import React, { useEffect, useState } from "react";
import AreaTable from "../../../components/areas/AreaTable";
import CreateAreaModal from "../../../components/areas/CreateAreaModal";
import EditAreaModal from "../../../components/areas/EditAreaModal";
import { getAreas, createArea, updateArea, deleteArea } from "../../../api/areaService";
import { getFactories } from "../../../api/factoryService";

export default function AreasPage() {
  const [areas, setAreas] = useState([]);
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [areasData, factoriesData] = await Promise.all([getAreas(), getFactories()]);
      setAreas(Array.isArray(areasData) ? areasData : []);
      setFactories(Array.isArray(factoriesData) ? factoriesData : []);
    } catch (e) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const canCreate = factories.length > 0;

  // Enrich area rows with factory name
  const enrichedAreas = areas.map((a) => {
    const factory = factories.find((f) => f.id === a.factoryId);
    return { ...a, factoryName: factory?.name || `Factory #${a.factoryId}` };
  });

  async function handleCreate(formData) {
    try {
      setSaving(true);
      setError("");
      const factory = factories.find((f) => f.id === formData.factoryId);
      const created = await createArea(formData);
      created.factoryName = factory?.name || `Factory #${formData.factoryId}`;
      setAreas((prev) => [created, ...prev]);
      setCreateOpen(false);
    } catch (e) {
      setError(e?.message || "Failed to create area");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(id, formData) {
    try {
      setSaving(true);
      setError("");
      const updated = await updateArea(id, formData);
      setAreas((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setEditTarget(null);
    } catch (e) {
      setError(e?.message || "Failed to update area");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(area) {
    if (!window.confirm(`Delete "${area.name}"? This action cannot be undone.`)) return;
    try {
      setError("");
      await deleteArea(area.id);
      setAreas((prev) => prev.filter((a) => a.id !== area.id));
    } catch (e) {
      setError(e?.message || "Failed to delete area");
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white text-left">Areas</h1>
          <p className="mt-1 text-sm text-white/60">Manage areas within your factories</p>
          {error && <div className="mt-2 text-sm text-red-300">{error}</div>}
        </div>

        {canCreate ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-10 px-4 rounded-lg bg-white text-neutral-950 font-medium hover:bg-white/90 transition disabled:opacity-60"
            disabled={loading}
          >
            + Create Area
          </button>
        ) : (
          <div className="h-10 px-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center text-sm text-yellow-300">
            You must create a factory before creating areas.
          </div>
        )}
      </div>

      <CreateAreaModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={saving}
        factories={factories}
      />

      <EditAreaModal
        open={!!editTarget}
        area={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        loading={saving}
        factories={factories}
      />

      <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-950/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="text-xs uppercase tracking-wider text-white/50">
            Areas List ({areas.length})
          </div>
        </div>
        <AreaTable
          areas={enrichedAreas}
          loading={loading}
          onEdit={(a) => setEditTarget(a)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
