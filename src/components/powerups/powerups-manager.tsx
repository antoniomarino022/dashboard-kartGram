"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Caption,
  Cell,
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
  useCreatePowerupMutation,
  useDeletePowerupMutation,
  usePowerupsQuery,
  useUpdatePowerupMutation,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import { UnlockType, type CreatePowerupInput, type Powerup } from "@/types/api";
import { UNLOCK_TYPE_META } from "@/lib/utils";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";
import { CatalogToolbar } from "@/components/ui/catalog-toolbar";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Pencil, Trash2, X, Zap } from "lucide-react";
import { toast } from "sonner";

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

  // Create / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPowerup, setEditingPowerup] = useState<Powerup | null>(null);
  const [formData, setFormData] = useState<CreatePowerupInput>(
    INITIAL_POWERUP_FORM
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Delete Confirmation Modal
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

  const openCreateModal = () => {
    setEditingPowerup(null);
    setFormData(INITIAL_POWERUP_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (powerup: Powerup) => {
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
      errs.name = ["Il nome del potenziamento è obbligatorio."];
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
        toast.success(`Powerup "${updated.name}" aggiornato con successo!`);
      } else {
        const created = await createPowerupMutation.mutateAsync(payload);
        toast.success(`Nuovo powerup "${created.name}" creato con successo!`);
      }
      setIsFormOpen(false);
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.fieldErrors) {
        setFieldErrors(parsed.fieldErrors);
      } else if (parsed.status === 409) {
        setFieldErrors({
          name: [parsed.message || "Esiste già un powerup con questo nome."],
        });
      }
      toast.error(parsed.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPowerup) return;
    try {
      await deletePowerupMutation.mutateAsync(deletingPowerup.id);
      toast.success(`Powerup "${deletingPowerup.name}" eliminato con successo.`);
      setDeletingPowerup(null);
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
              ⚡ Gestione Potenziamenti (Powerups)
            </Title>
            <Badge type="number" mode="secondary">
              {powerups.length}
            </Badge>
          </div>
          <Subheadline level="2" className="mt-1 !text-zinc-400">
            Gestisci i potenziamenti utilizzabili in gara e i relativi requisiti
            di sblocco
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
        createButtonLabel="Nuovo Powerup"
        totalCount={powerups.length}
        filteredCount={filteredPowerups.length}
      />

      {/* Table inside Telegram UI Section */}
      <Section
        header="Elenco Potenziamenti"
        className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50"
      >
        {isLoading ? (
          <Placeholder
            header="Caricamento potenziamenti..."
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
        ) : filteredPowerups.length === 0 ? (
          <Placeholder
            header="Nessun potenziamento trovato"
            description="Non ci sono powerup corrispondenti ai filtri selezionati."
            action={
              <Button size="s" mode="bezeled" onClick={openCreateModal}>
                Crea Nuovo Powerup
              </Button>
            }
          >
            <Zap className="h-10 w-10 text-zinc-600" />
          </Placeholder>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950/70 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Nome Powerup</th>
                  <th className="px-4 py-3.5">Sblocco &amp; Costo</th>
                  <th className="px-4 py-3.5">Stato</th>
                  <th className="px-4 py-3.5 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredPowerups.map((powerup) => (
                  <tr
                    key={powerup.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">
                      #{powerup.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-2 font-semibold text-zinc-100">
                        <Zap className="h-4 w-4 text-amber-400" />
                        {powerup.name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <UnlockTypeBadge
                        unlockType={powerup.unlockType}
                        unlockValue={powerup.unlockValue}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge isActive={powerup.isActive} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          size="s"
                          mode="bezeled"
                          onClick={() => openEditModal(powerup)}
                          before={<Pencil className="h-3.5 w-3.5" />}
                        >
                          Modifica
                        </Button>
                        <IconButton
                          type="button"
                          size="s"
                          mode="gray"
                          onClick={() => setDeletingPowerup(powerup)}
                          title="Elimina powerup"
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
                  {editingPowerup
                    ? `Modifica Powerup #${editingPowerup.id}`
                    : "Nuovo Potenziamento (Powerup)"}
                </Title>
                <Caption level="1" className="!text-zinc-400">
                  Definisci il nome del potenziamento e i requisiti di sblocco
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
                header="Informazioni Powerup"
                className="overflow-hidden rounded-xl border border-zinc-800/80"
              >
                <Input
                  header="Nome Powerup *"
                  required
                  maxLength={100}
                  status={fieldErrors.name ? "error" : "default"}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="es. Turbo Boost, Energy Shield, Magnet..."
                />
                {fieldErrors.name && (
                  <div className="px-5 pb-2">
                    <Caption level="1" className="!text-red-400">
                      {fieldErrors.name.join(", ")}
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
                  subtitle="Rendi il potenziamento attivo e sbloccabile in gioco"
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
                  {editingPowerup ? "Salva Modifiche" : "Crea Powerup"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingPowerup)}
        title="Elimina Powerup dal Catalogo"
        itemName={deletingPowerup?.name || ""}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPowerup(null)}
      />
    </div>
  );
}
