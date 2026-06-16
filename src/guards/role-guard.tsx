'use client';

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@store";
import { FullScreenLoader, AccessDenied } from "@/components/organisms";

interface Props {
  children: ReactNode;
}

export const RoleGuard = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { status, role, suppressAccessDenied } = useAppSelector((state) => state.auth);

  const isClientArea = pathname.startsWith("/client");
  const isAdminArea = pathname.startsWith("/admin");
  const isStorekeeperArea = pathname.startsWith("/storekeeper");
  const isOutsideStorekeeperArea = !isStorekeeperArea;
  const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");
  const isStorekeeperRole = role === "Almacenero" || role === "Almacenero Boom" || role === "Almacenero Tienda";

  useEffect(() => {
    if (status === "checking" || (status === "authenticated" && !role)) return;

    if (status === "authenticated" && isStorekeeperRole && isOutsideStorekeeperArea) {
      router.replace("/storekeeper");
      return;
    }

    if (status === "authenticated" && isAuthRoute) {
      if (role === "Administrador") {
        router.replace("/admin");
        return;
      }

      if (isStorekeeperRole) {
        router.replace("/storekeeper");
        return;
      }

      router.replace("/client");
    }
  }, [status, role, isAuthRoute, isOutsideStorekeeperArea, router, isStorekeeperRole]);

  if (
    status === "checking" ||
    (suppressAccessDenied && (isClientArea || isAdminArea || isStorekeeperArea)) ||
    (status === "authenticated" && (!role || isAuthRoute)) ||
    (status === "authenticated" && isStorekeeperRole && isOutsideStorekeeperArea)
  ) {
    return <FullScreenLoader />;
  }

  if (
    (status === "not-authenticated" && (isClientArea || isAdminArea || isStorekeeperArea)) ||
    (status === "authenticated" && role === "Cliente" && isAdminArea) ||
    (status === "authenticated" && role === "Cliente" && isStorekeeperArea) ||
    (status === "authenticated" && role === "Administrador" && isClientArea) ||
    (status === "authenticated" && role === "Administrador" && isStorekeeperArea) ||
    (status === "authenticated" && isStorekeeperRole && isAdminArea) ||
    (status === "authenticated" && isStorekeeperRole && isClientArea)
  ) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
