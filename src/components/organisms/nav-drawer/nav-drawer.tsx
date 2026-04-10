"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Drawer } from "@/components/atoms";

export interface NavDrawerChildItem {
  label: string;
  href: string;
}

export interface NavDrawerItem {
  label: string;
  href?: string;
  children?: NavDrawerChildItem[];
}

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  items: NavDrawerItem[];
  title: string;
  widthClass?: string;
  side?: "left" | "right";
}

export const NavDrawer = ({
  open,
  onClose,
  items,
  title,
  widthClass = "max-w-[320px]",
  side = "left",
}: NavDrawerProps) => {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const isPathActive = (href: string) => {
    const isDashboardRoute = href === "/admin" || href === "/client" || href === "/storekeeper";

    if (isDashboardRoute) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleToggleSection = (label: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleNavigate = () => {
    setOpenSections({});
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} widthClass={widthClass} side={side}>
      <div className="h-full overflow-y-auto bg-white">
        <div className="border-b border-black/10 px-5 py-4">
          <h3 className="text-lg font-light text-[#5B283A]">{title}</h3>
        </div>

        <ul className="space-y-1.5 px-3 py-3">
          {items.map((item) => {
            const hasChildren = !!item.children?.length;

            if (hasChildren) {
              const hasActiveChild = item.children!.some((child) => isPathActive(child.href));
              const isOpen = openSections[item.label] ?? hasActiveChild;

              return (
                <li key={item.label}>
                  <button
                    onClick={() => handleToggleSection(item.label)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all hover:bg-[#f8eef2] ${
                      hasActiveChild
                        ? "bg-[#f8eef2] font-medium text-[#5B283A]"
                        : "font-normal text-gray-800"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="ml-4 mt-1 space-y-1 border-l-2 border-[#e8c6d0] pl-3">
                      {item.children!.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={handleNavigate}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              isPathActive(child.href)
                                ? "bg-[#f8eef2] font-medium text-[#5B283A]"
                                : "font-light text-gray-800 hover:bg-[#f8eef2] hover:text-[#5B283A]"
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            }

            if (!item.href) return null;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={handleNavigate}
                  className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isPathActive(item.href)
                      ? "bg-[#f8eef2] font-medium text-[#5B283A]"
                      : "font-light text-gray-800 hover:bg-[#f8eef2] hover:text-[#5B283A]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </Drawer>
  );
};
