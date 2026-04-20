export type OrderStatus =
  | "PENDIENTE_PAGO"
  | "VALIDANDO"
  | "PREPARANDO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO"
  | "PAGO_RECHAZADO";

export type PaymentMethod = "yape" | "transferencia";

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
}

export interface OrderPayment {
  method?: PaymentMethod;
  operationCode?: string;
  last4Phone?: string;
  submittedAt?: number;
}

export interface Order {
  id?: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerReference?: string;
  items: OrderItem[];
  total: number;
  payment?: OrderPayment;
  status: OrderStatus;
  createdAt: number;
}