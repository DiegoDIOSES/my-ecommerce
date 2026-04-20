"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/store/auth";

export default function RequireAdmin({
  children,
  redirectTo = "/",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const user = useAuth((s) => s.user);

  useEffect(() => {
    if (!user) return router.replace("/login");
    if (user.role !== "admin") router.replace(redirectTo);
  }, [user, router, redirectTo]);

  if (!user || user.role !== "admin") return null;
  return <>{children}</>;
}