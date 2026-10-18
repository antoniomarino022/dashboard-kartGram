"use client";

import {
  Badge,
  Button,
  Caption,
  IconButton,
  Input,
  Section,
  Select,
  Subheadline,
  Switch,
} from "@telegram-apps/telegram-ui";
import { UnlockType } from "@/types/api";
import { UNLOCK_TYPE_META } from "@/lib/utils";
import { Filter, Plus, RefreshCw, Search, X } from "lucide-react";

interface CatalogToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
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
  searchPlaceholder = "Cerca per nome in tempo reale...",
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
  const hasFilters =
    searchQuery.trim() !== "" || unlockFilter !== "ALL" || onlyActive;

  return (
    <Section
      header="Ricerca, Filtri e Azioni Catalogo"
      className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60"
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Search + Filters */}
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            {/* Telegram UI Input */}
            <div className="flex-1 max-w-md">
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                before={<Search className="h-4 w-4 text-zinc-400" />}
                after={
                  searchQuery ? (
                    <IconButton
                      size="s"
                      mode="plain"
                      type="button"
                      onClick={() => onSearchChange("")}
                      aria-label="Pulisci ricerca"
                    >
                      <X className="h-4 w-4" />
                    </IconButton>
                  ) : undefined
                }
                className="!p-0"
              />
            </div>

            {/* Telegram UI Select */}
            <div className="min-w-[220px]">
              <Select
                value={unlockFilter}
                onChange={(e) => onUnlockFilterChange(e.target.value)}
                before={<Filter className="h-4 w-4 text-zinc-400" />}
                aria-label="Filtra per tipo di sblocco"
                className="!p-0"
              >
                <option value="ALL">Tutti gli sblocchi</option>
                {Object.values(UnlockType).map((type) => (
                  <option key={type} value={type}>
                    {UNLOCK_TYPE_META[type].label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Telegram UI Switch */}
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-2 select-none hover:border-zinc-700">
              <Switch
                checked={onlyActive}
                onChange={(e) => onOnlyActiveChange(e.target.checked)}
              />
              <Subheadline level="2" className="!text-zinc-200 font-medium">
                Solo Attivi
              </Subheadline>
            </label>
          </div>

          {/* Telegram UI Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              size="m"
              mode="bezeled"
              onClick={onRefresh}
              loading={isRefreshing}
              disabled={isRefreshing}
              before={
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              }
            >
              Aggiorna
            </Button>

            <Button
              type="button"
              size="m"
              mode="filled"
              onClick={onCreateNew}
              before={<Plus className="h-4 w-4 stroke-[2.5]" />}
            >
              {createButtonLabel}
            </Button>
          </div>
        </div>

        {/* Filter status bar */}
        <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3">
          <div className="flex items-center gap-2">
            <Caption level="1" className="!text-zinc-400">
              Elementi visualizzati:
            </Caption>
            <Badge type="number" mode="primary">
              {filteredCount} / {totalCount}
            </Badge>
          </div>
          {hasFilters && (
            <Button
              type="button"
              size="s"
              mode="plain"
              onClick={() => {
                onSearchChange("");
                onUnlockFilterChange("ALL");
                onOnlyActiveChange(false);
              }}
            >
              Reimposta filtri
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}
