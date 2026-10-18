"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { usePaymentsQuery } from "@/hooks/use-admin-queries";
import { parseApiError } from "@/services/apiClient";
import { formatDateTime, formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { PaymentStatus } from "@/types/api";
import { Badge, type BadgeTone } from "@/components/ui/badges";
import {
  PageScroll,
  PageTitle,
  Pager,
  Panel,
  RefreshButton,
  StateMessage,
  Table,
  tdClass,
  thClass,
} from "@/components/ui/page";

const STATUS: Record<PaymentStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "Pagato", tone: "success" },
  pending: { label: "In attesa", tone: "warning" },
  refunded: { label: "Rimborsato", tone: "danger" },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const meta = STATUS[status] ?? { label: status, tone: "muted" as const };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

function ChargeId({ value }: { value: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-tg-muted">—</span>;
  const short = value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-6)}` : value;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copia non riuscita");
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-sm text-tg-muted" title={value}>
        {short}
      </span>
      <button
        type="button"
        onClick={copy}
        title="Copia"
        aria-label="Copia ID transazione"
        className="rounded-md p-1 text-tg-muted hover:bg-tg-hover hover:text-tg-primary cursor-pointer"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-tg-success" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}

export function PaymentsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error, refetch } = usePaymentsQuery(page);
  const rows = data?.payments ?? [];
  const pageSize = data?.pageSize ?? 50;
  const total = data?.total ?? 0;
  const from = (page - 1) * pageSize + 1;

  return (
    <PageScroll>
      <PageTitle
        count={data ? total : null}
        actions={<RefreshButton onClick={() => refetch()} spinning={isFetching} />}>
        Pagamenti
      </PageTitle>

      <Panel>
        {isLoading ? (
          <StateMessage>Caricamento…</StateMessage>
        ) : isError ? (
          <StateMessage tone="danger" onRetry={() => refetch()}>
            {parseApiError(error).message}
          </StateMessage>
        ) : rows.length === 0 ? (
          <StateMessage>Nessun pagamento.</StateMessage>
        ) : (
          <div className={cn(isFetching && "opacity-60 transition-opacity")}>
            <Table
              head={
                <>
                  <th className={thClass}>Data</th>
                  <th className={thClass}>Giocatore</th>
                  <th className={cn(thClass, "hidden sm:table-cell")}>Acquisto</th>
                  <th className={cn(thClass, "text-right")}>Stelle</th>
                  <th className={thClass}>Stato</th>
                  <th className={cn(thClass, "hidden md:table-cell")}>ID transazione</th>
                </>
              }
            >
              {rows.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-tg-hover/60">
                  <td className={cn(tdClass, "whitespace-nowrap text-sm")}>
                    {formatDateTime(p.paidAt ?? p.createdAt)}
                  </td>
                  <td className={tdClass}>
                    <Link
                      href={`/players/${p.userId}`}
                      className="block max-w-[14rem] truncate font-semibold hover:text-tg-accent-ink hover:underline"
                    >
                      {p.playerName}
                    </Link>
                  </td>
                  <td className={cn(tdClass, "hidden text-sm sm:table-cell")}>
                    {p.purpose === "revive" ? "Revive" : (p.itemName ?? p.itemId ?? "—")}
                  </td>
                  <td className={cn(tdClass, "text-right font-semibold tabular-nums")}>
                    {formatNumber(p.stars)}
                  </td>
                  <td className={tdClass}>
                    <PaymentStatusBadge status={p.status} />
                  </td>
                  <td className={cn(tdClass, "hidden md:table-cell")}>
                    <ChargeId value={p.telegramChargeId} />
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
        {rows.length > 0 && (
          <Pager
            page={page}
            hasPrev={page > 1}
            hasNext={page * pageSize < total}
            onChange={setPage}
            label={`${formatNumber(from)}–${formatNumber(from + rows.length - 1)} di ${formatNumber(total)}`}
          />
        )}
      </Panel>
    </PageScroll>
  );
}
