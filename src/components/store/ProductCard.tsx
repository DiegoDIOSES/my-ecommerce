"use client";

import Link from "next/link";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import type { MockProduct } from "../../lib/mock/products";

export default function ProductCard({ p }: { p: MockProduct }) {
  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white">
        {p.tag ? (
          <div className="absolute left-3 top-3 z-10">
            <Badge>{p.tag}</Badge>
          </div>
        ) : null}

        <Link href={`/product/${p.id}`} className="block">
          <div className="aspect-[4/5] w-full overflow-hidden bg-black/[0.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image}
              alt={p.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </Link>

        <div className="p-4">
          <div className="text-sm font-medium">{p.name}</div>
          <div className="mt-1 text-sm text-black/70">
            {p.price.toFixed(2)} S/.
          </div>

          <div className="mt-4">
            <Button className="w-full" variant="primary">
              Agregar al carrito
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}