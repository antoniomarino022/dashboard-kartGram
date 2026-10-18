import type { Metadata } from "next";
import { MapsManager } from "@/components/maps/maps-manager";

export const instant = false;

export const metadata: Metadata = {
  title: "Gestione Mappe | Kart-Gram Admin",
  description: "Gestione del catalogo circuiti e mappe di Kart-Gram.",
};

export default function MapsPage() {
  return <MapsManager />;
}
