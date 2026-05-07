"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StoreHeader from "../../components/layout/StoreHeader";
import { useAuth } from "../store/auth";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();

  const init = useAuth((s) => s.init);
  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!loading && user) {
      router.push("/profile");
    }
  }, [loading, user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "register") {
      if (!name.trim()) return setError("Ingresa tu nombre.");
      if (!phone.trim()) return setError("Ingresa tu celular.");
      if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
      if (password !== confirmPassword) return setError("Las contraseñas no coinciden.");
    }

    try {
      setSubmitting(true);

      const res =
        mode === "login"
          ? await login(email.trim(), password)
          : await register({
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              password,
            });

      if (!res.ok) {
        setError(res.message ?? "No se pudo completar la acción.");
        return;
      }

      router.push("/profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mx-auto max-w-md rounded-3xl border border-black/10 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                mode === "login"
                  ? "bg-black text-white"
                  : "border border-black/10 hover:bg-black/[0.03]"
              }`}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                mode === "register"
                  ? "bg-black text-white"
                  : "border border-black/10 hover:bg-black/[0.03]"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h1>

          <p className="mt-1 text-sm text-black/60">
            {mode === "login"
              ? "Ingresa con tu correo y contraseña."
              : "Registra tu cuenta para ver y gestionar tus pedidos."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {mode === "register" ? (
              <>
                <div>
                  <label className="text-xs text-black/60">Nombre</label>
                  <input
                    className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    type="text"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="text-xs text-black/60">Celular</label>
                  <input
                    className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="999999999"
                    type="tel"
                    autoComplete="tel"
                  />
                </div>
              </>
            ) : null}

            <div>
              <label className="text-xs text-black/60">Email</label>
              <input
                className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                type="email"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs text-black/60">Contraseña</label>
              <input
                className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {mode === "register" ? (
              <div>
                <label className="text-xs text-black/60">Confirmar contraseña</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="******"
                  type="password"
                  autoComplete="new-password"
                />
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90 disabled:bg-black/20"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? mode === "login"
                  ? "Entrando..."
                  : "Creando cuenta..."
                : mode === "login"
                ? "Entrar"
                : "Crear cuenta"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}