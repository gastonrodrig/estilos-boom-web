// Si ya definiste SidebarModule en el archivo de admin, puedes reutilizarlo.
// Si no, defínelo aquí:
export interface ClientModuleChild {
  label: string;
  href: string;
  requiredRoles?: string[];
}

export interface ClientModule {
  label: string;
  href?: string;
  icon?: string;
  requiredRoles?: string[];
  children?: ClientModuleChild[];
}

export const clientModules: ClientModule[] = [
  {
    label: "Inicio",
    href: "/client",
    icon: "home",
    requiredRoles: ["Cliente"],
  },
  {
    label: "Mis Pedidos",
    icon: "package",
    children: [
      {
        label: "Activos",
        href: "/client/orders/active",
      },
      {
        label: "Historial",
        href: "/client/orders/history",
      },
    ],
  },
  {
    label: "Favoritos",
    href: "/client/favorites",
    icon: "heart",
  },
  {
    label: "Reseñas",
    href: "/client/reviews",
    icon: "star",
  },
  {
    label: "Sugerencias",
    href: "/client/suggestions",
    icon: "message-square",
  },
  {
    label: "Mi Perfil",
    href: "/client/profile",
    icon: "user",
  },
  {
    label: "Configuración",
    href: "/client/settings",
    icon: "settings",
  },
];