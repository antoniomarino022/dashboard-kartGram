import { cn } from "@/lib/cn";

export type BadgeTone = "success" | "danger" | "warning" | "muted" | "accent";

const TONES: Record<BadgeTone, string> = {
  success: "bg-tg-success-soft text-tg-success",
  danger: "bg-tg-danger-soft text-tg-danger",
  warning: "bg-tg-warning-soft text-tg-warning",
  muted: "bg-tg-hover text-tg-muted",
  accent: "bg-tg-accent-soft text-tg-accent-ink",
};

export function Badge({
  tone = "muted",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge tone={isActive ? "success" : "muted"}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {isActive ? "Attivo" : "Disattivo"}
    </Badge>
  );
}
