export type StorekeeperModule = {
  label: string;
  href?: string;
  icon?: string;
  highlighted?: boolean;
  requiredRoles?: string[];
  children?: StorekeeperModule[];
};

export const storekeeperModules: StorekeeperModule[] = [
  {
    label: "Panel General",
    icon: "dashboard",
    href: "storekeeper/warehouse/dashboard",
    requiredRoles: ["Almacenero"],
  },
  {
    label: "Recepciones",
    icon: "inventory",
    href: "/storekeeper/warehouse/receptions",
    requiredRoles: ["Almacenero"],
  },
  {
    label: "Movimientos de Prendas",
    icon: "warehouse",
    href: "/storekeeper/warehouse/transfers",
    requiredRoles: ["Almacenero"],
  },
];
