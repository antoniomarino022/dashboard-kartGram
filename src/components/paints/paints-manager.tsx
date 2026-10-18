"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Caption,
  Cell,
  ColorInput,
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
  useCreatePaintMutation,
  useDeletePaintMutation,
  usePaintsQuery,
  useUpdatePaintMutation,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import { UnlockType, type CreatePaintInput, type Paint } from "@/types/api";
import { UNLOCK_TYPE_META } from "@/lib/utils";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";
import { CatalogToolbar } from "@/components/ui/catalog-toolbar";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Palette, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const INITIAL_PAINT_FORM: CreatePaintInput = {
  color: "#e63946",
  unlockType: UnlockType.FREE,
  unlockValue: 0,
  isActive: true,
};

const PRESET_COLORS = [
  "#e63946",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f8fafc",
  "#18181b",
];

function isHexColor(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^#[0-9A-Fa-f]{6}$/.test(value.trim());
}

export function PaintsManager() {
  const {
    data: paints = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = usePaintsQuery();

  const createPaintMutation = useCreatePaintMutation();
  const updatePaintMutation = useUpdatePaintMutation();
  const deletePaintMutation = useDeletePaintMutation();

  const {
    searchQuery,
    setSearchQuery,
    unlockFilter,
    setUnlockFilter,
    onlyActive,
    setOnlyActive,
    filteredItems: filteredPaints,
  } = useCatalogFilters(paints);

  // Create / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaint, setEditingPaint] = useState<Paint | null>(null);
  const [formData, setFormData] =
    useState<CreatePaintInput>(INITIAL_PAINT_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Delete Confirmation Modal
  const [deletingPaint, setDeletingPaint] = useState<Paint | null>(null);

  const isSaving =
    createPaintMutation.isPending || updatePaintMutation.isPending;
  const isDeleting = deletePaintMutation.isPending;

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.isError) {
      toast.error(parseApiError(result.error).message);
    } else {
      toast.success("Elenco vernici aggiornato.");
    }
  };

  const openCreateModal = () => {
    setEditingPaint(null);
    setFormData(INITIAL_PAINT_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (paint: Paint) => {
    setEditingPaint(paint);
    setFormData({
      color: paint.color ?? "",
      unlockType: paint.unlockType,
      unlockValue: paint.unlockType === UnlockType.FREE ? 0 : paint.unlockValue,
      isActive: paint.isActive,
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
    const trimmedColor = formData.color?.trim() ?? "";

    if (trimmedColor.length > 50) {
      errs.color = ["Il codice/nome colore non può superare i 50 caratteri."];
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

    const payload: CreatePaintInput = {
      color: formData.color?.trim() ? formData.color.trim() : null,
      unlockType: formData.unlockType,
      unlockValue:
        formData.unlockType === UnlockType.FREE
          ? 0
          : Number(formData.unlockValue),
      isActive: formData.isActive,
    };

    try {
      if (editingPaint) {
        const updated = await updatePaintMutation.mutateAsync({
          id: editingPaint.id,
          payload,
        });
        toast.success(
          `Vernice "${updated.color || `#${updated.id}`}" aggiornata con successo!`
        );
      } else {
        const created = await createPaintMutation.mutateAsync(payload);
        toast.success(
          `Nuova vernice "${created.color || `#${created.id}`}" creata con successo!`
        );
      }
      setIsFormOpen(false);
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.fieldErrors) {
        setFieldErrors(parsed.fieldErrors);
      } else if (parsed.status === 409) {
        setFieldErrors({
          color: [parsed.message || "Questo colore esiste già nel catalogo."],
        });
      }
      toast.error(parsed.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPaint) return;
    try {
      await deletePaintMutation.mutateAsync(deletingPaint.id);
      toast.success(
        `Vernice "${deletingPaint.color || `#${deletingPaint.id}`}" eliminata con successo.`
      );
      setDeletingPaint(null);
    } catch (error) {
      const parsed = parseApiError(error);
      toast.error(parsed.message);
    }
  };

  const colorPickerValue = isHexColor(formData.color)
    ? formData.color!.trim()
    : "#e63946";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Title level="1" className="!text-2xl !font-bold !text-zinc-100">
              🎨 Gestione Vernici (Paints)
            </Title>
            <Badge type="number" mode="secondary">
              {paints.length}
            </Badge>
          </div>
          <Subheadline level="2" className="mt-1 !text-zinc-400">
            Gestisci i colori e le verniciature delle auto, con anteprima visiva
            e requisiti di sblocco
          </Subheadline>
        </div>
      </div>

      {/* Toolbar */}
      <CatalogToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cerca per codice o nome colore..."
        unlockFilter={unlockFilter}
        onUnlockFilterChange={setUnlockFilter}
        onlyActive={onlyActive}
        onOnlyActiveChange={setOnlyActive}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
        onCreateNew={openCreateModal}
        createButtonLabel="Nuova Vernice"
        totalCount={paints.length}
        filteredCount={filteredPaints.length}
      />

      {/* Table inside Telegram UI Section */}
      <Section
        header="Elenco Vernici Catalogo"
        className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50"
      >
        {isLoading ? (
          <Placeholder
            header="Caricamento vernici..."
            description="Recupero catalogo vernici dal server"
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
        ) : filteredPaints.length === 0 ? (
          <Placeholder
            header="Nessuna vernice trovata"
            description="Non ci sono vernici corrispondenti ai filtri selezionati."
            action={
              <Button size="s" mode="bezeled" onClick={openCreateModal}>
                Crea Nuova Vernice
              </Button>
            }
          >
            <Palette className="h-10 w-10 text-zinc-600" />
          </Placeholder>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950/70 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Anteprima &amp; Colore</th>
                  <th className="px-4 py-3.5">Sblocco &amp; Costo</th>
                  <th className="px-4 py-3.5">Stato</th>
                  <th className="px-4 py-3.5 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredPaints.map((paint) => (
                  <tr
                    key={paint.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">
                      #{paint.id}
                    </td>
                    <td className="px-4 py-3.5">
                      {paint.color ? (
                        <div className="inline-flex items-center gap-3">
                          <span
                            className="h-7 w-7 shrink-0 rounded-lg border border-white/20 shadow-inner"
                            style={{ backgroundColor: paint.color }}
                            title={`Anteprima colore: ${paint.color}`}
                          />
                          <span className="font-mono text-sm font-semibold text-zinc-100">
                            {paint.color}
                          </span>
                        </div>
                      ) : (
                        <Caption level="1" className="italic !text-zinc-500">
                          Nessun colore (default)
                        </Caption>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <UnlockTypeBadge
                        unlockType={paint.unlockType}
                        unlockValue={paint.unlockValue}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge isActive={paint.isActive} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          size="s"
                          mode="bezeled"
                          onClick={() => openEditModal(paint)}
                          before={<Pencil className="h-3.5 w-3.5" />}
                        >
                          Modifica
                        </Button>
                        <IconButton
                          type="button"
                          size="s"
                          mode="gray"
                          onClick={() => setDeletingPaint(paint)}
                          title="Elimina vernice"
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
                  {editingPaint
                    ? `Modifica Vernice #${editingPaint.id}`
                    : "Nuova Vernice"}
                </Title>
                <Caption level="1" className="!text-zinc-400">
                  Seleziona o inserisci il codice colore e i parametri di
                  sblocco
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
                header="Colore e Livrea"
                className="overflow-hidden rounded-xl border border-zinc-800/80"
              >
                <ColorInput
                  header="Selettore Colore Visivo"
                  value={colorPickerValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                />

                <Input
                  header="Codice o Nome Colore (max 50 caratteri)"
                  status={fieldErrors.color ? "error" : "default"}
                  maxLength={50}
                  value={formData.color ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  placeholder="es. #e63946, Crimson Red, Gold..."
                />

                {/* Quick Preset Swatches */}
                <div className="flex flex-wrap items-center gap-2 px-5 pb-4 pt-1">
                  <Caption level="2" className="!text-zinc-400">
                    Colori rapidi:
                  </Caption>
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, color: preset }))
                      }
                      className={`h-6 w-6 rounded-lg border transition-transform hover:scale-110 cursor-pointer ${
                        formData.color?.toLowerCase() === preset.toLowerCase()
                          ? "border-orange-400 ring-2 ring-orange-500/40 scale-110"
                          : "border-white/20"
                      }`}
                      style={{ backgroundColor: preset }}
                      title={preset}
                    />
                  ))}
                </div>

                {fieldErrors.color && (
                  <div className="px-5 pb-3">
                    <Caption level="1" className="!text-red-400">
                      {fieldErrors.color.join(", ")}
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
                  subtitle="Rendi la vernice disponibile nel garage di gioco"
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
                  {editingPaint ? "Salva Modifiche" : "Crea Vernice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingPaint)}
        title="Elimina Vernice dal Catalogo"
        itemName={
          deletingPaint
            ? deletingPaint.color || `Vernice #${deletingPaint.id}`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPaint(null)}
      />
    </div>
  );
}
