"use client";

import { create } from "zustand";
import { get, ref, remove as removeDb, update as updateDb } from "firebase/database";
import { db } from "../../lib/firebase";
import type { Order, OrderStatus } from "../../types/order";

type OrdersState = {
  orders: Order[];
  loadByUser: (userId: string) => Promise<void>;
  loadAll: () => Promise<void>;
  setStatus: (userId: string, orderId: string, status: OrderStatus) => Promise<void>;
  remove: (userId: string, orderId: string) => Promise<void>;
  clear: () => void;
};

function sortOrders(items: Order[]) {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

function flattenOrdersTree(data: Record<string, Record<string, Order>> | null | undefined): Order[] {
  if (!data) return [];

  const orders: Order[] = [];

  for (const [userId, userOrders] of Object.entries(data)) {
    for (const [orderId, order] of Object.entries(userOrders ?? {})) {
      orders.push({
        ...order,
        id: order.id ?? orderId,
        userId: order.userId ?? userId,
      });
    }
  }

  return orders;
}

function mapUserOrders(data: Record<string, Order> | null | undefined, userId: string): Order[] {
  if (!data) return [];

  return Object.entries(data).map(([orderId, order]) => ({
    ...order,
    id: order.id ?? orderId,
    userId: order.userId ?? userId,
  }));
}

export const useOrders = create<OrdersState>((set) => ({
  orders: [],

  loadByUser: async (userId: string) => {
    if (!userId) {
      set({ orders: [] });
      return;
    }

    const snapshot = await get(ref(db, `orders/${userId}`));
    const data = snapshot.exists() ? (snapshot.val() as Record<string, Order>) : null;

    set({
      orders: sortOrders(mapUserOrders(data, userId)),
    });
  },

  loadAll: async () => {
    const snapshot = await get(ref(db, "orders"));
    const data = snapshot.exists()
      ? (snapshot.val() as Record<string, Record<string, Order>>)
      : null;

    set({
      orders: sortOrders(flattenOrdersTree(data)),
    });
  },

  setStatus: async (userId: string, orderId: string, status: OrderStatus) => {
    await updateDb(ref(db, `orders/${userId}/${orderId}`), { status });

    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId && order.userId === userId ? { ...order, status } : order
      ),
    }));
  },

  remove: async (userId: string, orderId: string) => {
    await removeDb(ref(db, `orders/${userId}/${orderId}`));

    set((state) => ({
      orders: state.orders.filter(
        (order) => !(order.id === orderId && order.userId === userId)
      ),
    }));
  },

  clear: () => set({ orders: [] }),
}));