import { powerupsService } from "@/services/apiClient";
import type {
  CreatePowerupInput,
  PowerupResponse,
  UpdatePowerupInput,
} from "@/types/api";

export const powerupService = {
  getPowerups: (): Promise<PowerupResponse[]> => powerupsService.getAll(),
  getPowerupById: (id: number): Promise<PowerupResponse> =>
    powerupsService.getById(id),
  createPowerup: (payload: CreatePowerupInput): Promise<PowerupResponse> =>
    powerupsService.create(payload),
  updatePowerup: (
    id: number,
    payload: UpdatePowerupInput
  ): Promise<PowerupResponse> => powerupsService.update(id, payload),
  deletePowerup: (id: number): Promise<void> => powerupsService.remove(id),
};
