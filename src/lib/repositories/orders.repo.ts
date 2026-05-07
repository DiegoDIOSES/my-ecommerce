import { dbGet, dbPush, dbUpdate } from "../firebase/db";
import type { Order } from "../../types/order";

export const getOrders = async (): Promise<Order[]> => {
  const data = await dbGet("orders");

  if (!data) return [];

  return Object.entries(data as Record<string, Omit<Order, "id">>).map(
    ([id, value]) => ({
      ...value,
      id,
    })
  );
};

export const createOrder = async (order: Order) => {
  return dbPush("orders", order);
};

export const updateOrder = async (
  id: string,
  data: Partial<Order>
) => {
  return dbUpdate(`orders/${id}`, data);
};