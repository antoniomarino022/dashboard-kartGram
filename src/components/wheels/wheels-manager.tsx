"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { parseApiError } from "@/services/apiClient";
import {
  useCreateWheelMutation,
  useDeleteWheelMutation,
  useUpdateWheelMutation,
  useWheelsQuery,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import { UnlockType, type CreateWheelInput, type Wheel } from "@/types/api";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { UnlockFieldsSection } from "@/components/ui/unlock-fields-section";
import {
  DataTableManager,
  type DataTableColumn,
} from "@/components/ui/data-table-manager";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";

const INITIAL_WHEEL_FORM: CreateWheelInput = {
  name: "",
  capacity: 1,
  unlockType: UnlockType.FREE,
  unlockValue: 0,
  isActive: true,
};

export function WheelsManager() {
  const {
    data: wheels = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useWheelsQuery();

  const createWheelMutation = useCreateWheelMutation();
  const updateWheelMutation = useUpdateWheelMutation();
  const deleteWheelMutation = useDeleteWheelMutation();

  const {
    searchQuery,
    setSearchQuery,
    unlockFilter,
    setUnlockFilter,
    onlyActive,
    setOnlyActive,
    filteredItems: filteredWheels,
  } = useCatalogFilters(wheels);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWheel, setEditingWheel] = useState<Wheel | null>(null);
  const [formData, setFormData] =
    useState<CreateWheelInput>(INITIAL_WHEEL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [deletingWheel, setDeletingWheel] = useState<Wheel | null>(null);

  const isSaving =
    createWheelMutation.isPending || updateWheelMutation.isPending;
  const isDeleting = deleteWheelMutation.isPending;

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.isError) {
      toast.error(parseApiError(result.error).message);
    } else {
      toast.success("Elenco ruote aggiornato.");
    }
  };

  const openCreate = () => {
    setEditingWheel(null);
    setFormData(INITIAL_WHEEL_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (wheel: Wheel) => {
    setEditingWheel(wheel);
    setFormData({
      name: wheel.name,
      capacity: wheel.capacity,
      unlockType: wheel.unlockType,
      unlockValue:
        wheel.unlockType === UnlockType.FREE ? 0 : wheel.unlockValue,
      isActive: wheel.isActive,
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
      errs.name = ["Il nome del set di ruote è obbligatorio."];
    } else if (trimmedName.length > 100) {
      errs.name = ["Il nome non può superare i 100 caratteri."];
    }

    if (
      !Number.isInteger(Number(formData.capacity)) ||
      Number(formData.capacity) < 1
    ) {
      errs.capacity = [
        "La capacità/vite bonus deve essere un intero maggiore o uguale a 1.",
      ];
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
    const payload: CreateWheelInput = {
      name: formData.name.trim(),
      capacity: Number(formData.capacity),
      unlockType: formData.unlockType,
      unlockValue:
        formData.unlockType === UnlockType.FREE
          ? 0
          : Number(formData.unlockValue),
      isActive: formData.isActive,
    };

    try {
      if (editingWheel) {
        const updated = await updateWheelMutation.mutateAsync({
          id: editingWheel.id,
          payload,
        });
        toast.success(`Set ruote "${updated.name}" aggiornato.`);
      } else {
        const created = await createWheelMutation.mutateAsync(payload);
        toast.success(`Set ruote "${created.name}" creato.`);
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
    if (!deletingWheel) return;
    try {
      await deleteWheelMutation.mutateAsync(deletingWheel.id);
      toast.success(`Set ruote "${deletingWheel.name}" eliminato.`);
      setDeletingWheel(null);
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  const columns: DataTableColumn<Wheel>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Nome Set Ruote",
        render: (wheel) => (
          <span className="font-semibold text-tg-primary">{wheel.name}</span>
        ),
      },
      {
        key: "capacity",
        header: "Vite Bonus (Capacity)",
        align: "right",
        render: (wheel) => (
          <span className="font-mono text-xs">+{wheel.capacity} vite</span>
        ),
      },
      {
        key: "unlock",
        header: "Sblocco & Costo",
        render: (wheel) => (
          <UnlockTypeBadge
            unlockType={wheel.unlockType}
            unlockValue={wheel.unlockValue}
          />
        ),
      },
      {
        key: "status",
        header: "Stato",
        align: "center",
        render: (wheel) => <StatusBadge isActive={wheel.isActive} />,
      },
    ],
    []
  );

  return (
    <>
      <DataTableManager<Wheel>
        title="Set Ruote"
        description="Pneumatici e vite supplementari associate"
        items={filteredWheels}
        columns={columns}
        getId={(wheel) => wheel.id}
        getIsActive={(wheel) => wheel.isActive}
        totalCount={wheels.length}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={isError ? parseApiError(error).message : undefined}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cerca ruote per nome..."
        unlockFilter={unlockFilter}
        onUnlockFilterChange={setUnlockFilter}
        onlyActive={onlyActive}
        onOnlyActiveChange={setOnlyActive}
        onRefresh={handleRefresh}
        createButtonLabel="Nuove Ruote"
        isFormOpen={isFormOpen}
        formTitle={
          editingWheel ? `Modifica Ruote #${editingWheel.id}` : "Nuove Ruote"
        }
        formSubtitle="Compila nome, capacità e condizioni di sblocco."
        isSaving={isSaving}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onCloseForm={() => setIsFormOpen(false)}
        onRequestDelete={setDeletingWheel}
        onSubmitForm={handleSubmit}
        submitButtonLabel={editingWheel ? "Salva Modifiche" : "Crea Ruote"}
        renderFormFields={() => (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-tg-muted">
                Nome Ruote *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="es. Offroad Mud, Slick Pro..."
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
                Capacità / Vite Supplementari (capacity) *
              </label>
              <input
                type="number"
                required
                min={1}
                step={1}
                value={formData.capacity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    capacity: Number(e.target.value),
                  }))
                }
                className="h-8 w-full rounded-md border border-tg-border bg-tg-surface px-2.5 font-mono text-xs text-tg-primary focus:border-tg-accent focus:outline-none"
              />
              {fieldErrors.capacity && (
                <p className="mt-1 text-[11px] text-tg-danger">
                  {fieldErrors.capacity.join(", ")}
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
              activeSubtitle="Rendi il set di ruote selezionabile nel garage"
              fieldErrors={fieldErrors}
            />
          </div>
        )}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deletingWheel)}
        title="Elimina Ruote"
        itemName={deletingWheel?.name ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingWheel(null)}
      />
    </>
  );
}
