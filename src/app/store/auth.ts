"use client";

import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  type User,
} from "firebase/auth";
import { get, ref, set as setDb, update as updateDb } from "firebase/database";
import { auth, db } from "../../lib/firebase";

export type Role = "user" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
};

type LoginResult = {
  ok: boolean;
  message?: string;
};

type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  init: () => void;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (input: RegisterInput) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateProfile: (
    patch: Partial<Pick<AuthUser, "name" | "email" | "phone">>
  ) => Promise<void>;
};

type FirebaseErrorLike = {
  code?: string;
};

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as FirebaseErrorLike).code;
  }
  return undefined;
}

function mapFirebaseError(code?: string) {
  switch (code) {
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado.";
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/user-not-found":
      return "Usuario no encontrado.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/operation-not-allowed":
      return "Debes habilitar Email/Password en Firebase Authentication.";
    default:
      return "Ocurrió un error. Intenta nuevamente.";
  }
}

async function getDbUser(uid: string): Promise<Partial<AuthUser> | null> {
  const snapshot = await get(ref(db, `users/${uid}`));
  return snapshot.exists() ? (snapshot.val() as Partial<AuthUser>) : null;
}

function buildAuthUser(firebaseUser: User, dbUser?: Partial<AuthUser> | null): AuthUser {
  return {
    id: firebaseUser.uid,
    name: dbUser?.name || firebaseUser.displayName || "",
    email: dbUser?.email || firebaseUser.email || "",
    phone: dbUser?.phone || "",
    role: dbUser?.role === "admin" ? "admin" : "user",
  };
}

let initialized = false;

export const useAuth = create<AuthState>((set, getState) => ({
  user: null,
  loading: true,

  init: () => {
    if (initialized) return;
    initialized = true;

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({ user: null, loading: false });
        return;
      }

      try {
        const dbUser = await getDbUser(firebaseUser.uid);

        set({
          user: buildAuthUser(firebaseUser, dbUser),
          loading: false,
        });
      } catch {
        set({
          user: buildAuthUser(firebaseUser, null),
          loading: false,
        });
      }
    });
  },

  login: async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const dbUser = await getDbUser(cred.user.uid);

      set({
        user: buildAuthUser(cred.user, dbUser),
        loading: false,
      });

      return { ok: true };
    } catch (error: unknown) {
      return {
        ok: false,
        message: mapFirebaseError(getErrorCode(error)),
      };
    }
  },

  register: async ({ name, email, phone, password }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      if (name.trim()) {
        await updateFirebaseProfile(cred.user, {
          displayName: name.trim(),
        });
      }

      const newUser: AuthUser = {
        id: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: "user",
      };

      await setDb(ref(db, `users/${cred.user.uid}`), newUser);

      set({
        user: newUser,
        loading: false,
      });

      return { ok: true };
    } catch (error: unknown) {
      return {
        ok: false,
        message: mapFirebaseError(getErrorCode(error)),
      };
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, loading: false });
  },

  updateProfile: async (patch) => {
    const currentUser = getState().user;
    if (!currentUser) return;

    const nextUser: AuthUser = {
      ...currentUser,
      ...patch,
      name: patch.name ?? currentUser.name,
      email: patch.email ?? currentUser.email,
      phone: patch.phone ?? currentUser.phone,
    };

    if (
      auth.currentUser &&
      patch.name &&
      patch.name.trim() &&
      patch.name !== auth.currentUser.displayName
    ) {
      await updateFirebaseProfile(auth.currentUser, {
        displayName: patch.name,
      });
    }

    await updateDb(ref(db, `users/${currentUser.id}`), {
      name: nextUser.name,
      email: nextUser.email,
      phone: nextUser.phone,
    });

    set({ user: nextUser });
  },
}));