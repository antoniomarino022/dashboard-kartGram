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
import { Pencil, Sparkles, Trash2, Users, X } from "lucide-react";
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
        toast.success(`Personaggio "${updated.name}" aggiornato con successo!`);
      } else {
        const created = await createCharacterMutation.mutateAsync(payload);
        toast.success(
          `Nuovo personaggio "${created.name}" creato con successo!`
        );
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Title level="1" className="!text-2xl !font-bold !text-zinc-100">
              👤 Gestione Personaggi
            </Title>
            <Badge type="number" mode="secondary">
              {characters.length}
            </Badge>
          </div>
          <Subheadline level="2" className="mt-1 !text-zinc-400">
            Configura i piloti disponibili, i loro sottotipi, abilità bonus e
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
        createButtonLabel="Nuovo Personaggio"
        totalCount={characters.length}
        filteredCount={filteredCharacters.length}
      />

      {/* Table inside Telegram UI Section */}
      <Section
        header="Elenco Piloti & Personaggi"
        className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50"
      >
        {isLoading ? (
          <Placeholder
            header="Caricamento personaggi..."
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
        ) : filteredCharacters.length === 0 ? (
          <Placeholder
            header="Nessun personaggio trovato"
            description="Non ci sono piloti corrispondenti ai filtri selezionati."
            action={
              <Button size="s" mode="bezeled" onClick={openCreateModal}>
                Crea Nuovo Personaggio
              </Button>
            }
          >
            <Users className="h-10 w-10 text-zinc-600" />
          </Placeholder>
        ) : (
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
                {filteredCharacters.map((character) => (
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
                        <Chip
                          mode="mono"
                          className="!rounded-md !py-0.5 !px-2 text-xs font-medium"
                        >
                          {character.subtype}
                        </Chip>
                      ) : (
                        <span className="text-xs text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {character.bonusStat ? (
                        <Chip
                          mode="outline"
                          before={
                            <Sparkles className="h-3 w-3 text-indigo-400" />
                          }
                          className="!rounded-lg !py-0.5 !px-2.5 !border-indigo-500/30 !bg-indigo-500/10 !text-indigo-300 text-xs font-medium"
                        >
                          {character.bonusStat}
                        </Chip>
                      ) : (
                        <span className="text-xs text-zinc-500">
                          Nessun bonus
                        </span>
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
                      <div className="inline-flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          size="s"
                          mode="bezeled"
                          onClick={() => openEditModal(character)}
                          before={<Pencil className="h-3.5 w-3.5" />}
                        >
                          Modifica
                        </Button>
                        <IconButton
                          type="button"
                          size="s"
                          mode="gray"
                          onClick={() => setDeletingCharacter(character)}
                          title="Elimina personaggio"
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
                  {editingCharacter
                    ? `Modifica Personaggio #${editingCharacter.id}`
                    : "Nuovo Personaggio"}
                </Title>
                <Caption level="1" className="!text-zinc-400">
                  Definisci nome, sottotipo, perk bonus e requisiti di sblocco
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
                header="Profilo Pilota"
                className="overflow-hidden rounded-xl border border-zinc-800/80"
              >
                <Input
                  header="Nome Personaggio *"
                  required
                  maxLength={100}
                  status={fieldErrors.name ? "error" : "default"}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="es. Max Turbo, Cyber Luna..."
                />
                {fieldErrors.name && (
                  <div className="px-5 pb-2">
                    <Caption level="1" className="!text-red-400">
                      {fieldErrors.name.join(", ")}
                    </Caption>
                  </div>
                )}

                <Input
                  header="Sottotipo (subtype - opzionale)"
                  maxLength={50}
                  status={fieldErrors.subtype ? "error" : "default"}
                  value={formData.subtype ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subtype: e.target.value,
                    }))
                  }
                  placeholder="es. balanced, drift, heavyweight..."
                />

                <Input
                  header="Statistica Bonus / Perk (bonusStat - opzionale)"
                  status={fieldErrors.bonusStat ? "error" : "default"}
                  value={formData.bonusStat ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bonusStat: e.target.value,
                    }))
                  }
                  placeholder="es. +10% coins, shield_on_start..."
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
                  subtitle="Rendi il personaggio selezionabile in gioco"
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
                  {editingCharacter ? "Salva Modifiche" : "Crea Personaggio"}
                </Button>
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
