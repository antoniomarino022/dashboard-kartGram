"use client";

export function TypingDots({ label = "sta scrivendo" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[13px] text-tg-accent"
      aria-live="polite"
    >
      <span>{label}</span>
      <span className="inline-flex items-center gap-0.5 pt-0.5">
        <span className="h-1 w-1 animate-bounce rounded-full bg-tg-accent [animation-delay:-0.25s]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-tg-accent [animation-delay:-0.12s]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-tg-accent" />
      </span>
    </span>
  );
}
