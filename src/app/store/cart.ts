"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  qty: number;
};

export type AddPayload = Omit<CartItem, "qty"> & { qty?: number };

type CartState = {
  items: CartItem[];

  add: (payload: AddPayload) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;

  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (payload) => {
        const qty = Math.max(1, payload.qty ?? 1);

        set((state) => {
          const idx = state.items.findIndex((i) => i.id === payload.id);

          if (idx >= 0) {
            const next = [...state.items];
            next[idx] = { ...next[idx], qty: next[idx].qty + qty };
            return { items: next };
          }

          return {
            items: [
              ...state.items,
              {
                id: payload.id,
                name: payload.name,
                price: payload.price,
                image: payload.image,
                qty,
              },
            ],
          };
        });
      },

      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      setQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
        })),

      inc: (id) => {
        const it = get().items.find((i) => i.id === id);
        if (!it) return;
        get().setQty(id, it.qty + 1);
      },

      dec: (id) => {
        const it = get().items.find((i) => i.id === id);
        if (!it) return;
        get().setQty(id, Math.max(1, it.qty - 1));
      },

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((acc, it) => acc + it.qty, 0),

      subtotal: () => get().items.reduce((acc, it) => acc + it.price * it.qty, 0),
    }),
    {
      name: "biba_cart_v1", // clave en localStorage
      version: 1,
    }
  )
);