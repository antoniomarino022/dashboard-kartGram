"use client";

import { UnlockType } from "@/types/api";
import { UNLOCK_TYPE_META } from "@/lib/utils";
import { Filter, Plus, RefreshCw, Search, X } from "lucide-react";

interface CatalogToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  unlockFilter: string;
  onUnlockFilterChange: (value: string) => void;
  onlyActive: boolean;
  onOnlyActiveChange: (value: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onCreateNew: () => void;
  createButtonLabel: string;
  totalCount: number;
  filteredCount: number;
}

export function CatalogToolbar({
  searchQuery,
  onSearchChange,
  unlockFilter,
  onUnlockFilterChange,
  onlyActive,
  onOnlyActiveChange,
  onRefresh,
  isRefreshing,
  onCreateNew,
  createButtonLabel,
  totalCount,
  filteredCount,
}: CatalogToolbarProps) {
  const hasFilters = searchQuery.trim() !== "" || unlockFilter !== "ALL" || onlyActive;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search + Filters */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cerca per nome in tempo reale..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2 pr-9 pl-10 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-zinc-500 hover:text-zinc-300"
                aria-label="Pulisci ricerca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* UnlockType Select */}
          <div className="relative flex items-center">
            <Filter className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-500" />
            <select
              value={unlockFilter}
              onChange={(e) => onUnlockFilterChange(e.target.value)}
              aria-label="Filtra per tipo di sblocco"
              className="rounded-xl border border-zinc-800 bg-zinc-950/80 py-2 pr-8 pl-9 text-sm text-zinc-200 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="ALL">Tutti gli sblocchi</option>
              {Object.values(UnlockType).map((type) => (
                <option key={type} value={type}>
                  {UNLOCK_TYPE_META[type].label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Switch */}
          <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-300 select-none hover:border-zinc-700">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => onOnlyActiveChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative h-5 w-9 rounded-full bg-zinc-800 transition-colors peer-checked:bg-emerald-500 after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
            <span className="text-xs font-medium">Solo Attivi</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/70 transition-colors disabled:opacity-50 cursor-pointer"
            title="Aggiorna elenco"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-orange-400" : ""}`} />
            <span className="hidden sm:inline">Aggiorna</span>
          </button>

          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-orange-500/20 hover:from-orange-400 hover:to-amber-400 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            {createButtonLabel}
          </button>
        </div>
      </div>

      {/* Filter status bar */}
      <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2.5 text-xs text-zinc-400">
        <span>
          Visualizzati <strong className="text-zinc-200">{filteredCount}</strong> di{" "}
          <strong className="text-zinc-200">{totalCount}</strong> elementi
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              onUnlockFilterChange("ALL");
              onOnlyActiveChange(false);
            }}
            className="text-orange-400 hover:text-orange-300 font-medium underline underline-offset-4 cursor-pointer"
          >
            Reimposta filtri
          </button>
        )}
      </div>
    </div>
  );
}
