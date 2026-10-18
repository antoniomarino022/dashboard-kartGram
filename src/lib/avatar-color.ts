const TELEGRAM_AVATAR_PALETTE = [
  {
    bg: "#ff5858",
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee0979 100%)",
    text: "#FFFFFF",
  },
  {
    bg: "#ff9900",
    gradient: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
    text: "#FFFFFF",
  },
  {
    bg: "#8b5cf6",
    gradient: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
    text: "#FFFFFF",
  },
  {
    bg: "#10b981",
    gradient: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
    text: "#FFFFFF",
  },
  {
    bg: "#06b6d4",
    gradient: "linear-gradient(135deg, #22d3ee 0%, #0284c7 100%)",
    text: "#FFFFFF",
  },
  {
    bg: "#2aabee",
    gradient: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
    text: "#FFFFFF",
  },
  {
    bg: "#ec4899",
    gradient: "linear-gradient(135deg, #f472b6 0%, #db2777 100%)",
    text: "#FFFFFF",
  },
] as const;

const CHANNEL_SPECIFIC_PALETTE: Record<
  string,
  { bg: string; gradient: string; text: string }
> = {
  cars: {
    bg: "#ff5858",
    gradient: "linear-gradient(135deg, #ff5858 0%, #f97316 100%)",
    text: "#FFFFFF",
  },
  characters: {
    bg: "#8b5cf6",
    gradient: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
    text: "#FFFFFF",
  },
  maps: {
    bg: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
    text: "#FFFFFF",
  },
  paints: {
    bg: "#ec4899",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #a855f7 55%, #3b82f6 100%)",
    text: "#FFFFFF",
  },
  wheels: {
    bg: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    text: "#FFFFFF",
  },
  powerups: {
    bg: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
    text: "#FFFFFF",
  },
};

export function getAvatarColor(seed: string | number): {
  bg: string;
  gradient: string;
  text: string;
} {
  const str = String(seed || "T").toLowerCase();
  if (CHANNEL_SPECIFIC_PALETTE[str]) {
    return CHANNEL_SPECIFIC_PALETTE[str];
  }
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % TELEGRAM_AVATAR_PALETTE.length;
  return TELEGRAM_AVATAR_PALETTE[index];
}

export function getInitials(label: string | null | undefined): string {
  if (!label) return "KG";
  const cleaned = label.replace(/^#/, "").trim();
  if (!cleaned) return "KG";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
