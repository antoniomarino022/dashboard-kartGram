"use client";

import { useQuery } from "@tanstack/react-query";
import { wheelService } from "@/services/wheelService";
import {
  catalogKeys,
  useCreateWheelMutation,
  useDeleteWheelMutation,
  useUpdateWheelMutation,
  useWheelsQuery,
} from "@/hooks/use-catalog-queries";

export const wheelQueryKeys = {
  all: catalogKeys.wheels,
  detail: (id: number) => [...catalogKeys.wheels, id] as const,
};

export function useWheels() {
  return useWheelsQuery();
}

export function useWheel(id: number) {
  return useQuery({
    queryKey: wheelQueryKeys.detail(id),
    queryFn: () => wheelService.getWheelById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export {
  useCreateWheelMutation,
  useUpdateWheelMutation,
  useDeleteWheelMutation,
};
