"use client";

import { UnlockType } from "@/types/api";
import { UNLOCK_TYPE_META } from "@/lib/utils";
import { DoubleCheckIcon, SingleCheckIcon } from "@/components/ui/telegram-icons";

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide"
      style={{
        backgroundColor: isActive
          ? "var(--tg-success-soft)"
          : "var(--tg-bg-hover)",
        color: isActive ? "var(--tg-success)" : "var(--tg-text-secondary)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: isActive
            ? "var(--tg-success)"
            : "var(--tg-text-secondary)",
        }}
      />
      {isActive ? (
        <DoubleCheckIcon className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <SingleCheckIcon className="h-3 w-3 shrink-0" />
      )}
      {isActive ? "Attivo" : "Inattivo"}
    </span>
  );
}

export function UnlockTypeBadge({
  unlockType,
  unlockValue,
}: {
  unlockType: UnlockType;
  unlockValue: number;
}) {
  const meta = UNLOCK_TYPE_META[unlockType] ?? UNLOCK_TYPE_META[UnlockType.FREE];

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] leading-none">
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
        style={{
          backgroundColor: meta.softBgVar,
          color: meta.accentVar,
        }}
      >
        <span>{meta.shortLabel}</span>
      </span>
      {unlockType === UnlockType.FREE ? (
        <span className="text-[12px] font-medium text-tg-success">Gratis</span>
      ) : (
        <span className="font-mono text-[13px] font-semibold text-tg-primary">
          {unlockValue.toLocaleString("it-IT")}{" "}
          <span className="font-sans text-[11px] font-normal text-tg-muted">
            {meta.unitLabel}
          </span>
        </span>
      )}
    </span>
  );
}
