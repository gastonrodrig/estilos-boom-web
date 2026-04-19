type StorekeeperModuleChild = {
  label: string;
  href: string;
  highlighted?: boolean;
  requiredPermission?: string; // <--- AGREGAR
};

type StorekeeperModule = {
  label: string;
  href?: string;
  icon?: string;
  requiredPermission?: string; // <--- AGREGAR
  children?: StorekeeperModuleChild[];
};

export const storekeeperModules: StorekeeperModule[] = [
  {
    label: "Dashboard",
    href: "/storekeeper",
    icon: "dashboard",
    requiredPermission: "dashboard:view", // <--- ASIGNAR EL PERMISO
  },
  // Si agregas más módulos aquí luego, ya tendrán el campo listo
];