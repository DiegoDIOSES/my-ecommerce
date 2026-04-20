"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useOrders } from "../../store/orders";
import type { Order, OrderStatus } from "../../../types/order";

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function formatEUR(n: number) {
  return n.toFixed(2).replace(".", ",") + "€";
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("es-PE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeImageUrl(url?: string) {
  if (!url) return "";

  const value = url.trim();
  if (!value) return "";

  const fileMatch = value.match(/\/file\/d\/([^/]+)/);
  if (fileMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }

  if (value.includes("lh3.googleusercontent.com")) {
    return value;
  }

  return value;
}

const STATUS: Array<{ key: OrderStatus; label: string }> = [
  { key: "VALIDANDO", label: "Validando" },
  { key: "PREPARANDO", label: "Preparando" },
  { key: "ENVIADO", label: "Enviado" },
  { key: "ENTREGADO", label: "Entregado" },
  { key: "CANCELADO", label: "Cancelado" },
  { key: "PAGO_RECHAZADO", label: "Pago rechazado" },
];

function statusPill(status: OrderStatus) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border";

  switch (status) {
    case "VALIDANDO":
      return cn(base, "border-amber-200 bg-amber-50 text-amber-700");
    case "PREPARANDO":
      return cn(base, "border-blue-200 bg-blue-50 text-blue-700");
    case "ENVIADO":
      return cn(base, "border-indigo-200 bg-indigo-50 text-indigo-700");
    case "ENTREGADO":
      return cn(base, "border-emerald-200 bg-emerald-50 text-emerald-700");
    case "CANCELADO":
      return cn(base, "border-black/15 bg-black/[0.03] text-black/70");
    case "PAGO_RECHAZADO":
      return cn(base, "border-red-200 bg-red-50 text-red-700");
    default:
      return cn(base, "border-black/10 bg-black/[0.03] text-black/80");
  }
}

function statusLabel(status: OrderStatus) {
  return STATUS.find((s) => s.key === status)?.label ?? status;
}

function paymentLabel(method?: string) {
  if (method === "yape") return "Yape";
  if (method === "transferencia") return "Transferencia bancaria";
  return "Otro";
}

function orderTotal(order: Order) {
  return order.total ?? order.items.reduce((acc, it) => acc + it.price * it.qty, 0);
}

export default function AdminOrdersPage() {
  const orders = useOrders((s) => s.orders);
  const loadAll = useOrders((s) => s.loadAll);
  const setStatus = useOrders((s) => s.setStatus);
  const remove = useOrders((s) => s.remove);

  const [q, setQ] = useState("");
  const [status, setStatusFilter] = useState<OrderStatus | "todos">("todos");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return orders
      .filter((o) => (status === "todos" ? true : o.status === status))
      .filter((o) => {
        if (!qq) return true;

        const searchable = [
          o.id ?? "",
          o.orderNumber ?? "",
          o.userId ?? "",
          o.customerName ?? "",
          o.customerPhone ?? "",
          o.customerAddress ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(qq);
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, q, status]);

  const selected = useMemo(() => {
    if (!selectedKey) return null;
    return filtered.find((o) => `${o.userId}__${o.id ?? o.orderNumber}` === selectedKey) ?? null;
  }, [filtered, selectedKey]);

  const kpis = useMemo(() => {
    const total = orders.length;
    const validating = orders.filter((o) => o.status === "VALIDANDO").length;
    const preparing = orders.filter((o) => o.status === "PREPARANDO").length;
    const revenue = orders
      .filter((o) => o.status !== "CANCELADO" && o.status !== "PAGO_RECHAZADO")
      .reduce((acc, o) => acc + orderTotal(o), 0);

    return { total, validating, preparing, revenue };
  }, [orders]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Pedidos</h1>
          <p className="text-sm text-black/60">Gestiona pedidos reales, estados y validación de pago.</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin"
            className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/[0.03]"
          >
            Volver al panel
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
        <Kpi title="Total" value={kpis.total} />
        <Kpi title="Validando" value={kpis.validating} />
        <Kpi title="Preparando" value={kpis.preparing} />
        <Kpi title="Ventas" value={formatEUR(kpis.revenue)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl border border-black/10 bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-black/10 p-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por pedido, cliente, teléfono o dirección…"
              className="h-10 flex-1 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20"
            />

            <select
              value={status}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "todos")}
              className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
            >
              <option value="todos">Todos</option>
              {STATUS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="divide-y divide-black/10">
            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-black/60">No hay pedidos que coincidan.</div>
            ) : (
              filtered.map((o) => {
                const itemKey = `${o.userId}__${o.id ?? o.orderNumber}`;
                const active = itemKey === selectedKey;

                return (
                  <button
                    key={itemKey}
                    className={cn(
                      "w-full p-4 text-left transition hover:bg-black/[0.02]",
                      active && "bg-black/[0.03]"
                    )}
                    onClick={() => setSelectedKey(itemKey)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{o.orderNumber || o.id}</span>
                          <span className={statusPill(o.status)}>{statusLabel(o.status)}</span>
                        </div>

                        <div className="mt-1 truncate text-sm text-black/60">
                          {o.customerName} • {o.customerPhone}
                        </div>

                        <div className="mt-1 text-xs text-black/50">{formatDate(o.createdAt)}</div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-sm font-semibold">{formatEUR(orderTotal(o))}</div>
                        <div className="mt-1 text-xs text-black/50">
                          {paymentLabel(o.payment?.method)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white">
          {!selected ? (
            <div className="p-6">
              <div className="text-sm font-medium">Selecciona un pedido</div>
              <div className="mt-1 text-sm text-black/60">
                Verás detalle, cliente, items y cambio de estado.
              </div>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-black/60">Pedido</div>
                  <div className="text-xl font-semibold">{selected.orderNumber || selected.id}</div>
                  <div className="mt-1 text-xs text-black/50">{formatDate(selected.createdAt)}</div>
                </div>

                <button
                  onClick={async () => {
                    if (!selected.userId || !selected.id) return;

                    if (confirm("¿Eliminar este pedido?")) {
                      await remove(selected.userId, selected.id);
                      setSelectedKey(null);
                    }
                  }}
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  type="button"
                >
                  Eliminar
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-black/10 p-4">
                <div className="text-sm font-medium">Cliente</div>

                <div className="mt-2 space-y-1 text-sm text-black/70">
                  <div>{selected.customerName || "—"}</div>
                  <div className="text-black/60">{selected.customerPhone || "—"}</div>
                  <div className="text-black/60">{selected.customerAddress || "—"}</div>
                  {selected.customerReference ? (
                    <div className="text-black/60">Ref: {selected.customerReference}</div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-black/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Estado</div>
                  <span className={statusPill(selected.status)}>{statusLabel(selected.status)}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {STATUS.map((s) => (
                    <button
                      key={s.key}
                      onClick={async () => {
                        if (!selected.userId || !selected.id) return;
                        await setStatus(selected.userId, selected.id, s.key);
                      }}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-sm hover:bg-black/[0.03]",
                        selected.status === s.key
                          ? "border-black bg-black text-white hover:bg-black/90"
                          : "border-black/10"
                      )}
                      type="button"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-1 text-xs text-black/50">
                  <div>
                    Pago:{" "}
                    <span className="font-medium text-black/70">
                      {paymentLabel(selected.payment?.method)}
                    </span>
                  </div>

                  {selected.payment?.submittedAt ? (
                    <div>
                      Enviado:{" "}
                      <span className="font-medium text-black/70">
                        {formatDate(selected.payment.submittedAt)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-black/10 p-4">
                <div className="text-sm font-medium">Items</div>

                <div className="mt-3 space-y-3">
                  {selected.items.map((it) => {
                    const image = normalizeImageUrl(it.image);

                    return (
                      <div key={it.productId} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-black/10 bg-black/[0.02]">
                          {image ? (
                            <Image
                              src={image}
                              alt={it.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                              unoptimized
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{it.name}</div>
                          <div className="text-xs text-black/60">
                            {it.qty} × {formatEUR(it.price)}
                          </div>
                        </div>

                        <div className="text-sm font-semibold">{formatEUR(it.qty * it.price)}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-sm">
                  <span className="text-black/60">Total</span>
                  <span className="font-semibold">{formatEUR(orderTotal(selected))}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="text-sm text-black/60">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-xs text-black/40">Pedidos reales</div>
    </div>
  );
}