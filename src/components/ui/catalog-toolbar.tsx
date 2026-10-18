"use client";

import { UnlockType } from "@/types/api";
import { cn, UNLOCK_TYPE_META } from "@/lib/utils";
import { Plus, RefreshCw, Search, X } from "lucide-react";

interface CatalogToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  unlockFilter: "ALL" | UnlockType;
  onUnlockFilterChange: (val: "ALL" | UnlockType) => void;
  onlyActive: boolean;
  onOnlyActiveChange: (val: boolean) => void;
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
  searchPlaceholder = "Filtra nella chat corrente...",
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
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-tg-border bg-tg-surface px-3 py-2">
      {/* Search input */}
      <div className="relative flex min-w-[200px] flex-1 items-center">
        <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-tg-muted" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-8 w-full rounded-full border border-tg-border bg-tg-secondary pl-8 pr-7 text-[13px] text-tg-primary placeholder:text-tg-muted focus:border-tg-accent focus:bg-tg-surface focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Cancella ricerca"
            className="absolute right-2 text-tg-muted hover:text-tg-primary cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter pills for UnlockType */}
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => onUnlockFilterChange("ALL")}
          className={cn(
            "h-7 rounded-full px-2.5 text-[12px] font-medium transition-colors cursor-pointer",
            unlockFilter === "ALL"
              ? "bg-tg-accent text-tg-on-accent"
              : "bg-tg-secondary text-tg-muted hover:bg-tg-hover hover:text-tg-primary"
          )}
        >
          Tutti ({filteredCount}/{totalCount})
        </button>
        {Object.values(UnlockType).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onUnlockFilterChange(type)}
            className={cn(
              "h-7 rounded-full px-2.5 text-[12px] font-medium transition-colors cursor-pointer",
              unlockFilter === type
                ? "bg-tg-accent text-tg-on-accent"
                : "bg-tg-secondary text-tg-muted hover:bg-tg-hover hover:text-tg-primary"
            )}
          >
            {UNLOCK_TYPE_META[type].shortLabel}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onOnlyActiveChange(!onlyActive)}
          className={cn(
            "h-7 rounded-full px-2.5 text-[12px] font-medium transition-colors cursor-pointer",
            onlyActive
              ? "bg-tg-accent text-tg-on-accent"
              : "bg-tg-secondary text-tg-muted hover:bg-tg-hover hover:text-tg-primary"
          )}
        >
          Solo attivi
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Sincronizza con il server"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-tg-muted hover:bg-tg-hover hover:text-tg-primary disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            className={cn("h-4 w-4", isRefreshing && "animate-spin")}
          />
        </button>

        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-tg-accent px-3 text-[13px] font-medium text-tg-on-accent hover:bg-tg-accent-hover cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{createButtonLabel}</span>
        </button>
      </div>
    </div>
  );
}
