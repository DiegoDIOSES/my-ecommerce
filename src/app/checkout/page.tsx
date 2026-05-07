"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StoreHeader from "../../components/layout/StoreHeader";
import { useCart } from "../store/cart";
import { useAuth } from "../store/auth";
import { createOrder } from "../../lib/orders";
import type { Order } from "../../types/order";

function formatEUR(n: number) {
  return n.toFixed(2).replace(".", ",") + " S/.";
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

type FormState = {
  fullName: string;
  phone: string;
  address: string;
  reference: string;
};

const WHATSAPP_NUMBER = "51934914871";

function generateOrderNumber() {
  return `ORD-${Date.now()}`;
}

export default function CheckoutPage() {
  const router = useRouter();

  const authUser = useAuth((s) => s.user);

  const items = useCart((s) => s.items);
  const subtotalFn = useCart((s) => s.subtotal);
  const clear = useCart((s) => s.clear);

  const subtotal = useMemo(() => subtotalFn(), [subtotalFn, items]);

  const shipping = 0;
  const total = subtotal + shipping;

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    address: "",
    reference: "",
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || authUser?.name || "",
      phone: prev.phone || authUser?.phone || "",
    }));
  }, [authUser]);

  const isCartEmpty = items.length === 0;

  const canSubmit =
    !isCartEmpty &&
    form.fullName.trim() !== "" &&
    form.phone.trim() !== "" &&
    form.address.trim() !== "";

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async () => {
    if (isCartEmpty) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (!form.fullName.trim()) {
      alert("Ingresa tu nombre completo.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Ingresa tu celular.");
      return;
    }

    if (!form.address.trim()) {
      alert("Ingresa tu dirección.");
      return;
    }

    try {
      setSubmitting(true);

      const orderNumber = generateOrderNumber();

      const userId =
        authUser?.phone?.trim() ||
        authUser?.email?.trim() ||
        form.phone.trim();

      const order: Order = {
        id: orderNumber,
        orderNumber,

        userId,

        customerName: form.fullName.trim(),
        customerPhone: form.phone.trim(),
        customerAddress: form.address.trim(),
        customerReference: form.reference.trim() || undefined,

        items: items.map((it) => ({
          productId: it.id,
          name: it.name,
          qty: it.qty,
          price: it.price,
          image: it.image ?? "",
        })),

        total,

        status: "PENDIENTE_PAGO",

        createdAt: Date.now(),
      };

      // GUARDAR PEDIDO
      await createOrder(order);

      // MENSAJE WHATSAPP
      const waMessage = [
        "Hola, quiero confirmar este pedido y coordinar el pago.",
        "",
        `Pedido: ${order.orderNumber}`,
        `Cliente: ${order.customerName}`,
        `Celular: ${order.customerPhone}`,
        `Dirección: ${order.customerAddress}`,
        order.customerReference
          ? `Referencia: ${order.customerReference}`
          : "",
        "",
        "Detalle del pedido:",
        ...order.items.map(
          (item) =>
            `- ${item.name} | Cantidad: ${item.qty} | ${formatEUR(
              item.price * item.qty
            )}`
        ),
        "",
        `Total: ${formatEUR(order.total)}`,
        "",
        "Por favor, indíquenme los medios de pago disponibles.",
      ]
        .filter(Boolean)
        .join("\n");

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        waMessage
      )}`;

      // LIMPIAR CARRITO
      clear();

      // ABRIR WHATSAPP
      window.location.href = waUrl;
    } catch (error) {
      console.error("Error al crear pedido:", error);

      alert("No se pudo registrar el pedido. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Checkout
            </h1>

            <p className="mt-1 text-sm text-black/60">
              Completa tus datos y continúa la coordinación del pago por
              WhatsApp.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/store"
              className="rounded-xl border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/[0.03]"
            >
              Seguir comprando
            </Link>

            <Link
              href="/cart"
              className="rounded-xl border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/[0.03]"
            >
              Volver al carrito
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            {/* DATOS CLIENTE */}
            <div className="rounded-2xl border border-black/10 p-5">
              <div className="text-sm font-semibold">
                Datos del cliente
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-black/60">
                    Nombre completo
                  </label>

                  <input
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                    placeholder="Tu nombre"
                    className="h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-black/60">
                    Celular
                  </label>

                  <input
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="999 999 999"
                    className="h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-black/60">
                    Dirección
                  </label>

                  <input
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="Av. / Calle / Nro / Distrito"
                    className="h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-black/60">
                    Referencia
                  </label>

                  <textarea
                    value={form.reference}
                    onChange={handleChange("reference")}
                    placeholder="Referencia adicional para la entrega"
                    rows={3}
                    className="w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm outline-none focus:border-black/30"
                  />
                </div>
              </div>
            </div>

            {/* COORDINACION */}
            <div className="rounded-2xl border border-black/10 p-5">
              <div className="text-sm font-semibold">
                Coordinación de pago
              </div>

              <div className="mt-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/70">
                Cuando confirmes el pedido, se abrirá WhatsApp con el
                equipo de atención. Allí te compartirán los medios de
                pago para completar la compra.
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-black/15 p-4 text-sm text-black/70">
                <span className="font-medium text-black">
                  Importante:
                </span>{" "}
                tu pedido se registrará con estado{" "}
                <span className="font-medium">
                  PENDIENTE_PAGO
                </span>
                .
              </div>

              <button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
                className={[
                  "mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition",
                  canSubmit && !submitting
                    ? "bg-black hover:bg-black/90"
                    : "cursor-not-allowed bg-black/20",
                ].join(" ")}
              >
                {submitting
                  ? "Registrando pedido..."
                  : "Confirmar pedido por WhatsApp"}
              </button>

              <button
                type="button"
                className="mt-2 w-full rounded-2xl border border-black/15 px-4 py-3 text-sm font-medium hover:bg-black/[0.03]"
                onClick={() => clear()}
                disabled={isCartEmpty || submitting}
              >
                Vaciar carrito
              </button>
            </div>
          </section>

          {/* RESUMEN */}
          <aside className="h-fit rounded-2xl border border-black/10 p-5">
            <div className="text-sm font-semibold">Resumen</div>

            <div className="mt-4 space-y-3">
              {items.map((it) => {
                const image = normalizeImageUrl(it.image);

                return (
                  <div
                    key={it.id}
                    className="flex items-center gap-3"
                  >
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-black/10 bg-black/[0.02]">
                      {image ? (
                        <Image
                          src={image}
                          alt={it.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {it.name}
                      </div>

                      <div className="text-xs text-black/60">
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

            <div className="mt-5 space-y-2 border-t border-black/10 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-black/60">Subtotal</span>
                <span className="font-medium">
                  {formatEUR(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-black/60">Envío</span>

                <span className="font-medium">Gratis</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold">Total</span>

                <span className="text-base font-semibold">
                  {formatEUR(total)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}