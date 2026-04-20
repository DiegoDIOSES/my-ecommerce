"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import StoreHeader from "../../components/layout/StoreHeader";
import { useAuth } from "../store/auth";
import { useOrders } from "../store/orders";

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function formatEUR(n: number) {
  return n.toFixed(2).replace(".", ",") + "€";
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

function statusLabel(s: string) {
  switch (s) {
    case "VALIDANDO":
      return "Validando";
    case "PREPARANDO":
      return "Preparando";
    case "ENVIADO":
      return "Enviado";
    case "ENTREGADO":
      return "Entregado";
    case "CANCELADO":
      return "Cancelado";
    case "PAGO_RECHAZADO":
      return "Pago rechazado";
    default:
      return s;
  }
}

function statusPill(s: string) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border";

  if (s === "VALIDANDO") {
    return cn(base, "border-amber-200 bg-amber-50 text-amber-700");
  }

  if (s === "PREPARANDO") {
    return cn(base, "border-blue-200 bg-blue-50 text-blue-700");
  }

  if (s === "ENVIADO") {
    return cn(base, "border-indigo-200 bg-indigo-50 text-indigo-700");
  }

  if (s === "ENTREGADO") {
    return cn(base, "border-emerald-200 bg-emerald-50 text-emerald-700");
  }

  if (s === "PAGO_RECHAZADO") {
    return cn(base, "border-red-200 bg-red-50 text-red-700");
  }

  if (s === "CANCELADO") {
    return cn(base, "border-black/15 bg-black/[0.03] text-black/70");
  }

  return cn(base, "border-black/15 bg-black/[0.03] text-black/70");
}

interface AuthState {
  user: {
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
  } | null;
  logout: () => void;
  role?: string;
}

export default function ProfilePage() {
  const user = useAuth((s: AuthState) => s.user);
  const logout = useAuth((s: AuthState) => s.logout);
  const role = useAuth((s: AuthState) => s.role ?? s.user?.role);

  const orders = useOrders((s) => s.orders);
  const loadByUser = useOrders((s) => s.loadByUser);
  const clearOrders = useOrders((s) => s.clear);

  const isLogged = !!user;

  const userId = user?.phone?.trim() || user?.email?.trim() || "";

  useEffect(() => {
    if (!isLogged || !userId) {
      clearOrders();
      return;
    }

    void loadByUser(userId);
  }, [isLogged, userId, loadByUser, clearOrders]);

  const totalOrders = orders.length;

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === "VALIDANDO").length;
  }, [orders]);

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-white">
        <StoreHeader />

        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-3xl border border-black/10 p-8">
            <div className="text-xl font-semibold">Tu perfil</div>
            <div className="mt-2 text-sm text-black/60">
              Inicia sesión para ver tus datos y pedidos.
            </div>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/90"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight">Perfil</div>
            <div className="mt-1 text-sm text-black/60">
              {user?.name ?? "Usuario"} • {user?.email ?? user?.phone ?? "—"}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {role === "admin" ? (
              <Link
                href="/admin"
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm hover:bg-black/[0.03]"
              >
                Panel admin
              </Link>
            ) : null}

            <button
              onClick={logout}
              className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
              type="button"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 p-5">
            <div className="text-sm text-black/60">Pedidos</div>
            <div className="mt-2 text-2xl font-semibold">{totalOrders}</div>
          </div>

          <div className="rounded-3xl border border-black/10 p-5">
            <div className="text-sm text-black/60">Pendientes</div>
            <div className="mt-2 text-2xl font-semibold">{pendingCount}</div>
          </div>

          <div className="rounded-3xl border border-black/10 p-5">
            <div className="text-sm text-black/60">Métodos de pago</div>
            <div className="mt-2 text-sm font-medium">Yape • Transferencia</div>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Mis pedidos</div>
              <div className="mt-1 text-sm text-black/60">
                Historial de compras y estado actual.
              </div>
            </div>

            <Link
              href="/cart"
              className="rounded-2xl border border-black/10 px-4 py-2 text-sm hover:bg-black/[0.03]"
            >
              Ir al carrito
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-black/10 p-8 text-center">
              <div className="text-sm font-medium">Aún no tienes pedidos</div>
              <div className="mt-1 text-sm text-black/60">
                Cuando finalices una compra, aparecerá aquí.
              </div>

              <Link
                href="/store"
                className="mt-5 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/90"
              >
                Explorar productos
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id ?? o.orderNumber}
                  className="rounded-3xl border border-black/10 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold">
                          {o.orderNumber || o.id}
                        </div>

                        <span className={statusPill(o.status)}>
                          {statusLabel(o.status)}
                        </span>

                        <span className="text-xs text-black/50">
                          {new Date(o.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-1 text-sm text-black/60">
                        Pago:{" "}
                        <span className="font-medium text-black/80">
                          {o.payment?.method === "yape"
                            ? "Yape"
                            : o.payment?.method === "transferencia"
                            ? "Transferencia bancaria"
                            : "Otro"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-black/60">Total</div>
                      <div className="text-lg font-semibold">
                        {formatEUR(o.total)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {o.items.slice(0, 4).map((it) => {
                      const image = normalizeImageUrl(it.image);

                      return (
                        <div
                          key={`${o.id ?? o.orderNumber}-${it.productId}`}
                          className="flex gap-3 rounded-2xl border border-black/10 p-3"
                        >
                          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-black/10 bg-black/[0.02]">
                            {image ? (
                              <Image
                                src={image}
                                alt={it.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                                unoptimized
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">
                              {it.name}
                            </div>
                            <div className="mt-1 text-xs text-black/60">
                              {it.qty} × {formatEUR(it.price)}
                            </div>
                          </div>

                          <div className="text-sm font-semibold">
                            {formatEUR(it.price * it.qty)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {o.items.length > 4 ? (
                    <div className="mt-3 text-sm text-black/60">
                      + {o.items.length - 4} producto(s) más.
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}