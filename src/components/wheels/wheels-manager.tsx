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
  useCreateWheelMutation,
  useDeleteWheelMutation,
  useUpdateWheelMutation,
  useWheelsQuery,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import { UnlockType, type CreateWheelInput, type Wheel } from "@/types/api";
import { UNLOCK_TYPE_META } from "@/lib/utils";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";
import { CatalogToolbar } from "@/components/ui/catalog-toolbar";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Disc, Heart, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

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

  // Create / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWheel, setEditingWheel] = useState<Wheel | null>(null);
  const [formData, setFormData] =
    useState<CreateWheelInput>(INITIAL_WHEEL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Delete Confirmation Modal
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

  const openCreateModal = () => {
    setEditingWheel(null);
    setFormData(INITIAL_WHEEL_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (wheel: Wheel) => {
    setEditingWheel(wheel);
    setFormData({
      name: wheel.name,
      capacity: wheel.capacity,
      unlockType: wheel.unlockType,
      unlockValue: wheel.unlockType === UnlockType.FREE ? 0 : wheel.unlockValue,
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
      Number(formData.capacity) < 0
    ) {
      errs.capacity = [
        "La capacità (vite extra) deve essere un numero intero valido.",
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
        toast.success(`Set di ruote "${updated.name}" aggiornato con successo!`);
      } else {
        const created = await createWheelMutation.mutateAsync(payload);
        toast.success(
          `Nuovo set di ruote "${created.name}" creato con successo!`
        );
      }
      setIsFormOpen(false);
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.fieldErrors) {
        setFieldErrors(parsed.fieldErrors);
      } else if (parsed.status === 409) {
        setFieldErrors({
          name: [
            parsed.message || "Esiste già un set di ruote con questo nome.",
          ],
        });
      }
      toast.error(parsed.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingWheel) return;
    try {
      await deleteWheelMutation.mutateAsync(deletingWheel.id);
      toast.success(
        `Set di ruote "${deletingWheel.name}" eliminato con successo.`
      );
      setDeletingWheel(null);
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
              🛞 Gestione Ruote (Wheels)
            </Title>
            <Badge type="number" mode="secondary">
              {wheels.length}
            </Badge>
          </div>
          <Subheadline level="2" className="mt-1 !text-zinc-400">
            Gestisci i set di ruote, la capacità di vite extra fornite e i
            requisiti di sblocco
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
        createButtonLabel="Nuove Ruote"
        totalCount={wheels.length}
        filteredCount={filteredWheels.length}
      />

      {/* Table inside Telegram UI Section */}
      <Section
        header="Elenco Set di Ruote"
        className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50"
      >
        {isLoading ? (
          <Placeholder
            header="Caricamento set di ruote..."
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
        ) : filteredWheels.length === 0 ? (
          <Placeholder
            header="Nessun set di ruote trovato"
            description="Non ci sono ruote corrispondenti ai filtri selezionati."
            action={
              <Button size="s" mode="bezeled" onClick={openCreateModal}>
                Crea Nuove Ruote
              </Button>
            }
          >
            <Disc className="h-10 w-10 text-zinc-600" />
          </Placeholder>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950/70 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Nome Set Ruote</th>
                  <th className="px-4 py-3.5">Capacità (Vite Extra)</th>
                  <th className="px-4 py-3.5">Sblocco &amp; Costo</th>
                  <th className="px-4 py-3.5">Stato</th>
                  <th className="px-4 py-3.5 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredWheels.map((wheel) => (
                  <tr
                    key={wheel.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">
                      #{wheel.id}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-100">
                      {wheel.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <Chip
                        mode="outline"
                        before={
                          <Heart className="h-3.5 w-3.5 fill-rose-500/30 text-rose-400" />
                        }
                        className="!rounded-lg !py-1 !px-2.5 !border-rose-500/30 !bg-rose-500/10 !text-rose-400 text-xs font-semibold"
                      >
                        {wheel.capacity > 0
                          ? `+${wheel.capacity}`
                          : wheel.capacity}{" "}
                        {Math.abs(wheel.capacity) === 1
                          ? "vita extra"
                          : "vite extra"}
                      </Chip>
                    </td>
                    <td className="px-4 py-3.5">
                      <UnlockTypeBadge
                        unlockType={wheel.unlockType}
                        unlockValue={wheel.unlockValue}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge isActive={wheel.isActive} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          size="s"
                          mode="bezeled"
                          onClick={() => openEditModal(wheel)}
                          before={<Pencil className="h-3.5 w-3.5" />}
                        >
                          Modifica
                        </Button>
                        <IconButton
                          type="button"
                          size="s"
                          mode="gray"
                          onClick={() => setDeletingWheel(wheel)}
                          title="Elimina ruote"
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
                  {editingWheel
                    ? `Modifica Ruote #${editingWheel.id}`
                    : "Nuovo Set di Ruote"}
                </Title>
                <Caption level="1" className="!text-zinc-400">
                  Configura nome, capacità vite extra e requisiti di sblocco
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
                header="Dettagli Tecnici Ruote"
                className="overflow-hidden rounded-xl border border-zinc-800/80"
              >
                <Input
                  header="Nome Set Ruote *"
                  required
                  maxLength={100}
                  status={fieldErrors.name ? "error" : "default"}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="es. Slick Pro, Offroad Monster, Turbo Grip..."
                />
                {fieldErrors.name && (
                  <div className="px-5 pb-2">
                    <Caption level="1" className="!text-red-400">
                      {fieldErrors.name.join(", ")}
                    </Caption>
                  </div>
                )}

                <Input
                  header="Capacità / Vite Extra (capacity) *"
                  type="number"
                  required
                  min={0}
                  step={1}
                  status={fieldErrors.capacity ? "error" : "default"}
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      capacity: Number(e.target.value),
                    }))
                  }
                />
                {fieldErrors.capacity && (
                  <div className="px-5 pb-2">
                    <Caption level="1" className="!text-red-400">
                      {fieldErrors.capacity.join(", ")}
                    </Caption>
                  </div>
                )}
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
                {fieldErrors.unlockValue && (
                  <div className="px-5 pb-2">
                    <Caption level="1" className="!text-red-400">
                      {fieldErrors.unlockValue.join(", ")}
                    </Caption>
                  </div>
                )}

                <Cell
                  Component="label"
                  subtitle="Rendi questo set di ruote disponibile nel catalogo"
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
                  {editingWheel ? "Salva Modifiche" : "Crea Ruote"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingWheel)}
        title="Elimina Ruote dal Catalogo"
        itemName={deletingWheel?.name || ""}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingWheel(null)}
      />
    </div>
  );
}
