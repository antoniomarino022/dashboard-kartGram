"use client";

import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  CircleDot,
  MapPin,
  Palette,
  Users,
  Zap,
} from "lucide-react";
import {
  useCarsQuery,
  useCharactersQuery,
  useMapsQuery,
  usePaintsQuery,
  usePowerupsQuery,
  useWheelsQuery,
} from "@/hooks/use-catalog-queries";

const CATALOG_CARDS = [
  {
    key: "cars",
    href: "/cars",
    title: "Parco Auto",
    description: "Gestione veicoli, velocità di punta, vite base e tipo di sblocco.",
    icon: CarFront,
  },
  {
    key: "characters",
    href: "/characters",
    title: "Piloti & Personaggi",
    description: "Configurazione piloti, perk bonus e statistiche di gara.",
    icon: Users,
  },
  {
    key: "maps",
    href: "/maps",
    title: "Mappe & Tracciati",
    description: "Circuiti, ambientazioni e condizioni di accesso in-game.",
    icon: MapPin,
  },
  {
    key: "paints",
    href: "/paints",
    title: "Vernici & Livree",
    description: "Tavolozza colori esadecimali e personalizzazioni carrozzeria.",
    icon: Palette,
  },
  {
    key: "wheels",
    href: "/wheels",
    title: "Set Ruote",
    description: "Pneumatici e vite supplementari associate.",
    icon: CircleDot,
  },
  {
    key: "powerups",
    href: "/powerups",
    title: "Powerup",
    description: "Abilità speciali in gara, monete e condizioni di sblocco.",
    icon: Zap,
  },
];

export default function HomePage() {
  const carsQuery = useCarsQuery();
  const charactersQuery = useCharactersQuery();
  const mapsQuery = useMapsQuery();
  const paintsQuery = usePaintsQuery();
  const wheelsQuery = useWheelsQuery();
  const powerupsQuery = usePowerupsQuery();

  const counts: Record<string, number> = {
    cars: carsQuery.data?.length ?? 0,
    characters: charactersQuery.data?.length ?? 0,
    maps: mapsQuery.data?.length ?? 0,
    paints: paintsQuery.data?.length ?? 0,
    wheels: wheelsQuery.data?.length ?? 0,
    powerups: powerupsQuery.data?.length ?? 0,
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-tg-chat p-6">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        {/* Simple Header */}
        <div className="flex items-center justify-between border-b border-tg-border pb-4">
          <div>
            <h1 className="text-lg font-bold text-tg-primary">
              Panoramica Cataloghi
            </h1>
            <p className="text-xs text-tg-muted">
              Pannello di controllo per la gestione dei contenuti e dei dati di gioco.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Backend Connesso
          </span>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATALOG_CARDS.map((card) => {
            const Icon = card.icon;
            const count = counts[card.key] ?? 0;

            return (
              <Link
                key={card.key}
                href={card.href}
                className="flex flex-col justify-between rounded-lg border border-tg-border bg-tg-surface p-4 transition-colors hover:border-tg-accent hover:bg-tg-secondary/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded border border-tg-border bg-tg-secondary text-tg-accent">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-xs font-semibold text-tg-primary">
                      {count} elementi
                    </span>
                  </div>
                  <h2 className="mt-3 text-xs font-bold text-tg-primary">
                    {card.title}
                  </h2>
                  <p className="mt-1 text-[11px] leading-relaxed text-tg-muted">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1 border-t border-tg-border pt-2 text-[11px] font-semibold text-tg-accent">
                  <span>Apri tabella</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
