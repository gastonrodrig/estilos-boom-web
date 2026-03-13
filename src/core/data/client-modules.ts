export const clientModules = [
  {
    label: "Dashboard",
    href: "/client",
    icon: "dashboard",
  },
  {
    label: "Gestionar Ordenes",
    icon: "shopping-bag",
    children: [
      {
        label: "Recientes",
        href: "/client/orders/recents",
      },
      {
        label: "En Progreso",
        href: "/client/orders/in-progress",
      },
      {
        label: "Finalizadas",
        href: "/client/orders/finished",
      },
    ],
  },
  {
    label: "Gestionar Cotización",
    href: "/client/quotations",
    icon: "booktext",
  },
  {
    label: "Gestionar Perfil",
    icon: "contact",
    children: [
      {
        label: "Información",
        href: "/client/personal-information",
      },
      {
        label: "Direcciones",
        href: "/client/addresses",
      },
    ],
  },
];