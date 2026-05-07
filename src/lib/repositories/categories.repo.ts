import { dbGet, dbPush } from "../firebase/db";
import type { Category } from "../../types/category";

export const getCategories = async (): Promise<Category[]> => {
  const data = await dbGet("categories");

  if (!data) return [];

  return Object.entries(data as Record<string, Omit<Category, "id">>).map(
    ([id, value]) => ({
      ...value,
      id,
    })
  );
};

export const createCategory = async (category: Category) => {
  return dbPush("categories", category);
};