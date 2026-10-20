"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Ban, Gift, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGrantItemMutation,
  useItemsQuery,
  usePlayerQuery,
  useRevokeItemMutation,
  useUpdatePlayerMutation,
  useUpdatePlayerUpgradesMutation,
} from "@/hooks/use-admin-queries";
import { parseApiError } from "@/services/apiClient";
import { formatDate, formatDateTime, formatNumber, formatRelative } from "@/lib/format";
import { KIND_LABEL } from "@/lib/items";
import { cn } from "@/lib/cn";
import type {
  ItemKind,
  PlayerDetail,
  RunStatus,
  UpdatePlayerInput,
  UpgradeId,
} from "@/types/api";
import { Badge } from "@/components/ui/badges";
import { TgAvatar } from "@/components/ui/tg-avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, inputClass } from "@/components/ui/form-field";
import { PaymentStatusBadge } from "@/components/payments/payments-list";
import {
  PageScroll,
  Panel,
  StateMessage,
  Table,
  tdClass,
  thClass,
} from "@/components/ui/page";

const SOURCE_LABEL: Record<string, string> = {
  coins: "Monete",
  stars: "Stelle",
  grant: "Pacchetto",
  admin: "Admin",
};

const REASON_LABEL: Record<string, string> = {
  RUN: "Partita",
  PURCHASE: "Acquisto",
  MONTHLY_REWARD: "Premio mensile",
  AD: "Pubblicità",
  REFERRAL: "Invito",
  REVIVE: "Revive",
};

const UPGRADES: { id: UpgradeId; label: string; icon: string }[] = [
  { id: "ghost", label: "Ghost", icon: "👻" },
  { id: "magnet", label: "Magnete", icon: "🧲" },
  { id: "slowmo", label: "Rallenty", icon: "⏳" },
  { id: "x2", label: "Monete x2", icon: "✖️" },
  { id: "turbo", label: "Turbo", icon: "🔥" },
];

const MAX_UPGRADE = 5;

function RunStatusBadge({ status }: { status: RunStatus }) {
  if (status === "finished") return <Badge tone="muted">Finita</Badge>;
  if (status === "expired") return <Badge tone="danger">Scaduta</Badge>;
  return <Badge tone="warning">In corso</Badge>;
}

const smallBtn =
  "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer";

export function PlayerDetailView() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading, isError, error, refetch } = usePlayerQuery(id);

  if (!Number.isInteger(id) || id <= 0) {
    return (
      <PageScroll>
        <BackLink />
        <Panel>
          <StateMessage tone="danger">ID non valido.</StateMessage>
        </Panel>
      </PageScroll>
    );
  }

  return (
    <PageScroll>
      <BackLink />
      {isLoading ? (
        <Panel>
          <StateMessage>Caricamento…</StateMessage>
        </Panel>
      ) : isError || !data ? (
        <Panel>
          <StateMessage tone="danger" onRetry={() => refetch()}>
            {parseApiError(error).message}
          </StateMessage>
        </Panel>
      ) : (
        <PlayerBody id={id} detail={data} />
      )}
    </PageScroll>
  );
}

function BackLink() {
  return (
    <Link
      href="/players"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-tg-muted hover:text-tg-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      Giocatori
    </Link>
  );
}

function PlayerBody({ id, detail }: { id: number; detail: PlayerDetail }) {
  const { player, owned, upgrades, runs, payments, transactions } = detail;
  const updateMutation = useUpdatePlayerMutation(id);
  const [confirmBan, setConfirmBan] = useState(false);
  const { data: items = [] } = useItemsQuery();
  const itemName = useMemo(() => new Map(items.map((i) => [i.id, i.name])), [items]);

  const toggleBan = async () => {
    try {
      await updateMutation.mutateAsync({ isBanned: !player.isBanned });
      toast.success(player.isBanned ? "Giocatore riattivato" : "Giocatore sospeso");
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setConfirmBan(false);
    }
  };

  return (
    <>
      {/* Intestazione */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <TgAvatar name={player.name} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="truncate font-display text-3xl font-extrabold uppercase tracking-wide lg:text-4xl">
                {player.name}
              </h1>
              {player.isBanned && <Badge tone="danger">Sospeso</Badge>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-tg-muted">
              {player.username && <span>@{player.username}</span>}
              <span>
                ID Telegram <span className="font-mono">{player.telegramId}</span>
              </span>
              <span>
                ID <span className="font-mono">{player.id}</span>
              </span>
              <span>Iscritto {formatDate(player.createdAt)}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmBan(true)}
          className={cn(
            smallBtn,
            "border",
            player.isBanned
              ? "border-tg-border bg-tg-surface text-tg-primary hover:bg-tg-hover"
              : "border-tg-danger/40 bg-tg-danger-soft text-tg-danger hover:bg-tg-danger/15"
          )}
        >
          {player.isBanned ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          {player.isBanned ? "Riattiva" : "Sospendi"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ProfileForm
          key={player.id}
          id={id}
          displayName={player.displayName ?? ""}
          coins={player.coins}
          revives={player.revives}
          bestScore={player.bestScore}
        />
        <PlayerUpgradesCard
          id={id}
          upgrades={upgrades}
          equipped={player.equipped}
          itemName={itemName}
        />
        <OwnedItems id={id} owned={owned} />
      </div>

      <Panel title={`Partite recenti (${runs.length})`}>
        {runs.length === 0 ? (
          <StateMessage>Nessuna partita.</StateMessage>
        ) : (
          <Table
            head={
              <>
                <th className={thClass}>Inizio</th>
                <th className={cn(thClass, "text-right")}>Punti</th>
                <th className={cn(thClass, "text-right")}>Monete</th>
                <th className={cn(thClass, "text-right")}>Distanza</th>
                <th className={thClass}>Revive</th>
                <th className={thClass}>Stato</th>
              </>
            }
          >
            {runs.map((r) => (
              <tr key={r.id}>
                <td className={cn(tdClass, "whitespace-nowrap text-sm")} title={formatDateTime(r.startedAt)}>
                  {formatRelative(r.startedAt)}
                </td>
                <td className={cn(tdClass, "text-right font-semibold tabular-nums")}>
                  {formatNumber(r.score)}
                </td>
                <td className={cn(tdClass, "text-right tabular-nums")}>{formatNumber(r.coins)}</td>
                <td className={cn(tdClass, "text-right tabular-nums")}>
                  {r.distance == null ? "—" : `${formatNumber(r.distance)} m`}
                </td>
                <td className={cn(tdClass, "text-sm")}>{r.revived ? "Sì" : "—"}</td>
                <td className={tdClass}>
                  <RunStatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title={`Pagamenti (${payments.length})`}>
          {payments.length === 0 ? (
            <StateMessage>Nessun pagamento.</StateMessage>
          ) : (
            <Table
              head={
                <>
                  <th className={thClass}>Data</th>
                  <th className={thClass}>Oggetto</th>
                  <th className={cn(thClass, "text-right")}>Stelle</th>
                  <th className={thClass}>Stato</th>
                </>
              }
            >
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className={cn(tdClass, "whitespace-nowrap text-sm")}>
                    {formatDateTime(p.paidAt ?? p.createdAt)}
                  </td>
                  <td className={cn(tdClass, "text-sm")}>
                    {p.purpose === "revive"
                      ? "Revive"
                      : (p.itemId && itemName.get(p.itemId)) || p.itemId || "—"}
                  </td>
                  <td className={cn(tdClass, "text-right font-semibold tabular-nums")}>
                    {formatNumber(p.stars)}
                  </td>
                  <td className={tdClass}>
                    <PaymentStatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        <Panel title={`Movimenti monete (${transactions.length})`}>
          {transactions.length === 0 ? (
            <StateMessage>Nessun movimento.</StateMessage>
          ) : (
            <Table
              head={
                <>
                  <th className={thClass}>Data</th>
                  <th className={thClass}>Causale</th>
                  <th className={cn(thClass, "text-right")}>Importo</th>
                </>
              }
            >
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className={cn(tdClass, "whitespace-nowrap text-sm")}>
                    {formatDateTime(t.createdAt)}
                  </td>
                  <td className={cn(tdClass, "text-sm")}>{REASON_LABEL[t.reason] ?? t.reason}</td>
                  <td
                    className={cn(
                      tdClass,
                      "text-right font-semibold tabular-nums",
                      t.amount >= 0 ? "text-tg-success" : "text-tg-danger"
                    )}
                  >
                    {t.amount > 0 ? "+" : ""}
                    {formatNumber(t.amount)}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>

      <ConfirmDialog
        isOpen={confirmBan}
        title={player.isBanned ? `Riattivare ${player.name}?` : `Sospendere ${player.name}?`}
        confirmLabel={player.isBanned ? "Riattiva" : "Sospendi"}
        danger={!player.isBanned}
        isPending={updateMutation.isPending}
        onConfirm={toggleBan}
        onCancel={() => setConfirmBan(false)}
      />
    </>
  );
}

function ProfileForm({
  id,
  displayName,
  coins,
  revives,
  bestScore,
}: {
  id: number;
  displayName: string;
  coins: number;
  revives: number;
  bestScore: number;
}) {
  const mutation = useUpdatePlayerMutation(id);
  const [form, setForm] = useState({
    displayName,
    coins: String(coins),
    revives: String(revives),
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const changes = useMemo(() => {
    const out: UpdatePlayerInput = {};
    if (form.displayName.trim() !== displayName) out.displayName = form.displayName.trim();
    if (form.coins !== String(coins)) out.coins = Number(form.coins);
    if (form.revives !== String(revives)) out.revives = Number(form.revives);
    return out;
  }, [form, displayName, coins, revives]);
  const dirty = Object.keys(changes).length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Record<string, string[]> = {};
    if (changes.displayName === "") errs.displayName = ["Obbligatorio"];
    if (!/^\d+$/.test(form.coins.trim())) errs.coins = ["Intero ≥ 0"];
    if (!/^\d+$/.test(form.revives.trim())) errs.revives = ["Intero ≥ 0"];
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !dirty) return;
    try {
      await mutation.mutateAsync(changes);
      toast.success("Salvato");
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.fieldErrors) setErrors(parsed.fieldErrors);
      toast.error(parsed.message);
    }
  };

  return (
    <Panel title="Profilo">
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <Field label="Nome" error={errors.displayName}>
          <input
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            maxLength={100}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monete" error={errors.coins}>
            <input
              type="number"
              min={0}
              value={form.coins}
              onChange={(e) => setForm((f) => ({ ...f, coins: e.target.value }))}
              className={cn(inputClass, "tabular-nums")}
            />
          </Field>
          <Field label="Revive" error={errors.revives}>
            <input
              type="number"
              min={0}
              value={form.revives}
              onChange={(e) => setForm((f) => ({ ...f, revives: e.target.value }))}
              className={cn(inputClass, "tabular-nums")}
            />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-tg-muted">Record</div>
            <div className="font-display text-3xl font-extrabold leading-none tabular-nums">
              {formatNumber(bestScore)}
            </div>
          </div>
          <button
            type="submit"
            disabled={!dirty || mutation.isPending}
            className={cn(smallBtn, "bg-tg-accent text-tg-on-accent shadow-card hover:bg-tg-accent-hover")}
          >
            {mutation.isPending ? "Salvataggio…" : "Salva"}
          </button>
        </div>
      </form>
    </Panel>
  );
}

function OwnedItems({ id, owned }: { id: number; owned: PlayerDetail["owned"] }) {
  const { data: items = [] } = useItemsQuery();
  const grantMutation = useGrantItemMutation(id);
  const revokeMutation = useRevokeItemMutation(id);
  const [selected, setSelected] = useState("");
  const [revoking, setRevoking] = useState<PlayerDetail["owned"][number] | null>(null);

  const ownedIds = useMemo(() => new Set(owned.map((o) => o.itemId)), [owned]);
  // i pacchetti si possono regalare più volte; gli oggetti solo se non posseduti
  const options = items.filter(
    (i) => i.kind === "coin_pack" || i.kind === "starter_pack" || !ownedIds.has(i.id)
  );

  const grant = async () => {
    if (!selected) return;
    const name = items.find((i) => i.id === selected)?.name ?? selected;
    try {
      await grantMutation.mutateAsync(selected);
      toast.success(`"${name}" regalato`);
      setSelected("");
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  const revoke = async () => {
    if (!revoking) return;
    try {
      await revokeMutation.mutateAsync(revoking.itemId);
      toast.success(`"${revoking.name}" rimosso`);
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setRevoking(null);
    }
  };

  return (
    <Panel title={`Oggetti (${owned.length})`} className="flex flex-col">
      <div className="flex gap-2 border-b border-tg-border p-3">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="Oggetto da regalare"
          className={cn(inputClass, "min-w-0 flex-1 cursor-pointer")}
        >
          <option value="">Regala oggetto…</option>
          {options.map((i) => (
            <option key={i.id} value={i.id}>
              {KIND_LABEL[i.kind]} · {i.name}
              {i.isActive ? "" : " (disattivo)"}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={grant}
          disabled={!selected || grantMutation.isPending}
          title="Regala"
          aria-label="Regala"
          className={cn(smallBtn, "bg-tg-accent px-3 text-tg-on-accent hover:bg-tg-accent-hover")}
        >
          <Gift className="h-4 w-4" />
        </button>
      </div>
      {owned.length === 0 ? (
        <StateMessage>Solo oggetti gratuiti.</StateMessage>
      ) : (
        <ul className="max-h-80 divide-y divide-tg-border overflow-y-auto">
          {owned.map((o) => (
            <li key={o.itemId} className="flex items-center justify-between gap-3 px-5 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{o.name}</div>
                <div className="truncate text-xs text-tg-muted">
                  {KIND_LABEL[o.kind] ?? o.kind} · {SOURCE_LABEL[o.source] ?? o.source} ·{" "}
                  {formatDate(o.acquiredAt)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRevoking(o)}
                title="Rimuovi"
                aria-label={`Rimuovi ${o.name}`}
                className="rounded-lg p-2 text-tg-muted hover:bg-tg-danger-soft hover:text-tg-danger cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={Boolean(revoking)}
        title={`Rimuovere "${revoking?.name ?? ""}"?`}
        confirmLabel="Rimuovi"
        danger
        isPending={revokeMutation.isPending}
        onConfirm={revoke}
        onCancel={() => setRevoking(null)}
      />
    </Panel>
  );
}

function PlayerUpgradesCard({
  id,
  upgrades,
  equipped,
  itemName,
}: {
  id: number;
  upgrades: PlayerDetail["upgrades"];
  equipped: Record<string, string>;
  itemName: Map<string, string>;
}) {
  const mutation = useUpdatePlayerUpgradesMutation(id);
  const [state, setState] = useState<Record<string, number>>(() => ({ ...upgrades }));

  useEffect(() => {
    setState({ ...upgrades });
  }, [upgrades]);

  const isDirty = useMemo(() => {
    return UPGRADES.some((u) => (state[u.id] ?? 0) !== (upgrades[u.id] ?? 0));
  }, [state, upgrades]);

  const setLevel = (upgradeId: string, level: number) => {
    setState((prev) => ({
      ...prev,
      [upgradeId]: Math.max(0, Math.min(MAX_UPGRADE, level)),
    }));
  };

  const handleSave = async () => {
    try {
      await mutation.mutateAsync(state);
      toast.success("Potenziamenti aggiornati");
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  return (
    <Panel title="Potenziamenti">
      <div className="space-y-4 p-5">
        <ul className="space-y-3">
          {UPGRADES.map((u) => {
            const level = state[u.id] ?? 0;
            return (
              <li key={u.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{u.icon}</span>
                  <span className="text-sm font-medium">{u.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={level <= 0 || mutation.isPending}
                      onClick={() => setLevel(u.id, level - 1)}
                      aria-label={`Diminuisci ${u.label}`}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-tg-border bg-tg-surface text-xs font-bold text-tg-primary hover:bg-tg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      -
                    </button>
                    <div className="flex gap-1 px-1">
                      {Array.from({ length: MAX_UPGRADE }, (_, i) => (
                        <button
                          type="button"
                          key={i}
                          disabled={mutation.isPending}
                          onClick={() => setLevel(u.id, i + 1 === level ? 0 : i + 1)}
                          title={`Livello ${i + 1}`}
                          className={cn(
                            "h-3 w-5 rounded-full transition-colors cursor-pointer",
                            i < level
                              ? "bg-tg-accent"
                              : "bg-tg-badge-muted hover:bg-tg-badge-muted/70"
                          )}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={level >= MAX_UPGRADE || mutation.isPending}
                      onClick={() => setLevel(u.id, level + 1)}
                      aria-label={`Aumenta ${u.label}`}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-tg-border bg-tg-surface text-xs font-bold text-tg-primary hover:bg-tg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-7 text-right text-xs font-semibold tabular-nums text-tg-muted">
                    {level}/{MAX_UPGRADE}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex justify-end pt-2 border-t border-tg-border">
          <button
            type="button"
            disabled={!isDirty || mutation.isPending}
            onClick={handleSave}
            className={cn(
              smallBtn,
              "bg-tg-accent text-tg-on-accent shadow-card hover:bg-tg-accent-hover"
            )}
          >
            {mutation.isPending ? "Salvataggio…" : "Salva potenziamenti"}
          </button>
        </div>
      </div>
      {Object.keys(equipped).length > 0 && (
        <div className="border-t border-tg-border px-5 py-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-tg-muted">
            Equipaggiato
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(equipped).map(([slot, itemId]) => (
              <Badge key={slot} tone="muted">
                <span>{KIND_LABEL[slot as ItemKind] ?? slot}</span>
                <span className="text-tg-primary">{itemName.get(itemId) ?? itemId}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
