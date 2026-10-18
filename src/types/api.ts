export type ItemKind =
  | "kart"
  | "paint"
  | "wheels"
  | "trail"
  | "coin_pack"
  | "starter_pack";

export type PaintFinish = "flat" | "metal" | "neon";

export interface Item {
  id: string;
  kind: ItemKind;
  name: string;
  priceCoins: number | null;
  priceStars: number | null;
  model: string | null;
  color: string | null;
  finish: PaintFinish | null;
  coins: number | null;
  revives: number | null;
  grants: string[] | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export type ItemFields = Omit<Item, "id" | "createdAt">;
export type CreateItemInput = Pick<Item, "id" | "kind" | "name"> &
  Partial<Omit<ItemFields, "kind" | "name">>;
export type UpdateItemInput = Partial<ItemFields>;

export interface AdminStats {
  players: { total: number; newWeek: number; banned: number; coins: number };
  activity: { runsDay: number; runsWeek: number; activeWeek: number };
  stars: { total: number; month: number; paidCount: number };
  bestScore: number;
}

export interface PlayerSummary {
  id: number;
  telegramId: number;
  name: string;
  username: string | null;
  profileIcon: string | null;
  coins: number;
  bestScore: number;
  revives: number;
  isBanned: boolean;
  createdAt: string | null;
  runs: number;
  lastRunAt: string | null;
}

export interface PlayersPage {
  total: number;
  page: number;
  pageSize: number;
  players: PlayerSummary[];
}

export type UpgradeId = "turbo" | "magnet" | "slowmo" | "x2";
export type PaymentStatus = "pending" | "paid" | "refunded";

export interface Payment {
  id: number;
  userId: number;
  payload: string;
  purpose: "item" | "revive";
  itemId: string | null;
  runId: string | null;
  stars: number;
  status: PaymentStatus;
  telegramChargeId: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface PaymentRow extends Payment {
  playerName: string;
  itemName: string | null;
}

export interface PaymentsPage {
  total: number;
  page: number;
  pageSize: number;
  payments: PaymentRow[];
}

export type RunStatus = "running" | "finished" | "expired";

export interface PlayerDetail {
  player: Omit<PlayerSummary, "runs" | "lastRunAt"> & {
    displayName: string | null;
    equipped: Record<string, string>;
  };
  owned: {
    itemId: string;
    name: string;
    kind: ItemKind;
    source: string;
    acquiredAt: string;
  }[];
  upgrades: Record<UpgradeId, number>;
  runs: {
    id: string;
    status: RunStatus;
    score: number | null;
    coins: number | null;
    distance: number | null;
    revived: boolean;
    startedAt: string;
    finishedAt: string | null;
  }[];
  payments: Payment[];
  transactions: {
    id: number;
    amount: number;
    reason: string;
    createdAt: string | null;
  }[];
}

export interface UpdatePlayerInput {
  coins?: number;
  revives?: number;
  isBanned?: boolean;
  displayName?: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}
