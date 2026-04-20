import { create } from "zustand";

type CartState = {
  itemsCount: number;
  add: (qty?: number) => void;
  remove: (qty?: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>((set) => ({
  itemsCount: 0,
  add: (qty = 1) =>
    set((s) => ({ itemsCount: Math.max(0, s.itemsCount + qty) })),
  remove: (qty = 1) =>
    set((s) => ({ itemsCount: Math.max(0, s.itemsCount - qty) })),
  clear: () => set({ itemsCount: 0 }),
}));