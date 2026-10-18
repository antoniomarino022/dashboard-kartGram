import { Suspense } from "react";
import type { Metadata } from "next";
import { PlayerDetailView } from "@/components/players/player-detail";

export const instant = false;

export const metadata: Metadata = {
  title: "Giocatore",
};

export default function PlayerPage() {
  return (
    <Suspense fallback={null}>
      <PlayerDetailView />
    </Suspense>
  );
}
