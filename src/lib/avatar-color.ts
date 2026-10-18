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
