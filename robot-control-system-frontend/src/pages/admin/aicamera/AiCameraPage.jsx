import React from "react";
import { useAiCamera } from "../../../hooks/useAiCamera";

function Pill({ label, ok }) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        ok ? "bg-green-500/15 text-green-300" : "bg-white/10 text-white/60",
      ].join(" ")}
    >
      {label}: {ok ? "Yes" : "No"}
    </span>
  );
}

export default function AiCameraPage() {
  const {
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
  } = useAiCamera();

  const startDisabled = isViewer || isCameraRunning || isSendingAngles;
  const stopDisabled = isViewer || (!isCameraRunning && !isSendingAngles && !sessionActive);

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white text-left">AI Camera Control</h1>
          <p className="mt-1 text-sm text-white/60">
            Control robot joints using browser webcam hand tracking
          </p>
          <div className="mt-2 text-xs text-white/50">Role: {role || "—"}</div>

          {isViewer && (
            <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-300">
              Viewer cannot control robot camera
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={start}
            disabled={startDisabled}
            className="h-10 px-4 rounded-lg bg-white text-neutral-950 font-medium hover:bg-white/90 transition disabled:opacity-60"
          >
            Start AI Camera
          </button>
          <button
            type="button"
            onClick={stop}
            disabled={stopDisabled}
            className="h-10 px-4 rounded-lg bg-white/10 text-white hover:bg-white/15 transition disabled:opacity-60"
          >
            Stop AI Camera
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-neutral-950/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <div className="text-xs uppercase tracking-wider text-white/50">Webcam Preview</div>
          </div>
          <div className="p-5">
            <div className="aspect-video w-full rounded-xl bg-black/40 border border-white/10 overflow-hidden">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
            <div className="mt-2 text-xs text-white/50">
              If permission is denied, allow camera access in the browser.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-950/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <div className="text-xs uppercase tracking-wider text-white/50">Status</div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Pill label="WS Connected" ok={wsConnected} />
              <Pill label="Session Active" ok={sessionActive} />
              <Pill label="Camera Running" ok={isCameraRunning} />
              <Pill label="Sending Angles" ok={isSendingAngles} />
            </div>

            <div className="rounded-xl border border-white/10 bg-neutral-950/30 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="text-xs uppercase tracking-wider text-white/50">Live Angles (degrees)</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-white/40">
                      <th className="text-left font-medium px-4 py-3">Joint</th>
                      <th className="text-left font-medium px-4 py-3">Index</th>
                      <th className="text-left font-medium px-4 py-3">Angle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[
                      "shoulder_link",
                      "arm_link",
                      "elbow_link",
                      "forearm_link",
                      "wrist_link",
                      "hand_link",
                    ].map((name, idx) => (
                      <tr key={name} className="hover:bg-white/5 transition">
                        <td className="px-4 py-3 text-white">{name}</td>
                        <td className="px-4 py-3 text-white/70">{idx}</td>
                        <td className="px-4 py-3 text-white/70">
                          {Number(angles?.[idx] ?? 0).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-xs text-white/50">
              WebSocket payload sent: {`{ "type": "ai_angles", "angles": [a0..a5] }`} (exactly 6 numbers)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
