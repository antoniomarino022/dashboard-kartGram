"use client";

import { useState } from "react";
import { parseApiError } from "@/services/apiClient";
import {
  useCreateMapMutation,
  useDeleteMapMutation,
  useMapsQuery,
  useUpdateMapMutation,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import {
  UnlockType,
  type CreateMapInput,
  type GameMap,
} from "@/types/api";
import { UNLOCK_TYPE_META } from "@/lib/utils";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";
import { CatalogToolbar } from "@/components/ui/catalog-toolbar";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Flag, Loader2, MapPin, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const INITIAL_MAP_FORM: CreateMapInput = {
  name: "",
  mapType: "",
  unlockType: UnlockType.FREE,
  unlockValue: 0,
  isActive: true,
};

export function MapsManager() {
  const {
    data: maps = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useMapsQuery();

  const createMapMutation = useCreateMapMutation();
  const updateMapMutation = useUpdateMapMutation();
  const deleteMapMutation = useDeleteMapMutation();

  const {
    searchQuery,
    setSearchQuery,
    unlockFilter,
    setUnlockFilter,
    onlyActive,
    setOnlyActive,
    filteredItems: filteredMaps,
  } = useCatalogFilters(maps);

  // Create / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMap, setEditingMap] = useState<GameMap | null>(null);
  const [formData, setFormData] = useState<CreateMapInput>(INITIAL_MAP_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Delete Confirmation Modal
  const [deletingMap, setDeletingMap] = useState<GameMap | null>(null);

  const isSaving = createMapMutation.isPending || updateMapMutation.isPending;
  const isDeleting = deleteMapMutation.isPending;

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.isError) {
      toast.error(parseApiError(result.error).message);
    } else {
      toast.success("Elenco mappe aggiornato.");
    }
  };

  const openCreateModal = () => {
    setEditingMap(null);
    setFormData(INITIAL_MAP_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (map: GameMap) => {
    setEditingMap(map);
    setFormData({
      name: map.name,
      mapType: map.mapType ?? "",
      unlockType: map.unlockType,
      unlockValue: map.unlockType === UnlockType.FREE ? 0 : map.unlockValue,
      isActive: map.isActive,
    });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleUnlockTypeChange = (newType: UnlockType) => {
    setFormData((prev) => ({
      ...prev,
      unlockType: newType,
      unlockValue: newType === UnlockType.FREE ? 0 : prev.unlockValue,
    }));
  };

  const validateClientForm = (): boolean => {
    const errs: Record<string, string[]> = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errs.name = ["Il nome della mappa è obbligatorio."];
    } else if (trimmedName.length > 100) {
      errs.name = ["Il nome non può superare i 100 caratteri."];
    }

    if (formData.mapType && formData.mapType.trim().length > 50) {
      errs.mapType = ["Il tipo mappa non può superare i 50 caratteri."];
    }

    if (
      formData.unlockType !== UnlockType.FREE &&
      (!Number.isInteger(Number(formData.unlockValue)) ||
        Number(formData.unlockValue) < 0)
    ) {
      errs.unlockValue = ["Il valore di sblocco deve essere un intero positivo."];
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateClientForm()) return;

    setFieldErrors({});

    const payload: CreateMapInput = {
      name: formData.name.trim(),
      mapType: formData.mapType?.trim() ? formData.mapType.trim() : null,
      unlockType: formData.unlockType,
      unlockValue:
        formData.unlockType === UnlockType.FREE
          ? 0
          : Number(formData.unlockValue),
      isActive: formData.isActive,
    };

    try {
      if (editingMap) {
        const updated = await updateMapMutation.mutateAsync({
          id: editingMap.id,
          payload,
        });
        toast.success(`Mappa "${updated.name}" aggiornata con successo!`);
      } else {
        const created = await createMapMutation.mutateAsync(payload);
        toast.success(`Nuova mappa "${created.name}" creata con successo!`);
      }
      setIsFormOpen(false);
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.fieldErrors) {
        setFieldErrors(parsed.fieldErrors);
      }
      toast.error(parsed.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMap) return;
    try {
      await deleteMapMutation.mutateAsync(deletingMap.id);
      toast.success(`Mappa "${deletingMap.name}" eliminata con successo.`);
      setDeletingMap(null);
    } catch (error) {
      const parsed = parseApiError(error);
      toast.error(parsed.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          🗺 Gestione Circuiti / Mappe
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Gestisci le piste e le ambientazioni del gioco, i tipi di terreno e i
          requisiti di sblocco
        </p>
      </div>

      {/* Toolbar */}
      <CatalogToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unlockFilter={unlockFilter}
        onUnlockFilterChange={setUnlockFilter}
        onlyActive={onlyActive}
        onOnlyActiveChange={setOnlyActive}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
        onCreateNew={openCreateModal}
        createButtonLabel="Nuova Mappa"
        totalCount={maps.length}
        filteredCount={filteredMaps.length}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/70 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Nome Circuito</th>
                <th className="px-4 py-3.5">Ambientazione / Tipo</th>
                <th className="px-4 py-3.5">Sblocco &amp; Costo</th>
                <th className="px-4 py-3.5">Stato</th>
                <th className="px-4 py-3.5 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                      Caricamento circuiti...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-red-400"
                  >
                    {parseApiError(error).message}
                  </td>
                </tr>
              ) : filteredMaps.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    <Flag className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                    Nessuna mappa trovata con i filtri selezionati.
                  </td>
                </tr>
              ) : (
                filteredMaps.map((map) => (
                  <tr
                    key={map.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">
                      #{map.id}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-100">
                      {map.name}
                    </td>
                    <td className="px-4 py-3.5">
                      {map.mapType ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                          <MapPin className="h-3 w-3" />
                          {map.mapType}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <UnlockTypeBadge
                        unlockType={map.unlockType}
                        unlockValue={map.unlockValue}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge isActive={map.isActive} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(map)}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-800/70 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 transition-colors cursor-pointer"
                          title="Modifica mappa"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingMap(map)}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-800/70 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                          title="Elimina mappa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">
                  {editingMap
                    ? `Modifica Mappa #${editingMap.id}`
                    : "Nuova Mappa / Circuito"}
                </h2>
                <p className="text-xs text-zinc-400">
                  Definisci nome, ambientazione e requisiti di sblocco del
                  circuito
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                disabled={isSaving}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nome Circuito / Mappa{" "}
                  <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="es. Neon Highway, Desert Oasis..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.name.join(", ")}
                  </p>
                )}
              </div>

              {/* MapType */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Ambientazione / Tipo (mapType - opzionale)
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.mapType ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mapType: e.target.value,
                    }))
                  }
                  placeholder="es. asphalt, desert, cyberpunk, snow..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {fieldErrors.mapType && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.mapType.join(", ")}
                  </p>
                )}
              </div>

              {/* UnlockType & UnlockValue */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Metodo di Sblocco <span className="text-orange-400">*</span>
                  </label>
                  <select
                    value={formData.unlockType}
                    onChange={(e) =>
                      handleUnlockTypeChange(e.target.value as UnlockType)
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    {Object.values(UnlockType).map((type) => (
                      <option key={type} value={type}>
                        {UNLOCK_TYPE_META[type].label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.unlockType && (
                    <p className="mt-1 text-xs text-red-400">
                      {fieldErrors.unlockType.join(", ")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Valore / Costo Sblocco
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    disabled={formData.unlockType === UnlockType.FREE}
                    value={
                      formData.unlockType === UnlockType.FREE
                        ? 0
                        : formData.unlockValue
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        unlockValue: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-zinc-900 disabled:text-zinc-500"
                  />
                  {formData.unlockType === UnlockType.FREE && (
                    <p className="mt-1 text-[11px] text-zinc-500">
                      Impostato automaticamente a 0 per sblocco FREE.
                    </p>
                  )}
                  {fieldErrors.unlockValue && (
                    <p className="mt-1 text-xs text-red-400">
                      {fieldErrors.unlockValue.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* isActive Switch */}
              <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                <div>
                  <span className="block text-sm font-medium text-zinc-200">
                    Stato Visibilità (isActive)
                  </span>
                  <span className="text-xs text-zinc-400">
                    Rendi il circuito giocabile nell&apos;app
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="h-6 w-11 rounded-full bg-zinc-800 transition-colors peer-checked:bg-emerald-500 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="rounded-xl border border-zinc-700 bg-zinc-800/70 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm font-semibold text-zinc-950 hover:from-orange-400 hover:to-amber-400 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvataggio...
                    </>
                  ) : editingMap ? (
                    "Salva Modifiche"
                  ) : (
                    "Crea Mappa"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingMap)}
        title="Elimina Mappa dal Catalogo"
        itemName={deletingMap?.name || ""}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingMap(null)}
      />
    </div>
  );
}
