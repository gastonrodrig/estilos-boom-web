"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, ChevronDown, LogOut, LayoutDashboard, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/hooks";
import { getUserMenuItems, UserMenuRole } from "@data";
import { ThemeSwitcher } from "../theme-switcher/theme-switcher";

const userMenuIconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  LogOut,
  User,
};

export function AdminHeaderActions() {
  const { user, logout, permissions } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adminFloatingButtonClass = 
    "group flex w-[38px] h-[38px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] backdrop-blur-[8px] transition-all duration-300 hover:bg-[rgba(196,96,127,0.2)] hover:border-[rgba(196,96,127,0.4)] text-[#8B3A52] dark:text-[#ddc0c8] hover:text-[#D6405F] dark:hover:text-[#ffffff] cursor-pointer";

  const adminUserIconClass = "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110";

  const userRole = (user?.role?.toLowerCase() as UserMenuRole) || "client";
  const userMenuItems = getUserMenuItems(userRole);

  const onLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  return (
    <div className="flex items-center gap-[12px]">
      <ThemeSwitcher 
        className={adminFloatingButtonClass}
        iconClassName={adminUserIconClass}
      />
      <div className="relative" ref={userMenuRef}>
        <button
          aria-label="Abrir menú de usuario"
          onClick={() => setUserMenuOpen((prev) => !prev)}
          className={adminFloatingButtonClass}
        >
          <div className="flex items-center">
            <User className={adminUserIconClass} />
            <ChevronDown className="-ml-1 w-3.5 h-3.5 text-current" />
          </div>
        </button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#ffffff] dark:bg-[#1a0e14] shadow-xl text-[#364152] dark:text-[#ddc0c8] md:mt-3 md:w-60 md:rounded-2xl z-50"
            >
              <div className="py-1.5 md:py-2">
                {userMenuItems.map(({ label, href, icon, requiredPermission }) => {
                  if (requiredPermission && !permissions.includes(requiredPermission)) return null;
                  const ItemIcon = userMenuIconMap[icon];

                  return (
                    <Link
                      key={label}
                      href={href}
                      className="mx-1 flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[rgba(139,58,82,0.06)] dark:hover:bg-[rgba(255,255,255,0.05)] md:mx-1.5 md:gap-2.5 md:px-2.5 md:py-2"
                    >
                      {ItemIcon && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(139,58,82,0.08)] dark:bg-[rgba(255,255,255,0.06)] md:h-6 md:w-6">
                          <ItemIcon className="h-3 w-3 text-[#8B3A52] dark:text-[#c4607f] md:h-3.5 md:w-3.5" />
                        </span>
                      )}
                      <span className="text-xs font-medium md:text-sm text-[#8B3A52] dark:text-[#ddc0c8]">{label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mx-1 h-px bg-[rgba(139,58,82,0.08)] dark:bg-[rgba(255,255,255,0.05)] md:mx-1.5" />

              <button
                onClick={onLogout}
                className="mx-1 mb-1 mt-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-lg px-2 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-[rgba(255,0,0,0.1)] md:mx-1.5 md:mb-1.5 md:w-[calc(100%-0.75rem)] md:gap-2.5 md:px-2.5 md:py-2"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 dark:bg-transparent border border-red-200 dark:border-red-900 md:h-6 md:w-6">
                  <LogOut className="h-3 w-3 md:h-3.5 md:w-3.5" />
                </span>
                <span className="text-xs font-medium hover:cursor-pointer md:text-sm">Cerrar Sesión</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
