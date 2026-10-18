import { wheelsService } from "@/services/apiClient";
import type { CreateWheelInput, UpdateWheelInput, WheelResponse } from "@/types/api";

export const wheelService = {
  getWheels: (): Promise<WheelResponse[]> => wheelsService.getAll(),
  getWheelById: (id: number): Promise<WheelResponse> => wheelsService.getById(id),
  createWheel: (payload: CreateWheelInput): Promise<WheelResponse> =>
    wheelsService.create(payload),
  updateWheel: (id: number, payload: UpdateWheelInput): Promise<WheelResponse> =>
    wheelsService.update(id, payload),
  deleteWheel: (id: number): Promise<void> => wheelsService.remove(id),
};
