import { cn } from "@/lib/cn";

export const inputClass =
  "h-10 w-full rounded-xl border border-tg-border bg-tg-surface px-3 text-sm text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent-ink focus:outline-none focus:ring-2 focus:ring-tg-accent-ink/30 disabled:opacity-60";

export function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string | string[];
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const message = Array.isArray(error) ? error.join(", ") : error;
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs font-semibold text-tg-muted">{label}</span>
      {children}
      {message ? (
        <span className="mt-1 block text-xs text-tg-danger">{message}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-tg-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-tg-border bg-tg-surface px-3 py-2.5 text-sm font-medium text-tg-primary transition-colors hover:bg-tg-hover disabled:opacity-50 cursor-pointer"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full transition-colors",
          checked ? "bg-tg-accent" : "bg-tg-badge-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}
