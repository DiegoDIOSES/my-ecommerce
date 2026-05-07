"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../app/store/cart";

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
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

  if (value.includes("drive.google.com")) {
    const openMatch = value.match(/[?&]id=([^&]+)/);

    if (openMatch?.[1]) {
      return `https://lh3.googleusercontent.com/d/${openMatch[1]}`;
    }
  }

  return value;
}

function formatPEN(n: number) {
  return n.toFixed(2).replace(".", ",") + " S/.";
}

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const goCheckout = () => {
    onClose();
    setTimeout(() => router.push("/checkout"), 50);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] transition",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/30 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
        className={cn(
          "absolute right-0 top-0 h-full w-[92%] max-w-md bg-white shadow-xl",
          "transition-transform duration-300 will-change-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <div className="text-base font-semibold">Carrito</div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/[0.03]"
            type="button"
          >
            Cerrar
          </button>
        </div>

        <div className="h-[calc(100%-64px)] overflow-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white p-6 text-center">
              <div className="text-sm font-medium">Tu carrito está vacío</div>

              <div className="mt-1 text-sm text-black/60">
                Agrega productos para verlos aquí.
              </div>

              <button
                className="mt-4 w-full rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
                onClick={onClose}
                type="button"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((it) => {
                  const image = normalizeImageUrl(it.image);

                  return (
                    <div
                      key={it.id}
                      className="flex gap-4 rounded-2xl border border-black/10 p-3"
                    >
                      <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-black/10 bg-black/[0.02]">
                        {image ? (
                          <Image
                            src={image}
                            alt={it.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                            unoptimized
                          />
                        ) : null}
                      </div>

                      <div className="flex-1">
                        <div className="text-sm font-medium">{it.name}</div>

                        <div className="mt-1 text-sm text-black/70">
                          {formatPEN(it.price)}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center overflow-hidden rounded-xl border border-black/15">
                            <button
                              className="h-8 w-9 text-lg hover:bg-black/[0.03]"
                              onClick={() =>
                                setQty(it.id, Math.max(1, it.qty - 1))
                              }
                              type="button"
                            >
                              −
                            </button>

                            <div className="h-8 w-10 select-none text-center text-sm leading-8">
                              {it.qty}
                            </div>

                            <button
                              className="h-8 w-9 text-lg hover:bg-black/[0.03]"
                              onClick={() => setQty(it.id, it.qty + 1)}
                              type="button"
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="text-xs text-black/60 hover:text-black"
                            onClick={() => remove(it.id)}
                            type="button"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-black/10 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/60">Total</span>
                  <span className="font-semibold">{formatPEN(total)}</span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="w-full rounded-xl border border-black/15 bg-white px-4 py-2 text-center text-sm font-medium hover:bg-black/[0.03]"
                  >
                    Ver carrito
                  </Link>

                  <button
                    type="button"
                    onClick={goCheckout}
                    className="w-full rounded-xl bg-black px-4 py-2 text-center text-sm font-medium text-white hover:bg-black/90"
                  >
                    Finalizar compra
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}