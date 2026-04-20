export type StorekeeperModule = {
  label: string;
  href?: string;
  icon?: string;
  highlighted?: boolean;
  requiredPermission?: string;
  children?: StorekeeperModule[];
};

export const storekeeperModules: StorekeeperModule[] = [
  {
    label: "Dashboard",
    href: "/storekeeper",
    icon: "dashboard",
  },
];
