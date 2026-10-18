import type { Metadata } from "next";
import { CharactersManager } from "@/components/characters/characters-manager";

export const instant = false;

export const metadata: Metadata = {
  title: "Gestione Personaggi | Kart-Gram Admin",
  description: "Gestione del catalogo personaggi e piloti di Kart-Gram.",
};

export default function CharactersPage() {
  return <CharactersManager />;
}
