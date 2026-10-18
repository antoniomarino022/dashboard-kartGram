"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { parseApiError } from "@/services/apiClient";
import {
  useCreatePaintMutation,
  useDeletePaintMutation,
  usePaintsQuery,
  useUpdatePaintMutation,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import { UnlockType, type CreatePaintInput, type Paint } from "@/types/api";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { UnlockFieldsSection } from "@/components/ui/unlock-fields-section";
import {
  DataTableManager,
  type DataTableColumn,
} from "@/components/ui/data-table-manager";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";

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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaint, setEditingPaint] = useState<Paint | null>(null);
  const [formData, setFormData] =
    useState<CreatePaintInput>(INITIAL_PAINT_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
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

  const openCreate = () => {
    setEditingPaint(null);
    setFormData(INITIAL_PAINT_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (paint: Paint) => {
    setEditingPaint(paint);
    setFormData({
      color: paint.color,
      unlockType: paint.unlockType,
      unlockValue:
        paint.unlockType === UnlockType.FREE ? 0 : paint.unlockValue,
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
    const trimmedColor = (formData.color ?? "").trim();

    if (!trimmedColor) {
      errs.color = ["Il colore esadecimale è obbligatorio."];
    } else if (!isHexColor(trimmedColor)) {
      errs.color = [
        "Formato non valido: deve essere un esadecimale a 6 cifre con cancelletto (es. #FF0055).",
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
    const payload: CreatePaintInput = {
      color: (formData.color ?? "").trim().toLowerCase(),
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
        toast.success(`Vernice "${updated.color ?? ""}" aggiornata.`);
      } else {
        const created = await createPaintMutation.mutateAsync(payload);
        toast.success(`Vernice "${created.color ?? ""}" creata.`);
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
    if (!deletingPaint) return;
    try {
      await deletePaintMutation.mutateAsync(deletingPaint.id);
      toast.success(`Vernice "${deletingPaint.color ?? ""}" eliminata.`);
      setDeletingPaint(null);
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  const columns: DataTableColumn<Paint>[] = useMemo(
    () => [
      {
        key: "color",
        header: "Colore Esadecimale",
        render: (paint) => (
          <div className="flex items-center gap-2.5">
            <span
              className="h-5 w-5 shrink-0 rounded border border-tg-border"
              style={{ backgroundColor: paint.color ?? "#ffffff" }}
            />
            <span className="font-mono text-xs font-semibold text-tg-primary uppercase">
              {paint.color ?? "N/D"}
            </span>
          </div>
        ),
      },
      {
        key: "unlock",
        header: "Sblocco & Costo",
        render: (paint) => (
          <UnlockTypeBadge
            unlockType={paint.unlockType}
            unlockValue={paint.unlockValue}
          />
        ),
      },
      {
        key: "status",
        header: "Stato",
        align: "center",
        render: (paint) => <StatusBadge isActive={paint.isActive} />,
      },
    ],
    []
  );

  return (
    <>
      <DataTableManager<Paint>
        title="Vernici & Livree"
        description="Tavolozza colori esadecimali e personalizzazioni carrozzeria"
        items={filteredPaints}
        columns={columns}
        getId={(paint) => paint.id}
        getIsActive={(paint) => paint.isActive}
        totalCount={paints.length}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={isError ? parseApiError(error).message : undefined}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cerca codice esadecimale (#3b82f6)..."
        unlockFilter={unlockFilter}
        onUnlockFilterChange={setUnlockFilter}
        onlyActive={onlyActive}
        onOnlyActiveChange={setOnlyActive}
        onRefresh={handleRefresh}
        createButtonLabel="Nuova Vernice"
        isFormOpen={isFormOpen}
        formTitle={
          editingPaint
            ? `Modifica Vernice #${editingPaint.id}`
            : "Nuova Vernice"
        }
        formSubtitle="Definisci il codice esadecimale e il costo di sblocco."
        isSaving={isSaving}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onCloseForm={() => setIsFormOpen(false)}
        onRequestDelete={setDeletingPaint}
        onSubmitForm={handleSubmit}
        submitButtonLabel={editingPaint ? "Salva Modifiche" : "Crea Vernice"}
        renderFormFields={() => (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-tg-muted">
                Codice Colore HEX *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={isHexColor(formData.color) ? (formData.color ?? "#e63946") : "#e63946"}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="h-8 w-10 shrink-0 cursor-pointer rounded border border-tg-border bg-transparent p-0.5"
                />
                <input
                  type="text"
                  required
                  maxLength={7}
                  value={formData.color ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  placeholder="#FF0055"
                  className="h-8 flex-1 rounded-md border border-tg-border bg-tg-surface px-2.5 font-mono text-xs uppercase text-tg-primary focus:border-tg-accent focus:outline-none"
                />
              </div>
              {fieldErrors.color && (
                <p className="mt-1 text-[11px] text-tg-danger">
                  {fieldErrors.color.join(", ")}
                </p>
              )}
            </div>

            {/* Quick palette preset chips */}
            <div>
              <span className="mb-1.5 block text-[11px] font-medium text-tg-muted">
                Preimpostazioni rapide
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color: c }))
                    }
                    className="flex h-6 w-6 items-center justify-center rounded border border-tg-border transition-transform hover:scale-105 cursor-pointer"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
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
              activeSubtitle="Rendi la livrea disponibile nel garage"
              fieldErrors={fieldErrors}
            />
          </div>
        )}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deletingPaint)}
        title="Elimina Vernice"
        itemName={deletingPaint?.color ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPaint(null)}
      />
    </>
  );
}
