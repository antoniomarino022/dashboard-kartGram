import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UnlockType } from "@/types/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const UNLOCK_TYPE_META: Record<
  UnlockType,
  {
    label: string;
    shortLabel: string;
    unitLabel: string;
    accentVar: string;
    softBgVar: string;
  }
> = {
  [UnlockType.FREE]: {
    label: "Gratuito (FREE)",
    shortLabel: "FREE",
    unitLabel: "Gratuito",
    accentVar: "var(--tg-success)",
    softBgVar: "var(--tg-success-soft)",
  },
  [UnlockType.COINS]: {
    label: "Monete (COINS)",
    shortLabel: "COINS",
    unitLabel: "monete",
    accentVar: "var(--tg-warning)",
    softBgVar: "var(--tg-warning-soft)",
  },
  [UnlockType.STARS]: {
    label: "Stelle Telegram (STARS)",
    shortLabel: "STARS",
    unitLabel: "stelle",
    accentVar: "var(--tg-purple)",
    softBgVar: "var(--tg-purple-soft)",
  },
  [UnlockType.SHARES]: {
    label: "Condivisioni (SHARES)",
    shortLabel: "SHARES",
    unitLabel: "condivisioni",
    accentVar: "var(--tg-cyan)",
    softBgVar: "var(--tg-cyan-soft)",
  },
  [UnlockType.ADS]: {
    label: "Pubblicità (ADS)",
    shortLabel: "ADS",
    unitLabel: "spot",
    accentVar: "var(--tg-danger)",
    softBgVar: "var(--tg-danger-soft)",
  },
};
