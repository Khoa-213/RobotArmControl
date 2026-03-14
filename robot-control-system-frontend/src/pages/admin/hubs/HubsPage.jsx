import React, { useEffect, useState } from "react";
import HubTable from "../../../components/hubs/HubTable";
import CreateHubModal from "../../../components/hubs/CreateHubModal";
import EditHubModal from "../../../components/hubs/EditHubModal";
import { getHubsByArea, createHub, updateHub, deleteHub } from "../../../api/hubService";
import { getAreasByFactory } from "../../../api/areaService";
import { getFactories } from "../../../api/factoryService";

export default function HubsPage() {
  const [hubs, setHubs] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

 async function loadData() {
  try {
    setLoading(true);
    setError("");
    const factoriesData = await getFactories();
    const factoryList = Array.isArray(factoriesData) ? factoriesData : [];

    const allAreas = [];
    for (const f of factoryList) {
      try {
        const areasData = await getAreasByFactory(f.factoryId);
        if (Array.isArray(areasData)) allAreas.push(...areasData);
      } catch { /* skip */ }
    }
    setAreas(allAreas);

    const allHubs = [];
    for (const a of allAreas) {
      try {
        const hubsData = await getHubsByArea(a.areaId);
        if (Array.isArray(hubsData)) {
          hubsData.forEach((h) => { h.areaName = a.areaName; });
          allHubs.push(...hubsData);
        }
      } catch { /* skip */ }
    }
    setHubs(allHubs);
  } catch (e) {
    setError(e?.message || "Failed to load data");
  } finally {
    setLoading(false);
  }
}

  useEffect(() => { loadData(); }, []);

  const canCreate = areas.length > 0;

  const enrichedHubs = hubs.map((h) => {
    const area = areas.find((a) => a.areaId === h.areaId);
    return { ...h, areaName: area?.areaName || `Area #${h.areaId}` };
  });

async function handleCreate(formData) {
  try {
    setSaving(true);
    setError("");
    const { areaId, ...rest } = formData;
    const area = areas.find((a) => a.areaId === areaId);
    const created = await createHub(areaId, rest);
    created.areaName = area?.areaName || `Area #${areaId}`;
    setHubs((prev) => [created, ...prev]);
    setCreateOpen(false);
  } catch (e) {
    setError(e?.response?.data?.message || e?.message || "Failed to create hub");
  } finally {
    setSaving(false);
  }
}

  async function handleEdit(id, formData) {
    try {
      setSaving(true);
      setError("");
      const updated = await updateHub(id, formData);
      setHubs((prev) => prev.map((h) => (h.hubId === id ? updated : h)));
      setEditTarget(null);
    } catch (e) {
      setError(e?.message || "Failed to update hub");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(hub) {
    if (!window.confirm(`Delete "${hub.hubName}"? This action cannot be undone.`)) return;
    try {
      setError("");
      await deleteHub(hub.hubId);
      setHubs((prev) => prev.filter((h) => h.hubId !== hub.hubId));
    } catch (e) {
      setError(e?.message || "Failed to delete hub");
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white text-left">Hubs</h1>
          <p className="mt-1 text-sm text-white/60">Manage hubs within your areas</p>
          {error && <div className="mt-2 text-sm text-red-300">{error}</div>}
        </div>

        {canCreate ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-10 px-4 rounded-lg bg-white text-neutral-950 font-medium hover:bg-white/90 transition disabled:opacity-60"
            disabled={loading}
          >
            + Create Hub
          </button>
        ) : (
          <div className="h-10 px-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center text-sm text-yellow-300">
            You must create an area before creating hubs.
          </div>
        )}
      </div>

      <CreateHubModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={saving}
        areas={areas}
      />

      <EditHubModal
        key={editTarget?.hubId ?? "edit-hub"}
        open={!!editTarget}
        hub={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        loading={saving}
        areas={areas}
      />

      <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-950/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="text-xs uppercase tracking-wider text-white/50">
            Hubs List ({hubs.length})
          </div>
        </div>
        <HubTable
          hubs={enrichedHubs}
          loading={loading}
          onEdit={(h) => setEditTarget(h)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
