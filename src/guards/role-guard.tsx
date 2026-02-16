'use client';

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@store";

interface RoleGuardProps {
  children: ReactNode;
}

export const RoleGuard = ({ children }: RoleGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const { status, role, isExtraDataCompleted } = useAppSelector(
    (state) => state.auth
  );

  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    let mounted = true; // Para evitar updates si el componente se desmonta

    const safeSetCanRender = (value: boolean) => {
      if (mounted && value !== canRender) {
        setCanRender(value);
      }
    };

    const checkAccess = () => {
      const isAuthRoute =
        pathname.startsWith("/auth/login") ||
        pathname.startsWith("/auth/register");
      const isAdminRoute = pathname.startsWith("/admin");
      const isClientRoute = pathname.startsWith("/client");

      if (status === "checking" || (status === "authenticated" && !role)) {
        safeSetCanRender(false);
        return;
      }

      if (status === "not-authenticated") {
        router.replace("/auth/login");
        return;
      }

      if (status === "first-login-password") {
        router.replace("/auth/first-login-password");
        return;
      }

      if (status === "authenticated" && isAuthRoute) {
        router.replace(role === "Administrador" ? "/admin" : "/client");
        return;
      }

      if (status === "authenticated" && !isExtraDataCompleted) {
        safeSetCanRender(true);
        return;
      }

      if (status === "authenticated") {
        if (role === "Cliente" && isAdminRoute) {
          router.replace("/client");
          return;
        }
        if (role === "Administrador" && isClientRoute) {
          router.replace("/admin");
          return;
        }
      }

      safeSetCanRender(true);
    };

    checkAccess();

    return () => {
      mounted = false; // cleanup
    };
  }, [status, role, isExtraDataCompleted, pathname, router, canRender]);

  if (!canRender)
    return <div className="flex justify-center items-center min-h-screen">Cargando…</div>;

  return <>{children}</>;
};
