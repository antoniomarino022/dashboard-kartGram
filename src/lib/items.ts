import type { Item, ItemKind, PaintFinish } from "@/types/api";

export const KIND_LABEL: Record<ItemKind, string> = {
  kart: "Kart",
  paint: "Vernici",
  wheels: "Ruote",
  trail: "Scie",
  coin_pack: "Pacchetto monete",
  starter_pack: "Pacchetto iniziale",
};

export type CatalogTab = "kart" | "paint" | "wheels" | "trail" | "pack";

export const CATALOG_TABS: { key: CatalogTab; label: string; kinds: ItemKind[] }[] = [
  { key: "kart", label: "Kart", kinds: ["kart"] },
  { key: "paint", label: "Vernici", kinds: ["paint"] },
  { key: "wheels", label: "Ruote", kinds: ["wheels"] },
  { key: "trail", label: "Scie", kinds: ["trail"] },
  { key: "pack", label: "Pacchetti", kinds: ["coin_pack", "starter_pack"] },
];

export const FINISH_LABEL: Record<PaintFinish, string> = {
  flat: "Opaca",
  metal: "Metallizzata",
  neon: "Neon",
};

export const isPack = (kind: ItemKind) => kind === "coin_pack" || kind === "starter_pack";
export const hasModel = (kind: ItemKind) => kind === "kart" || kind === "wheels";
export const hasColor = (kind: ItemKind) => kind === "paint" || kind === "trail";

/** Gratis = 0 monete e nessun prezzo in Stelle: lo possiedono tutti. */
export const isFree = (item: Pick<Item, "priceCoins" | "priceStars">) =>
  item.priceCoins === 0 && item.priceStars == null;
