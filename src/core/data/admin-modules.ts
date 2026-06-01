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
    label: "Órdenes de Venta",
    icon: "shopping-bag",
    requiredRoles: ["Administrador"],
    children: [
      {
        label: "Órdenes de Venta",
        href: "/admin/orders/history",
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
        label: "Documentos y Movimientos",
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
  {
    label: "Gestionar Movimientos",
    icon: "arrow-right-left",
    children: [
      {
        label: "Panel General",
        href: "/admin/warehouse/dashboard",
      },
      {
        label: "Recepciones",
        href: "/admin/warehouse/receptions",
      },
      {
        label: "Movimientos de productos",
        href: "/admin/warehouse/transfers",
      },
      {
        label: "Historial",
        href: "/admin/warehouse/history",
      },
    ],
  },
];