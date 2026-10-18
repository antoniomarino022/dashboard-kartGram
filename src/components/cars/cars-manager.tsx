"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { parseApiError } from "@/services/apiClient";
import {
  useCarsQuery,
  useCreateCarMutation,
  useDeleteCarMutation,
  useUpdateCarMutation,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import { UnlockType, type Car, type CreateCarInput } from "@/types/api";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { UnlockFieldsSection } from "@/components/ui/unlock-fields-section";
import {
  DataTableManager,
  type DataTableColumn,
} from "@/components/ui/data-table-manager";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";

const INITIAL_CAR_FORM: CreateCarInput = {
  name: "",
  carType: "",
  speed: 120,
  baseLives: 3,
  unlockType: UnlockType.FREE,
  unlockValue: 0,
  isActive: true,
};

export function CarsManager() {
  const {
    data: cars = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCarsQuery();

  const createCarMutation = useCreateCarMutation();
  const updateCarMutation = useUpdateCarMutation();
  const deleteCarMutation = useDeleteCarMutation();

  const {
    searchQuery,
    setSearchQuery,
    unlockFilter,
    setUnlockFilter,
    onlyActive,
    setOnlyActive,
    filteredItems: filteredCars,
  } = useCatalogFilters(cars);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<CreateCarInput>(INITIAL_CAR_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [deletingCar, setDeletingCar] = useState<Car | null>(null);

  const isSaving = createCarMutation.isPending || updateCarMutation.isPending;
  const isDeleting = deleteCarMutation.isPending;

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.isError) {
      toast.error(parseApiError(result.error).message);
    } else {
      toast.success("Elenco auto aggiornato.");
    }
  };

  const openCreate = () => {
    setEditingCar(null);
    setFormData(INITIAL_CAR_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      carType: car.carType ?? "",
      speed: car.speed,
      baseLives: car.baseLives,
      unlockType: car.unlockType,
      unlockValue: car.unlockType === UnlockType.FREE ? 0 : car.unlockValue,
      isActive: car.isActive,
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
      errs.name = ["Il nome dell'auto è obbligatorio."];
    } else if (trimmedName.length > 100) {
      errs.name = ["Il nome non può superare i 100 caratteri."];
    }

    if (formData.carType && formData.carType.trim().length > 50) {
      errs.carType = ["Il tipo auto non può superare i 50 caratteri."];
    }

    if (
      !Number.isInteger(Number(formData.speed)) ||
      Number(formData.speed) <= 0
    ) {
      errs.speed = ["La velocità deve essere un numero intero positivo."];
    }

    if (
      !Number.isInteger(Number(formData.baseLives)) ||
      Number(formData.baseLives) < 1
    ) {
      errs.baseLives = [
        "Le vite base devono essere un intero maggiore o uguale a 1.",
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
    const payload: CreateCarInput = {
      name: formData.name.trim(),
      carType: formData.carType?.trim() ? formData.carType.trim() : null,
      speed: Number(formData.speed),
      baseLives: Number(formData.baseLives),
      unlockType: formData.unlockType,
      unlockValue:
        formData.unlockType === UnlockType.FREE
          ? 0
          : Number(formData.unlockValue),
      isActive: formData.isActive,
    };

    try {
      if (editingCar) {
        const updated = await updateCarMutation.mutateAsync({
          id: editingCar.id,
          payload,
        });
        toast.success(`Auto "${updated.name}" aggiornata.`);
      } else {
        const created = await createCarMutation.mutateAsync(payload);
        toast.success(`Auto "${created.name}" creata.`);
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
    if (!deletingCar) return;
    try {
      await deleteCarMutation.mutateAsync(deletingCar.id);
      toast.success(`Auto "${deletingCar.name}" eliminata.`);
      setDeletingCar(null);
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  const columns: DataTableColumn<Car>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Nome Auto",
        render: (car) => (
          <div className="flex flex-col">
            <span className="font-semibold text-tg-primary">{car.name}</span>
            <span className="text-[11px] text-tg-muted">
              {car.carType || "standard"}
            </span>
          </div>
        ),
      },
      {
        key: "speed",
        header: "Velocità",
        align: "right",
        render: (car) => (
          <span className="font-mono text-xs">{car.speed} km/h</span>
        ),
      },
      {
        key: "lives",
        header: "Vite Base",
        align: "center",
        render: (car) => (
          <span className="font-mono text-xs">{car.baseLives}</span>
        ),
      },
      {
        key: "unlock",
        header: "Sblocco & Costo",
        render: (car) => (
          <UnlockTypeBadge
            unlockType={car.unlockType}
            unlockValue={car.unlockValue}
          />
        ),
      },
      {
        key: "status",
        header: "Stato",
        align: "center",
        render: (car) => <StatusBadge isActive={car.isActive} />,
      },
    ],
    []
  );

  return (
    <>
      <DataTableManager<Car>
        title="Parco Auto"
        description="Gestisci veicoli, velocità di punta, vite base e tipo di sblocco"
        items={filteredCars}
        columns={columns}
        getId={(car) => car.id}
        getIsActive={(car) => car.isActive}
        totalCount={cars.length}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={isError ? parseApiError(error).message : undefined}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cerca per nome o categoria..."
        unlockFilter={unlockFilter}
        onUnlockFilterChange={setUnlockFilter}
        onlyActive={onlyActive}
        onOnlyActiveChange={setOnlyActive}
        onRefresh={handleRefresh}
        createButtonLabel="Nuova Auto"
        isFormOpen={isFormOpen}
        formTitle={editingCar ? `Modifica Auto #${editingCar.id}` : "Nuova Auto"}
        formSubtitle="Compila i parametri tecnici e di sblocco dell'auto."
        isSaving={isSaving}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onCloseForm={() => setIsFormOpen(false)}
        onRequestDelete={setDeletingCar}
        onSubmitForm={handleSubmit}
        submitButtonLabel={editingCar ? "Salva Modifiche" : "Crea Auto"}
        renderFormFields={() => (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-tg-muted">
                Nome Auto *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="es. Lightning Turbo"
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
                Categoria / Tipo (opzionale)
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.carType ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, carType: e.target.value }))
                }
                placeholder="es. drift, speed, balanced"
                className="h-8 w-full rounded-md border border-tg-border bg-tg-surface px-2.5 text-xs text-tg-primary focus:border-tg-accent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-tg-muted">
                  Velocità *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  step={1}
                  value={formData.speed}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      speed: Number(e.target.value),
                    }))
                  }
                  className="h-8 w-full rounded-md border border-tg-border bg-tg-surface px-2.5 font-mono text-xs text-tg-primary focus:border-tg-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-tg-muted">
                  Vite Base *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  step={1}
                  value={formData.baseLives}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      baseLives: Number(e.target.value),
                    }))
                  }
                  className="h-8 w-full rounded-md border border-tg-border bg-tg-surface px-2.5 font-mono text-xs text-tg-primary focus:border-tg-accent focus:outline-none"
                />
              </div>
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
              activeSubtitle="Rendi l'auto disponibile nel gioco"
              fieldErrors={fieldErrors}
            />
          </div>
        )}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deletingCar)}
        title="Elimina Auto"
        itemName={deletingCar?.name ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCar(null)}
      />
    </>
  );
}
