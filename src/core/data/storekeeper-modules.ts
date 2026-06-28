export type StorekeeperModule = {
  label: string;
  href?: string;
  icon?: string;
  badge?: number;
  highlighted?: boolean;
  requiredRoles?: string[];
  children?: StorekeeperModule[];
};

export const storekeeperModules: StorekeeperModule[] = [
  {
    label: "Panel General",
    icon: "dashboard",
    href: "/storekeeper/warehouse/dashboard",
    requiredRoles: ["Almacenero", "Almacenero Boom", "Almacenero Tienda"],
  },
  {
    label: "Insumos",
    icon: "spool",
    href: "/storekeeper/warehouse/supplies",
    requiredRoles: ["Almacenero", "Almacenero Boom"],
  },
  {
    label: "Movimientos",
    icon: "warehouse",
    href: "/storekeeper/warehouse/transfers",
    requiredRoles: ["Almacenero", "Almacenero Boom", "Almacenero Tienda"],
  },
];
