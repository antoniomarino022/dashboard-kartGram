"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { TgAvatar } from "@/components/ui/tg-avatar";
import { StatusBadge, UnlockTypeBadge } from "@/components/ui/badges";
import { UnlockType } from "@/types/api";
import { cn, UNLOCK_TYPE_META } from "@/lib/utils";

export interface CatalogItemDescriptor<T> {
  raw: T;
  id: number;
  title: string;
  senderLabel?: string;
  subtitle: string;
  unlockType: UnlockType;
  unlockValue: number;
  isActive: boolean;
  colorSwatch?: string | null;
  badges?: Array<{ label: string; value: string }>;
}

export interface TelegramCatalogWorkspaceProps<T> {
  sectionKey: string;
  channelTitle: string;
  channelSubtitle: string;
  items: CatalogItemDescriptor<T>[];
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  unlockFilter: "ALL" | UnlockType;
  onUnlockFilterChange: (f: "ALL" | UnlockType) => void;
  onlyActive: boolean;
  onOnlyActiveChange: (v: boolean) => void;
  onRefresh: () => void;
  createButtonLabel: string;
  isFormOpen: boolean;
  formTitle: string;
  formSubtitle: string;
  isSaving: boolean;
  onOpenCreate: (prefillText?: string) => void;
  onOpenEdit: (item: T) => void;
  onCloseForm: () => void;
  onRequestDelete: (item: T) => void;
  renderFormFields: () => React.ReactNode;
  onSubmitForm: (e: React.FormEvent<HTMLFormElement>) => void;
  submitButtonLabel: string;
  // Optional backwards compatibility props
  composerPlaceholder?: string;
  composerPresets?: string[];
  onDuplicateItem?: (item: T) => void;
}

export function TelegramCatalogWorkspace<T>({
  channelTitle,
  channelSubtitle,
  items,
  totalCount,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Cerca nel catalogo...",
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
}: TelegramCatalogWorkspaceProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [sortField, setSortField] = useState<"id" | "title" | "unlockValue">("id");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      if (sortField === "id") {
        comparison = a.id - b.id;
      } else if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "unlockValue") {
        comparison = a.unlockValue - b.unlockValue;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [items, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, validCurrentPage, pageSize]);

  const activeCount = useMemo(() => items.filter((i) => i.isActive).length, [items]);

  const handleSort = (field: "id" | "title" | "unlockValue") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-tg-chat">
      {/* Top Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-tg-border bg-tg-surface px-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-tg-primary">{channelTitle}</h1>
            <span className="rounded-full bg-tg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-tg-accent">
              {totalCount} totali
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {activeCount} attivi
            </span>
          </div>
          <p className="text-xs text-tg-muted">{channelSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            title="Aggiorna dati"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-tg-border bg-tg-surface text-tg-muted transition-colors hover:bg-tg-secondary hover:text-tg-primary disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </button>

          <button
            type="button"
            onClick={() => onOpenCreate()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-tg-accent px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-tg-accent-hover cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{createButtonLabel}</span>
          </button>
        </div>
      </header>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tg-border bg-tg-surface px-4 py-3 sm:px-6">
        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-tg-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-tg-border bg-tg-secondary pl-9 pr-8 text-xs text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent focus:bg-tg-surface focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-tg-muted hover:text-tg-primary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-tg-border bg-tg-secondary p-1">
            <button
              type="button"
              onClick={() => {
                onUnlockFilterChange("ALL");
                setCurrentPage(1);
              }}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                unlockFilter === "ALL"
                  ? "bg-tg-surface text-tg-primary shadow-xs"
                  : "text-tg-muted hover:text-tg-primary"
              )}
            >
              Tutti
            </button>
            {Object.values(UnlockType).map((type) => {
              const meta = UNLOCK_TYPE_META[type];
              const isSelected = unlockFilter === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onUnlockFilterChange(type);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                    isSelected
                      ? "bg-tg-surface text-tg-primary shadow-xs font-semibold"
                      : "text-tg-muted hover:text-tg-primary"
                  )}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: meta.accentVar }}
                  />
                  <span>{meta.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onOnlyActiveChange(!onlyActive);
              setCurrentPage(1);
            }}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors cursor-pointer",
              onlyActive
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-tg-border bg-tg-surface text-tg-muted hover:bg-tg-secondary hover:text-tg-primary"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                onlyActive ? "bg-emerald-500" : "bg-tg-muted"
              )}
            />
            <span>Solo Attivi</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-tg-accent" />
          </div>
        ) : isError ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-tg-border bg-tg-surface p-6 text-center">
            <p className="text-sm font-semibold text-tg-danger">
              {errorMessage || "Errore durante il caricamento dei dati"}
            </p>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-tg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-tg-accent-hover cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Riprova</span>
            </button>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-tg-border bg-tg-surface p-6 text-center">
            <Filter className="h-8 w-8 text-tg-muted opacity-50" />
            <p className="mt-2 text-sm font-medium text-tg-primary">
              Nessun elemento trovato
            </p>
            <p className="mt-0.5 text-xs text-tg-muted">
              Prova a modificare i filtri di ricerca o crea un nuovo elemento.
            </p>
            <button
              type="button"
              onClick={() => onOpenCreate()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-tg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-tg-accent-hover cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{createButtonLabel}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-tg-border bg-tg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-tg-border bg-tg-secondary/70 text-[11px] font-semibold uppercase tracking-wider text-tg-muted">
                  <tr>
                    <th
                      onClick={() => handleSort("id")}
                      className="cursor-pointer px-4 py-3 hover:text-tg-primary"
                    >
                      <div className="flex items-center gap-1">
                        <span>ID</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("title")}
                      className="cursor-pointer px-4 py-3 hover:text-tg-primary"
                    >
                      <div className="flex items-center gap-1">
                        <span>Nome / Elemento</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3">Dettagli</th>
                    <th
                      onClick={() => handleSort("unlockValue")}
                      className="cursor-pointer px-4 py-3 hover:text-tg-primary"
                    >
                      <div className="flex items-center gap-1">
                        <span>Sblocco</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3">Stato</th>
                    <th className="px-4 py-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tg-border">
                  {paginatedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-tg-secondary/50"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-tg-muted">
                        #{item.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {item.colorSwatch ? (
                            <span
                              className="h-6 w-6 shrink-0 rounded-full border border-tg-border shadow-xs"
                              style={{ backgroundColor: item.colorSwatch }}
                            />
                          ) : (
                            <TgAvatar
                              name={item.title}
                              seed={item.id}
                              size="sm"
                            />
                          )}
                          <span className="font-semibold text-tg-primary">
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-tg-muted">
                        <div className="max-w-md truncate">
                          {item.subtitle}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <UnlockTypeBadge
                          unlockType={item.unlockType}
                          unlockValue={item.unlockValue}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isActive={item.isActive} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenEdit(item.raw)}
                            className="rounded-md border border-tg-border bg-tg-surface px-2.5 py-1 text-xs font-medium text-tg-primary transition-colors hover:bg-tg-secondary cursor-pointer"
                          >
                            Modifica
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestDelete(item.raw)}
                            title="Elimina"
                            className="rounded-md p-1 text-tg-muted transition-colors hover:bg-tg-danger-soft hover:text-tg-danger cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-tg-border px-4 py-3">
              <span className="text-xs text-tg-muted">
                Visualizzati{" "}
                <strong className="text-tg-primary">
                  {Math.min(
                    (validCurrentPage - 1) * pageSize + 1,
                    sortedItems.length
                  )}
                  -
                  {Math.min(validCurrentPage * pageSize, sortedItems.length)}
                </strong>{" "}
                di <strong className="text-tg-primary">{sortedItems.length}</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage <= 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-tg-border bg-tg-surface text-tg-muted hover:bg-tg-secondary hover:text-tg-primary disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs font-medium text-tg-primary">
                  {validCurrentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage >= totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-tg-border bg-tg-surface text-tg-muted hover:bg-tg-secondary hover:text-tg-primary disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over or Modal CRUD Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-tg-border bg-tg-surface shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-tg-border px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-tg-primary">{formTitle}</h2>
                <p className="text-xs text-tg-muted">{formSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={onCloseForm}
                className="rounded-lg p-1 text-tg-muted hover:bg-tg-secondary hover:text-tg-primary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={onSubmitForm} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {renderFormFields()}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-tg-border bg-tg-secondary/30 px-5 py-3">
                <button
                  type="button"
                  onClick={onCloseForm}
                  disabled={isSaving}
                  className="rounded-lg border border-tg-border bg-tg-surface px-4 py-2 text-xs font-medium text-tg-primary hover:bg-tg-secondary disabled:opacity-50 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-tg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-tg-accent-hover disabled:opacity-50 cursor-pointer"
                >
                  {isSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSaving ? "Salvataggio..." : submitButtonLabel}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
