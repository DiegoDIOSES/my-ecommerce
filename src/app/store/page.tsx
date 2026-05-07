"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import StoreHeader from "../../components/layout/StoreHeader";
import { useCart } from "./cart";
import { useProductsAdmin } from "../store/products.store";

type Sort = "relevance" | "price_asc" | "price_desc";

type StoreCategory = {
  id: string;
  name: string;
};

type StoreTag = "all" | "Más vendido" | "Oferta";

function Pill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1 text-sm transition",
        active ? "bg-black text-white" : "bg-black/5 text-black hover:bg-black/10",
      ].join(" ")}
      type="button"
    >
      {children}
    </button>
  );
}

function normalizeText(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function normalizeImageUrl(url?: string) {
  if (!url) return "";

  const value = url.trim();
  if (!value) return "";

  if (value.includes("drive.google.com")) {
    const fileMatch = value.match(/\/file\/d\/([^/]+)/);
    if (fileMatch?.[1]) {
      return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
    }

    const openMatch = value.match(/[?&]id=([^&]+)/);
    if (openMatch?.[1]) {
      return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
    }
  }

  return value;
}

function getCategoryId(category?: string) {
  const normalized = normalizeText(category);
  if (!normalized) return "sin-categoria";

  return normalized
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function getCategoryName(category?: string) {
  const value = (category ?? "").trim();
  return value || "Sin categoría";
}

function getProductTag(tags: string[]): "" | "Más vendido" | "Oferta" {
  if (tags.includes("más vendido")) return "Más vendido";
  if (tags.includes("oferta")) return "Oferta";
  return "";
}

export default function StorePage() {
  const loadProducts = useProductsAdmin((s) => s.load);
  const allProducts = useProductsAdmin((s) => s.products);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [tag, setTag] = useState<StoreTag>("all");
  const [sort, setSort] = useState<Sort>("relevance");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const addToCart = useCart((s) => s.add);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setTimeout(() => closeBtnRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileFiltersOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileFiltersOpen]);

  const storeProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.active)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        categoryId: getCategoryId(p.category),
        categoryName: getCategoryName(p.category),
        tag: getProductTag(p.tags),
        stock: p.stock,
        image: normalizeImageUrl(p.image),
      }));
  }, [allProducts]);

  const categories = useMemo<StoreCategory[]>(() => {
    const dynamic = Array.from(
      new Map(
        storeProducts.map((p) => [
          p.categoryId,
          {
            id: p.categoryId,
            name: p.categoryName,
          },
        ])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));

    return [{ id: "all", name: "Todos" }, ...dynamic];
  }, [storeProducts]);

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (q.trim() !== "") n++;
    if (cat !== "all") n++;
    if (minPrice !== "") n++;
    if (maxPrice !== "") n++;
    if (onlyInStock) n++;
    if (tag !== "all") n++;
    return n;
  }, [q, cat, minPrice, maxPrice, onlyInStock, tag]);

  const hasActiveFilters = activeFiltersCount > 0;

  const filtered = useMemo(() => {
    let list = storeProducts.filter((p) => {
      const byCat = cat === "all" ? true : p.categoryId === cat;

      const byQ =
        q.trim() === ""
          ? true
          : p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.id.toLowerCase().includes(q.toLowerCase()) ||
            p.categoryName.toLowerCase().includes(q.toLowerCase());

      const byMin = minPrice === "" ? true : p.price >= Number(minPrice);
      const byMax = maxPrice === "" ? true : p.price <= Number(maxPrice);
      const byStock = onlyInStock ? p.stock > 0 : true;
      const byTag = tag === "all" ? true : p.tag === tag;

      return byCat && byQ && byMin && byMax && byStock && byTag;
    });

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [storeProducts, q, cat, minPrice, maxPrice, onlyInStock, tag, sort]);

  const clearFilters = () => {
    setQ("");
    setCat("all");
    setMinPrice("");
    setMaxPrice("");
    setOnlyInStock(false);
    setTag("all");
    setSort("relevance");
  };

  const FiltersPanel = (
    <div className="space-y-5">
      <div>
        <div className="text-xs text-black/60">Buscar</div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar productos..."
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
        />
      </div>

      <div>
        <div className="text-xs text-black/60">Categoría</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Pill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              {c.name}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs text-black/60">Precio</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Min"
            type="number"
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Max"
            type="number"
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-black/60">Solo con stock</div>
        <button
          onClick={() => setOnlyInStock((v) => !v)}
          className={[
            "h-6 w-11 rounded-full border border-black/10 p-0.5 transition",
            onlyInStock ? "bg-black" : "bg-black/10",
          ].join(" ")}
          type="button"
        >
          <span
            className={[
              "block h-5 w-5 rounded-full bg-white transition",
              onlyInStock ? "translate-x-5" : "translate-x-0",
            ].join(" ")}
          />
        </button>
      </div>

      <div>
        <div className="text-xs text-black/60">Etiqueta</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Pill active={tag === "all"} onClick={() => setTag("all")}>
            Todas
          </Pill>
          <Pill active={tag === "Más vendido"} onClick={() => setTag("Más vendido")}>
            Más vendido
          </Pill>
          <Pill active={tag === "Oferta"} onClick={() => setTag("Oferta")}>
            Oferta
          </Pill>
        </div>
      </div>

      <div>
        <div className="text-xs text-black/60">Ordenar</div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="relevance">Relevancia</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
        </select>
      </div>

      {hasActiveFilters ? (
        <button
          onClick={clearFilters}
          className="w-full rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/90"
          type="button"
        >
          Limpiar filtros
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader onOpenFilters={() => setMobileFiltersOpen(true)} filtersCount={activeFiltersCount} />

      <div
        className={[
          "fixed inset-0 z-[60] lg:hidden transition",
          mobileFiltersOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!mobileFiltersOpen}
      >
        <div
          className={[
            "absolute inset-0 bg-black/30 transition-opacity duration-200",
            mobileFiltersOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setMobileFiltersOpen(false)}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filtros"
          className={[
            "absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-auto bg-white p-5 shadow-xl",
            "transition-transform duration-300 will-change-transform",
            mobileFiltersOpen ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="text-base font-semibold">Filtros</div>
            <button
              ref={closeBtnRef}
              className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/[0.03]"
              onClick={() => setMobileFiltersOpen(false)}
              type="button"
            >
              Cerrar
            </button>
          </div>

          {FiltersPanel}

          <button
            className="mt-6 w-full rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
            onClick={() => setMobileFiltersOpen(false)}
            type="button"
          >
            Ver resultados ({filtered.length})
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-black/10 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Filtros</div>
                {hasActiveFilters ? (
                  <button
                    className="rounded-full bg-black/5 px-3 py-1 text-xs text-black hover:bg-black/10"
                    onClick={clearFilters}
                    type="button"
                  >
                    Limpiar
                  </button>
                ) : null}
              </div>
              <div className="mt-4">{FiltersPanel}</div>
            </div>
          </aside>

          <section>
            <div className="mb-4 flex flex-col gap-3 lg:hidden">
              <div className="flex items-center justify-between">
                <div className="text-sm text-black/60">{filtered.length} productos</div>

                {hasActiveFilters ? (
                  <button
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/[0.03]"
                    onClick={clearFilters}
                    type="button"
                  >
                    Limpiar
                  </button>
                ) : (
                  <div className="text-sm text-black/40"> </div>
                )}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-3 py-2">
                <div className="text-xs text-black/60">Ordenar</div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option value="relevance">Relevancia</option>
                  <option value="price_asc">Precio: menor a mayor</option>
                  <option value="price_desc">Precio: mayor a menor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] transition hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.10)]">
                    {p.tag ? (
                      <div className="absolute left-3 top-3 z-10 rounded-md bg-black px-2 py-1 text-xs font-medium text-white">
                        {p.tag}
                      </div>
                    ) : null}

                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-black/[0.03] to-black/[0.06]">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-b from-black/[0.03] to-black/[0.06]" />
                      )}
                    </div>

                    <div
                      className={[
                        "absolute inset-x-0 bottom-0 px-3 pb-3",
                        "translate-y-[110%] opacity-0",
                        "transition-[transform,opacity] duration-300 ease-out",
                        "group-hover:translate-y-0 group-hover:opacity-100",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "rounded-xl border border-white/30 bg-white/70 px-3 py-2 text-center text-sm font-medium text-black backdrop-blur-md",
                          "shadow-[0_18px_50px_rgba(0,0,0,0.18)]",
                          "transition-transform duration-300 ease-out group-hover:scale-[1.01]",
                        ].join(" ")}
                      >
                        Vista rápida
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="mt-1 text-sm text-black/70">{p.price.toFixed(2)} S/.</div>

                    <button
                      className={[
                        "mt-3 w-full rounded-xl px-4 py-2 text-sm font-medium transition",
                        p.stock > 0
                          ? "bg-black text-white hover:bg-black/90"
                          : "cursor-not-allowed bg-black/10 text-black/40",
                      ].join(" ")}
                      type="button"
                      disabled={p.stock <= 0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        addToCart({
                          id: p.id,
                          name: p.name,
                          price: p.price,
                          image: p.image,
                          qty: 1,
                        });
                      }}
                    >
                      {p.stock > 0 ? "Agregar al carrito" : "Sin stock"}
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-black/10 bg-white p-8 text-center">
                <div className="text-base font-semibold">No encontramos productos</div>
                <div className="mt-2 text-sm text-black/60">Prueba cambiando filtros o buscando otro término.</div>
                <div className="mt-5">
                  <button
                    className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/[0.03]"
                    onClick={clearFilters}
                    type="button"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}