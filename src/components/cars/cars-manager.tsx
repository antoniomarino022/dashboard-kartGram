"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Caption,
  Cell,
  Chip,
  IconButton,
  Input,
  Placeholder,
  Section,
  Select,
  Spinner,
  Subheadline,
  Switch,
  Title,
} from "@telegram-apps/telegram-ui";
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
import { CarFront, Gauge, Heart, Pencil, Trash2, X } from "lucide-react";
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Title level="1" className="!text-2xl !font-bold !text-zinc-100">
              🏎 Gestione Auto
            </Title>
            <Badge type="number" mode="secondary">
              {cars.length}
            </Badge>
          </div>
          <Subheadline level="2" className="mt-1 !text-zinc-400">
            Gestisci il parco auto da corsa, le statistiche di velocità, vite
            base e requisiti di sblocco
          </Subheadline>
        </div>
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

      {/* Table inside Telegram UI Section */}
      <Section
        header="Catalogo Parco Auto"
        className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50"
      >
        {isLoading ? (
          <Placeholder
            header="Caricamento parco auto..."
            description="Recupero dati dal server in corso"
          >
            <Spinner size="l" />
          </Placeholder>
        ) : isError ? (
          <Placeholder
            header="Errore di caricamento"
            description={parseApiError(error).message}
            action={
              <Button size="s" mode="bezeled" onClick={handleRefresh}>
                Riprova
              </Button>
            }
          />
        ) : filteredCars.length === 0 ? (
          <Placeholder
            header="Nessuna auto trovata"
            description="Non ci sono auto corrispondenti ai filtri selezionati."
            action={
              <Button size="s" mode="bezeled" onClick={openCreateModal}>
                Crea Nuova Auto
              </Button>
            }
          >
            <CarFront className="h-10 w-10 text-zinc-600" />
          </Placeholder>
        ) : (
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
                {filteredCars.map((car) => (
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
                        <Chip
                          mode="mono"
                          className="!rounded-md !py-0.5 !px-2 text-xs font-medium"
                        >
                          {car.carType}
                        </Chip>
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
                      <div className="inline-flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          size="s"
                          mode="bezeled"
                          onClick={() => openEditModal(car)}
                          before={<Pencil className="h-3.5 w-3.5" />}
                        >
                          Modifica
                        </Button>
                        <IconButton
                          type="button"
                          size="s"
                          mode="gray"
                          onClick={() => setDeletingCar(car)}
                          title="Elimina auto"
                          className="hover:!text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Create / Edit Modal with Telegram UI Form Controls */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <Title level="3" className="!text-lg !font-bold !text-zinc-100">
                  {editingCar
                    ? `Modifica Auto #${editingCar.id}`
                    : "Nuova Auto da Corsa"}
                </Title>
                <Caption level="1" className="!text-zinc-400">
                  Compila i parametri tecnici e di sblocco dell&apos;auto
                </Caption>
              </div>
              <IconButton
                type="button"
                size="s"
                mode="gray"
                onClick={() => setIsFormOpen(false)}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </IconButton>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Section
                header="Specifiche Auto"
                className="overflow-hidden rounded-xl border border-zinc-800/80"
              >
                <Input
                  header="Nome Auto *"
                  required
                  maxLength={100}
                  status={fieldErrors.name ? "error" : "default"}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="es. Speedy Kart, Rocket Flame..."
                />
                {fieldErrors.name && (
                  <div className="px-5 pb-2">
                    <Caption level="1" className="!text-red-400">
                      {fieldErrors.name.join(", ")}
                    </Caption>
                  </div>
                )}

                <Input
                  header="Categoria / Tipo (carType - opzionale)"
                  maxLength={50}
                  status={fieldErrors.carType ? "error" : "default"}
                  value={formData.carType ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      carType: e.target.value,
                    }))
                  }
                  placeholder="es. speed, drift, acceleration, balanced..."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <Input
                    header="Velocità (speed) *"
                    type="number"
                    required
                    min={1}
                    step={1}
                    status={fieldErrors.speed ? "error" : "default"}
                    value={formData.speed}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        speed: Number(e.target.value),
                      }))
                    }
                  />
                  <Input
                    header="Vite Base (baseLives) *"
                    type="number"
                    required
                    min={1}
                    step={1}
                    status={fieldErrors.baseLives ? "error" : "default"}
                    value={formData.baseLives}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        baseLives: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </Section>

              <Section
                header="Sblocco & Stato"
                className="overflow-hidden rounded-xl border border-zinc-800/80"
              >
                <Select
                  header="Metodo di Sblocco *"
                  status={fieldErrors.unlockType ? "error" : "default"}
                  value={formData.unlockType}
                  onChange={(e) =>
                    handleUnlockTypeChange(e.target.value as UnlockType)
                  }
                >
                  {Object.values(UnlockType).map((type) => (
                    <option key={type} value={type}>
                      {UNLOCK_TYPE_META[type].label}
                    </option>
                  ))}
                </Select>

                <Input
                  header="Valore / Costo Sblocco"
                  type="number"
                  min={0}
                  step={1}
                  status={fieldErrors.unlockValue ? "error" : "default"}
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
                />

                <Cell
                  Component="label"
                  subtitle="Rendi l'auto disponibile nel catalogo di gioco"
                  after={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                    />
                  }
                >
                  Stato Visibilità (isActive)
                </Cell>
              </Section>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
                <Button
                  type="button"
                  size="m"
                  mode="gray"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  size="m"
                  mode="filled"
                  loading={isSaving}
                  disabled={isSaving}
                >
                  {editingCar ? "Salva Modifiche" : "Crea Auto"}
                </Button>
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
