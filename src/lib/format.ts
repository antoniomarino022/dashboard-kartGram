import { format, isToday, isYesterday } from "date-fns";
import { it } from "date-fns/locale";

export function formatTelegramTime(date: Date | number | string): string {
  const d = typeof date === "object" ? date : new Date(date);
  return format(d, "HH:mm");
}

export function formatDaySeparator(date: Date | number | string): string {
  const d = typeof date === "object" ? date : new Date(date);
  if (isToday(d)) return "Oggi";
  if (isYesterday(d)) return "Ieri";
  return format(d, "d MMMM", { locale: it });
}

export function getDeterministicTimestamp(id: number): Date {
  const now = new Date();
  const baseMs = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    9,
    15,
    0
  ).getTime();
  const offsetMinutes = ((id * 17) % 360) - (id > 8 ? 1440 : 0);
  return new Date(baseMs + offsetMinutes * 60_000);
}
