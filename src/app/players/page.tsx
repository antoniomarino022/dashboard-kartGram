import type { Metadata } from "next";
import { PlayersList } from "@/components/players/players-list";

export const instant = false;

export const metadata: Metadata = {
  title: "Giocatori",
};

export default function PlayersPage() {
  return <PlayersList />;
}
