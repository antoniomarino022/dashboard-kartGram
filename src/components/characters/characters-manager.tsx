"use client";

import { useState } from "react";
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
import { UNLOCK_TYPE_META } from "@/lib/utils";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";
import { CatalogToolbar } from "@/components/ui/catalog-toolbar";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Loader2, Pencil, Sparkles, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";

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

  // Create / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [formData, setFormData] = useState<CreateCharacterInput>(
    INITIAL_CHARACTER_FORM
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Delete Confirmation Modal
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
      toast.success("Elenco personaggi aggiornato.");
    }
  };

  const openCreateModal = () => {
    setEditingCharacter(null);
    setFormData(INITIAL_CHARACTER_FORM);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (character: Character) => {
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
      errs.name = ["Il nome del personaggio è obbligatorio."];
    } else if (trimmedName.length > 100) {
      errs.name = ["Il nome non può superare i 100 caratteri."];
    }

    if (formData.subtype && formData.subtype.trim().length > 50) {
      errs.subtype = ["Il sottotipo non può superare i 50 caratteri."];
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
        toast.success(`Personaggio "${updated.name}" aggiornato con successo!`);
      } else {
        const created = await createCharacterMutation.mutateAsync(payload);
        toast.success(`Nuovo personaggio "${created.name}" creato con successo!`);
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
    if (!deletingCharacter) return;
    try {
      await deleteCharacterMutation.mutateAsync(deletingCharacter.id);
      toast.success(
        `Personaggio "${deletingCharacter.name}" eliminato con successo.`
      );
      setDeletingCharacter(null);
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
          👤 Gestione Personaggi / Piloti
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Configura i piloti del gioco, i sottotipi di guida, i perk bonus e i
          requisiti di sblocco
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
        createButtonLabel="Nuovo Personaggio"
        totalCount={characters.length}
        filteredCount={filteredCharacters.length}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/70 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Nome Pilota</th>
                <th className="px-4 py-3.5">Sottotipo</th>
                <th className="px-4 py-3.5">Bonus / Perk</th>
                <th className="px-4 py-3.5">Sblocco &amp; Costo</th>
                <th className="px-4 py-3.5">Stato</th>
                <th className="px-4 py-3.5 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                      Caricamento personaggi...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-red-400"
                  >
                    {parseApiError(error).message}
                  </td>
                </tr>
              ) : filteredCharacters.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    <Users className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                    Nessun personaggio trovato con i filtri selezionati.
                  </td>
                </tr>
              ) : (
                filteredCharacters.map((character) => (
                  <tr
                    key={character.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">
                      #{character.id}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-100">
                      {character.name}
                    </td>
                    <td className="px-4 py-3.5">
                      {character.subtype ? (
                        <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-xs font-medium text-zinc-300">
                          {character.subtype}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {character.bonusStat ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-300">
                          <Sparkles className="h-3 w-3" />
                          {character.bonusStat}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">Nessun perk</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <UnlockTypeBadge
                        unlockType={character.unlockType}
                        unlockValue={character.unlockValue}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge isActive={character.isActive} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(character)}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-800/70 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 transition-colors cursor-pointer"
                          title="Modifica personaggio"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCharacter(character)}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-800/70 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                          title="Elimina personaggio"
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
                  {editingCharacter
                    ? `Modifica Personaggio #${editingCharacter.id}`
                    : "Nuovo Personaggio / Pilota"}
                </h2>
                <p className="text-xs text-zinc-400">
                  Definisci nome, sottotipo, bonus abilità e condizioni di
                  sblocco
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
                  Nome Personaggio <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="es. Mario Racer, Cyber Pilot..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.name.join(", ")}
                  </p>
                )}
              </div>

              {/* Subtype & BonusStat */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Sottotipo (subtype - opzionale)
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={formData.subtype ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subtype: e.target.value,
                      }))
                    }
                    placeholder="es. balanced, drift, heavy..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  {fieldErrors.subtype && (
                    <p className="mt-1 text-xs text-red-400">
                      {fieldErrors.subtype.join(", ")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Perk / Bonus (bonusStat - opzionale)
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={formData.bonusStat ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bonusStat: e.target.value,
                      }))
                    }
                    placeholder="es. +10% coins, shield_on_start"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  {fieldErrors.bonusStat && (
                    <p className="mt-1 text-xs text-red-400">
                      {fieldErrors.bonusStat.join(", ")}
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
                    Rendi il pilota selezionabile dai giocatori
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
                  ) : editingCharacter ? (
                    "Salva Modifiche"
                  ) : (
                    "Crea Personaggio"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingCharacter)}
        title="Elimina Personaggio dal Catalogo"
        itemName={deletingCharacter?.name || ""}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCharacter(null)}
      />
    </div>
  );
}
