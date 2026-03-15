import React from "react";
import { getRole, isOperatorRole } from "../../../utils/auth";

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  const cls =
    s === "success"
      ? "bg-green-500/15 text-green-300"
      : s === "queued"
        ? "bg-white/10 text-white/70"
        : "bg-red-500/15 text-red-300";

  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        cls,
      ].join(" ")}
    >
      {s || "unknown"}
    </span>
  );
}

export default function DashboardPage() {
  const isOperator = isOperatorRole(getRole());

  const stats = [
    { label: "Factories", value: 5 },
    { label: "Areas", value: 12 },
    { label: "Hubs", value: 9 },
    { label: "Devices", value: 28 },
  ];

  const logs = [
    {
      time: "2026-02-02 09:21",
      actor: "Admin",
      action: "Created device",
      target: "Robot Arm #10",
      status: "success",
    },
    {
      time: "2026-02-02 09:05",
      actor: "Admin",
      action: "Created hub",
      target: "Hub-01 (Area A)",
      status: "success",
    },
    {
      time: "2026-02-01 16:48",
      actor: "Admin",
      action: "Sent command",
      target: "Robot Arm #07",
      status: "queued",
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white text-left align-top">{isOperator ? "Logs" : "Dashboard"}</h1>
        <p className="mt-1 text-sm text-white/60 text-left align-top">
          {isOperator ? "Recent activity and system logs" : "Overview of your RoboArm system"}
        </p>
      </div>

      {!isOperator && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-neutral-950/40 p-5"
            >
              <div className="text-xs uppercase tracking-wider text-white/50">
                {s.label}
              </div>
              <div className="mt-2 text-3xl font-semibold text-white">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-neutral-950/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <div className="text-xs uppercase tracking-wider text-white/50">
              Activity
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-white/40">
                  <th className="text-left font-medium px-5 py-3">Time</th>
                  <th className="text-left font-medium px-5 py-3">Actor</th>
                  <th className="text-left font-medium px-5 py-3">Action</th>
                  <th className="text-left font-medium px-5 py-3">Target</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {logs.map((l) => (
                  <tr
                    key={l.time + l.action}
                    className="hover:bg-white/5 transition"
                  >
                    <td className="px-5 py-4 text-white/70">{l.time}</td>
                    <td className="px-5 py-4 text-white/70">{l.actor}</td>
                    <td className="px-5 py-4 text-white">{l.action}</td>
                    <td className="px-5 py-4 text-white/70">{l.target}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-950/40 p-5">
          <div className="text-xs uppercase tracking-wider text-white/50">
            System Health
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between text-white/70">
              <span>Devices online</span>
              <span className="text-white">24/28</span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>Hubs online</span>
              <span className="text-white">8/9</span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>Alerts</span>
              <span className="text-white">2</span>
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              className="w-full h-10 rounded-lg bg-white text-neutral-950 font-medium hover:bg-white/90 transition"
            >
              View details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
