"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { parseApiError } from "@/services/apiClient";
import {
  useCreatePowerupMutation,
  useDeletePowerupMutation,
  usePowerupsQuery,
  useUpdatePowerupMutation,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import { UnlockType, type CreatePowerupInput, type Powerup } from "@/types/api";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { UnlockFieldsSection } from "@/components/ui/unlock-fields-section";
import {
  DataTableManager,
  type DataTableColumn,
} from "@/components/ui/data-table-manager";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";

const INITIAL_POWERUP_FORM: CreatePowerupInput = {
  name: "",
  unlockType: UnlockType.FREE,
  unlockValue: 0,
  isActive: true,
};

export function PowerupsManager() {
  const {
    data: powerups = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = usePowerupsQuery();

  const createPowerupMutation = useCreatePowerupMutation();
  const updatePowerupMutation = useUpdatePowerupMutation();
  const deletePowerupMutation = useDeletePowerupMutation();

  const {
    searchQuery,
    setSearchQuery,
    unlockFilter,
    setUnlockFilter,
    onlyActive,
    setOnlyActive,
    filteredItems: filteredPowerups,
  } = useCatalogFilters(powerups);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPowerup, setEditingPowerup] = useState<Powerup | null>(null);
  const [formData, setFormData] = useState<CreatePowerupInput>(
    INITIAL_POWERUP_FORM
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [deletingPowerup, setDeletingPowerup] = useState<Powerup | null>(null);

  const isSaving =
    createPowerupMutation.isPending || updatePowerupMutation.isPending;
  const isDeleting = deletePowerupMutation.isPending;

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.isError) {
      toast.error(parseApiError(result.error).message);
    } else {
      toast.success("Elenco potenziamenti aggiornato.");
    }
  };

  const openCreate = () => {
    setEditingPowerup(null);
    setFormData(INITIAL_POWERUP_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (powerup: Powerup) => {
    setEditingPowerup(powerup);
    setFormData({
      name: powerup.name,
      unlockType: powerup.unlockType,
      unlockValue:
        powerup.unlockType === UnlockType.FREE ? 0 : powerup.unlockValue,
      isActive: powerup.isActive,
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
      errs.name = ["Il nome del powerup è obbligatorio."];
    } else if (trimmedName.length > 100) {
      errs.name = ["Il nome non può superare i 100 caratteri."];
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
    const payload: CreatePowerupInput = {
      name: formData.name.trim(),
      unlockType: formData.unlockType,
      unlockValue:
        formData.unlockType === UnlockType.FREE
          ? 0
          : Number(formData.unlockValue),
      isActive: formData.isActive,
    };

    try {
      if (editingPowerup) {
        const updated = await updatePowerupMutation.mutateAsync({
          id: editingPowerup.id,
          payload,
        });
        toast.success(`Powerup "${updated.name}" aggiornato.`);
      } else {
        const created = await createPowerupMutation.mutateAsync(payload);
        toast.success(`Powerup "${created.name}" creato.`);
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
    if (!deletingPowerup) return;
    try {
      await deletePowerupMutation.mutateAsync(deletingPowerup.id);
      toast.success(`Powerup "${deletingPowerup.name}" eliminato.`);
      setDeletingPowerup(null);
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  const columns: DataTableColumn<Powerup>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Nome Abilità / Powerup",
        render: (powerup) => (
          <span className="font-semibold text-tg-primary">{powerup.name}</span>
        ),
      },
      {
        key: "unlock",
        header: "Sblocco & Costo",
        render: (powerup) => (
          <UnlockTypeBadge
            unlockType={powerup.unlockType}
            unlockValue={powerup.unlockValue}
          />
        ),
      },
      {
        key: "status",
        header: "Stato",
        align: "center",
        render: (powerup) => <StatusBadge isActive={powerup.isActive} />,
      },
    ],
    []
  );

  return (
    <>
      <DataTableManager<Powerup>
        title="Powerup & Abilità"
        description="Abilità speciali in gara, monete e condizioni di sblocco"
        items={filteredPowerups}
        columns={columns}
        getId={(powerup) => powerup.id}
        getIsActive={(powerup) => powerup.isActive}
        totalCount={powerups.length}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={isError ? parseApiError(error).message : undefined}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cerca powerup per nome..."
        unlockFilter={unlockFilter}
        onUnlockFilterChange={setUnlockFilter}
        onlyActive={onlyActive}
        onOnlyActiveChange={setOnlyActive}
        onRefresh={handleRefresh}
        createButtonLabel="Nuovo Powerup"
        isFormOpen={isFormOpen}
        formTitle={
          editingPowerup
            ? `Modifica Powerup #${editingPowerup.id}`
            : "Nuovo Powerup"
        }
        formSubtitle="Definisci il nome dell'abilità e le condizioni di acquisto."
        isSaving={isSaving}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onCloseForm={() => setIsFormOpen(false)}
        onRequestDelete={setDeletingPowerup}
        onSubmitForm={handleSubmit}
        submitButtonLabel={editingPowerup ? "Salva Modifiche" : "Crea Powerup"}
        renderFormFields={() => (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-tg-muted">
                Nome Powerup *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="es. Nitro Boost, Scudo Magnetico..."
                className="h-8 w-full rounded-md border border-tg-border bg-tg-surface px-2.5 text-xs text-tg-primary focus:border-tg-accent focus:outline-none"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] text-tg-danger">
                  {fieldErrors.name.join(", ")}
                </p>
              )}
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
              activeSubtitle="Rendi il potenziamento ottenibile in gioco"
              fieldErrors={fieldErrors}
            />
          </div>
        )}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deletingPowerup)}
        title="Elimina Powerup"
        itemName={deletingPowerup?.name ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPowerup(null)}
      />
    </>
  );
}
