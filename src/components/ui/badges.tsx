"use client";

import { Badge, Caption, Chip } from "@telegram-apps/telegram-ui";
import { UnlockType } from "@/types/api";
import { cn, UNLOCK_TYPE_META } from "@/lib/utils";
import { Coins, Gift, Megaphone, Share2, Sparkles } from "lucide-react";

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Chip
      mode="elevated"
      before={<Badge type="dot" mode={isActive ? "primary" : "gray"} />}
      className={cn(
        "!rounded-full !py-1 !px-2.5 text-xs font-medium border",
        isActive
          ? "!border-emerald-500/30 !bg-emerald-500/10 !text-emerald-400"
          : "!border-zinc-700 !bg-zinc-800/80 !text-zinc-400"
      )}
    >
      {isActive ? "Attivo" : "Inattivo"}
    </Chip>
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
      <Chip
        mode="outline"
        before={<Icon className="h-3.5 w-3.5" />}
        className={cn(
          "!rounded-lg !py-1 !px-2.5 text-xs font-semibold tracking-wide border",
          meta.badgeClass
        )}
      >
        {unlockType}
      </Chip>
      {typeof unlockValue === "number" && (
        <Caption level="1" className="font-mono !text-zinc-400">
          {unlockType === UnlockType.FREE
            ? "0 (Gratis)"
            : `${unlockValue.toLocaleString("it-IT")} ${meta.unitLabel}`}
        </Caption>
      )}
    </div>
  );
}
