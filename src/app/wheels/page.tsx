import type { Metadata } from "next";
import { WheelsManager } from "@/components/wheels/wheels-manager";

export const metadata: Metadata = {
  title: "Gestione Ruote | Kart-Gram Admin",
  description: "Gestione dei set di ruote e vite extra di Kart-Gram.",
};

export default function WheelsPage() {
  return <WheelsManager />;
}
