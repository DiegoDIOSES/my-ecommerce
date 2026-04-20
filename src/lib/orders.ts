import { ref, set } from "firebase/database";
import { db } from "./firebase";
import type { Order } from "../types/order";

export async function createOrder(order: Order) {
  const orderId = order.id ?? order.orderNumber;
  await set(ref(db, `orders/${order.userId}/${orderId}`), {
    ...order,
    id: orderId,
  });
}