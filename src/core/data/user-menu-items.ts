export type UserMenuRole = "admin" | "client" | "storekeeper";

export type UserMenuItem = {
  label: string;
  href: string;
  icon: "dashboard" | "package" | "user";
  requiredPermission?: string;
  children?: UserMenuItem[];
};

export const userMenuItemsByRole: Record<UserMenuRole, UserMenuItem[]> = {
  admin: [
    {
      label: "Panel de Administración",
      href: "/admin",
      icon: "dashboard",
      requiredPermission: "dashboard:view",
    },
  ],
  client: [
    {
      label: "Panel de Cliente",
      href: "/client",
      icon: "dashboard",
      requiredPermission: "dashboard:view",
    },
    {
      label: "Mis Productos",
      href: "/new-in",
      icon: "package",
      requiredPermission: "orders:view",
    },
    {
      label: "Mi Cuenta",
      href: "/client/settings",
      icon: "user",
      requiredPermission: "profile:view",
    },
  ],
  storekeeper: [
    {
      label: "Panel de Almacén",
      href: "/storekeeper",
      icon: "dashboard",
      requiredPermission: "dashboard:view",
    },
  ],
};

export const getUserMenuItems = (role: UserMenuRole | null): UserMenuItem[] =>
  role ? userMenuItemsByRole[role] : [];