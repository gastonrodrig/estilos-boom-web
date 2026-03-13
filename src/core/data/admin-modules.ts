export const adminModules = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "dashboard",
  },
  {
    label: "Gestionar Productos",
    icon: "package",
    children: [
      {
        label: "Categorías",
        href: "/admin/categories",
        highlighted: true,
      },
      {
        label: "Productos",
        href: "/admin/products",
      },
    ],
  },
  {
    label: "Almacén",
    href: "/admin/storehouse",
    icon: "store",
  },
  {
    label: "Gestionar Ordenes",
    icon: "shopping-bag",
    children: [
      {
        label: "Recientes",
        href: "/admin/recents",
      },
      {
        label: "En Progreso",
        href: "/admin/orders/in-progress",
      },
      {
        label: "Finalizadas",
        href: "/admin/orders/finished",
      },
    ],
  },
  {
    label: "Gestionar Cotización",
    href: "/admin/quotations",
    icon: "booktext",
  },
  {
    label: "Gestionar Pagos",
    href: "/admin/payments",
    icon: "banknote",
  },
  {
    label: "Gestionar Clientes",
    icon: "contact",
    children: [
      {
        label: "Persona",
        href: "/admin/clients/persons",
      },
      {
        label: "Empresa",
        href: "/admin/clients/companies",
      },
    ],
  },
  {
    label: "Visualizar Reseñas",
    href: "/admin/reviews",
    icon: "eye",
  },
];