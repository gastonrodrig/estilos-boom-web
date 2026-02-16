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
  const { status, role } = useAppSelector((state) => state.auth);

  const isClientArea = pathname.startsWith("/client");
  const isAdminArea = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");

  useEffect(() => {
    if (status === "checking" || (status === "authenticated" && !role)) return;
    if (status === "authenticated" && isAuthRoute) {
      router.replace(role === "Administrador" ? "/admin" : "/client");
    }
  }, [status, role, isAuthRoute, router]);

  if (status === "checking" || (status === "authenticated" && (!role || isAuthRoute))) {
    return <FullScreenLoader />;
  }

  if (
    (status === "not-authenticated" && (isClientArea || isAdminArea)) ||
    (status === "authenticated" && role === "Cliente" && isAdminArea) ||
    (status === "authenticated" && role === "Administrador" && isClientArea)
  ) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
