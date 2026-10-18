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
  useCreateMapMutation,
  useDeleteMapMutation,
  useMapsQuery,
  useUpdateMapMutation,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import { UnlockType, type CreateMapInput, type GameMap } from "@/types/api";
import { UNLOCK_TYPE_META } from "@/lib/utils";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";
import { CatalogToolbar } from "@/components/ui/catalog-toolbar";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Flag, MapPin, Pencil, Trash2, X } from "lucide-react";
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Title level="1" className="!text-2xl !font-bold !text-zinc-100">
              🗺 Gestione Circuiti / Mappe
            </Title>
            <Badge type="number" mode="secondary">
              {maps.length}
            </Badge>
          </div>
          <Subheadline level="2" className="mt-1 !text-zinc-400">
            Gestisci le piste e le ambientazioni del gioco, i tipi di terreno e
            i requisiti di sblocco
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
        createButtonLabel="Nuova Mappa"
        totalCount={maps.length}
        filteredCount={filteredMaps.length}
      />

      {/* Table inside Telegram UI Section */}
      <Section
        header="Elenco Circuiti & Ambientazioni"
        className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50"
      >
        {isLoading ? (
          <Placeholder
            header="Caricamento circuiti..."
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
        ) : filteredMaps.length === 0 ? (
          <Placeholder
            header="Nessuna mappa trovata"
            description="Non ci sono mappe corrispondenti ai filtri selezionati."
            action={
              <Button size="s" mode="bezeled" onClick={openCreateModal}>
                Crea Nuova Mappa
              </Button>
            }
          >
            <Flag className="h-10 w-10 text-zinc-600" />
          </Placeholder>
        ) : (
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
                {filteredMaps.map((map) => (
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
                        <Chip
                          mode="outline"
                          before={
                            <MapPin className="h-3 w-3 text-emerald-400" />
                          }
                          className="!rounded-lg !py-0.5 !px-2.5 !border-emerald-500/30 !bg-emerald-500/10 !text-emerald-300 text-xs font-medium"
                        >
                          {map.mapType}
                        </Chip>
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
                      <div className="inline-flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          size="s"
                          mode="bezeled"
                          onClick={() => openEditModal(map)}
                          before={<Pencil className="h-3.5 w-3.5" />}
                        >
                          Modifica
                        </Button>
                        <IconButton
                          type="button"
                          size="s"
                          mode="gray"
                          onClick={() => setDeletingMap(map)}
                          title="Elimina mappa"
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
                  {editingMap
                    ? `Modifica Mappa #${editingMap.id}`
                    : "Nuova Mappa / Circuito"}
                </Title>
                <Caption level="1" className="!text-zinc-400">
                  Definisci nome, ambientazione e requisiti di sblocco del
                  circuito
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
                header="Dettagli Circuito"
                className="overflow-hidden rounded-xl border border-zinc-800/80"
              >
                <Input
                  header="Nome Circuito / Mappa *"
                  required
                  maxLength={100}
                  status={fieldErrors.name ? "error" : "default"}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="es. Neon Highway, Desert Oasis..."
                />
                {fieldErrors.name && (
                  <div className="px-5 pb-2">
                    <Caption level="1" className="!text-red-400">
                      {fieldErrors.name.join(", ")}
                    </Caption>
                  </div>
                )}

                <Input
                  header="Ambientazione / Tipo (mapType - opzionale)"
                  maxLength={50}
                  status={fieldErrors.mapType ? "error" : "default"}
                  value={formData.mapType ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mapType: e.target.value,
                    }))
                  }
                  placeholder="es. asphalt, desert, cyberpunk, snow..."
                />
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
                  subtitle="Rendi il circuito giocabile nell'app"
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
                  {editingMap ? "Salva Modifiche" : "Crea Mappa"}
                </Button>
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
