"use client";

import { ChevronLeft, ChevronRight, RefreshCw, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
    </div>
  );
}

export function CountPill({
  value,
  label,
  tone = "muted",
}: {
  value: number;
  label?: string;
  tone?: "muted" | "success";
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums",
        tone === "success"
          ? "border-tg-success/30 bg-tg-success-soft text-tg-success"
          : "border-tg-border bg-tg-surface text-tg-muted"
      )}
    >
      {value.toLocaleString("it-IT")}
      {label ? ` ${label}` : ""}
    </span>
  );
}

export function PageTitle({
  children,
  count,
  extra,
  actions,
}: {
  children: React.ReactNode;
  count?: number | null;
  extra?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate font-display text-3xl font-extrabold uppercase tracking-wide text-tg-primary lg:text-4xl">
          {children}
        </h1>
        {count != null && <CountPill value={count} />}
        {extra}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function RefreshButton({
  onClick,
  spinning,
}: {
  onClick: () => void;
  spinning: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={spinning}
      title="Aggiorna"
      aria-label="Aggiorna"
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-tg-border bg-tg-surface text-tg-muted transition-colors hover:bg-tg-hover hover:text-tg-primary disabled:opacity-50 cursor-pointer"
    >
      <RefreshCw className={cn("h-4 w-4", spinning && "animate-spin")} />
    </button>
  );
}

export function Panel({
  title,
  actions,
  className,
  children,
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-tg-border bg-tg-surface shadow-card",
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-tg-border px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-tg-muted">{title}</h2>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function StateMessage({
  children,
  tone = "muted",
  onRetry,
}: {
  children: React.ReactNode;
  tone?: "muted" | "danger";
  onRetry?: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <p
        className={cn(
          "text-sm",
          tone === "danger" ? "font-semibold text-tg-danger" : "text-tg-muted"
        )}
      >
        {children}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-tg-border bg-tg-surface px-3 py-1.5 text-sm font-semibold text-tg-primary hover:bg-tg-secondary cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Riprova
        </button>
      )}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  label = "Cerca",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-tg-muted" />
      <input
        type="text"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 w-full rounded-xl border border-tg-border bg-tg-surface pl-9 pr-8 text-sm text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent-ink focus:outline-none focus:ring-2 focus:ring-tg-accent-ink/30"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Svuota ricerca"
          className="absolute right-2.5 top-3 text-tg-muted hover:text-tg-primary cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export const thClass =
  "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-tg-muted";
export const tdClass = "px-5 py-3";

export function Table({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[15px]">
        <thead>
          <tr className="border-b border-tg-border bg-tg-secondary">{head}</tr>
        </thead>
        <tbody className="divide-y divide-tg-border text-tg-primary">{children}</tbody>
      </table>
    </div>
  );
}

export function Pager({
  page,
  hasPrev,
  hasNext,
  onChange,
  label,
}: {
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
  onChange: (page: number) => void;
  label?: React.ReactNode;
}) {
  const btn =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-tg-border bg-tg-surface text-tg-muted hover:bg-tg-secondary hover:text-tg-primary disabled:opacity-30 cursor-pointer";
  return (
    <div className="flex items-center justify-between border-t border-tg-border px-4 py-2.5 text-sm text-tg-muted">
      <div className="tabular-nums">{label}</div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onChange(page - 1)}
          aria-label="Pagina precedente"
          className={btn}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-2 font-mono text-xs">{page}</span>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onChange(page + 1)}
          aria-label="Pagina successiva"
          className={btn}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
