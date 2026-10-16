"use client";

import { UnlockType } from "@/types/api";
import { cn, UNLOCK_TYPE_META } from "@/lib/utils";
import { Coins, Gift, Megaphone, Share2, Sparkles } from "lucide-react";

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        isActive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-zinc-700 bg-zinc-800/80 text-zinc-400"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
        )}
      />
      {isActive ? "Attivo" : "Inattivo"}
    </span>
  );
}

export function UnlockTypeBadge({
  unlockType,
  unlockValue,
}: {
  unlockType: UnlockType;
  unlockValue?: number;
}) {
  const meta = UNLOCK_TYPE_META[unlockType] ?? {
    label: unlockType,
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    unitLabel: "",
  };

  const Icon =
    unlockType === UnlockType.FREE
      ? Gift
      : unlockType === UnlockType.COINS
      ? Coins
      : unlockType === UnlockType.STARS
      ? Sparkles
      : unlockType === UnlockType.SHARES
      ? Share2
      : Megaphone;

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
          meta.badgeClass
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {unlockType}
      </span>
      {typeof unlockValue === "number" && (
        <span className="text-xs font-mono text-zinc-400">
          {unlockType === UnlockType.FREE
            ? "0 (Gratis)"
            : `${unlockValue.toLocaleString("it-IT")} ${meta.unitLabel}`}
        </span>
      )}
    </div>
  );
}
