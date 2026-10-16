"use client";

import { useMemo, useState } from "react";
import type { UnlockType } from "@/types/api";

export interface FilterableCatalogItem {
  name: string;
  unlockType: UnlockType;
  isActive: boolean;
}

export function useCatalogFilters<T extends FilterableCatalogItem>(items: T[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [unlockFilter, setUnlockFilter] = useState("ALL");
  const [onlyActive, setOnlyActive] = useState(false);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesName = item.name.toLowerCase().includes(normalizedSearch);
      const matchesUnlock =
        unlockFilter === "ALL" || item.unlockType === unlockFilter;
      const matchesActive = !onlyActive || item.isActive;
      return matchesName && matchesUnlock && matchesActive;
    });
  }, [items, searchQuery, unlockFilter, onlyActive]);

  return {
    searchQuery,
    setSearchQuery,
    unlockFilter,
    setUnlockFilter,
    onlyActive,
    setOnlyActive,
    filteredItems,
  };
}
