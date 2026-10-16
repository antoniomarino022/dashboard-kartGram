import type { Metadata } from "next";
import { MapsManager } from "@/components/maps/maps-manager";

export const metadata: Metadata = {
  title: "Gestione Mappe | Kart-Gram Admin",
  description: "Gestione dei circuiti e delle mappe di Kart-Gram.",
};

export default function MapsPage() {
  return <MapsManager />;
}
