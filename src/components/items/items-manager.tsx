"use client";

import { useMemo, useState } from "react";
import { Coins, Heart, Package, Star } from "lucide-react";
import { toast } from "sonner";
import { parseApiError } from "@/services/apiClient";
import {
  useCreateItemMutation,
  useDeleteItemMutation,
  useItemsQuery,
  useUpdateItemMutation,
} from "@/hooks/use-admin-queries";
import type { CreateItemInput, Item, ItemKind, PaintFinish } from "@/types/api";
import {
  CATALOG_TABS,
  FINISH_LABEL,
  KIND_LABEL,
  hasColor,
  hasModel,
  isFree,
  isPack,
  type CatalogTab,
} from "@/lib/items";
import { cn } from "@/lib/cn";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DataTableManager,
  type DataTableColumn,
} from "@/components/ui/data-table-manager";
import { Badge, StatusBadge } from "@/components/ui/badges";
import { Field, Toggle, inputClass } from "@/components/ui/form-field";

interface ItemForm {
  id: string;
  kind: ItemKind;
  name: string;
  priceCoins: string;
  priceStars: string;
  model: string;
  color: string;
  finish: PaintFinish;
  coins: string;
  revives: string;
  grants: string[];
  sortOrder: string;
  isActive: boolean;
}

type FieldErrors = Record<string, string[]>;

const ID_RE = /^[a-z0-9_]{2,64}$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const ID_PLACEHOLDER: Record<ItemKind, string> = {
  kart: "kart_bolt",
  paint: "paint_red",
  wheels: "wheel_sport",
  trail: "trail_fire",
  coin_pack: "coins_xl",
  starter_pack: "starter_pack",
};

const str = (n: number | null | undefined) => (n == null ? "" : String(n));

/** "" → null, altrimenti intero (NaN se non valido) */
function toInt(value: string): number | null {
  const t = value.trim();
  if (t === "") return null;
  return /^-?\d+$/.test(t) ? Number(t) : NaN;
}

function emptyForm(kind: ItemKind, sortOrder: number): ItemForm {
  return {
    id: "",
    kind,
    name: "",
    priceCoins: "",
    priceStars: "",
    model: "",
    color: "#ffd60a",
    finish: "flat",
    coins: "",
    revives: "",
    grants: [],
    sortOrder: String(sortOrder),
    isActive: true,
  };
}

function formFromItem(item: Item): ItemForm {
  return {
    id: item.id,
    kind: item.kind,
    name: item.name,
    priceCoins: str(item.priceCoins),
    priceStars: str(item.priceStars),
    model: item.model ?? "",
    color: item.color ?? "#ffd60a",
    finish: item.finish ?? "flat",
    coins: str(item.coins),
    revives: str(item.revives),
    grants: item.grants ?? [],
    sortOrder: String(item.sortOrder),
    isActive: item.isActive,
  };
}

function validate(form: ItemForm, isCreate: boolean): FieldErrors {
  const errs: FieldErrors = {};
  const { kind } = form;
  const intField = (key: keyof ItemForm, min: number, required = false) => {
    const v = toInt(String(form[key]));
    if (v === null) {
      if (required) errs[key] = ["Obbligatorio"];
    } else if (!Number.isInteger(v) || v < min) {
      errs[key] = [min > 0 ? `Intero ≥ ${min}` : "Intero ≥ 0"];
    }
  };

  if (isCreate && !ID_RE.test(form.id.trim())) {
    errs.id = ["Minuscole, numeri e _ (2-64)"];
  }
  if (!form.name.trim()) errs.name = ["Obbligatorio"];
  if (!isPack(kind)) intField("priceCoins", 0);
  intField("priceStars", 1, isPack(kind));
  if (
    !errs.priceStars &&
    toInt(form.priceStars) === null &&
    (isPack(kind) || toInt(form.priceCoins) === null)
  ) {
    errs.priceStars = ["Serve almeno un prezzo"];
  }
  if (hasModel(kind)) {
    const m = form.model.trim();
    if (!m) errs.model = ["Obbligatorio"];
    else if (!m.endsWith(".glb")) errs.model = ["File .glb"];
  }
  if (hasColor(kind) && !HEX_RE.test(form.color.trim())) {
    errs.color = ["Formato #rrggbb"];
  }
  if (isPack(kind)) intField("coins", kind === "coin_pack" ? 1 : 0, kind === "coin_pack");
  if (kind === "starter_pack") intField("revives", 0);
  if (toInt(form.sortOrder) === null || Number.isNaN(toInt(form.sortOrder))) {
    errs.sortOrder = ["Intero"];
  }
  return errs;
}

function toPayload(form: ItemForm): Omit<CreateItemInput, "id"> {
  const { kind } = form;
  return {
    kind,
    name: form.name.trim(),
    priceCoins: isPack(kind) ? null : toInt(form.priceCoins),
    priceStars: toInt(form.priceStars),
    model: hasModel(kind) ? form.model.trim() : null,
    color: hasColor(kind) ? form.color.trim().toLowerCase() : null,
    finish: kind === "paint" ? form.finish : null,
    coins: isPack(kind) ? toInt(form.coins) : null,
    revives: kind === "starter_pack" ? toInt(form.revives) : null,
    grants: kind === "starter_pack" ? form.grants : null,
    sortOrder: toInt(form.sortOrder) ?? 0,
    isActive: form.isActive,
  };
}

function Price({ item }: { item: Item }) {
  if (isFree(item)) return <Badge tone="success">Gratis</Badge>;
  if (item.priceCoins == null && item.priceStars == null) {
    return <span className="text-sm text-tg-muted">Non in vendita</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm tabular-nums">
      {item.priceCoins != null && (
        <span className="inline-flex items-center gap-1 font-semibold">
          <Coins className="h-3.5 w-3.5 text-tg-warning" />
          {item.priceCoins.toLocaleString("it-IT")}
        </span>
      )}
      {item.priceStars != null && (
        <span className="inline-flex items-center gap-1 font-semibold">
          <Star className="h-3.5 w-3.5 fill-current text-tg-warning" />
          {item.priceStars.toLocaleString("it-IT")}
        </span>
      )}
    </div>
  );
}

function PackContent({ item, names }: { item: Item; names: Map<string, string> }) {
  const parts: React.ReactNode[] = [];
  if (item.coins) {
    parts.push(
      <span key="c" className="inline-flex items-center gap-1">
        <Coins className="h-3.5 w-3.5 text-tg-warning" />
        {item.coins.toLocaleString("it-IT")}
      </span>
    );
  }
  if (item.revives) {
    parts.push(
      <span key="r" className="inline-flex items-center gap-1">
        <Heart className="h-3.5 w-3.5 text-tg-danger" />
        {item.revives}
      </span>
    );
  }
  if (item.grants?.length) {
    parts.push(
      <span
        key="g"
        className="inline-flex items-center gap-1"
        title={item.grants.map((g) => names.get(g) ?? g).join(", ")}
      >
        <Package className="h-3.5 w-3.5 text-tg-muted" />
        {item.grants.length}
      </span>
    );
  }
  if (parts.length === 0) return <span className="text-tg-muted">—</span>;
  return <div className="flex items-center gap-3 text-sm tabular-nums">{parts}</div>;
}

export function ItemsManager() {
  const { data: items = [], isLoading, isFetching, isError, error, refetch } = useItemsQuery();
  const createMutation = useCreateItemMutation();
  const updateMutation = useUpdateItemMutation();
  const deleteMutation = useDeleteItemMutation();

  const [tab, setTab] = useState<CatalogTab>("kart");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<ItemForm>(() => emptyForm("kart", 0));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const tabMeta = CATALOG_TABS.find((t) => t.key === tab) ?? CATALOG_TABS[0];

  const names = useMemo(() => new Map(items.map((i) => [i.id, i.name])), [items]);
  const grantable = useMemo(() => items.filter((i) => !isPack(i.kind)), [items]);

  const tabCounts = useMemo(() => {
    const counts = {} as Record<CatalogTab, number>;
    for (const t of CATALOG_TABS) {
      counts[t.key] = items.filter((i) => t.kinds.includes(i.kind)).length;
    }
    return counts;
  }, [items]);

  const tabItems = useMemo(
    () => items.filter((i) => tabMeta.kinds.includes(i.kind)),
    [items, tabMeta]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tabItems.filter(
      (i) =>
        (!onlyActive || i.isActive) &&
        (q === "" || i.name.toLowerCase().includes(q) || i.id.includes(q))
    );
  }, [tabItems, searchQuery, onlyActive]);

  const set = <K extends keyof ItemForm>(key: K, value: ItemForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    const nextOrder = items.reduce((m, i) => Math.max(m, i.sortOrder), 0) + 10;
    setEditing(null);
    setForm(emptyForm(tabMeta.kinds[0], nextOrder));
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setForm(formFromItem(item));
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.isError) toast.error(parseApiError(result.error).message);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(form, !editing);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = toPayload(form);
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success(`"${payload.name}" salvato`);
      } else {
        await createMutation.mutateAsync({ id: form.id.trim(), ...payload });
        toast.success(`"${payload.name}" creato`);
      }
      setIsFormOpen(false);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.fieldErrors) setFieldErrors(parsed.fieldErrors);
      toast.error(parsed.message);
    }
  };

  const handleToggleActive = async (item: Item) => {
    setTogglingId(item.id);
    try {
      await updateMutation.mutateAsync({ id: item.id, payload: { isActive: !item.isActive } });
      toast.success(`"${item.name}" ${item.isActive ? "disattivato" : "attivato"}`);
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast.success(`"${deleting.name}" eliminato`);
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setDeleting(null);
    }
  };

  const columns = useMemo<DataTableColumn<Item>[]>(() => {
    const cols: DataTableColumn<Item>[] = [
      {
        key: "name",
        header: "Nome",
        render: (item) => (
          <div className="flex items-center gap-3">
            {hasColor(item.kind) && (
              <span
                className="h-7 w-7 shrink-0 rounded-lg border border-tg-border"
                style={{ backgroundColor: item.color ?? "transparent" }}
                title={item.color ?? undefined}
              />
            )}
            <div className="min-w-0">
              <div className="truncate font-semibold">{item.name}</div>
              <div className="truncate font-mono text-xs text-tg-muted">{item.id}</div>
            </div>
          </div>
        ),
      },
    ];
    if (tab === "kart" || tab === "wheels") {
      cols.push({
        key: "model",
        header: "Modello",
        hideOnMobile: true,
        render: (item) => (
          <span className="font-mono text-sm text-tg-muted">{item.model ?? "—"}</span>
        ),
      });
    }
    if (tab === "paint") {
      cols.push({
        key: "finish",
        header: "Finitura",
        hideOnMobile: true,
        render: (item) => (
          <span className="text-sm">{item.finish ? FINISH_LABEL[item.finish] : "—"}</span>
        ),
      });
    }
    if (tab === "pack") {
      cols.push(
        {
          key: "kind",
          header: "Tipo",
          render: (item) => <Badge tone="accent">{KIND_LABEL[item.kind]}</Badge>,
        },
        {
          key: "content",
          header: "Contenuto",
          hideOnMobile: true,
          render: (item) => <PackContent item={item} names={names} />,
        }
      );
    }
    cols.push(
      { key: "price", header: "Prezzo", render: (item) => <Price item={item} /> },
      {
        key: "status",
        header: "Stato",
        align: "center",
        render: (item) => (
          <button
            type="button"
            onClick={() => handleToggleActive(item)}
            disabled={togglingId === item.id}
            title={item.isActive ? "Disattiva" : "Attiva"}
            className="rounded-full transition-opacity hover:opacity-75 disabled:opacity-40 cursor-pointer"
          >
            <StatusBadge isActive={item.isActive} />
          </button>
        ),
      }
    );
    return cols;
    // handleToggleActive cambia a ogni render ma usa solo setter stabili e la mutazione
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, names, togglingId]);

  const { kind } = form;

  return (
    <>
      <DataTableManager<Item>
        title="Catalogo"
        items={filtered}
        columns={columns}
        getId={(item) => item.id}
        getLabel={(item) => item.name}
        totalCount={tabItems.length}
        activeCount={tabItems.filter((i) => i.isActive).length}
        resetKey={tab}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={isError ? parseApiError(error).message : undefined}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cerca nome o ID"
        toolbar={
          <div className="inline-flex flex-wrap gap-1 rounded-xl border border-tg-border bg-tg-surface p-1 shadow-card">
            {CATALOG_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-colors cursor-pointer",
                  tab === t.key
                    ? "bg-tg-accent text-tg-on-accent"
                    : "text-tg-muted hover:bg-tg-hover hover:text-tg-primary"
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    tab === t.key ? "text-tg-on-accent/70" : "text-tg-muted"
                  )}
                >
                  {tabCounts[t.key]}
                </span>
              </button>
            ))}
          </div>
        }
        onlyActive={onlyActive}
        onOnlyActiveChange={setOnlyActive}
        onRefresh={handleRefresh}
        createButtonLabel="Nuovo"
        isFormOpen={isFormOpen}
        formTitle={editing ? editing.name : `Nuovo: ${tabMeta.label}`}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onOpenCreate={openCreate}
        onOpenEdit={openEdit}
        onCloseForm={() => setIsFormOpen(false)}
        onRequestDelete={setDeleting}
        onSubmitForm={handleSubmit}
        submitButtonLabel={editing ? "Salva" : "Crea"}
        renderFormFields={() => (
          <div className="space-y-4">
            {!editing && tab === "pack" && (
              <Field label="Tipo">
                <select
                  value={kind}
                  onChange={(e) => set("kind", e.target.value as ItemKind)}
                  className={cn(inputClass, "cursor-pointer")}
                >
                  <option value="coin_pack">{KIND_LABEL.coin_pack}</option>
                  <option value="starter_pack">{KIND_LABEL.starter_pack}</option>
                </select>
              </Field>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="ID" error={fieldErrors.id}>
                <input
                  value={form.id}
                  onChange={(e) => set("id", e.target.value.toLowerCase())}
                  disabled={Boolean(editing)}
                  placeholder={ID_PLACEHOLDER[kind]}
                  className={cn(inputClass, "font-mono")}
                />
              </Field>
              <Field label="Nome" error={fieldErrors.name}>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  maxLength={100}
                  className={inputClass}
                />
              </Field>
            </div>

            {hasModel(kind) && (
              <Field label="Modello" error={fieldErrors.model}>
                <input
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder={kind === "kart" ? "kart_bolt.glb" : "wheel_sport.glb"}
                  className={cn(inputClass, "font-mono")}
                />
              </Field>
            )}

            {hasColor(kind) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Colore" error={fieldErrors.color}>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={HEX_RE.test(form.color) ? form.color : "#ffd60a"}
                      onChange={(e) => set("color", e.target.value)}
                      className="h-10 w-12 shrink-0 cursor-pointer rounded-xl border border-tg-border bg-transparent p-1"
                    />
                    <input
                      value={form.color}
                      onChange={(e) => set("color", e.target.value)}
                      maxLength={7}
                      aria-label="Codice colore"
                      className={cn(inputClass, "font-mono uppercase")}
                    />
                  </div>
                </Field>
                {kind === "paint" && (
                  <Field label="Finitura" error={fieldErrors.finish}>
                    <select
                      value={form.finish}
                      onChange={(e) => set("finish", e.target.value as PaintFinish)}
                      className={cn(inputClass, "cursor-pointer")}
                    >
                      {(Object.keys(FINISH_LABEL) as PaintFinish[]).map((f) => (
                        <option key={f} value={f}>
                          {FINISH_LABEL[f]}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              </div>
            )}

            {isPack(kind) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Monete date" error={fieldErrors.coins}>
                  <input
                    type="number"
                    min={0}
                    value={form.coins}
                    onChange={(e) => set("coins", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                {kind === "starter_pack" && (
                  <Field label="Revive dati" error={fieldErrors.revives}>
                    <input
                      type="number"
                      min={0}
                      value={form.revives}
                      onChange={(e) => set("revives", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                )}
              </div>
            )}

            {kind === "starter_pack" && (
              <fieldset>
                <legend className="mb-1 block text-xs font-semibold text-tg-muted">
                  Oggetti dati ({form.grants.length})
                </legend>
                <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-xl border border-tg-border p-1.5">
                  {grantable.map((g) => {
                    const checked = form.grants.includes(g.id);
                    return (
                      <label
                        key={g.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-tg-hover",
                          checked && "bg-tg-accent-soft"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              set(
                                "grants",
                                checked
                                  ? form.grants.filter((x) => x !== g.id)
                                  : [...form.grants, g.id]
                              )
                            }
                            className="h-4 w-4 cursor-pointer accent-[var(--tg-accent)]"
                          />
                          {g.name}
                        </span>
                        <span className="text-xs text-tg-muted">{KIND_LABEL[g.kind]}</span>
                      </label>
                    );
                  })}
                </div>
                {fieldErrors.grants && (
                  <span className="mt-1 block text-xs text-tg-danger">
                    {fieldErrors.grants.join(", ")}
                  </span>
                )}
              </fieldset>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {!isPack(kind) && (
                <Field label="Prezzo monete" error={fieldErrors.priceCoins} hint="Vuoto = non in vendita · 0 = gratis">
                  <input
                    type="number"
                    min={0}
                    value={form.priceCoins}
                    onChange={(e) => set("priceCoins", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              )}
              <Field
                label="Prezzo Stelle"
                error={fieldErrors.priceStars}
                hint={isPack(kind) ? undefined : "Vuoto = non in vendita"}
              >
                <input
                  type="number"
                  min={1}
                  value={form.priceStars}
                  onChange={(e) => set("priceStars", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Ordine" error={fieldErrors.sortOrder}>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => set("sortOrder", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Toggle
              checked={form.isActive}
              onChange={(v) => set("isActive", v)}
              label="Attivo nel gioco"
            />
          </div>
        )}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title={`Eliminare «${deleting?.name ?? ""}»?`}
        description="Non si può annullare."
        confirmLabel="Elimina"
        danger
        isPending={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
