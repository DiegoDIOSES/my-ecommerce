"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/store/auth";

export default function RequireAuth({
  children,
  redirectTo = "/login",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const user = useAuth((s) => s.user);

  useEffect(() => {
    if (!user) router.replace(redirectTo);
  }, [user, router, redirectTo]);

  if (!user) return null;
  return <>{children}</>;
}