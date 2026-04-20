"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import StoreHeader from "../../components/layout/StoreHeader";
import { useCart, CartItem } from "../store/cart";

function formatEUR(n: number) {
  return n.toFixed(2).replace(".", ",") + "€";
}

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

export default function CartPage() {
  const router = useRouter();

  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotalFn = useCart((s) => s.subtotal);

  const subtotal = useMemo(() => subtotalFn(), [subtotalFn, items]);
  const shipping = 0;
  const total = subtotal + shipping;

  const goCheckout = (anchor?: string) => {
    router.push(anchor ? `/checkout#${anchor}` : "/checkout");
  };

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Tu carrito</h1>
            <p className="mt-1 text-sm text-black/60">{items.length} productos</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/[0.03]"
            >
              Continuar comprando
            </Link>
            <button
              onClick={clear}
              className="rounded-xl border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/[0.03]"
              type="button"
            >
              Vaciar carrito
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <section className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-black/10 p-6 text-center">
                <div className="text-sm font-semibold">Tu carrito está vacío</div>
                <div className="mt-1 text-sm text-black/60">
                  Agrega productos para verlos aquí.
                </div>
                <Link
                  href="/"
                  className="mt-4 inline-flex w-full justify-center rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90 sm:w-auto"
                >
                  Ir a la tienda
                </Link>
              </div>
            ) : (
              items.map((it: CartItem) => (
                <div
                  key={it.id}
                  className="flex gap-4 rounded-2xl border border-black/10 p-4"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02]">
                    {it.image ? (
                      <Image
                        src={it.image}
                        alt={it.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{it.name}</div>
                        <div className="mt-1 text-sm text-black/60">{formatEUR(it.price)}</div>
                      </div>

                      <button
                        className="text-xs text-black/60 hover:text-black"
                        onClick={() => remove(it.id)}
                        type="button"
                      >
                        Quitar
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center overflow-hidden rounded-xl border border-black/15">
                        <button
                          className="h-9 w-10 text-lg hover:bg-black/[0.03]"
                          onClick={() => setQty(it.id, Math.max(1, it.qty - 1))}
                          type="button"
                          aria-label="Disminuir"
                        >
                          −
                        </button>
                        <div className="h-9 w-10 select-none text-center text-sm leading-9">
                          {it.qty}
                        </div>
                        <button
                          className="h-9 w-10 text-lg hover:bg-black/[0.03]"
                          onClick={() => setQty(it.id, it.qty + 1)}
                          type="button"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-sm font-semibold">
                        {formatEUR(it.price * it.qty)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border border-black/10 p-5">
            <div className="text-sm font-semibold">Resumen</div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-black/60">Subtotal</span>
                <span className="font-medium">{formatEUR(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black/60">Envío estimado</span>
                <span className="font-medium">{shipping === 0 ? "Gratis" : formatEUR(shipping)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-base font-semibold">{formatEUR(total)}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => goCheckout("pago")}
                className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-sm font-medium hover:bg-black/[0.03]"
                disabled={items.length === 0}
              >
                Ver métodos de pago
              </button>

              <button
                type="button"
                onClick={() => goCheckout()}
                className={cn(
                  "w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90",
                  items.length === 0 && "opacity-50 cursor-not-allowed"
                )}
                disabled={items.length === 0}
              >
                Finalizar compra
              </button>
            </div>

            <p className="mt-3 text-xs text-black/50">
              Impuestos y costos de envío se calculan en el checkout.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}