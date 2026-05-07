import { dbGet, dbPush, dbRemove } from "../firebase/db";
import type { Product } from "../../types/product";

export const getProducts = async (): Promise<Product[]> => {
  const data = await dbGet("products");

  if (!data) return [];

  return Object.entries(data as Record<string, Omit<Product, "id">>).map(
    ([id, value]) => ({
      ...value,
      id,
    })
  );
};

export const createProduct = async (product: Product) => {
  return dbPush("products", product);
};

export const deleteProduct = async (id: string) => {
  return dbRemove(`products/${id}`);
};