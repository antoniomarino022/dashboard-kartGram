import type { Metadata } from "next";
import { ItemsManager } from "@/components/items/items-manager";

export const instant = false;

export const metadata: Metadata = {
  title: "Catalogo",
};

export default function ItemsPage() {
  return <ItemsManager />;
}
