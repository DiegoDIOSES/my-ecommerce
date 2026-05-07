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
  createdAt?: string | number;
  updatedAt?: string | number;
};