"use client";

import { useQuery } from "@tanstack/react-query";
import { paintService } from "@/services/paintService";
import {
  catalogKeys,
  useCreatePaintMutation,
  useDeletePaintMutation,
  usePaintsQuery,
  useUpdatePaintMutation,
} from "@/hooks/use-catalog-queries";

export const paintQueryKeys = {
  all: catalogKeys.paints,
  detail: (id: number) => [...catalogKeys.paints, id] as const,
};

export function usePaints() {
  return usePaintsQuery();
}

export function usePaint(id: number) {
  return useQuery({
    queryKey: paintQueryKeys.detail(id),
    queryFn: () => paintService.getPaintById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export {
  useCreatePaintMutation,
  useUpdatePaintMutation,
  useDeletePaintMutation,
};
