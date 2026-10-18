"use client";

import { useQuery } from "@tanstack/react-query";
import { powerupService } from "@/services/powerupService";
import {
  catalogKeys,
  useCreatePowerupMutation,
  useDeletePowerupMutation,
  usePowerupsQuery,
  useUpdatePowerupMutation,
} from "@/hooks/use-catalog-queries";

export const powerupQueryKeys = {
  all: catalogKeys.powerups,
  detail: (id: number) => [...catalogKeys.powerups, id] as const,
};

export function usePowerups() {
  return usePowerupsQuery();
}

export function usePowerup(id: number) {
  return useQuery({
    queryKey: powerupQueryKeys.detail(id),
    queryFn: () => powerupService.getPowerupById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export {
  useCreatePowerupMutation,
  useUpdatePowerupMutation,
  useDeletePowerupMutation,
};
