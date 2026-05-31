export type UserMenuRole = "admin" | "client" | "storekeeper";

export type UserMenuItem = {
  label: string;
  href: string;
  icon: "dashboard" | "package" | "user";
  requiredRoles?: string[];
  children?: UserMenuItem[];
};

export const userMenuItemsByRole: Record<UserMenuRole, UserMenuItem[]> = {
  admin: [
    {
      label: "Panel de Administración",
      href: "/admin",
      icon: "dashboard",
      requiredRoles: ["Administrador"],
    },
  ],
  client: [
    {
      label: "Panel de Cliente",
      href: "/client",
      icon: "dashboard",
      requiredRoles: ["Cliente"],
    },
    {
      label: "Mis Productos",
      href: "/new-in",
      icon: "package",
      requiredRoles: ["Cliente"],
    },
    {
      label: "Mi Cuenta",
      href: "/client/settings",
      icon: "user",
      requiredRoles: ["Cliente"],
    },
  ],
  storekeeper: [
    {
      label: "Panel de Almacén",
      href: "/storekeeper",
      icon: "dashboard",
      requiredRoles: ["Almacenero"],
    },
  ],
};

export const getUserMenuItems = (role: UserMenuRole | null): UserMenuItem[] =>
  role ? userMenuItemsByRole[role] : [];