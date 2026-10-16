export enum UnlockType {
  FREE = "FREE",
  COINS = "COINS",
  STARS = "STARS",
  SHARES = "SHARES",
  ADS = "ADS",
}

export interface Car {
  id: number;
  name: string;             // Obbligatorio, min 1, max 100
  carType: string | null;   // Opzionale, max 50 (es. "drift", "speed", "acceleration")
  speed: number;            // Intero positivo obbligatorio (es. 120)
  baseLives: number;        // Intero, default 3
  unlockType: UnlockType;   // "FREE" | "COINS" | "STARS" | "SHARES" | "ADS"
  unlockValue: number;      // Costo o requisiti di sblocco (default 0)
  isActive: boolean;        // default true
}

export type CreateCarInput = Omit<Car, "id">;
export type UpdateCarInput = Partial<CreateCarInput>;

export interface Character {
  id: number;
  name: string;             // Obbligatorio, min 1, max 100
  subtype: string | null;   // Opzionale, max 50 (es. "balanced", "drift")
  bonusStat: string | null; // Modificatore/perk (es. "+10% coins", "shield_on_start")
  unlockType: UnlockType;
  unlockValue: number;
  isActive: boolean;
}

export type CreateCharacterInput = Omit<Character, "id">;
export type UpdateCharacterInput = Partial<CreateCharacterInput>;

export interface GameMap {
  id: number;
  name: string;             // Obbligatorio, min 1, max 100
  mapType: string | null;   // Opzionale, max 50 (es. "asphalt", "desert", "cyberpunk")
  unlockType: UnlockType;
  unlockValue: number;
  isActive: boolean;
}

export type CreateMapInput = Omit<GameMap, "id">;
export type UpdateMapInput = Partial<CreateMapInput>;

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}
