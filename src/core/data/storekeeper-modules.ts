type StorekeeperModuleChild = {
  label: string;
  href: string;
  highlighted?: boolean;
};

type StorekeeperModule = {
  label: string;
  href?: string;
  icon?: string;
  children?: StorekeeperModuleChild[];
};

export const storekeeperModules: StorekeeperModule[] = [
  {
    label: "Dashboard",
    href: "/storekeeper",
    icon: "dashboard",
  },
];
