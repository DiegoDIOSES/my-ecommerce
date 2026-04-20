import { dbGet, dbSet, dbPush, dbRemove } from "../firebase/db";
import { Product } from "@/types/product";

export const getProducts = async (): Promise<Product[]> => {
  const data = await dbGet("products");
  if (!data) return [];
  return Object.entries(data).map(([id, value]: any) => ({
    id,
    ...value,
  }));
};

export const createProduct = async (product: Product) => {
  return dbPush("products", product);
};

export const deleteProduct = async (id: string) => {
  return dbRemove(`products/${id}`);
};
