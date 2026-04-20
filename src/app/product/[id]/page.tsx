"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoreHeader from "../../../components/layout/StoreHeader";
import { useCart } from "../../store/cart";
import { useProductsAdmin, type Product } from "../../store/products.store";

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

function getProductImages(image?: string) {
  const normalized = normalizeImageUrl(image);
  return normalized ? [normalized] : [];
}

function ProductDetailContent({
  product,
  prev,
  next,
}: {
  product: Product;
  prev: Product | null;
  next: Product | null;
}) {
  const router = useRouter();
  const addToCart = useCart((s) => s.add);

  const images = useMemo(() => getProductImages(product.image), [product.image]);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  const currentImage = images[activeImg] || images[0] || "";

  const onAdd = () => {
    if (product.stock <= 0) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: currentImage || product.image || "",
      qty,
    });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-black/60">
        <div className="flex items-center gap-2">
          <Link className="hover:text-black" href="/">
            Inicio
          </Link>
          <span>/</span>
          <Link className="hover:text-black" href="/store">
            Tienda
          </Link>
          <span>/</span>
          <span className="text-black/80">{product.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {prev ? (
            <Link
              href={`/product/${prev.id}`}
              className="inline-flex items-center gap-1 hover:text-black"
            >
              <span className="text-base leading-none">‹</span> Previo
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 text-black/30">
              <span className="text-base leading-none">‹</span> Previo
            </span>
          )}

          <span className="text-black/20">|</span>

          {next ? (
            <Link
              href={`/product/${next.id}`}
              className="inline-flex items-center gap-1 hover:text-black"
            >
              Próximo <span className="text-base leading-none">›</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 text-black/30">
              Próximo <span className="text-base leading-none">›</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[520px_1fr]">
        <section>
          <div className="relative overflow-hidden border border-black/10 bg-black/[0.02]">
            <div className="relative aspect-square w-full">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-10"
                  sizes="(max-width: 768px) 100vw, 520px"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-b from-black/[0.03] to-black/[0.06]" />
              )}
            </div>
          </div>

          {images.length > 1 ? (
            <div className="mt-3 flex gap-2">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "relative h-14 w-14 overflow-hidden border transition",
                    i === activeImg ? "border-black" : "border-black/15 hover:border-black/40"
                  )}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="56px" unoptimized />
                </button>
              ))}
            </div>
          ) : null}

          <p className="mt-6 max-w-md text-sm leading-6 text-black/70">
            Producto de la categoría{" "}
            <span className="font-medium text-black">{product.category || "General"}</span>.
            Aquí luego podremos mostrar una descripción real desde Firebase.
          </p>
        </section>

        <section>
          <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>

          <div className="mt-2 text-xs uppercase tracking-wider text-black/40">
            SKU: {product.id}
          </div>

          <div className="mt-3 flex items-center gap-2">
            {product.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-xs text-black/70"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-lg font-medium">{formatEUR(product.price)}</span>
          </div>

          <div className="mt-6 space-y-2">
            <div className="text-sm">
              Stock:{" "}
              <span className={cn("font-medium", product.stock > 0 ? "text-black" : "text-red-600")}>
                {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="text-sm">Cantidad</div>
            <div className="inline-flex items-center border border-black/20">
              <button
                type="button"
                className="h-9 w-9 text-lg leading-none hover:bg-black/[0.03]"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                aria-label="Disminuir"
                disabled={product.stock <= 0}
              >
                −
              </button>

              <div className="h-9 w-10 select-none text-center text-sm leading-9">{qty}</div>

              <button
                type="button"
                className="h-9 w-9 text-lg leading-none hover:bg-black/[0.03]"
                onClick={() =>
                  setQty((v) => {
                    if (product.stock <= 0) return 1;
                    return Math.min(product.stock, v + 1);
                  })
                }
                aria-label="Aumentar"
                disabled={product.stock <= 0}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAdd}
                disabled={product.stock <= 0}
                className={cn(
                  "h-11 flex-1 border text-sm font-medium transition",
                  product.stock > 0
                    ? "border-black/30 bg-white hover:bg-black/[0.03]"
                    : "cursor-not-allowed border-black/10 bg-black/[0.03] text-black/40"
                )}
              >
                {product.stock > 0 ? "Agregar al carrito" : "Sin stock"}
              </button>

              <button
                type="button"
                className="h-11 w-11 border border-black/30 bg-white text-lg hover:bg-black/[0.03]"
                aria-label="Favorito"
              >
                ♡
              </button>
            </div>

            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => {
                onAdd();
                router.push("/checkout");
              }}
              className={cn(
                "h-11 w-full text-sm font-medium text-white transition",
                product.stock > 0
                  ? "bg-black hover:bg-black/90"
                  : "cursor-not-allowed bg-black/20"
              )}
            >
              Realizar compra
            </button>
          </div>

          <div className="mt-10 border-t border-black/10 pt-6">
            <details open className="group border-b border-black/10 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold tracking-wide">
                INFORMACIÓN DEL PRODUCTO
                <span className="text-black/40 transition group-open:rotate-45">+</span>
              </summary>
              <div className="mt-3 text-sm leading-6 text-black/70">
                <strong className="text-black">Detalles del producto.</strong> Este producto pertenece a{" "}
                <span className="font-medium">{product.category || "General"}</span>, tiene código{" "}
                <span className="font-medium">{product.id}</span> y precio de{" "}
                <span className="font-medium">{formatEUR(product.price)}</span>.
              </div>
            </details>

            <details className="group border-b border-black/10 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold tracking-wide">
                POLÍTICA DE DEVOLUCIÓN Y REEMBOLSO
                <span className="text-black/40 transition group-open:rotate-45">+</span>
              </summary>
              <div className="mt-3 text-sm leading-6 text-black/70">
                Define aquí condiciones, plazos y procedimiento de devolución.
              </div>
            </details>

            <details className="group border-b border-black/10 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold tracking-wide">
                POLÍTICA DE ENVÍOS
                <span className="text-black/40 transition group-open:rotate-45">+</span>
              </summary>
              <div className="mt-3 text-sm leading-6 text-black/70">
                Define aquí tiempos de despacho, costos y cobertura.
              </div>
            </details>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const loadProducts = useProductsAdmin((s) => s.load);
  const products = useProductsAdmin((s) => s.products);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.active);
  }, [products]);

  const product = useMemo(() => {
    return activeProducts.find((p) => p.id === id) ?? null;
  }, [activeProducts, id]);

  const index = useMemo(() => {
    if (!product) return -1;
    return activeProducts.findIndex((p) => p.id === product.id);
  }, [activeProducts, product]);

  const prev = index > 0 ? activeProducts[index - 1] : null;
  const next = index >= 0 && index < activeProducts.length - 1 ? activeProducts[index + 1] : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <StoreHeader />
        <main className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-3xl border border-black/10 bg-white p-10 text-center">
            <div className="text-2xl font-semibold">Producto no encontrado</div>
            <div className="mt-2 text-sm text-black/60">
              Puede que el producto no exista, esté inactivo o todavía no se haya cargado.
            </div>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => router.push("/store")}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/90"
              >
                Volver a la tienda
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader />
      <ProductDetailContent
        key={product.id}
        product={product}
        prev={prev}
        next={next}
      />
    </div>
  );
}