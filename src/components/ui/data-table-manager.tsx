"use client";

import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  CountPill,
  PageScroll,
  PageTitle,
  Pager,
  Panel,
  RefreshButton,
  SearchInput,
  StateMessage,
  Table,
  tdClass,
  thClass,
} from "@/components/ui/page";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "right" | "center";
  /** nasconde la colonna sotto sm */
  hideOnMobile?: boolean;
  render: (item: T) => React.ReactNode;
}

export interface DataTableManagerProps<T> {
  title: string;
  items: T[];
  columns: DataTableColumn<T>[];
  getId: (item: T) => string | number;
  /** nome leggibile per aria-label delle azioni */
  getLabel: (item: T) => string;
  totalCount: number;
  activeCount?: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  /** Filtri extra sopra la ricerca (es. tab per tipo) */
  toolbar?: React.ReactNode;
  /** quando cambia, la tabella torna a pagina 1 (es. tab attiva) */
  resetKey?: string;
  onlyActive?: boolean;
  onOnlyActiveChange?: (v: boolean) => void;
  onRefresh: () => void;
  createButtonLabel: string;
  isFormOpen: boolean;
  formTitle: string;
  isSaving: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (item: T) => void;
  onCloseForm: () => void;
  onRequestDelete: (item: T) => void;
  renderFormFields: () => React.ReactNode;
  onSubmitForm: (e: React.FormEvent<HTMLFormElement>) => void;
  submitButtonLabel: string;
}

const PAGE_SIZE = 15;

export function DataTableManager<T>({
  title,
  items,
  columns,
  getId,
  getLabel,
  totalCount,
  activeCount,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Cerca",
  toolbar,
  resetKey = "",
  onlyActive,
  onOnlyActiveChange,
  onRefresh,
  createButtonLabel,
  isFormOpen,
  formTitle,
  isSaving,
  onOpenCreate,
  onOpenEdit,
  onCloseForm,
  onRequestDelete,
  renderFormFields,
  onSubmitForm,
  submitButtonLabel,
}: DataTableManagerProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // filtri, ricerca o tab cambiati → si riparte da pagina 1
  const signature = `${resetKey}|${searchQuery}|${onlyActive ?? ""}`;
  const [lastSignature, setLastSignature] = useState(signature);
  if (lastSignature !== signature) {
    setLastSignature(signature);
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const from = (page - 1) * PAGE_SIZE;

  const pageItems = useMemo(() => items.slice(from, from + PAGE_SIZE), [items, from]);
  const isFiltered = searchQuery.trim() !== "" || Boolean(onlyActive);

  return (
    <PageScroll>
      <PageTitle
        count={totalCount}
        extra={
          activeCount !== undefined && (
            <CountPill value={activeCount} label="attivi" tone="success" />
          )
        }
        actions={
          <>
            <RefreshButton onClick={onRefresh} spinning={isFetching} />
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-tg-accent px-4 text-sm font-semibold text-tg-on-accent shadow-card transition-colors hover:bg-tg-accent-hover cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{createButtonLabel}</span>
            </button>
          </>
        }
      >
        {title}
      </PageTitle>

      {toolbar}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          label={searchPlaceholder}
        />
        {onlyActive !== undefined && onOnlyActiveChange && (
          <label className="flex items-center gap-2 text-sm text-tg-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => onOnlyActiveChange(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-[var(--tg-accent)]"
            />
            <span>Solo attivi</span>
          </label>
        )}
      </div>

      <Panel>
        {isLoading ? (
          <StateMessage>Caricamento…</StateMessage>
        ) : isError ? (
          <StateMessage tone="danger" onRetry={onRefresh}>
            {errorMessage || "Errore di caricamento."}
          </StateMessage>
        ) : items.length === 0 ? (
          isFiltered ? (
            <StateMessage>Nessun risultato.</StateMessage>
          ) : (
            <div className="p-10 text-center">
              <p className="text-sm text-tg-muted">Nessun elemento.</p>
              <button
                type="button"
                onClick={onOpenCreate}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-tg-accent px-3 py-1.5 text-sm font-semibold text-tg-on-accent hover:bg-tg-accent-hover cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{createButtonLabel}</span>
              </button>
            </div>
          )
        ) : (
          <>
            <Table
              head={
                <>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        thClass,
                        col.width,
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.hideOnMobile && "hidden sm:table-cell"
                      )}
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className={cn(thClass, "w-28 text-right")}>Azioni</th>
                </>
              }
            >
              {pageItems.map((item) => {
                const label = getLabel(item);
                return (
                  <tr key={getId(item)} className="transition-colors hover:bg-tg-hover/60">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          tdClass,
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center",
                          col.hideOnMobile && "hidden sm:table-cell"
                        )}
                      >
                        {col.render(item)}
                      </td>
                    ))}
                    <td className={cn(tdClass, "text-right")}>
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenEdit(item)}
                          title="Modifica"
                          aria-label={`Modifica ${label}`}
                          className="rounded-lg p-2 text-tg-muted hover:bg-tg-hover hover:text-tg-primary cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDelete(item)}
                          title="Elimina"
                          aria-label={`Elimina ${label}`}
                          className="rounded-lg p-2 text-tg-muted hover:bg-tg-danger-soft hover:text-tg-danger cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
            <Pager
              page={page}
              hasPrev={page > 1}
              hasNext={page < totalPages}
              onChange={setCurrentPage}
              label={`${from + 1}–${Math.min(from + PAGE_SIZE, items.length)} di ${items.length}`}
            />
          </>
        )}
      </Panel>

      {/* Modale crea / modifica */}
      <Dialog.Root
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open && !isSaving) onCloseForm();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            onInteractOutside={(e) => {
              if (isSaving) e.preventDefault();
            }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-tg-border bg-tg-surface text-tg-primary shadow-elevated focus:outline-none"
          >
            <div className="flex items-center justify-between gap-3 border-b border-tg-border px-5 py-3.5">
              <Dialog.Title className="truncate text-lg font-semibold">{formTitle}</Dialog.Title>
              <Dialog.Description className="sr-only">{formTitle}</Dialog.Description>
              <Dialog.Close
                disabled={isSaving}
                aria-label="Chiudi"
                className="rounded-lg p-1.5 text-tg-muted hover:bg-tg-secondary hover:text-tg-primary disabled:opacity-50 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={onSubmitForm} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-5 py-5 text-sm">{renderFormFields()}</div>
              <div className="flex items-center justify-end gap-2 border-t border-tg-border bg-tg-secondary px-5 py-3">
                <button
                  type="button"
                  onClick={onCloseForm}
                  disabled={isSaving}
                  className="h-10 rounded-xl border border-tg-border bg-tg-surface px-4 text-sm font-medium text-tg-primary hover:bg-tg-hover disabled:opacity-50 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-10 rounded-xl bg-tg-accent px-5 text-sm font-semibold text-tg-on-accent hover:bg-tg-accent-hover disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Salvataggio…" : submitButtonLabel}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </PageScroll>
  );
}
