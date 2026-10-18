import type { Metadata } from "next";
import { PaintsManager } from "@/components/paints/paints-manager";

export const instant = false;

export const metadata: Metadata = {
  title: "Gestione Vernici | Kart-Gram Admin",
  description: "Gestione del catalogo vernici e colori auto di Kart-Gram.",
};

export default function PaintsPage() {
  return <PaintsManager />;
}
