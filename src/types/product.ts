export interface Product {
  id?: string;
  name: string;
  price: number;
  categoryId: string;
  stock: number;
  active: boolean;
  createdAt: number;
}
