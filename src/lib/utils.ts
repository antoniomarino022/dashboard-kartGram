import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UnlockType } from "@/types/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const UNLOCK_TYPE_META: Record<
  UnlockType,
  { label: string; badgeClass: string; unitLabel: string }
> = {
  [UnlockType.FREE]: {
    label: "Gratuito (FREE)",
    badgeClass:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 ring-emerald-500/20",
    unitLabel: "Gratuito",
  },
  [UnlockType.COINS]: {
    label: "Monete (COINS)",
    badgeClass:
      "bg-amber-500/15 text-amber-400 border-amber-500/30 ring-amber-500/20",
    unitLabel: "monete",
  },
  [UnlockType.STARS]: {
    label: "Stelle Telegram (STARS)",
    badgeClass:
      "bg-purple-500/15 text-purple-400 border-purple-500/30 ring-purple-500/20",
    unitLabel: "stelle",
  },
  [UnlockType.SHARES]: {
    label: "Condivisioni (SHARES)",
    badgeClass:
      "bg-sky-500/15 text-sky-400 border-sky-500/30 ring-sky-500/20",
    unitLabel: "condivisioni",
  },
  [UnlockType.ADS]: {
    label: "Pubblicità (ADS)",
    badgeClass:
      "bg-rose-500/15 text-rose-400 border-rose-500/30 ring-rose-500/20",
    unitLabel: "spot",
  },
};
