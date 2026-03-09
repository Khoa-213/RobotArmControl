import cv2
import mediapipe as mp
import websocket
import json
import math
import urllib.request
import os
import time
import requests
import threading
import numpy as np

# ============ CONFIGURATION ============
API_BASE_URL = "http://localhost:8080"
WS_URL = "ws://localhost:8080/ws/robot-control"

# Credentials sẽ được nhập khi chạy chương trình
AI_CAMERA_USERNAME = None
AI_CAMERA_PASSWORD = None

JWT_TOKEN = None

# Camera control state
camera_active = False
camera_lock = threading.Lock()
stop_event = threading.Event()

# ============ SETUP MEDIAPIPE ============
BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

MODEL_PATH = "hand_landmarker.task"
if not os.path.exists(MODEL_PATH):
    print("Downloading model...")
    url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
    urllib.request.urlretrieve(url, MODEL_PATH)

latest_landmarks = None
latest_handedness = None


def result_callback(result, output_image, timestamp_ms):
    global latest_landmarks, latest_handedness
    if result.hand_landmarks:
        latest_landmarks = result.hand_landmarks[0]
        if result.handedness and len(result.handedness) > 0 and len(result.handedness[0]) > 0:
            latest_handedness = result.handedness[0][0].category_name
        else:
            latest_handedness = None
    else:
        latest_landmarks = None
        latest_handedness = None


options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=VisionRunningMode.LIVE_STREAM,
    num_hands=1,
    min_hand_detection_confidence=0.6,
    min_tracking_confidence=0.6,
    result_callback=result_callback
)
hand_landmarker = HandLandmarker.create_from_options(options)


# ============ SMOOTH ============
class LowPassValue:
    def __init__(self, alpha=0.25, initial=0.0):
        self.alpha = alpha
        self.value = initial
        self.initialized = False

    def update(self, x):
        if not self.initialized:
            self.value = x
            self.initialized = True
        else:
            self.value = self.alpha * x + (1 - self.alpha) * self.value
        return self.value


# ============ CONTROLLER ============
class RobotHandController:
    def __init__(self):
        self.angles = [0.0] * 6

        # Đồng bộ với Unity/Inspector hiện tại
        self.joint_limits = [
            (-90, 90),  # J0 shoulder_link
            (-45, 45),    # J1 arm_link
            (-60, 60),    # J2 elbow_link
            (-90, 90),    # J3 forearm_link
            (-90, 90),    # J4 wrist_link
            (-90, 90)     # J5 hand_link
        ]

        self.joint_names = [
            "J0 shoulder_link",
            "J1 arm_link",
            "J2 elbow_link",
            "J3 forearm_link",
            "J4 wrist_link",
            "J5 hand_link"
        ]

        self.selected_joint = 0
        self.pending_joint = 0
        self.pending_since = time.time()
        self.mode_hold_seconds = 0.30

        # tốc độ quay từng khớp
        self.max_speed_deg = [120, 90, 90, 100, 100, 100]

        # deadzone để tay ở giữa không bị trôi
        self.deadzone = 0.08
        self.max_offset = 0.35

        self.palm_x_filter = LowPassValue(alpha=0.25, initial=0.5)
        self.palm_y_filter = LowPassValue(alpha=0.25, initial=0.5)

    def clamp(self, value, min_v, max_v):
        return max(min_v, min(max_v, value))

    def count_fingers(self, lm, handedness=None):
        fingers = 0

        # 4 ngón còn lại
        if lm[8].y < lm[6].y:
            fingers += 1
        if lm[12].y < lm[10].y:
            fingers += 1
        if lm[16].y < lm[14].y:
            fingers += 1
        if lm[20].y < lm[18].y:
            fingers += 1

        # ngón cái
        thumb_dx = lm[4].x - lm[2].x

        # nếu thumb bị đếm ngược thì đảo dấu 2 dòng dưới
        if handedness == "Right":
            thumb_open = thumb_dx > 0.04
        elif handedness == "Left":
            thumb_open = thumb_dx < -0.04
        else:
            thumb_open = abs(thumb_dx) > 0.10

        if thumb_open:
            fingers += 1

        return fingers

    def update_selected_joint(self, fingers_count):
        target_joint = max(0, min(5, fingers_count))

        now = time.time()
        if target_joint != self.pending_joint:
            self.pending_joint = target_joint
            self.pending_since = now
        else:
            if now - self.pending_since >= self.mode_hold_seconds:
                self.selected_joint = self.pending_joint

    def get_palm_center(self, lm):
        ids = [0, 5, 9, 13, 17]
        x = sum(lm[i].x for i in ids) / len(ids)
        y = sum(lm[i].y for i in ids) / len(ids)
        x = self.palm_x_filter.update(x)
        y = self.palm_y_filter.update(y)
        return x, y

    def axis_control(self, value):
        if abs(value) < self.deadzone:
            return 0.0
        mag = (abs(value) - self.deadzone) / (self.max_offset - self.deadzone)
        mag = self.clamp(mag, 0.0, 1.0)
        return math.copysign(mag, value)

    def update_angles(self, lm, handedness, dt):
        fingers_count = self.count_fingers(lm, handedness)
        self.update_selected_joint(fingers_count)

        palm_x, palm_y = self.get_palm_center(lm)

        # TẤT CẢ khớp cùng điều khiển bằng trái/phải
        control_signal = palm_x - 0.5
        control = self.axis_control(control_signal)

        j = self.selected_joint
        speed = control * self.max_speed_deg[j]
        self.angles[j] += speed * dt

        mn, mx = self.joint_limits[j]
        self.angles[j] = self.clamp(self.angles[j], mn, mx)

        return fingers_count, palm_x, palm_y, control

    def reset_angles(self):
        self.angles = [0.0] * 6


controller = RobotHandController()


# ============ AUTHENTICATION ============
def login():
    """Đăng nhập và lấy JWT token"""
    global JWT_TOKEN
    try:
        print(f"Đang đăng nhập với user: {AI_CAMERA_USERNAME}...")
        response = requests.post(
            f"{API_BASE_URL}/api/auth/login",
            json={"username": AI_CAMERA_USERNAME, "password": AI_CAMERA_PASSWORD},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("data"):
                JWT_TOKEN = data["data"].get("accessToken")
                print("✓ Đăng nhập thành công!")
                return True
            else:
                print(f"✗ Login failed: {data.get('message', 'Unknown error')}")
        else:
            print(f"✗ Login failed with status {response.status_code}: {response.text}")
        return False
    except requests.exceptions.ConnectionError:
        print("✗ Không thể kết nối đến server. Hãy chắc chắn backend đang chạy!")
        return False
    except Exception as e:
        print(f"✗ Login error: {e}")
        return False


# ============ WEBSOCKET WITH MESSAGE LISTENER ============
ws_app = None
ws_connected = False


def on_message(ws, message):
    """Xử lý tin nhắn từ server"""
    global camera_active
    try:
        data = json.loads(message)
        msg_type = data.get("type", "")
        
        # Xử lý lệnh điều khiển camera
        if msg_type == "camera_control":
            command = data.get("command", "")
            with camera_lock:
                if command == "START":
                    if not camera_active:
                        camera_active = True
                        print("\n" + "="*50)
                        print(">>> AI CAMERA ACTIVATED - Bắt đầu điều khiển! <<<")
                        print("="*50 + "\n")
                elif command == "STOP":
                    if camera_active:
                        camera_active = False
                        print("\n" + "="*50)
                        print(">>> AI CAMERA DEACTIVATED - Kết thúc điều khiển <<<")
                        print("="*50 + "\n")
    except json.JSONDecodeError:
        pass  # Ignore non-JSON messages
    except Exception as e:
        print(f"Error processing message: {e}")


def on_error(ws, error):
    """Xử lý lỗi WebSocket"""
    print(f"✗ WebSocket error: {error}")


def on_close(ws, close_status_code, close_msg):
    """Xử lý đóng kết nối"""
    global ws_connected
    ws_connected = False
    print(f"WebSocket disconnected (code: {close_status_code})")


def on_open(ws):
    """Xử lý mở kết nối"""
    global ws_connected
    ws_connected = True
    print("✓ WebSocket kết nối thành công! Đang chờ lệnh START từ server...")


def connect_websocket():
    """Kết nối WebSocket với message listener"""
    global ws_app, JWT_TOKEN
    
    # Login nếu chưa có token
    if JWT_TOKEN is None:
        if not login():
            print("Không thể đăng nhập. Vui lòng kiểm tra:")
            print(f"  1. Backend đang chạy tại {API_BASE_URL}")
            print(f"  2. Account '{AI_CAMERA_USERNAME}' tồn tại với role OPERATOR hoặc ADMIN")
            print(f"  3. Password đúng")
            return False
    
    try:
        ws_app = websocket.WebSocketApp(
            WS_URL,
            header=[f"Authorization: Bearer {JWT_TOKEN}"],
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close
        )
        
        # Run WebSocket in background thread
        ws_thread = threading.Thread(target=ws_app.run_forever, daemon=True)
        ws_thread.start()
        
        # Wait for connection
        time.sleep(2)
        return ws_connected
        
    except Exception as e:
        print(f"✗ Failed to connect: {e}")
        return False


def send_angles(angles):
    """Gửi góc điều khiển qua WebSocket"""
    global ws_app
    if ws_app is None or not ws_connected:
        return

    payload = {
        "type": "ai_angles",
        "angles": [round(a, 2) for a in angles]
    }

    try:
        ws_app.send(json.dumps(payload))
    except Exception as e:
        print(f"! Error sending angles: {e}")


# ============ DRAW ============
def draw_hand(image, landmarks):
    if not landmarks:
        return image

    h, w = image.shape[:2]
    connections = [
        (0, 1), (1, 2), (2, 3), (3, 4),
        (0, 5), (5, 6), (6, 7), (7, 8),
        (0, 9), (9, 10), (10, 11), (11, 12),
        (0, 13), (13, 14), (14, 15), (15, 16),
        (0, 17), (17, 18), (18, 19), (19, 20),
        (5, 9), (9, 13), (13, 17)
    ]

    for c in connections:
        p1, p2 = landmarks[c[0]], landmarks[c[1]]
        cv2.line(
            image,
            (int(p1.x * w), int(p1.y * h)),
            (int(p2.x * w), int(p2.y * h)),
            (0, 255, 0), 2
        )

    for lm in landmarks:
        cv2.circle(image, (int(lm.x * w), int(lm.y * h)), 5, (255, 0, 0), -1)

    return image


def draw_ui(frame, controller, fingers_count, handedness, palm_x, control):
    h, w = frame.shape[:2]

    center_x = int(w * 0.5)
    dz_left = int(w * (0.5 - controller.deadzone))
    dz_right = int(w * (0.5 + controller.deadzone))

    cv2.line(frame, (center_x, 0), (center_x, h), (255, 255, 255), 1)
    cv2.line(frame, (dz_left, 0), (dz_left, h), (100, 100, 255), 1)
    cv2.line(frame, (dz_right, 0), (dz_right, h), (100, 100, 255), 1)

    px = int(palm_x * w)
    cv2.line(frame, (px, 0), (px, h), (0, 255, 255), 2)

    cv2.putText(frame, f"Hand: {handedness or 'Unknown'}", (10, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

    cv2.putText(frame, f"Fingers: {fingers_count}", (10, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

    cv2.putText(frame, f"Selected: {controller.joint_names[controller.selected_joint]}", (10, 80),
                cv2.FONT_HERSHEY_SIMPLEX, 0.58, (0, 255, 255), 2)

    cv2.putText(frame, f"Control: {control:+.2f}", (10, 105),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 255), 2)

    for i, angle in enumerate(controller.angles):
        color = (0, 255, 255) if i == controller.selected_joint else (0, 255, 0)
        cv2.putText(frame, f"{controller.joint_names[i]}: {angle:>7.1f}", (10, 140 + i * 26),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.54, color, 2)

    instructions = [
        "0 ngon -> J0 shoulder_link",
        "1 ngon -> J1 arm_link",
        "2 ngon -> J2 elbow_link",
        "3 ngon -> J3 forearm_link",
        "4 ngon -> J4 wrist_link",
        "5 ngon -> J5 hand_link",
        "Tat ca khop: di tay trai/phai de giam/tang goc",
        "J0 range: -175 .. 175",
        "R = Reset | Q = Quit"
    ]

    y0 = h - len(instructions) * 22 - 10
    for i, text in enumerate(instructions):
        cv2.putText(frame, text, (10, y0 + i * 22),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.48, (200, 200, 200), 1)


# ============ MAIN ============
def main():
    global AI_CAMERA_USERNAME, AI_CAMERA_PASSWORD, camera_active
    
    print("=" * 72)
    print(" AI Camera - 6 DOF Robot Arm Control (Auto-Start Mode)")
    print("=" * 72)
    print(f"Server: {API_BASE_URL}")
    print("=" * 72)
    
    # Nhập thông tin đăng nhập
    print("\n--- ĐĂNG NHẬP ---")
    AI_CAMERA_USERNAME = input("Username: ").strip()
    AI_CAMERA_PASSWORD = input("Password: ").strip()
    
    if not AI_CAMERA_USERNAME or not AI_CAMERA_PASSWORD:
        print("✗ Username và password không được để trống!")
        return
    
    print()
    
    # Kết nối WebSocket
    if not connect_websocket():
        print("\n✗ Không thể kết nối. Thoát chương trình.")
        return
    
    print()
    print("AI Camera đang chờ lệnh START từ Frontend...")
    print("(Camera sẽ tự động bật khi bạn nhấn 'Bắt đầu điều khiển' trên web)")
    print()
    print("="*50)
    print("Hướng dẫn sử dụng khi camera hoạt động:")
    print("0 ngón -> J0 shoulder_link")
    print("1 ngón -> J1 arm_link")
    print("2 ngón -> J2 elbow_link")
    print("3 ngón -> J3 forearm_link")
    print("4 ngón -> J4 wrist_link")
    print("5 ngón -> J5 hand_link")
    print("Di tay trái/phải để giảm/tăng góc")
    print("R = Reset | Q = Quit")
    print("="*50)
    print()

    cap = None
    ts = 0
    prev_time = time.time()
    
    try:
        while True:
            # Check if camera should be active
            with camera_lock:
                is_active = camera_active
            
            if is_active:
                # Camera is active - process video
                if cap is None:
                    cap = cv2.VideoCapture(0)
                    if not cap.isOpened():
                        print("✗ Cannot open camera")
                        camera_active = False
                        continue
                    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                    print("✓ Camera started")
                    ts = 0
                    prev_time = time.time()
                
                ret, frame = cap.read()
                if not ret:
                    time.sleep(0.01)
                    continue

                frame = cv2.flip(frame, 1)
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                ts += 33
                hand_landmarker.detect_async(mp_img, ts)

                now = time.time()
                dt = now - prev_time
                prev_time = now
                dt = max(0.001, min(dt, 0.05))

                if latest_landmarks:
                    frame = draw_hand(frame, latest_landmarks)

                    fingers_count, palm_x, palm_y, control = controller.update_angles(
                        latest_landmarks,
                        latest_handedness,
                        dt
                    )

                    send_angles(controller.angles)
                    draw_ui(frame, controller, fingers_count, latest_handedness, palm_x, control)
                else:
                    cv2.putText(frame, "Dua tay vao camera", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

                    for i, angle in enumerate(controller.angles):
                        cv2.putText(frame, f"{controller.joint_names[i]}: {angle:>7.1f}", (10, 70 + i * 28),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.58, (0, 255, 0), 2)

                # Show status on frame
                cv2.putText(frame, "ACTIVE", (frame.shape[1] - 100, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                
                cv2.imshow("AI Camera Robot Control", frame)

                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('r'):
                    controller.reset_angles()
                    print("Angles reset.")
            else:
                # Camera is inactive - wait mode
                if cap is not None:
                    cap.release()
                    cv2.destroyAllWindows()
                    cap = None
                    print("Camera stopped. Waiting for START command...")
                
                # Show waiting window
                wait_frame = 255 * np.ones((200, 500, 3), dtype=np.uint8)
                cv2.putText(wait_frame, "AI Camera - Standby Mode", (50, 80),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
                cv2.putText(wait_frame, "Waiting for START from Frontend...", (50, 130),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 100, 100), 1)
                cv2.putText(wait_frame, "Press Q to quit", (50, 170),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 100, 100), 1)
                
                cv2.imshow("AI Camera Robot Control", wait_frame)
                
                key = cv2.waitKey(100) & 0xFF
                if key == ord('q'):
                    break
                    
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    finally:
        if cap is not None:
            cap.release()
        cv2.destroyAllWindows()
        hand_landmarker.close()
        if ws_app:
            ws_app.close()
        print("AI Camera đã dừng.")


if __name__ == "__main__":
    main()