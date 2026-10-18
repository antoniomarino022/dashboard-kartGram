import { format, formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

export const formatNumber = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("it-IT");

export const formatDate = (iso: string | null | undefined) =>
  iso ? format(new Date(iso), "d MMM yyyy", { locale: it }) : "—";

export const formatDateTime = (iso: string | null | undefined) =>
  iso ? format(new Date(iso), "d MMM yyyy, HH:mm", { locale: it }) : "—";

export const formatRelative = (iso: string | null | undefined) =>
  iso ? formatDistanceToNow(new Date(iso), { addSuffix: true, locale: it }) : "—";
