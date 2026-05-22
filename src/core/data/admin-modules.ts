// Define la estructura para que TypeScript la reconozca
export interface SidebarModule {
  label: string;
  href?: string;
  icon?: string;
  requiredPermission?: string; // <--- Importante: aquí le decimos que existe
  children?: {
    label: string;
    href: string;
    requiredPermission?: string; // <--- También para los hijos
  }[];
}

// Aplica el tipo SidebarModule[] al array
export const adminModules: SidebarModule[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "dashboard",
    requiredPermission: "dashboard:view", // <-- Agrega el permiso correspondiente
  },
  {
    label: "Gestionar Productos",
    icon: "package",
     // El padre necesita permiso para verse
    children: [
      {
        label: "Categorías",
        href: "/admin/categories",
        requiredPermission: "categories:view",
      },
      {
        label: "Productos",
        href: "/admin/products",
        requiredPermission: "products:view",
      },
    ],
  },
  {
      label: "Gestionar Insumos",
      icon: "spool", // ✂️ Evoca confección, telas e hilados
      href: "/admin/supplies",
      requiredPermission: "products:view",
    },
  {
    label: "Produccion",
    icon: "factory",
    children: [
      {
        label: "Crear Orden de Produccion",
        href: "/admin/production/plan",
        requiredPermission: "orders:view",
      },
      {
        label: "Seguimiento de Ordenes",
        href: "/admin/production/details",
        requiredPermission: "orders:view",
      },
      {
        label: "Ordenes Completadas",
        href: "/admin/production/complete",
        requiredPermission: "orders:view",
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
        requiredPermission: "orders:view",
      },
      {
        label: "Seguimiento de Ordenes",
        href: "/admin/storehouse/details",
        requiredPermission: "orders:view",
      },
      {
        label: "Ordenes Completas",
        href: "/admin/storehouse/complete",
        requiredPermission: "orders:view",
      },
      
    ],
  },
  {
    label: "Gestionar Ordenes",
    icon: "shopping-bag",
    requiredPermission: "orders:view",
    children: [
      {
        label: "Recientes",
        href: "/admin/recents",
        requiredPermission: "orders:view",
      },
      {
        label: "En Progreso",
        href: "/admin/orders/in-progress",
        requiredPermission: "orders:view",
      },
      {
        label: "Finalizadas",
        href: "/admin/orders/finished",
        requiredPermission: "orders:view",
      },
    ],
  },
  {
    label: "Gestionar Cotización",
    href: "/admin/quotations",
    icon: "booktext",
    requiredPermission: "quotations:view",
  },
  {
    label: "Gestionar Pagos",
    href: "/admin/payments",
    icon: "banknote",
    requiredPermission: "payments:view",
  },
  {
      label: "Gestionar Facturas",
      icon: "notepad-text", // ✂️ Evoca confección, telas e hilados
      href: "/admin/invoice",
      requiredPermission: "products:view",
  },
  {
      label: "Gestionar Inventario",
      icon: "notepad-text", // ✂️ Evoca confección, telas e hilados
      requiredPermission: "products:view",
      children: [
      {
        label: "Stock Actual",
        href: "/admin/movements",
        requiredPermission: "orders:view",
      },
      {
        label: "Movimientos",
        href: "/admin/invoice", 
        requiredPermission: "orders:view",
      },
      {
        label: "Historial de movimientos",
        href: "/admin/invoice", 
        requiredPermission: "orders:view",
      }
    
    ],
  },
  {
    label: "Gestionar Clientes",
    icon: "contact",
    requiredPermission: "clients:view",
    children: [
      {
        label: "Persona",
        href: "/admin/clients/persons",
        requiredPermission: "clients:view",
      },
      {
        label: "Empresa",
        href: "/admin/clients/companies",
        requiredPermission: "clients:view",
      },
      {
        label: "Proveedores",
        href: "/admin/suppliers",
        requiredPermission: "clients:view",
      },
      {
        label: "Talleres",
        href: "/admin/workshops",
        requiredPermission: "clients:view",
      },
    ],
  },
  {
    label: "Visualizar Reseñas",
    href: "/admin/reviews",
    icon: "eye",
    requiredPermission: "reviews:view",
  },
  {
    label: "Usuarios y Roles",
    href: "/admin/users-roles",
    icon: "users",
  },
];