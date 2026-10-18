import { paintsService } from "@/services/apiClient";
import type { CreatePaintInput, PaintResponse, UpdatePaintInput } from "@/types/api";

export const paintService = {
  getPaints: (): Promise<PaintResponse[]> => paintsService.getAll(),
  getPaintById: (id: number): Promise<PaintResponse> => paintsService.getById(id),
  createPaint: (payload: CreatePaintInput): Promise<PaintResponse> =>
    paintsService.create(payload),
  updatePaint: (id: number, payload: UpdatePaintInput): Promise<PaintResponse> =>
    paintsService.update(id, payload),
  deletePaint: (id: number): Promise<void> => paintsService.remove(id),
};
