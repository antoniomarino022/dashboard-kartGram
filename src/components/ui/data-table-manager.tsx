"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { UnlockType } from "@/types/api";
import { cn, UNLOCK_TYPE_META } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "right" | "center";
  render: (item: T) => React.ReactNode;
}

export interface DataTableManagerProps<T> {
  title: string;
  description?: string;
  items: T[];
  columns: DataTableColumn<T>[];
  getId: (item: T) => number;
  getIsActive?: (item: T) => boolean;
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  unlockFilter?: "ALL" | UnlockType;
  onUnlockFilterChange?: (f: "ALL" | UnlockType) => void;
  onlyActive?: boolean;
  onOnlyActiveChange?: (v: boolean) => void;
  onRefresh: () => void;
  createButtonLabel: string;
  isFormOpen: boolean;
  formTitle: string;
  formSubtitle: string;
  isSaving: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (item: T) => void;
  onCloseForm: () => void;
  onRequestDelete: (item: T) => void;
  renderFormFields: () => React.ReactNode;
  onSubmitForm: (e: React.FormEvent<HTMLFormElement>) => void;
  submitButtonLabel: string;
}

export function DataTableManager<T>({
  title,
  description,
  items,
  columns,
  getId,
  getIsActive,
  totalCount,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Cerca...",
  unlockFilter,
  onUnlockFilterChange,
  onlyActive,
  onOnlyActiveChange,
  onRefresh,
  createButtonLabel,
  isFormOpen,
  formTitle,
  formSubtitle,
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
  const pageSize = 15;

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, validCurrentPage, pageSize]);

  const activeCount = useMemo(() => {
    if (!getIsActive) return null;
    return items.filter((i) => getIsActive(i)).length;
  }, [items, getIsActive]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-tg-chat">
      {/* Page Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-tg-border bg-tg-surface px-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-tg-primary">{title}</h1>
            <span className="rounded border border-tg-border bg-tg-secondary px-2 py-0.5 font-mono text-[11px] text-tg-muted">
              {totalCount} totali
            </span>
            {activeCount !== null && (
              <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {activeCount} attivi
              </span>
            )}
          </div>
          {description && (
            <p className="text-[11px] text-tg-muted leading-tight">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            title="Aggiorna elenco"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-tg-border bg-tg-surface text-tg-muted transition-colors hover:bg-tg-secondary hover:text-tg-primary disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          </button>

          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-tg-accent px-3 text-xs font-semibold text-white transition-colors hover:bg-tg-accent-hover cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{createButtonLabel}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tg-border bg-tg-surface px-6 py-2.5">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-tg-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded-md border border-tg-border bg-tg-secondary pl-8 pr-7 text-xs text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent focus:bg-tg-surface focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-2 text-tg-muted hover:text-tg-primary cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unlockFilter !== undefined && onUnlockFilterChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-tg-muted">Sblocco:</span>
              <select
                value={unlockFilter}
                onChange={(e) => {
                  onUnlockFilterChange(e.target.value as "ALL" | UnlockType);
                  setCurrentPage(1);
                }}
                className="h-8 rounded-md border border-tg-border bg-tg-surface px-2.5 text-xs text-tg-primary focus:border-tg-accent focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tutti</option>
                {Object.values(UnlockType).map((type) => (
                  <option key={type} value={type}>
                    {UNLOCK_TYPE_META[type].shortLabel}
                  </option>
                ))}
              </select>
            </div>
          )}

          {onlyActive !== undefined && onOnlyActiveChange && (
            <label className="flex items-center gap-1.5 text-xs text-tg-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => {
                  onOnlyActiveChange(e.target.checked);
                  setCurrentPage(1);
                }}
                className="h-3.5 w-3.5 rounded border-tg-border text-tg-accent focus:ring-0 cursor-pointer"
              />
              <span>Solo attivi</span>
            </label>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-tg-chat p-6">
        <div className="flex flex-col overflow-hidden rounded-lg border border-tg-border bg-tg-surface">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-tg-muted">
              Caricamento in corso...
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="text-xs font-semibold text-tg-danger">
                {errorMessage || "Si è verificato un errore durante il caricamento."}
              </p>
              <button
                type="button"
                onClick={onRefresh}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-tg-border bg-tg-surface px-3 py-1.5 text-xs font-semibold text-tg-primary hover:bg-tg-secondary cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Riprova</span>
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xs font-medium text-tg-muted">
                {searchQuery
                  ? "Nessun elemento corrispondente ai filtri impostati."
                  : "Nessun elemento presente nel catalogo."}
              </p>
              <button
                type="button"
                onClick={onOpenCreate}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-tg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-tg-accent-hover cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Crea il primo elemento</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-tg-border bg-tg-secondary font-semibold text-tg-muted">
                    <th className="w-16 px-4 py-2.5 font-mono text-[11px]">ID</th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={cn(
                          "px-4 py-2.5",
                          col.width,
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center"
                        )}
                      >
                        {col.header}
                      </th>
                    ))}
                    <th className="w-24 px-4 py-2.5 text-right font-medium">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tg-border font-normal text-tg-primary">
                  {paginatedItems.map((item) => {
                    const id = getId(item);
                    return (
                      <tr
                        key={id}
                        className="transition-colors hover:bg-tg-secondary/60"
                      >
                        <td className="px-4 py-2.5 font-mono text-[11px] text-tg-muted">
                          #{id}
                        </td>
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={cn(
                              "px-4 py-2.5",
                              col.align === "right" && "text-right",
                              col.align === "center" && "text-center"
                            )}
                          >
                            {col.render(item)}
                          </td>
                        ))}
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenEdit(item)}
                              title="Modifica"
                              className="rounded p-1 text-tg-muted hover:bg-tg-secondary hover:text-tg-primary cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRequestDelete(item)}
                              title="Elimina"
                              className="rounded p-1 text-tg-muted hover:bg-tg-danger-soft hover:text-tg-danger cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Pagination Footer */}
          {items.length > 0 && (
            <div className="flex items-center justify-between border-t border-tg-border bg-tg-surface px-4 py-2.5 text-xs text-tg-muted">
              <div>
                Visualizzati{" "}
                <span className="font-mono font-medium text-tg-primary">
                  {(validCurrentPage - 1) * pageSize + 1}
                </span>{" "}
                -{" "}
                <span className="font-mono font-medium text-tg-primary">
                  {Math.min(validCurrentPage * pageSize, items.length)}
                </span>{" "}
                di{" "}
                <span className="font-mono font-medium text-tg-primary">
                  {items.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-tg-border bg-tg-surface text-tg-muted hover:bg-tg-secondary hover:text-tg-primary disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px]">
                  {validCurrentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-tg-border bg-tg-surface text-tg-muted hover:bg-tg-secondary hover:text-tg-primary disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over / Modal Form for Create & Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg border border-tg-border bg-tg-surface shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-tg-border px-5 py-3.5">
              <div>
                <h2 className="text-sm font-bold text-tg-primary">{formTitle}</h2>
                <p className="text-[11px] text-tg-muted">{formSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={onCloseForm}
                className="rounded p-1 text-tg-muted hover:bg-tg-secondary hover:text-tg-primary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={onSubmitForm} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs">
                {renderFormFields()}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-tg-border bg-tg-secondary px-5 py-3">
                <button
                  type="button"
                  onClick={onCloseForm}
                  disabled={isSaving}
                  className="rounded-md border border-tg-border bg-tg-surface px-3 py-1.5 text-xs font-medium text-tg-primary hover:bg-tg-secondary cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-tg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-tg-accent-hover disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Salvataggio..." : submitButtonLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
