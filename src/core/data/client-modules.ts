// Si ya definiste SidebarModule en el archivo de admin, puedes reutilizarlo.
// Si no, defínelo aquí:
export interface ClientModuleChild {
  label: string;
  href: string;
  requiredPermission?: string;
}

export interface ClientModule {
  label: string;
  href?: string;
  icon?: string;
  requiredPermission?: string;
  children?: ClientModuleChild[];
  position?: 'bottom';
}

export const clientModules: ClientModule[] = [
  {
    label: "Inicio",
    href: "/client",
    icon: "home",
    requiredPermission: "dashboard:view",
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
    position: "bottom",
  },
  {
    label: "Configuración",
    href: "/client/settings",
    icon: "settings",
    position: "bottom",
  },
];