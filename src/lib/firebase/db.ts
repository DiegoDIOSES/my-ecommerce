import { ref, get, set, push, update, remove } from "firebase/database";
import { db } from "./client";

export const dbGet = async (path: string) => {
  const snapshot = await get(ref(db, path));
  return snapshot.exists() ? snapshot.val() : null;
};

export const dbSet = async (path: string, data: any) => {
  return set(ref(db, path), data);
};

export const dbPush = async (path: string, data: any) => {
  return push(ref(db, path), data);
};

export const dbUpdate = async (path: string, data: any) => {
  return update(ref(db, path), data);
};

export const dbRemove = async (path: string) => {
  return remove(ref(db, path));
};
