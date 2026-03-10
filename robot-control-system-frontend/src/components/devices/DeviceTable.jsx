import React from "react";

function StatusPill({ active }) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        active ? "bg-green-500/15 text-green-300" : "bg-white/10 text-white/60",
      ].join(" ")}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function DeviceTable({ devices, loading, onEdit, onDelete }) {
  if (loading) {
    return <div className="px-5 py-10 text-center text-white/50 text-sm">Loading devices...</div>;
  }

  if (!devices || devices.length === 0) {
    return <div className="px-5 py-10 text-center text-white/50 text-sm">No devices found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-white/40">
            <th className="text-left font-medium px-5 py-3">Name</th>
            <th className="text-left font-medium px-5 py-3">Type</th>
            <th className="text-left font-medium px-5 py-3">Hub</th>
            <th className="text-left font-medium px-5 py-3">Created Date</th>
            <th className="text-left font-medium px-5 py-3">Status</th>
            <th className="text-left font-medium px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {devices.map((d) => {
            const active = String(d.status).toLowerCase() === "active";
            return (
              <tr key={d.id} className="hover:bg-white/5 transition">
                <td className="px-5 py-4 text-left align-top">
                  <div className="text-white font-medium">{d.name}</div>
                  <div className="text-xs text-white/50">ID: {d.id}</div>
                </td>
                <td className="px-5 py-4 text-white/70 text-left align-top">{d.type || "—"}</td>
                <td className="px-5 py-4 text-white/70 text-left align-top">{d.hubName || `Hub #${d.hubId}`}</td>
                <td className="px-5 py-4 text-white/70 text-left align-top">{d.createdAt || "—"}</td>
                <td className="px-5 py-4 text-left align-top"><StatusPill active={active} /></td>
                <td className="px-5 py-4 text-left align-top">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onEdit(d)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs transition">Edit</button>
                    <button type="button" onClick={() => onDelete(d)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs transition">Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
