export type UserMenuRole = "admin" | "client";

export type UserMenuItem = {
  label: string;
  href: string;
  icon: "dashboard" | "package" | "user";
};

export const userMenuItemsByRole: Record<UserMenuRole, UserMenuItem[]> = {
  admin: [
    {
      label: "Panel de Administración",
      href: "/admin",
      icon: "dashboard",
    },
  ],
  client: [
    {
      label: "Panel de Cliente",
      href: "/client",
      icon: "dashboard",
    },
    {
      label: "Mis Productos",
      href: "/new-in",
      icon: "package",
    },
    {
      label: "Mi Cuenta",
      href: "/client/settings",
      icon: "user",
    },
  ],
};

export const getUserMenuItems = (role: UserMenuRole | null): UserMenuItem[] =>
  role ? userMenuItemsByRole[role] : [];