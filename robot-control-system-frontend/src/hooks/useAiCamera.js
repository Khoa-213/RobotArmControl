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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizePalmX(palmX) {
  // Map palmX (0..1) -> control (-1..1) with a small deadzone
  const controlSignal = palmX - 0.5;
  const deadzone = 0.08;
  const maxOffset = 0.35;

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

export function useAiCamera() {
  const videoRef = useRef(null);

  const [wsConnected, setWsConnected] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [isSendingAngles, setIsSendingAngles] = useState(false);
  const [angles, setAngles] = useState(() => [0, 0, 0, 0, 0, 0]);
  const [error, setError] = useState("");

  const role = useMemo(() => String(localStorage.getItem("role") || "").toUpperCase(), []);
  const isViewer = role === "VIEWER";

  const wsConnectedRef = useRef(false);
  const sessionActiveRef = useRef(false);
  const runningRef = useRef(false);

  const anglesRef = useRef([0, 0, 0, 0, 0, 0]);
  const lastTickRef = useRef(0);
  const lastSendRef = useRef(0);
  const palmXFilteredRef = useRef(null);

  const streamRef = useRef(null);
  const handsRef = useRef(null);
  const rafRef = useRef(0);

  const wsServiceRef = useRef(null);

  function stopLocal() {
    runningRef.current = false;
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

  async function refreshStatus() {
    try {
      const status = await cameraService.status();
      const active = !!status?.sessionActive;
      sessionActiveRef.current = active;
      setSessionActive(active);
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
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
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

      const palmX = computePalmCenterX(landmarks);
      if (palmX == null) return;

      // low-pass filter to reduce jitter
      const alpha = 0.25;
      const prev = palmXFilteredRef.current;
      const filtered = prev == null ? palmX : prev + alpha * (palmX - prev);
      palmXFilteredRef.current = filtered;

      const control = normalizePalmX(filtered);

      // integrate angle changes
      const next = anglesRef.current.slice(0, 6);
      for (let i = 0; i < 6; i += 1) {
        const [minL, maxL] = JOINT_LIMITS[i];
        const speed = SPEEDS_DEG_PER_SEC[i];
        next[i] = clamp(next[i] + control * speed * dt, minL, maxL);
      }

      anglesRef.current = next;

      // send at ~20 msg/s
      const sendIntervalMs = 50;
      if (isSendingAngles && wsConnectedRef.current) {
        if (now - lastSendRef.current >= sendIntervalMs) {
          lastSendRef.current = now;
          const svc = wsServiceRef.current;
          svc?.sendJson({ type: "ai_angles", angles: next.map((n) => Number(n)) });
          setAngles(next);
        }
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
      } catch {
        // ignore per-frame errors
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  async function start() {
    if (isViewer) return;

    setError("");

    try {
      await cameraService.start();
      sessionActiveRef.current = true;
      setSessionActive(true);
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
    lastTickRef.current = performance.now();
    lastSendRef.current = 0;
    palmXFilteredRef.current = null;

    initHands();

    runningRef.current = true;
    setIsSendingAngles(true);
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
    isCameraRunning,
    isSendingAngles,
    angles,
    error,
    start,
    stop,
    refreshStatus,
  };
}
