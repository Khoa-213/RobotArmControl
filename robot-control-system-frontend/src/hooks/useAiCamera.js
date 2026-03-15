import { useEffect, useMemo, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { cameraService } from "../api/cameraService";
import { buildWsUrl, WebsocketService } from "../services/websocketService";

const JOINT_LIMITS = [
  [-90, 90],
  [-45, 45],
  [-60, 60],
  [-90, 90],
  [-90, 90],
  [-90, 90],
];

const SPEEDS_DEG_PER_SEC = [120, 90, 90, 100, 100, 100];
const MODE_HOLD_MS = 300;

const SELFIE_MODE = String(import.meta.env.VITE_AI_CAMERA_SELFIE_MODE || "1") !== "0";
const DEADZONE = 0.08;
const MAX_OFFSET = 0.35;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizePalmX(palmX) {
  // Map palmX (0..1) -> control (-1..1) with a small deadzone
  const controlSignal = palmX - 0.5;
  const deadzone = DEADZONE;
  const maxOffset = MAX_OFFSET;

  if (Math.abs(controlSignal) < deadzone) return 0;
  const sign = controlSignal > 0 ? 1 : -1;
  const mag = (Math.abs(controlSignal) - deadzone) / (maxOffset - deadzone);
  return clamp(sign * mag, -1, 1);
}

function computePalmCenterX(landmarks) {
  // Average of wrist + MCPs: 0,5,9,13,17
  const ids = [0, 5, 9, 13, 17];
  let sum = 0;
  let count = 0;
  for (const i of ids) {
    const lm = landmarks?.[i];
    if (!lm) continue;
    sum += lm.x;
    count += 1;
  }
  return count ? sum / count : null;
}

function maybeMirror01(x) {
  if (x == null) return null;
  return SELFIE_MODE ? 1 - x : x;
}

function countFingers(landmarks, handedness) {
  if (!landmarks || landmarks.length < 21) return 0;

  let fingers = 0;
  // In MediaPipe, y increases downward; "open" means tip is above pip.
  if (landmarks[8].y < landmarks[6].y) fingers += 1;
  if (landmarks[12].y < landmarks[10].y) fingers += 1;
  if (landmarks[16].y < landmarks[14].y) fingers += 1;
  if (landmarks[20].y < landmarks[18].y) fingers += 1;

  const thumbDx = landmarks[4].x - landmarks[2].x;
  let thumbOpen;
  if (handedness === "Right") {
    thumbOpen = thumbDx > 0.03;
  } else if (handedness === "Left") {
    thumbOpen = thumbDx < -0.03;
  } else {
    thumbOpen = Math.abs(thumbDx) > 0.05;
  }

  if (!thumbOpen) {
    thumbOpen = Math.abs(thumbDx) > 0.07;
  }

  if (thumbOpen) fingers += 1;
  return fingers;
}

function getHandedness(results) {
  const raw = results?.multiHandedness?.[0]?.label;
  if (raw === "Left" || raw === "Right") return raw;
  return null;
}


export function useAiCamera() {
  const videoRef = useRef(null);

  const [wsConnected, setWsConnected] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDeviceId, setSessionDeviceId] = useState(null);
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [isSendingAngles, setIsSendingAngles] = useState(false);
  const [angles, setAngles] = useState(() => [0, 0, 0, 0, 0, 0]);
  const [error, setError] = useState("");
  const [selectedJoint, setSelectedJoint] = useState(0);
  const [fingersCount, setFingersCount] = useState(0);

  const role = useMemo(() => String(localStorage.getItem("role") || "").toUpperCase(), []);
  const isViewer = role === "VIEWER";

  const wsConnectedRef = useRef(false);
  const sessionActiveRef = useRef(false);
  const sessionDeviceIdRef = useRef(null);
  const runningRef = useRef(false);
  const isSendingAnglesRef = useRef(false);

  const debugRef = useRef({
    landmarks: null,
    handednessRaw: null,
    palmX: null, // raw filtered (0..1) in video coords
    control: 0,
  });

  const anglesRef = useRef([0, 0, 0, 0, 0, 0]);
  const lastTickRef = useRef(0);
  const lastSendRef = useRef(0);
  const lastRestSendRef = useRef(0);
  const palmXFilteredRef = useRef(null);

  const selectedJointRef = useRef(0);
  const pendingJointRef = useRef(0);
  const pendingSinceRef = useRef(0);
  const lastUiSelectedJointRef = useRef(0);
  const lastUiFingersCountRef = useRef(0);

  const streamRef = useRef(null);
  const handsRef = useRef(null);
  const rafRef = useRef(0);

  const consecutiveSendErrorsRef = useRef(0);
  const sendErrorShownRef = useRef(false);

  const wsServiceRef = useRef(null);

  function stopLocal() {
    runningRef.current = false;
    isSendingAnglesRef.current = false;
    setIsSendingAngles(false);
    setIsCameraRunning(false);

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }

    if (handsRef.current) {
      try {
        handsRef.current.close();
      } catch {
        // ignore
      }
      handsRef.current = null;
    }

    const stream = streamRef.current;
    if (stream) {
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }
      streamRef.current = null;
    }

    const v = videoRef.current;
    if (v) {
      try {
        v.srcObject = null;
      } catch {
        // ignore
      }
    }
  }

  function ensureWs() {
    if (wsServiceRef.current) return wsServiceRef.current;

    const wsUrl = buildWsUrl("/ws/robot-control");
    const svc = new WebsocketService(wsUrl, {
      reconnect: { enabled: true },
    });

    svc.setHandlers({
      onStatus: (connected) => {
        wsConnectedRef.current = connected;
        setWsConnected(connected);
      },
      onError: () => {
        // keep UI minimal; status indicator is enough
      },
      onMessage: (msg) => {
        if (msg && typeof msg === "object") {
          if (msg.type === "camera_control" && String(msg.command).toUpperCase() === "STOP") {
            setSessionActive(false);
            sessionActiveRef.current = false;
            stopLocal();
          }
        }
      },
    });

    wsServiceRef.current = svc;
    svc.connect();
    return svc;
  }

  function getPreferredDeviceId() {
    // Minimal mechanism (no new UI): allow selecting deviceId via URL (?deviceId=)
    // or existing localStorage keys if the app already stores it.
    try {
      const qs = new URLSearchParams(window.location.search);
      const fromQs = qs.get("deviceId");
      if (fromQs != null && String(fromQs).trim() !== "") return Number(fromQs);
    } catch {
      // ignore
    }

    const fromStorage = localStorage.getItem("deviceId") || localStorage.getItem("selectedDeviceId");
    if (fromStorage != null && String(fromStorage).trim() !== "") return Number(fromStorage);
    return null;
  }

  async function refreshStatus() {
    try {
      const status = await cameraService.status();
      const active = !!status?.sessionActive;
      sessionActiveRef.current = active;
      setSessionActive(active);

      const dev = status?.deviceId ?? null;
      sessionDeviceIdRef.current = dev;
      setSessionDeviceId(dev);
    } catch (e) {
      setError(e?.message || "Failed to fetch camera status");
    }
  }

  async function startWebcam() {
    const v = videoRef.current;
    if (!v) throw new Error("Video element not ready");

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    streamRef.current = stream;

    v.srcObject = stream;
    await v.play();

    setIsCameraRunning(true);
  }

  function initHands() {
    const hands = new Hands({
      locateFile: (file) => {
        const base = import.meta.env.VITE_MEDIAPIPE_ASSETS_BASE_URL;
        if (base) return `${String(base).replace(/\/$/, "")}/${file}`;
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      selfieMode: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      if (!runningRef.current) return;

      const now = performance.now();
      const last = lastTickRef.current || now;
      const dt = Math.max(0.001, Math.min(0.2, (now - last) / 1000));
      lastTickRef.current = now;

      const landmarks = results?.multiHandLandmarks?.[0];
      if (!landmarks) return;

      debugRef.current.landmarks = landmarks;

      // Python-style: count fingers -> choose joint (0..5), only switch if held for MODE_HOLD_MS
      const handednessRaw = getHandedness(results);
      debugRef.current.handednessRaw = handednessRaw;

      const fingersCount = countFingers(landmarks, handednessRaw);
      const targetJoint = clamp(fingersCount, 0, 5);
      if (targetJoint !== pendingJointRef.current) {
        pendingJointRef.current = targetJoint;
        pendingSinceRef.current = now;
      } else {
        if (now - pendingSinceRef.current >= MODE_HOLD_MS) {
          selectedJointRef.current = pendingJointRef.current;
        }
      }

      if (lastUiFingersCountRef.current !== fingersCount) {
        lastUiFingersCountRef.current = fingersCount;
        setFingersCount(fingersCount);
      }
      if (lastUiSelectedJointRef.current !== selectedJointRef.current) {
        lastUiSelectedJointRef.current = selectedJointRef.current;
        setSelectedJoint(selectedJointRef.current);
      }

      const palmXRaw = computePalmCenterX(landmarks);
      if (palmXRaw == null) return;

      // low-pass filter to reduce jitter
      const alpha = 0.25;
      const prev = palmXFilteredRef.current;
      const filteredRaw = prev == null ? palmXRaw : prev + alpha * (palmXRaw - prev);
      palmXFilteredRef.current = filteredRaw;

      debugRef.current.palmX = filteredRaw;

      const filteredForControl = maybeMirror01(filteredRaw);
      if (filteredForControl == null) return;

      const control = normalizePalmX(filteredForControl);
      debugRef.current.control = control;

      // Python-style: integrate ONLY the selected joint
      const next = anglesRef.current.slice(0, 6);
      const j = clamp(selectedJointRef.current, 0, 5);
      const [minL, maxL] = JOINT_LIMITS[j];
      const speed = SPEEDS_DEG_PER_SEC[j];
      next[j] = clamp(next[j] + control * speed * dt, minL, maxL);

      anglesRef.current = next;

      // send at ~20 msg/s
      const sendIntervalMs = 50;
      if (!isSendingAnglesRef.current) return;
      if (now - lastSendRef.current < sendIntervalMs) return;
      lastSendRef.current = now;

      const deviceId = sessionDeviceIdRef.current;
      const payloadAngles = next.map((n) => Number(n));

      // Preferred path: REST -> BE will broadcast to Unity via WS.
      const restMinIntervalMs = 100;
      if (now - lastRestSendRef.current >= restMinIntervalMs) {
        lastRestSendRef.current = now;
        cameraService
          .sendAngles(payloadAngles, deviceId)
          .then(() => {
            setAngles(next);
          })
          .catch(() => {
            // keep UI minimal; status pills indicate connectivity
          });
      }

      // Optional: also try WS if connected (useful for local debugging/monitoring)
      if (wsConnectedRef.current) {
        const svc = wsServiceRef.current;
        svc?.sendJson({ type: "ai_angles", deviceId, angles: payloadAngles });
      }
    });

    handsRef.current = hands;
  }

  async function startLoop() {
    const v = videoRef.current;
    const hands = handsRef.current;
    if (!v || !hands) return;

    async function frame() {
      if (!runningRef.current) return;
      try {
        await hands.send({ image: v });
        consecutiveSendErrorsRef.current = 0;
      } catch (e) {
        consecutiveSendErrorsRef.current += 1;
        if (consecutiveSendErrorsRef.current >= 10 && !sendErrorShownRef.current) {
          sendErrorShownRef.current = true;
          setError(
            "Hand tracking failed to run. Possible cause: MediaPipe assets blocked/unreachable (CDN) or insecure context. " +
              "Open DevTools Console/Network for details. " +
              (e?.message ? `(${e.message})` : "")
          );
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  async function start() {
    if (isViewer) return;

    setError("");

    try {
      const started = await cameraService.start(getPreferredDeviceId());
      sessionActiveRef.current = true;
      setSessionActive(true);

      const dev = started?.deviceId ?? null;
      sessionDeviceIdRef.current = dev;
      setSessionDeviceId(dev);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to start camera session");
      return;
    }

    ensureWs();

    try {
      await startWebcam();
    } catch (e) {
      setError(e?.message || "Camera permission denied or webcam unavailable");
      return;
    }

    // reset angles before run
    anglesRef.current = [0, 0, 0, 0, 0, 0];
    setAngles([0, 0, 0, 0, 0, 0]);
    selectedJointRef.current = 0;
    pendingJointRef.current = 0;
    pendingSinceRef.current = performance.now();
    lastUiSelectedJointRef.current = 0;
    lastUiFingersCountRef.current = 0;
    setSelectedJoint(0);
    setFingersCount(0);
    lastTickRef.current = performance.now();
    lastSendRef.current = 0;
    lastRestSendRef.current = 0;
    palmXFilteredRef.current = null;

    consecutiveSendErrorsRef.current = 0;
    sendErrorShownRef.current = false;

    runningRef.current = true;
    isSendingAnglesRef.current = true;
    setIsSendingAngles(true);

    initHands();
    await startLoop();
  }

  async function stop() {
    if (isViewer) return;

    setError("");

    try {
      await cameraService.stop();
      sessionActiveRef.current = false;
      setSessionActive(false);
    } catch (e) {
      // even if REST fails, we still stop local resources
      setError(e?.response?.data?.message || e?.message || "Failed to stop camera session");
    } finally {
      stopLocal();
      sessionDeviceIdRef.current = null;
      setSessionDeviceId(null);
    }
  }

  useEffect(() => {
    // bootstrap without calling setState directly inside the effect body
    const bootstrap = () => {
      ensureWs();
      refreshStatus();
    };

    bootstrap();

    return () => {
      stopLocal();
      wsServiceRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    videoRef,
    role,
    isViewer,
    wsConnected,
    sessionActive,
    sessionDeviceId,
    isCameraRunning,
    isSendingAngles,
    angles,
    selectedJoint,
    fingersCount,
    selfieMode: SELFIE_MODE,
    deadzone: DEADZONE,
    maxOffset: MAX_OFFSET,
    debugRef,
    error,
    start,
    stop,
    refreshStatus,
  };
}
