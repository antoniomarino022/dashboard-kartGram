"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { adminService } from "@/services/apiClient";
import type {
  CreateItemInput,
  Item,
  PlayerDetail,
  UpdateItemInput,
  UpdatePlayerInput,
} from "@/types/api";

export const adminKeys = {
  stats: ["admin", "stats"] as const,
  items: ["admin", "items"] as const,
  players: ["admin", "players"] as const,
  playerAll: ["admin", "player"] as const,
  playersPage: (q: string, page: number) => ["admin", "players", q, page] as const,
  player: (id: number) => ["admin", "player", id] as const,
  payments: (page: number) => ["admin", "payments", page] as const,
};

export function useStatsQuery() {
  return useQuery({ queryKey: adminKeys.stats, queryFn: adminService.stats });
}

// --- Catalogo ---

export function useItemsQuery(enabled = true) {
  return useQuery({ queryKey: adminKeys.items, queryFn: adminService.items, enabled });
}

export function useCreateItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemInput) => adminService.createItem(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.items }),
  });
}

export function useUpdateItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateItemInput }) =>
      adminService.updateItem(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Item[]>(adminKeys.items, (prev = []) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      queryClient.invalidateQueries({ queryKey: adminKeys.items });
      queryClient.invalidateQueries({ queryKey: adminKeys.playerAll });
    },
  });
}

export function useDeleteItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.removeItem(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Item[]>(adminKeys.items, (prev = []) =>
        prev.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: adminKeys.items });
      queryClient.invalidateQueries({ queryKey: adminKeys.playerAll });
    },
  });
}

// --- Giocatori ---

export function usePlayersQuery(q: string, page: number, enabled = true) {
  return useQuery({
    enabled,
    queryKey: adminKeys.playersPage(q, page),
    queryFn: () => adminService.players(q, page),
    placeholderData: keepPreviousData,
  });
}

export function usePlayerQuery(id: number) {
  return useQuery({
    queryKey: adminKeys.player(id),
    queryFn: () => adminService.player(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

/** Le mutazioni sul giocatore rispondono con la scheda aggiornata: la si scrive in cache e si invalidano gli elenchi. */
function usePlayerMutation<V>(id: number, fn: (vars: V) => Promise<PlayerDetail>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (detail) => {
      queryClient.setQueryData(adminKeys.player(id), detail);
      queryClient.invalidateQueries({ queryKey: adminKeys.players });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });
}

export function useUpdatePlayerMutation(id: number) {
  return usePlayerMutation(id, (payload: UpdatePlayerInput) =>
    adminService.updatePlayer(id, payload)
  );
}

export function useUpdatePlayerUpgradesMutation(id: number) {
  return usePlayerMutation(id, (upgrades: Record<string, number>) =>
    adminService.updatePlayerUpgrades(id, upgrades)
  );
}

export function useGrantItemMutation(id: number) {
  return usePlayerMutation(id, (itemId: string) => adminService.grantItem(id, itemId));
}

export function useRevokeItemMutation(id: number) {
  return usePlayerMutation(id, (itemId: string) => adminService.revokeItem(id, itemId));
}

// --- Pagamenti ---

export function usePaymentsQuery(page: number) {
  return useQuery({
    queryKey: adminKeys.payments(page),
    queryFn: () => adminService.payments(page),
    placeholderData: keepPreviousData,
  });
}
