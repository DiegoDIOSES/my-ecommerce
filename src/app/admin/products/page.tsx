"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductTag, useProductsAdmin } from "../../store/products.store";

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function formatEUR(n: number) {
  return n.toFixed(2).replace(".", ",") + " S/.";
}

const TAGS: Array<{ key: ProductTag; label: string }> = [
  { key: "más vendido", label: "Más vendido" },
  { key: "oferta", label: "Oferta" },
  { key: "nuevo", label: "Nuevo" },
];

function normalizeImageUrl(url?: string) {
  if (!url) return "";
  const value = url.trim();
  if (!value) return "";
  // GOOGLE DRIVE /file/d/
  const fileMatch = value.match(/\/file\/d\/([^/]+)/);
  if (fileMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }
  // GOOGLE DRIVE ?id=
  if (value.includes("drive.google.com")) {
    const openMatch = value.match(/[?&]id=([^&]+)/);
    if (openMatch?.[1]) {
      return `https://lh3.googleusercontent.com/d/${openMatch[1]}`;
    }
  }
  // GOOGLE HOSTED
  if (value.includes("lh3.googleusercontent.com")) {
    return value;
  }
  return value;
}

export default function AdminProductsPage() {
  const seedIfEmpty = useProductsAdmin((s) => s.seedIfEmpty);
  const products = useProductsAdmin((s) => s.products);

  const create = useProductsAdmin((s) => s.create);
  const update = useProductsAdmin((s) => s.update);
  const remove = useProductsAdmin((s) => s.remove);
  const toggleActive = useProductsAdmin((s) => s.toggleActive);

  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    void seedIfEmpty();
  }, [seedIfEmpty]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return products
      .filter((p) => (onlyActive ? p.active : true))
      .filter((p) => {
        if (!qq) return true;
        return (
          p.id.toLowerCase().includes(qq) ||
          p.name.toLowerCase().includes(qq) ||
          (p.category ?? "").toLowerCase().includes(qq)
        );
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [products, q, onlyActive]);

  const kpis = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.active).length;
    const outOfStock = products.filter((p) => p.active && p.stock <= 0).length;
    return { total, active, outOfStock };
  }, [products]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-black/60">Crea, edita, stock, tags, activar/desactivar y eliminar.</p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/[0.03]">
            Volver al panel
          </Link>
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
            type="button"
          >
            + Nuevo producto
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Kpi title="Total" value={kpis.total} />
        <Kpi title="Activos" value={kpis.active} />
        <Kpi title="Sin stock" value={kpis.outOfStock} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
        {/* List */}
        <div className="rounded-3xl border border-black/10 bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-black/10 p-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por ID, nombre o categoría…"
              className="h-10 flex-1 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20"
            />

            <button
              onClick={() => setOnlyActive((v) => !v)}
              className={cn(
                "h-10 rounded-xl border px-3 text-sm hover:bg-black/[0.03]",
                onlyActive ? "border-black bg-black text-white hover:bg-black/90" : "border-black/10"
              )}
              type="button"
            >
              {onlyActive ? "Solo activos" : "Todos"}
            </button>
          </div>

          <div className="divide-y divide-black/10">
            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-black/60">No hay productos.</div>
            ) : (
              filtered.map((p) => {
                const active = selected?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={cn("w-full text-left p-4 hover:bg-black/[0.02] transition", active && "bg-black/[0.03]")}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-black/10 bg-black/[0.02]">
                        {normalizeImageUrl(p.image) ? (
                          <Image
                            src={normalizeImageUrl(p.image)}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">{p.name}</span>
                          {!p.active ? <span className="rounded-full border border-black/10 bg-black/[0.03] px-2 py-0.5 text-xs text-black/60">Inactivo</span> : null}
                          {p.stock <= 0 ? <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700">Sin stock</span> : null}
                        </div>
                        <div className="mt-1 text-xs text-black/50">
                          {p.id} • {p.category ?? "—"} • {p.stock} stock
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatEUR(p.price)}</div>
                        <div className="mt-1 text-xs text-black/40">upd {new Date(p.updatedAt).toLocaleDateString("es-PE")}</div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="rounded-3xl border border-black/10 bg-white">
          {!selected ? (
            <div className="p-6">
              <div className="text-sm font-medium">Selecciona un producto</div>
              <div className="mt-1 text-sm text-black/60">Verás edición rápida y acciones.</div>
            </div>
          ) : (
            <ProductEditor
              key={selected.id}
              product={selected}
              onClose={() => setSelected(null)}
              onSave={async (patch) => {
                await update(selected.id, patch);
              }}
              onToggleActive={async () => {
                await toggleActive(selected.id);
              }}
              onDelete={async () => {
                if (confirm(`¿Eliminar "${selected.name}"?`)) {
                  await remove(selected.id);
                  setSelected(null);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Create modal */}
      {createOpen ? (
        <CreateProductModal
          onClose={() => setCreateOpen(false)}
          onCreate={async (p) => {
            await create(p);
            setCreateOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="text-sm text-black/60">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-xs text-black/40">Admin demo</div>
    </div>
  );
}

function ProductEditor({
  product,
  onClose,
  onSave,
  onToggleActive,
  onDelete,
}: {
  product: Product;
  onClose: () => void;
  onSave: (patch: Partial<Omit<Product, "id" | "createdAt">>) => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(() => product.name);
  const [price, setPrice] = useState(() => String(product.price));
  const [image, setImage] = useState(() => product.image ?? "");
  const [category, setCategory] = useState(() => product.category ?? "");
  const [stock, setStock] = useState(() => String(product.stock));
  const [tags, setTags] = useState<ProductTag[]>(() => product.tags ?? []);

  const dirty =
    name !== product.name ||
    Number(price) !== product.price ||
    image !== (product.image ?? "") ||
    category !== (product.category ?? "") ||
    Number(stock) !== product.stock ||
    JSON.stringify(tags) !== JSON.stringify(product.tags ?? []);

  const save = () => {
    const p = Number(price);
    const s = Number(stock);

    if (!name.trim()) return alert("Nombre requerido");
    if (Number.isNaN(p) || p < 0) return alert("Precio inválido");
    if (Number.isNaN(s) || s < 0) return alert("Stock inválido");

    onSave({
      name: name.trim(),
      price: p,
      image: normalizeImageUrl(image) || undefined,
      category: category.trim() || undefined,
      stock: s,
      tags,
    });
  };

  const toggleTag = (t: ProductTag) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-black/60">Producto</div>
          <div className="text-xl font-semibold">{product.id}</div>
          <div className="mt-1 text-xs text-black/50">Creado: {new Date(product.createdAt).toLocaleString("es-PE")}</div>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/[0.03]"
          type="button"
        >
          Cerrar
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={onToggleActive}
          className={cn(
            "rounded-xl border px-3 py-2 text-sm hover:bg-black/[0.03]",
            product.active ? "border-black bg-black text-white hover:bg-black/90" : "border-black/10"
          )}
          type="button"
        >
          {product.active ? "Activo" : "Inactivo"}
        </button>

        <button
          onClick={onDelete}
          className="rounded-xl border border-black/10 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          type="button"
        >
          Eliminar
        </button>

        {dirty ? <span className="text-xs text-black/50">Cambios sin guardar</span> : null}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <Field label="Nombre">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black/20"
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Precio (S/.)">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black/20"
            />
          </Field>

          <Field label="Stock">
            <input
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              inputMode="numeric"
              className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black/20"
            />
          </Field>
        </div>

        <Field label="Categoría">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black/20"
          />
        </Field>

        <Field label="Imagen (URL de Google Drive o imagen pública)">
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
            className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black/20"
          />
          <div className="mt-2 flex items-center gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02]">
              {normalizeImageUrl(image) ? (
                <Image
                  src={normalizeImageUrl(image)}
                  alt="preview"
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              ) : null}
            </div>
          </div>
        </Field>

        <Field label="Tags">
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => {
              const on = tags.includes(t.key);
              return (
                <button
                  key={t.key}
                  onClick={() => toggleTag(t.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm hover:bg-black/[0.03]",
                    on ? "border-black bg-black text-white hover:bg-black/90" : "border-black/10"
                  )}
                  type="button"
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </Field>

        <button
          onClick={save}
          className="mt-2 w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90"
          type="button"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium">{label}</div>
      {children}
    </div>
  );
}

function CreateProductModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
    stock: number;
    active: boolean;
    tags: ProductTag[];
  }) => void;
}) {
  const [id, setId] = useState(() => "p" + Math.floor(Math.random() * 9000 + 1000));
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [active, setActive] = useState(true);
  const [tags, setTags] = useState<ProductTag[]>([]);

  const toggleTag = (t: ProductTag) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const submit = () => {
    const p = Number(price);
    const s = Number(stock);

    if (!id.trim()) return alert("ID requerido");
    if (!name.trim()) return alert("Nombre requerido");
    if (Number.isNaN(p) || p < 0) return alert("Precio inválido");
    if (Number.isNaN(s) || s < 0) return alert("Stock inválido");

    onCreate({
      id: id.trim(),
      name: name.trim(),
      price: p,
      stock: s,
      category: category.trim() || undefined,
      image: normalizeImageUrl(image) || undefined,
      active,
      tags,
    });
  };

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-black/10 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">Nuevo producto</div>
            <div className="mt-1 text-sm text-black/60">Crea el producto y luego lo editas.</div>
          </div>
          <button onClick={onClose} className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/[0.03]" type="button">
            Cerrar
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <Field label="ID">
            <input value={id} onChange={(e) => setId(e.target.value)} className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black/20" />
          </Field>

          <Field label="Nombre">
            <input value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black/20" />
          </Field>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Precio (S/.)">
              <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black/20" />
            </Field>
            <Field label="Stock">
              <input value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black/20" />
            </Field>
          </div>

          <Field label="Categoría">
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black/20" />
          </Field>

          <Field label="Imagen (URL de Google Drive o imagen pública)">
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing" className="h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black/20" />
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02]">
                {normalizeImageUrl(image) ? (
                  <Image
                    src={normalizeImageUrl(image)}
                    alt="preview"
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="text-xs text-black/50">
                Pega un enlace público de imagen. Si es de Google Drive, se convertirá automáticamente.
              </div>
            </div>
          </Field>

          <Field label="Estado">
            <button
              onClick={() => setActive((v) => !v)}
              className={cn("h-11 w-full rounded-2xl border px-3 text-sm hover:bg-black/[0.03]", active ? "border-black bg-black text-white hover:bg-black/90" : "border-black/10")}
              type="button"
            >
              {active ? "Activo" : "Inactivo"}
            </button>
          </Field>

          <Field label="Tags">
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => {
                const on = tags.includes(t.key);
                return (
                  <button
                    key={t.key}
                    onClick={() => toggleTag(t.key)}
                    className={cn("rounded-full border px-3 py-1.5 text-sm hover:bg-black/[0.03]", on ? "border-black bg-black text-white hover:bg-black/90" : "border-black/10")}
                    type="button"
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <button onClick={submit} className="mt-2 w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90" type="button">
            Crear producto
          </button>
        </div>
      </div>
    </div>
  );
}