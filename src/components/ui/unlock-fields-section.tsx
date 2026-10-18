"use client";

import { UnlockType } from "@/types/api";
import { cn, UNLOCK_TYPE_META } from "@/lib/utils";
import { Coins, Gift, Megaphone, Share2, Sparkles } from "lucide-react";

interface UnlockFieldsSectionProps {
  unlockType: UnlockType;
  unlockValue: number;
  isActive: boolean;
  onUnlockTypeChange: (newType: UnlockType) => void;
  onUnlockValueChange: (newValue: number) => void;
  onIsActiveChange: (newActive: boolean) => void;
  activeSubtitle?: string;
  fieldErrors?: Record<string, string[]>;
}

const UNLOCK_ICONS = {
  [UnlockType.FREE]: Gift,
  [UnlockType.COINS]: Coins,
  [UnlockType.STARS]: Sparkles,
  [UnlockType.SHARES]: Share2,
  [UnlockType.ADS]: Megaphone,
};

export function UnlockFieldsSection({
  unlockType,
  unlockValue,
  isActive,
  onUnlockTypeChange,
  onUnlockValueChange,
  onIsActiveChange,
  activeSubtitle = "Elemento visibile e sbloccabile nel client",
  fieldErrors = {},
}: UnlockFieldsSectionProps) {
  const currentMeta = UNLOCK_TYPE_META[unlockType];

  return (
    <div className="space-y-3.5 border-t border-tg-border pt-3.5">
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-tg-muted">
          Metodo di Sblocco *
        </label>
        <div
          role="radiogroup"
          aria-label="Metodo di Sblocco"
          className="grid grid-cols-5 gap-1.5"
        >
          {Object.values(UnlockType).map((type) => {
            const Icon = UNLOCK_ICONS[type];
            const isSelected = unlockType === type;
            const meta = UNLOCK_TYPE_META[type];

            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onUnlockTypeChange(type)}
                style={
                  isSelected
                    ? {
                        backgroundColor: meta.softBgVar,
                        color: meta.accentVar,
                        borderColor: meta.accentVar,
                      }
                    : undefined
                }
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-[12px] border py-2 px-1 text-[11px] font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-tg-accent",
                  isSelected
                    ? "scale-[1.03] shadow-xs"
                    : "border-tg-border bg-tg-secondary text-tg-muted hover:bg-tg-hover hover:text-tg-primary"
                )}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: meta.accentVar }}
                />
                <span>{meta.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-tg-muted">
            Tipo Sblocco
          </label>
          <select
            value={unlockType}
            onChange={(e) => onUnlockTypeChange(e.target.value as UnlockType)}
            className="h-10 w-full rounded-[12px] border border-tg-border bg-tg-secondary px-3 text-[14px] font-medium text-tg-primary focus:border-tg-accent focus:outline-none"
          >
            {Object.values(UnlockType).map((type) => (
              <option key={type} value={type}>
                {UNLOCK_TYPE_META[type].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-semibold text-tg-muted">
            {unlockType === UnlockType.FREE
              ? "Costo (Gratis)"
              : `Costo (${currentMeta.unitLabel})`}
          </label>
          <input
            type="number"
            min={0}
            step={1}
            disabled={unlockType === UnlockType.FREE}
            value={unlockType === UnlockType.FREE ? 0 : unlockValue}
            onChange={(e) => onUnlockValueChange(Number(e.target.value))}
            className="h-10 w-full rounded-[12px] border border-tg-border bg-tg-secondary px-3 font-mono text-[14px] font-bold text-tg-primary focus:border-tg-accent focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      {(fieldErrors.unlockType || fieldErrors.unlockValue) && (
        <div className="space-y-0.5 text-[12px] font-medium text-tg-danger">
          {fieldErrors.unlockType && <p>{fieldErrors.unlockType.join(", ")}</p>}
          {fieldErrors.unlockValue && (
            <p>{fieldErrors.unlockValue.join(", ")}</p>
          )}
        </div>
      )}

      <label className="flex items-center justify-between gap-3 rounded-[14px] border border-tg-border bg-tg-secondary/80 px-3.5 py-2.5 transition-colors hover:bg-tg-hover cursor-pointer">
        <span className="min-w-0">
          <span className="block text-[14px] font-bold text-tg-primary">
            Stato visibilità (isActive)
          </span>
          <span className="block truncate text-[12px] text-tg-muted">
            {activeSubtitle}
          </span>
        </span>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => onIsActiveChange(e.target.checked)}
          className="h-5 w-5 shrink-0 accent-[var(--tg-accent)] cursor-pointer"
        />
      </label>
    </div>
  );
}
