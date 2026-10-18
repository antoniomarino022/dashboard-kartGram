"use client";

import Link from "next/link";
import {
  Activity,
  Coins,
  Flag,
  Star,
  Trophy,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useStatsQuery } from "@/hooks/use-admin-queries";
import { parseApiError } from "@/services/apiClient";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageScroll, PageTitle, Panel, RefreshButton, StateMessage } from "@/components/ui/page";

interface StatCard {
  label: string;
  value: number | undefined;
  sub?: string;
  icon: LucideIcon;
  href?: string;
}

export default function HomePage() {
  const { data, isLoading, isFetching, isError, error, refetch } = useStatsQuery();

  const cards: StatCard[] = [
    {
      label: "Giocatori",
      value: data?.players.total,
      sub: data?.players.banned ? `${formatNumber(data.players.banned)} sospesi` : undefined,
      icon: Users,
      href: "/players",
    },
    { label: "Nuovi 7g", value: data?.players.newWeek, icon: UserPlus },
    { label: "Attivi 7g", value: data?.activity.activeWeek, icon: Activity },
    {
      label: "Partite oggi",
      value: data?.activity.runsDay,
      sub: data ? `${formatNumber(data.activity.runsWeek)} in 7g` : undefined,
      icon: Flag,
    },
    {
      label: "Stelle 30g",
      value: data?.stars.month,
      sub: data ? `${formatNumber(data.stars.total)} totali · ${formatNumber(data.stars.paidCount)} pagamenti` : undefined,
      icon: Star,
      href: "/payments",
    },
    { label: "Monete in circolo", value: data?.players.coins, icon: Coins },
    { label: "Record", value: data?.bestScore, icon: Trophy },
  ];

  return (
    <PageScroll>
      <PageTitle actions={<RefreshButton onClick={() => refetch()} spinning={isFetching} />}>
        Panoramica
      </PageTitle>

      {isError ? (
        <Panel>
          <StateMessage tone="danger" onRetry={() => refetch()}>
            {parseApiError(error).message}
          </StateMessage>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            const body = (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-tg-muted">{card.label}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tg-accent-soft text-tg-accent-ink">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                </div>
                <div className="mt-4 font-display text-5xl font-extrabold leading-none tabular-nums text-tg-primary">
                  {isLoading ? (
                    <span className="inline-block h-10 w-24 animate-pulse rounded-lg bg-tg-hover" />
                  ) : (
                    formatNumber(card.value)
                  )}
                </div>
                {card.sub && <div className="mt-2 text-xs text-tg-muted tabular-nums">{card.sub}</div>}
              </>
            );
            const className = cn(
              "flex flex-col rounded-2xl border border-tg-border bg-tg-surface p-5 shadow-card",
              card.href && "transition-colors hover:border-tg-accent-ink/60"
            );
            return card.href ? (
              <Link key={card.label} href={card.href} className={className}>
                {body}
              </Link>
            ) : (
              <div key={card.label} className={className}>
                {body}
              </div>
            );
          })}
        </div>
      )}
    </PageScroll>
  );
}
