"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlayersQuery } from "@/hooks/use-admin-queries";
import { parseApiError } from "@/services/apiClient";
import { formatNumber, formatRelative } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badges";
import { TgAvatar } from "@/components/ui/tg-avatar";
import {
  PageScroll,
  PageTitle,
  Pager,
  Panel,
  RefreshButton,
  SearchInput,
  StateMessage,
  Table,
  tdClass,
  thClass,
} from "@/components/ui/page";

export function PlayersList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // ricerca con debounce: la query parte 300ms dopo l'ultimo tasto
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching, isError, error, refetch } = usePlayersQuery(query, page);
  const players = data?.players ?? [];
  const pageSize = data?.pageSize ?? 50;
  const total = data?.total ?? 0;
  const from = (page - 1) * pageSize + 1;

  return (
    <PageScroll>
      <PageTitle
        count={data ? total : null}
        actions={<RefreshButton onClick={() => refetch()} spinning={isFetching} />}
      >
        Giocatori
      </PageTitle>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Nome, @username, ID, ID Telegram"
        label="Cerca giocatori"
      />

      <Panel>
        {isLoading ? (
          <StateMessage>Caricamento…</StateMessage>
        ) : isError ? (
          <StateMessage tone="danger" onRetry={() => refetch()}>
            {parseApiError(error).message}
          </StateMessage>
        ) : players.length === 0 ? (
          <StateMessage>{query ? "Nessun risultato." : "Nessun giocatore."}</StateMessage>
        ) : (
          <>
            <div className={cn(isFetching && "opacity-60 transition-opacity")}>
              <Table
                head={
                  <>
                    <th className={thClass}>Giocatore</th>
                    <th className={cn(thClass, "hidden lg:table-cell")}>ID Telegram</th>
                    <th className={cn(thClass, "hidden text-right sm:table-cell")}>Monete</th>
                    <th className={cn(thClass, "text-right")}>Record</th>
                    <th className={cn(thClass, "hidden text-right md:table-cell")}>Partite</th>
                    <th className={cn(thClass, "hidden md:table-cell")}>Ultima partita</th>
                    <th className={thClass} />
                  </>
                }
              >
                {players.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/players/${p.id}`)}
                    className="cursor-pointer transition-colors hover:bg-tg-hover/60"
                  >
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <TgAvatar name={p.name} size="sm" />
                        <div className="min-w-0 max-w-[14rem]">
                          <Link
                            href={`/players/${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="block truncate font-semibold hover:text-tg-accent-ink hover:underline"
                          >
                            {p.name}
                          </Link>
                          {p.username && (
                            <div className="truncate text-xs text-tg-muted">@{p.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={cn(tdClass, "hidden font-mono text-sm text-tg-muted lg:table-cell")}>
                      {p.telegramId}
                    </td>
                    <td className={cn(tdClass, "hidden text-right tabular-nums sm:table-cell")}>
                      {formatNumber(p.coins)}
                    </td>
                    <td className={cn(tdClass, "text-right font-semibold tabular-nums")}>
                      {formatNumber(p.bestScore)}
                    </td>
                    <td className={cn(tdClass, "hidden text-right tabular-nums md:table-cell")}>
                      {formatNumber(p.runs)}
                    </td>
                    <td className={cn(tdClass, "hidden whitespace-nowrap text-sm text-tg-muted md:table-cell")}>
                      {p.lastRunAt ? formatRelative(p.lastRunAt) : "Mai"}
                    </td>
                    <td className={cn(tdClass, "text-right")}>
                      {p.isBanned && <Badge tone="danger">Sospeso</Badge>}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
            <Pager
              page={page}
              hasPrev={page > 1}
              hasNext={page * pageSize < total}
              onChange={setPage}
              label={`${formatNumber(from)}–${formatNumber(from + players.length - 1)} di ${formatNumber(total)}`}
            />
          </>
        )}
      </Panel>
    </PageScroll>
  );
}
