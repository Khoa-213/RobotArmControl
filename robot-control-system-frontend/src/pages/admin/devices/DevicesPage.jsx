import React, { useEffect, useState } from "react";
import DeviceTable from "../../../components/devices/DeviceTable";
import CreateDeviceModal from "../../../components/devices/CreateDeviceModal";
import EditDeviceModal from "../../../components/devices/EditDeviceModal";
import { getDevices, createDevice, updateDevice, deleteDevice } from "../../../api/deviceService";
import { getHubsByArea } from "../../../api/hubService";
import { getAreasByFactory } from "../../../api/areaService";
import { getFactories } from "../../../api/factoryService";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

 async function loadData() {
  try {
    setLoading(true);
    setError("");

    // Load factories → areas → hubs
    const factoriesData = await getFactories();
    const factoryList = Array.isArray(factoriesData) ? factoriesData : [];

    const allAreas = [];
    for (const f of factoryList) {
      try {
        const areasData = await getAreasByFactory(f.factoryId);
        if (Array.isArray(areasData)) allAreas.push(...areasData);
      } catch { /* skip */ }
    }

    const allHubs = [];
    for (const a of allAreas) {
      try {
        const hubsData = await getHubsByArea(a.areaId);
        if (Array.isArray(hubsData)) allHubs.push(...hubsData);
      } catch { /* skip */ }
    }
    setHubs(allHubs);

    // Load devices — deviceService vẫn mock, nên getDevices() OK
    const devicesData = await getDevices();
    setDevices(Array.isArray(devicesData) ? devicesData : []);
  } catch (e) {
    setError(e?.message || "Failed to load data");
  } finally {
    setLoading(false);
  }
}

  useEffect(() => { loadData(); }, []);

  const canCreate = hubs.length > 0;

  const enrichedDevices = devices.map((d) => {
    const hub = hubs.find((h) => h.hubId === d.hubId);
    return { ...d, hubName: hub?.hubName || `Hub #${d.hubId}` };
  });

  async function handleCreate(formData) {
    try {
      setSaving(true);
      setError("");
      const hub = hubs.find((h) => h.hubId === formData.hubId);
      const created = await createDevice(formData);
      created.hubName = hub?.hubName || `Hub #${formData.hubId}`;
      setDevices((prev) => [created, ...prev]);
      setCreateOpen(false);
    } catch (e) {
      setError(e?.message || "Failed to create device");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(id, formData) {
    try {
      setSaving(true);
      setError("");
      const updated = await updateDevice(id, formData);
      setDevices((prev) => prev.map((d) => (d.id === id ? updated : d)));
      setEditTarget(null);
    } catch (e) {
      setError(e?.message || "Failed to update device");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(device) {
    if (!window.confirm(`Delete "${device.name}"? This action cannot be undone.`)) return;
    try {
      setError("");
      await deleteDevice(device.id);
      setDevices((prev) => prev.filter((d) => d.id !== device.id));
    } catch (e) {
      setError(e?.message || "Failed to delete device");
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white text-left">Devices</h1>
          <p className="mt-1 text-sm text-white/60">Manage devices within your hubs</p>
          {error && <div className="mt-2 text-sm text-red-300">{error}</div>}
        </div>

        {canCreate ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-10 px-4 rounded-lg bg-white text-neutral-950 font-medium hover:bg-white/90 transition disabled:opacity-60"
            disabled={loading}
          >
            + Create Device
          </button>
        ) : (
          <div className="h-10 px-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center text-sm text-yellow-300">
            You must create a hub before creating devices.
          </div>
        )}
      </div>

      <CreateDeviceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={saving}
        hubs={hubs}
      />

      <EditDeviceModal
        open={!!editTarget}
        device={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        loading={saving}
        hubs={hubs}
      />

      <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-950/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="text-xs uppercase tracking-wider text-white/50">
            Devices List ({devices.length})
          </div>
        </div>
        <DeviceTable
          devices={enrichedDevices}
          loading={loading}
          onEdit={(d) => setEditTarget(d)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
