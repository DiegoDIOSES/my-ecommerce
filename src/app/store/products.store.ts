"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "../../lib/firebase";
import {
  get as getDb,
  ref,
  remove as removeDb,
  set as setDb,
  update as updateDb,
} from "firebase/database";

export type ProductTag = "más vendido" | "oferta" | "nuevo";

export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  stock: number;
  active: boolean;
  tags: ProductTag[];
  createdAt: string;
  updatedAt: string;
};

type ProductRecord = Omit<Product, "id">;

type ProductsState = {
  products: Product[];
  load: () => Promise<void>;
  seedIfEmpty: () => Promise<void>;
  create: (p: Omit<Product, "createdAt" | "updatedAt">) => Promise<void>;
  update: (
    id: string,
    patch: Partial<Omit<Product, "id" | "createdAt">>
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  clear: () => void;
};

function nowISO() {
  return new Date().toISOString();
}

function demoProducts(): Product[] {
  const t = nowISO();

  return [
    {
      id: "p1",
      name: "Soy un producto",
      price: 15,
      image: "/products/p1.jpg",
      category: "Tote bags",
      stock: 12,
      active: true,
      tags: ["más vendido"],
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "p3",
      name: "Soy un producto",
      price: 12.5,
      image: "/products/p3.jpg",
      category: "Mini bags",
      stock: 2,
      active: true,
      tags: ["oferta"],
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "p4",
      name: "Soy un producto",
      price: 22,
      image: "/products/p4.jpg",
      category: "Eco",
      stock: 0,
      active: true,
      tags: [],
      createdAt: t,
      updatedAt: t,
    },
  ];
}

function mapFirebaseProducts(
  data: Record<string, ProductRecord> | null | undefined
): Product[] {
  if (!data) return [];

  return Object.entries(data).map(([id, value]) => ({
    id,
    name: value.name ?? "",
    price: Number(value.price ?? 0),
    image: value.image ?? "",
    category: value.category ?? "",
    stock: Number(value.stock ?? 0),
    active: Boolean(value.active),
    tags: Array.isArray(value.tags) ? value.tags : [],
    createdAt: value.createdAt ?? nowISO(),
    updatedAt: value.updatedAt ?? nowISO(),
  }));
}

function sortProducts(items: Product[]) {
  return [...items].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export const useProductsAdmin = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: [],

      load: async () => {
        const snapshot = await getDb(ref(db, "products"));
        const data = snapshot.exists()
          ? (snapshot.val() as Record<string, ProductRecord>)
          : null;

        set({
          products: sortProducts(mapFirebaseProducts(data)),
        });
      },

      seedIfEmpty: async () => {
        const snapshot = await getDb(ref(db, "products"));

        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, ProductRecord>;
          set({
            products: sortProducts(mapFirebaseProducts(data)),
          });
          return;
        }

        const demo = demoProducts();

        await Promise.all(
          demo.map((product) =>
            setDb(ref(db, `products/${product.id}`), {
              name: product.name,
              price: product.price,
              image: product.image ?? "",
              category: product.category ?? "",
              stock: product.stock,
              active: product.active,
              tags: product.tags,
              createdAt: product.createdAt,
              updatedAt: product.updatedAt,
            })
          )
        );

        set({ products: sortProducts(demo) });
      },

      create: async (product) => {
        const createdAt = nowISO();
        const updatedAt = createdAt;

        const newProduct: Product = {
          ...product,
          image: product.image ?? "",
          category: product.category ?? "",
          createdAt,
          updatedAt,
        };

        await setDb(ref(db, `products/${newProduct.id}`), {
          name: newProduct.name,
          price: newProduct.price,
          image: newProduct.image ?? "",
          category: newProduct.category ?? "",
          stock: newProduct.stock,
          active: newProduct.active,
          tags: newProduct.tags,
          createdAt: newProduct.createdAt,
          updatedAt: newProduct.updatedAt,
        });

        set((state) => ({
          products: sortProducts([newProduct, ...state.products]),
        }));
      },

      update: async (id, patch) => {
        const updatedAt = nowISO();

        await updateDb(ref(db, `products/${id}`), {
          ...patch,
          updatedAt,
        });

        set((state) => ({
          products: sortProducts(
            state.products.map((product) =>
              product.id === id ? { ...product, ...patch, updatedAt } : product
            )
          ),
        }));
      },

      toggleActive: async (id) => {
        const current = get().products.find((product) => product.id === id);
        if (!current) return;

        const updatedAt = nowISO();
        const active = !current.active;

        await updateDb(ref(db, `products/${id}`), {
          active,
          updatedAt,
        });

        set((state) => ({
          products: sortProducts(
            state.products.map((product) =>
              product.id === id ? { ...product, active, updatedAt } : product
            )
          ),
        }));
      },

      remove: async (id) => {
        await removeDb(ref(db, `products/${id}`));

        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));
      },

      clear: () => set({ products: [] }),
    }),
    {
      name: "biba_products_admin_v1",
      partialize: (state) => ({ products: state.products }),
    }
  )
);