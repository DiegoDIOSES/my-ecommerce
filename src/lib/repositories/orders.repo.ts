import { dbGet, dbPush, dbUpdate } from "../firebase/db";
import { Order } from "@/types/order";

export const getOrders = async (): Promise<Order[]> => {
  const data = await dbGet("orders");
  if (!data) return [];
  return Object.entries(data).map(([id, value]: any) => ({
    id,
    ...value,
  }));
};

export const createOrder = async (order: Order) => {
  return dbPush("orders", order);
};

export const updateOrder = async (id: string, data: Partial<Order>) => {
  return dbUpdate(`orders/${id}`, data);
};
