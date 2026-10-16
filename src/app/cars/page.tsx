import type { Metadata } from "next";
import { CarsManager } from "@/components/cars/cars-manager";

export const metadata: Metadata = {
  title: "Gestione Auto | Kart-Gram Admin",
  description: "Gestione del catalogo auto da corsa di Kart-Gram.",
};

export default function CarsPage() {
  return <CarsManager />;
}
