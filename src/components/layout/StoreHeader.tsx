"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CartDrawer from "../../components/cart/CartDrawer";
import { useCart } from "../../app/store/cart";
import { useAuth } from "../../app/store/auth";

interface User {
  role: "admin" | "user";
}

function AuthDesktop({ user }: { user: User | null }) {
  if (user) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Link
          href="/profile"
          className="rounded-xl px-3 py-2 text-black/70 hover:bg-black/[0.03] hover:text-black"
        >
          {user.role === "admin" ? "Perfil (Admin)" : "Mi perfil"}
        </Link>

        {user.role === "admin" ? (
          <Link
            href="/admin"
            className="rounded-xl border border-black/10 px-3 py-2 text-black/70 hover:bg-black/[0.03] hover:text-black"
          >
            Panel admin
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      className="hidden rounded-xl px-3 py-2 text-black/70 hover:bg-black/[0.03] hover:text-black md:inline-flex"
      href="/login"
    >
      Iniciar sesión
    </Link>
  );
}

function AuthMobile({ user }: { user: User | null; onClose: () => void }) {
  if (user) {
    return (
      <>
        <Link
          className="rounded-xl px-3 py-2 hover:bg-black/[0.03]"
          href="/profile"
          onClick={() => {}}
        >
          Mi perfil
        </Link>

        {user.role === "admin" ? (
          <Link
            className="rounded-xl px-3 py-2 hover:bg-black/[0.03]"
            href="/admin"
            onClick={() => {}}
          >
            Panel admin
          </Link>
        ) : null}
      </>
    );
  }

  return (
    <Link
      className="rounded-xl px-3 py-2 hover:bg-black/[0.03]"
      href="/login"
      onClick={() => {}}
    >
      Iniciar sesión
    </Link>
  );
}

export default function StoreHeader({
  onOpenFilters,
  filtersCount = 0,
}: {
  onOpenFilters?: () => void;
  filtersCount?: number;
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Auth
  const user = useAuth((s) => s.user);

  // ✅ Carrito: derivar count desde items (re-render seguro)
  const items = useCart((s) => s.items);
  const cartCount = useMemo(
    () => items.reduce((acc, it) => acc + (it.qty ?? 1), 0),
    [items]
  );

  // Cierra menú móvil al pasar a desktop (md+)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const openCart = () => {
    setMenuOpen(false); // evita conflicto menú vs drawer
    setCartOpen(true);
  };

  const toggleMenu = () => setMenuOpen((v) => !v);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="min-w-0">
            <div className="text-2xl font-semibold tracking-tight">Biba</div>
            <div className="text-sm text-black/60">Diseños llenas de color</div>
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-6 text-sm text-black/70 md:flex">
            <Link className="hover:text-black" href="/">
              Tienda
            </Link>
            <a className="hover:text-black" href="#">
              Acerca de
            </a>
            <a className="hover:text-black" href="#">
              FAQ
            </a>
            <a className="hover:text-black" href="#">
              Contacto
            </a>
          </nav>

          {/* actions */}
          <div className="flex items-center gap-2 text-sm">
            {/* mobile: filtros (solo si te pasaron handler) */}
            {onOpenFilters ? (
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 hover:bg-black/[0.03] md:hidden"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenFilters();
                }}
                type="button"
              >
                Filtros
                {filtersCount > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs font-medium text-white">
                    {filtersCount}
                  </span>
                ) : null}
              </button>
            ) : null}

            {/* Auth (desktop) */}
            <AuthDesktop user={user} />

            {/* Carrito */}
            <button
              onClick={openCart}
              className="relative inline-flex items-center rounded-xl border border-black/10 px-3 py-2 hover:bg-black/[0.03]"
              type="button"
            >
              Carrito
              {cartCount > 0 ? (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs font-medium text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>

            {/* mobile menu */}
            <button
              className="inline-flex items-center rounded-xl border border-black/10 px-3 py-2 hover:bg-black/[0.03] md:hidden"
              onClick={toggleMenu}
              type="button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
            >
              ☰
            </button>
          </div>
        </div>

        {/* mobile dropdown menu */}
        <div
          className={[
            "md:hidden overflow-hidden border-t border-black/10 bg-white transition-[max-height,opacity] duration-200",
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="px-4 py-3">
            <div className="flex flex-col gap-2 text-sm text-black/70">
              <Link
                className="rounded-xl px-3 py-2 hover:bg-black/[0.03]"
                href="/"
                onClick={() => setMenuOpen(false)}
              >
                Tienda
              </Link>

              <a className="rounded-xl px-3 py-2 hover:bg-black/[0.03]" href="#">
                Acerca de
              </a>
              <a className="rounded-xl px-3 py-2 hover:bg-black/[0.03]" href="#">
                FAQ
              </a>
              <a className="rounded-xl px-3 py-2 hover:bg-black/[0.03]" href="#">
                Contacto
              </a>

              {/* Auth (mobile) */}
              <AuthMobile user={user} onClose={() => setMenuOpen(false)} />

              {/* acceso directo a carrito en móvil */}
              <button
                className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-black/[0.03]"
                onClick={openCart}
                type="button"
              >
                <span>Carrito</span>
                {cartCount > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs font-medium text-white">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Drawer carrito */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}