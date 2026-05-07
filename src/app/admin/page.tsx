"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useProductsAdmin } from "../store/products.store";
import { useOrders } from "../store/orders";

export default function AdminPage() {
  const products = useProductsAdmin((s) => s.products);
  const seedProducts = useProductsAdmin((s) => s.seedIfEmpty);

  const orders = useOrders((s) => s.orders);
  const loadOrders = useOrders((s) => s.loadAll);

  useEffect(() => {
    void seedProducts();
    void loadOrders();
  }, [seedProducts, loadOrders]);

  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.active).length;
    const outOfStock = products.filter((p) => p.active && p.stock <= 0).length;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) => o.status === "PENDIENTE_PAGO" || o.status === "VALIDANDO"
    ).length;

    return {
      totalProducts,
      activeProducts,
      outOfStock,
      totalOrders,
      pendingOrders,
    };
  }, [products, orders]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Panel Admin</h1>
          <p className="text-sm text-black/60">Resumen y accesos rápidos</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/orders"
            className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/[0.03]"
          >
            Ver pedidos
          </Link>

          <Link
            href="/admin/products"
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
          >
            Gestionar productos
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card
          title="Pedidos"
          value={metrics.totalOrders}
          subtitle={`Pendientes: ${metrics.pendingOrders}`}
        />
        <Card
          title="Productos"
          value={metrics.totalProducts}
          subtitle={`Activos: ${metrics.activeProducts}`}
        />
        <Card
          title="Stock"
          value={metrics.outOfStock}
          subtitle="Sin stock (activos)"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <QuickCard
          title="Gestionar pedidos"
          desc="Revisa pedidos reales, valida pagos y cambia estados."
          href="/admin/orders"
          cta="Abrir pedidos"
        />
        <QuickCard
          title="Gestionar productos"
          desc="Crea, edita, activa/desactiva y maneja stock."
          href="/admin/products"
          cta="Abrir productos"
        />
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="text-sm text-black/60">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-sm text-black/60">{subtitle}</div>
    </div>
  );
}

function QuickCard({
  title,
  desc,
  href,
  cta,
}: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-black/10 bg-white p-6 hover:bg-black/[0.03]"
    >
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-black/60">{desc}</div>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
        {cta}
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}