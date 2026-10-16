"use client";

import { useState } from "react";
import { parseApiError } from "@/services/apiClient";
import {
  useCarsQuery,
  useCreateCarMutation,
  useDeleteCarMutation,
  useUpdateCarMutation,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import { UnlockType, type Car, type CreateCarInput } from "@/types/api";
import { UNLOCK_TYPE_META } from "@/lib/utils";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";
import { CatalogToolbar } from "@/components/ui/catalog-toolbar";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import {
  CarFront,
  Gauge,
  Heart,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

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

  // Create / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<CreateCarInput>(INITIAL_CAR_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Delete Confirmation Modal
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

  const openCreateModal = () => {
    setEditingCar(null);
    setFormData(INITIAL_CAR_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (car: Car) => {
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
      errs.unlockValue = ["Il valore di sblocco deve essere un intero positivo."];
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
        toast.success(`Auto "${updated.name}" aggiornata con successo!`);
      } else {
        const created = await createCarMutation.mutateAsync(payload);
        toast.success(`Nuova auto "${created.name}" creata con successo!`);
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
    if (!deletingCar) return;
    try {
      await deleteCarMutation.mutateAsync(deletingCar.id);
      toast.success(`Auto "${deletingCar.name}" eliminata con successo.`);
      setDeletingCar(null);
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
          🏎 Gestione Auto
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Gestisci il parco auto da corsa, le statistiche di velocità, vite base
          e requisiti di sblocco
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
        createButtonLabel="Nuova Auto"
        totalCount={cars.length}
        filteredCount={filteredCars.length}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/70 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Nome Auto</th>
                <th className="px-4 py-3.5">Categoria</th>
                <th className="px-4 py-3.5">Velocità</th>
                <th className="px-4 py-3.5">Vite Base</th>
                <th className="px-4 py-3.5">Sblocco &amp; Costo</th>
                <th className="px-4 py-3.5">Stato</th>
                <th className="px-4 py-3.5 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                      Caricamento parco auto...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-red-400"
                  >
                    {parseApiError(error).message}
                  </td>
                </tr>
              ) : filteredCars.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    <CarFront className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                    Nessuna auto trovata con i filtri selezionati.
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => (
                  <tr
                    key={car.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">
                      #{car.id}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-100">
                      {car.name}
                    </td>
                    <td className="px-4 py-3.5">
                      {car.carType ? (
                        <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-xs font-medium text-zinc-300">
                          {car.carType}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-orange-400">
                        <Gauge className="h-3.5 w-3.5" />
                        {car.speed} km/h
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400">
                        <Heart className="h-3.5 w-3.5 fill-rose-500/30" />
                        {car.baseLives}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <UnlockTypeBadge
                        unlockType={car.unlockType}
                        unlockValue={car.unlockValue}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge isActive={car.isActive} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(car)}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-800/70 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 transition-colors cursor-pointer"
                          title="Modifica auto"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCar(car)}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-800/70 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                          title="Elimina auto"
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
                  {editingCar
                    ? `Modifica Auto #${editingCar.id}`
                    : "Nuova Auto da Corsa"}
                </h2>
                <p className="text-xs text-zinc-400">
                  Compila i parametri tecnici e di sblocco dell&apos;auto
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
                  Nome Auto <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="es. Speedy Kart, Rocket Flame..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.name.join(", ")}
                  </p>
                )}
              </div>

              {/* CarType */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Categoria / Tipo (carType - opzionale)
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.carType ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      carType: e.target.value,
                    }))
                  }
                  placeholder="es. speed, drift, acceleration, balanced..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {fieldErrors.carType && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.carType.join(", ")}
                  </p>
                )}
              </div>

              {/* Speed & BaseLives */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Velocità (speed) <span className="text-orange-400">*</span>
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
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  {fieldErrors.speed && (
                    <p className="mt-1 text-xs text-red-400">
                      {fieldErrors.speed.join(", ")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Vite Base (baseLives)
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
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  {fieldErrors.baseLives && (
                    <p className="mt-1 text-xs text-red-400">
                      {fieldErrors.baseLives.join(", ")}
                    </p>
                  )}
                </div>
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
                    Rendi l&apos;auto disponibile nel catalogo di gioco
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
                  ) : editingCar ? (
                    "Salva Modifiche"
                  ) : (
                    "Crea Auto"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingCar)}
        title="Elimina Auto dal Catalogo"
        itemName={deletingCar?.name || ""}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCar(null)}
      />
    </div>
  );
}
