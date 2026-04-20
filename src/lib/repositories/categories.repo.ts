import { dbGet, dbPush } from "../firebase/db";
import { Category } from "@/types/category";

export const getCategories = async (): Promise<Category[]> => {
  const data = await dbGet("categories");
  if (!data) return [];
  return Object.entries(data).map(([id, value]: any) => ({
    id,
    ...value,
  }));
};

export const createCategory = async (category: Category) => {
  return dbPush("categories", category);
};
