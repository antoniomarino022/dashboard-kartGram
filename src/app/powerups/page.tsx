import type { Metadata } from "next";
import { PowerupsManager } from "@/components/powerups/powerups-manager";

export const metadata: Metadata = {
  title: "Gestione Powerup | Kart-Gram Admin",
  description: "Gestione del catalogo potenziamenti (powerups) di Kart-Gram.",
};

export default function PowerupsPage() {
  return <PowerupsManager />;
}
