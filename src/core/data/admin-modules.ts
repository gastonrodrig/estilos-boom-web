// Define la estructura para que TypeScript la reconozca
export interface SidebarModule {
  label: string;
  href?: string;
  icon?: string;
  requiredRoles?: string[]; // <--- Importante: aquí le decimos que existe
  children?: {
    label: string;
    href: string;
    requiredRoles?: string[]; // <--- También para los hijos
  }[];
}

// Aplica el tipo SidebarModule[] al array
export const adminModules: SidebarModule[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "dashboard",
    requiredRoles: ["Administrador"], // <-- Agrega el permiso correspondiente
  },
  {
    label: "Gestionar Productos",
    icon: "package",
     // El padre necesita permiso para verse
    children: [
      {
        label: "Categorías",
        href: "/admin/categories",
        requiredRoles: ["Administrador"],
      },
      {
        label: "Productos",
        href: "/admin/products",
        requiredRoles: ["Administrador"],
      },
    ],
  },
  {
      label: "Gestionar Insumos",
      icon: "spool", // ✂️ Evoca confección, telas e hilados
      href: "/admin/supplies",
      requiredRoles: ["Administrador"],
    },
  {
    label: "Produccion",
    icon: "factory",
    children: [
      {
        label: "Crear Orden de Produccion",
        href: "/admin/production/plan",
        requiredRoles: ["Administrador"],
      },
      {
        label: "Seguimiento de Ordenes",
        href: "/admin/production/details",
        requiredRoles: ["Administrador"],
      },
      {
        label: "Ordenes Completadas",
        href: "/admin/production/complete",
        requiredRoles: ["Administrador"],
      },
    ],
  },
  {
    label: "Abastecimiento",
    icon: "store",
    children: [
      {
        label: "Crear Ordenes de Pre-Compra",
        href: "/admin/storehouse",
        requiredRoles: ["Administrador"],
      },
      {
        label: "Seguimiento de Ordenes",
        href: "/admin/storehouse/details",
        requiredRoles: ["Administrador"],
      },
      {
        label: "Ordenes Completas",
        href: "/admin/storehouse/complete",
        requiredRoles: ["Administrador"],
      },
      
    ],
  },
  {
    label: "Gestionar Ordenes",
    icon: "shopping-bag",
    requiredRoles: ["Administrador"],
    children: [
      {
        label: "Recientes",
        href: "/admin/recents",
        requiredRoles: ["Administrador"],
      },
      {
        label: "En Progreso",
        href: "/admin/orders/in-progress",
        requiredRoles: ["Administrador"],
      },
      {
        label: "Finalizadas",
        href: "/admin/orders/finished",
        requiredRoles: ["Administrador"],
      },
    ],
  },
  {
    label: "Gestionar Cotización",
    href: "/admin/quotations",
    icon: "booktext",
    requiredRoles: ["Administrador"],
  },
  {
    label: "Gestionar Pagos",
    href: "/admin/payments",
    icon: "banknote",
    requiredRoles: ["Administrador"],
  },
  {
      label: "Gestionar Facturas",
      icon: "notepad-text", // ✂️ Evoca confección, telas e hilados
      href: "/admin/invoice",
      requiredRoles: ["Administrador"],
  },
  {
      label: "Gestionar Inventario",
      icon: "notepad-text", // ✂️ Evoca confección, telas e hilados
      requiredRoles: ["Administrador"],
      children: [
      {
        label: "Stock Actual",
        href: "/admin/movements/stock",
        requiredRoles: ["Administrador"],
      },
      {
        label: "Movimientos",
        href: "/admin/invoice", 
        requiredRoles: ["Administrador"],
      },
      {
        label: "Historial de movimientos",
        href: "/admin/movements", 
        requiredRoles: ["Administrador"],
      }
    
    ],
  },
  {
    label: "Gestionar Clientes",
    icon: "contact",
    requiredRoles: ["Administrador"],
    children: [
      {
        label: "Persona",
        href: "/admin/clients/persons",
        requiredRoles: ["Administrador"],
      },
      {
        label: "Empresa",
        href: "/admin/clients/companies",
        requiredRoles: ["Administrador"],
      },
      {
        label: "Proveedores",
        href: "/admin/suppliers",
        requiredRoles: ["Administrador"],
      },
      {
        label: "Talleres",
        href: "/admin/workshops",
        requiredRoles: ["Administrador"],
      },
    ],
  },
  {
    label: "Gestionar Trabajadores",
    icon: "briefcase", 
    children: [
      {
        label: "Trabajadores",
        href: "/admin/workers/worker",
      },
      {
        label: "Roles / Tipos",
        href: "/admin/workers/WorkerType",
      },
    ],
  },
  {
    label: "Visualizar Reseñas",
    href: "/admin/reviews",
    icon: "eye",
    requiredRoles: ["Administrador"],
  },
  {
    label: "Usuarios",
    href: "/admin/users-roles",
    icon: "users",
  },
];