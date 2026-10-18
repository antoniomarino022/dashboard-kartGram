"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { parseApiError } from "@/services/apiClient";
import {
  useCharactersQuery,
  useCreateCharacterMutation,
  useDeleteCharacterMutation,
  useUpdateCharacterMutation,
} from "@/hooks/use-catalog-queries";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import {
  UnlockType,
  type Character,
  type CreateCharacterInput,
} from "@/types/api";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { UnlockFieldsSection } from "@/components/ui/unlock-fields-section";
import {
  DataTableManager,
  type DataTableColumn,
} from "@/components/ui/data-table-manager";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";

const INITIAL_CHARACTER_FORM: CreateCharacterInput = {
  name: "",
  subtype: "",
  bonusStat: "",
  unlockType: UnlockType.FREE,
  unlockValue: 0,
  isActive: true,
};

export function CharactersManager() {
  const {
    data: characters = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCharactersQuery();

  const createCharacterMutation = useCreateCharacterMutation();
  const updateCharacterMutation = useUpdateCharacterMutation();
  const deleteCharacterMutation = useDeleteCharacterMutation();

  const {
    searchQuery,
    setSearchQuery,
    unlockFilter,
    setUnlockFilter,
    onlyActive,
    setOnlyActive,
    filteredItems: filteredCharacters,
  } = useCatalogFilters(characters);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [formData, setFormData] = useState<CreateCharacterInput>(
    INITIAL_CHARACTER_FORM
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [deletingCharacter, setDeletingCharacter] = useState<Character | null>(
    null
  );

  const isSaving =
    createCharacterMutation.isPending || updateCharacterMutation.isPending;
  const isDeleting = deleteCharacterMutation.isPending;

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.isError) {
      toast.error(parseApiError(result.error).message);
    } else {
      toast.success("Elenco piloti aggiornato.");
    }
  };

  const openCreate = () => {
    setEditingCharacter(null);
    setFormData(INITIAL_CHARACTER_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      subtype: character.subtype ?? "",
      bonusStat: character.bonusStat ?? "",
      unlockType: character.unlockType,
      unlockValue:
        character.unlockType === UnlockType.FREE ? 0 : character.unlockValue,
      isActive: character.isActive,
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
      errs.name = ["Il nome del pilota è obbligatorio."];
    } else if (trimmedName.length > 100) {
      errs.name = ["Il nome non può superare i 100 caratteri."];
    }

    if (formData.subtype && formData.subtype.trim().length > 50) {
      errs.subtype = ["La classe pilota non può superare i 50 caratteri."];
    }

    if (formData.bonusStat && formData.bonusStat.trim().length > 100) {
      errs.bonusStat = ["Il bonus statistica non può superare i 100 caratteri."];
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
    const payload: CreateCharacterInput = {
      name: formData.name.trim(),
      subtype: formData.subtype?.trim() ? formData.subtype.trim() : null,
      bonusStat: formData.bonusStat?.trim() ? formData.bonusStat.trim() : null,
      unlockType: formData.unlockType,
      unlockValue:
        formData.unlockType === UnlockType.FREE
          ? 0
          : Number(formData.unlockValue),
      isActive: formData.isActive,
    };

    try {
      if (editingCharacter) {
        const updated = await updateCharacterMutation.mutateAsync({
          id: editingCharacter.id,
          payload,
        });
        toast.success(`Pilota "${updated.name}" aggiornato.`);
      } else {
        const created = await createCharacterMutation.mutateAsync(payload);
        toast.success(`Pilota "${created.name}" creato.`);
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
    if (!deletingCharacter) return;
    try {
      await deleteCharacterMutation.mutateAsync(deletingCharacter.id);
      toast.success(`Pilota "${deletingCharacter.name}" eliminato.`);
      setDeletingCharacter(null);
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  const columns: DataTableColumn<Character>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Nome Pilota",
        render: (char) => (
          <div className="flex flex-col">
            <span className="font-semibold text-tg-primary">{char.name}</span>
            <span className="text-[11px] text-tg-muted">
              {char.subtype || "standard"}
            </span>
          </div>
        ),
      },
      {
        key: "bonusStat",
        header: "Perk / Abilità",
        render: (char) => (
          <span className="text-xs text-tg-muted">
            {char.bonusStat || "Nessun bonus"}
          </span>
        ),
      },
      {
        key: "unlock",
        header: "Sblocco & Costo",
        render: (char) => (
          <UnlockTypeBadge
            unlockType={char.unlockType}
            unlockValue={char.unlockValue}
          />
        ),
      },
      {
        key: "status",
        header: "Stato",
        align: "center",
        render: (char) => <StatusBadge isActive={char.isActive} />,
      },
    ],
    []
  );

  return (
    <>
      <DataTableManager<Character>
        title="Piloti & Personaggi"
        description="Configurazione piloti, perk bonus e statistiche di gara"
        items={filteredCharacters}
        columns={columns}
        getId={(char) => char.id}
        getIsActive={(char) => char.isActive}
        totalCount={characters.length}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={isError ? parseApiError(error).message : undefined}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cerca pilota per nome o classe..."
        unlockFilter={unlockFilter}
        onUnlockFilterChange={setUnlockFilter}
        onlyActive={onlyActive}
        onOnlyActiveChange={setOnlyActive}
        onRefresh={handleRefresh}
        createButtonLabel="Nuovo Pilota"
        isFormOpen={isFormOpen}
        formTitle={
          editingCharacter
            ? `Modifica Pilota #${editingCharacter.id}`
            : "Nuovo Pilota"
        }
        formSubtitle="Compila le caratteristiche e condizioni di sblocco."
        isSaving={isSaving}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onCloseForm={() => setIsFormOpen(false)}
        onRequestDelete={setDeletingCharacter}
        onSubmitForm={handleSubmit}
        submitButtonLabel={editingCharacter ? "Salva Modifiche" : "Crea Pilota"}
        renderFormFields={() => (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-tg-muted">
                Nome Pilota *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="es. Mario Racer, Speed Fox..."
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
                Classe / Sottotipo (opzionale)
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.subtype ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtype: e.target.value }))
                }
                placeholder="es. veterano, rookie, pro"
                className="h-8 w-full rounded-md border border-tg-border bg-tg-surface px-2.5 text-xs text-tg-primary focus:border-tg-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-tg-muted">
                Bonus Statistica (bonusStat - opzionale)
              </label>
              <input
                type="text"
                maxLength={100}
                value={formData.bonusStat ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bonusStat: e.target.value }))
                }
                placeholder="es. +5% turbo, +10% monete..."
                className="h-8 w-full rounded-md border border-tg-border bg-tg-surface px-2.5 text-xs text-tg-primary focus:border-tg-accent focus:outline-none"
              />
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
              activeSubtitle="Rendi il pilota selezionabile in gara"
              fieldErrors={fieldErrors}
            />
          </div>
        )}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deletingCharacter)}
        title="Elimina Pilota"
        itemName={deletingCharacter?.name ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCharacter(null)}
      />
    </>
  );
}
