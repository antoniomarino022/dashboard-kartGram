"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { parseApiError } from "@/services/apiClient";
import {
  useCreateMapMutation,
  useDeleteMapMutation,
  useMapsQuery,
  useUpdateMapMutation,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import { UnlockType, type CreateMapInput, type GameMap } from "@/types/api";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { UnlockFieldsSection } from "@/components/ui/unlock-fields-section";
import {
  DataTableManager,
  type DataTableColumn,
} from "@/components/ui/data-table-manager";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";

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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMap, setEditingMap] = useState<GameMap | null>(null);
  const [formData, setFormData] = useState<CreateMapInput>(INITIAL_MAP_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
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

  const openCreate = () => {
    setEditingMap(null);
    setFormData(INITIAL_MAP_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (map: GameMap) => {
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
      errs.name = ["Il nome del tracciato è obbligatorio."];
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
      errs.unlockValue = [
        "Il valore di sblocco deve essere un intero positivo.",
      ];
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
        toast.success(`Mappa "${updated.name}" aggiornata.`);
      } else {
        const created = await createMapMutation.mutateAsync(payload);
        toast.success(`Mappa "${created.name}" creata.`);
      }
      setIsFormOpen(false);
    } catch (err) {
      const parsed = parseApiError(err);
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
      toast.success(`Mappa "${deletingMap.name}" eliminata.`);
      setDeletingMap(null);
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  const columns: DataTableColumn<GameMap>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Nome Circuito",
        render: (map) => (
          <div className="flex flex-col">
            <span className="font-semibold text-tg-primary">{map.name}</span>
            <span className="text-[11px] text-tg-muted">
              {map.mapType || "standard"}
            </span>
          </div>
        ),
      },
      {
        key: "mapType",
        header: "Ambiente / Categoria",
        render: (map) => (
          <span className="text-xs text-tg-muted">
            {map.mapType || "Standard"}
          </span>
        ),
      },
      {
        key: "unlock",
        header: "Sblocco & Costo",
        render: (map) => (
          <UnlockTypeBadge
            unlockType={map.unlockType}
            unlockValue={map.unlockValue}
          />
        ),
      },
      {
        key: "status",
        header: "Stato",
        align: "center",
        render: (map) => <StatusBadge isActive={map.isActive} />,
      },
    ],
    []
  );

  return (
    <>
      <DataTableManager<GameMap>
        title="Mappe & Tracciati"
        description="Circuiti, ambientazioni e condizioni di accesso in-game"
        items={filteredMaps}
        columns={columns}
        getId={(map) => map.id}
        getIsActive={(map) => map.isActive}
        totalCount={maps.length}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={isError ? parseApiError(error).message : undefined}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cerca tracciato per nome o ambiente..."
        unlockFilter={unlockFilter}
        onUnlockFilterChange={setUnlockFilter}
        onlyActive={onlyActive}
        onOnlyActiveChange={setOnlyActive}
        onRefresh={handleRefresh}
        createButtonLabel="Nuova Mappa"
        isFormOpen={isFormOpen}
        formTitle={editingMap ? `Modifica Mappa #${editingMap.id}` : "Nuova Mappa"}
        formSubtitle="Compila i dati dell'ambientazione e i parametri di accesso."
        isSaving={isSaving}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onCloseForm={() => setIsFormOpen(false)}
        onRequestDelete={setDeletingMap}
        onSubmitForm={handleSubmit}
        submitButtonLabel={editingMap ? "Salva Modifiche" : "Crea Mappa"}
        renderFormFields={() => (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-tg-muted">
                Nome Circuito *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="es. Desert Dunes, Neon City..."
                className="h-8 w-full rounded-md border border-tg-border bg-tg-surface px-2.5 text-xs text-tg-primary focus:border-tg-accent focus:outline-none"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] text-tg-danger">
                  {fieldErrors.name.join(", ")}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-tg-muted">
                Ambiente / Tipo (opzionale)
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.mapType ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mapType: e.target.value }))
                }
                placeholder="es. asfalto, sabbia, notturna..."
                className="h-8 w-full rounded-md border border-tg-border bg-tg-surface px-2.5 text-xs text-tg-primary focus:border-tg-accent focus:outline-none"
              />
            </div>

            <UnlockFieldsSection
              unlockType={formData.unlockType}
              unlockValue={formData.unlockValue}
              isActive={formData.isActive}
              onUnlockTypeChange={handleUnlockTypeChange}
              onUnlockValueChange={(val) =>
                setFormData((prev) => ({ ...prev, unlockValue: val }))
              }
              onIsActiveChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
              activeSubtitle="Rendi il circuito selezionabile in gioco"
              fieldErrors={fieldErrors}
            />
          </div>
        )}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deletingMap)}
        title="Elimina Mappa"
        itemName={deletingMap?.name ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingMap(null)}
      />
    </>
  );
}
