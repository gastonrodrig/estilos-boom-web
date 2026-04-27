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
}

export const clientModules: ClientModule[] = [
  {
    label: "Dashboard",
    href: "/client",
    icon: "dashboard",
    requiredPermission: "dashboard:view",
  },
  {
    label: "Gestionar Ordenes",
    icon: "shopping-bag",
    requiredPermission: "orders:view",
    children: [
      {
        label: "Recientes",
        href: "/client/orders/recents",
        requiredPermission: "orders:view",
      },
      {
        label: "En Progreso",
        href: "/client/orders/in-progress",
        requiredPermission: "orders:view",
      },
      {
        label: "Finalizadas",
        href: "/client/orders/finished",
        requiredPermission: "orders:view",
      },
    ],
  },
  {
    label: "Gestionar Cotización",
    href: "/client/quotations",
    icon: "booktext",
    requiredPermission: "quotations:view",
  },
  {
    label: "Gestionar Perfil",
    icon: "contact",
    requiredPermission: "profile:manage",
    children: [
      {
        label: "Información",
        href: "/client/personal-information",
        requiredPermission: "profile:manage",
      },
      {
        label: "Direcciones",
        href: "/client/addresses",
        requiredPermission: "profile:manage",
      },
    ],
  },
];