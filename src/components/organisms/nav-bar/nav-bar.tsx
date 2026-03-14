"use client";

import Link from "next/link";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  LayoutDashboard,
  Package,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/atoms";
import { navbarMenu, getUserMenuItems, UserMenuRole, adminModules, clientModules } from "@data";
import { useAuthStore } from "@hooks";
import { usePathname } from "next/navigation";
import { SearchDrawer } from "../search-drawer";
import { NavDrawer, NavDrawerItem } from "../nav-drawer";

interface NavbarProps {
  isHome?: boolean;
  onSearchOpen?: () => void;
  showTopBar?: boolean;
  showClientCenterMenu?: boolean;
}

export const Navbar = ({
  isHome = false,
  onSearchOpen,
  showTopBar = true,
  showClientCenterMenu = false,
}: NavbarProps) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileGuestMenuOpen, setMobileGuestMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpenPath, setUserMenuOpenPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isUnder1138, setIsUnder1138] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1137px)").matches;
  });
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isClientRoute = pathname.startsWith("/client");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { status, role, onLogout } = useAuthStore();

  const centerMenu = isAdminRoute
    ? []
    : isClientRoute
    ? showClientCenterMenu
      ? navbarMenu
      : []
    : navbarMenu;
  const showCompactClientMenu = isClientRoute && showClientCenterMenu && centerMenu.length > 0;
  const isAuthenticated = status === "authenticated";
  const isAdmin = role === "Administrador";
  const isClient = role === "Cliente";
  const currentUserMenuRole: UserMenuRole | null = isAdmin
    ? "admin"
    : isClient
    ? "client"
    : null;

  const userMenuItems = getUserMenuItems(currentUserMenuRole);
  const userMenuOpen = userMenuOpenPath === pathname;

  const userMenuIconMap = {
    dashboard: LayoutDashboard,
    package: Package,
    user: User,
  };

  const bgClass = isHome
    ? scrolled
      ? "bg-[#f2b6c1]"
      : "bg-transparent"
    : "bg-[#f2b6c1]";

  const textClass = isHome
    ? scrolled
      ? "text-black"
      : "text-white"
    : "text-black";

  const isActive = (href: string) => pathname === href;

  const iconClass =
    "w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110";

  const iconButtonClass =
    "group flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-black/5 hover:cursor-pointer";

  const adminUserButtonClass =
    "group flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-colors duration-200 hover:bg-gray-200 hover:cursor-pointer";

  const adminUserIconClass =
    "h-[18px] w-[18px] text-gray-600 transition-transform duration-200 group-hover:scale-110";

  const menuLinkClass = (href: string) =>
    `transition-colors duration-200 ${
      isActive(href)
        ? "font-semibold border-b-2 pb-1"
        : "hover:opacity-70 font-light"
    }`;

  const drawerItems: NavDrawerItem[] = isAdminRoute
    ? adminModules.map((item) => ({
        label: item.label,
        href: item.href,
        children: item.children?.map((child) => ({
          label: child.label,
          href: child.href,
        })),
      }))
    : isClientRoute
    ? clientModules.map((item) => ({
        label: item.label,
        href: item.href,
        children: item.children?.map((child) => ({
          label: child.label,
          href: child.href,
        })),
      }))
    : centerMenu.map(({ label, href }) => ({
        label,
        href,
      }));

  const showLeftMenuButton =
    isUnder1138 && (isAdminRoute || isAuthenticated);

  const showRightMenuButton =
    isUnder1138 && !isAuthenticated && !isAdminRoute;

  const handleSearchOpen = () => {
    if (onSearchOpen) {
      onSearchOpen();
      return;
    }

    setSearchOpen(true);
  };

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpenPath(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1137px)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsUnder1138(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50">
        {/* Top bar */}
        {showTopBar &&
          (isHome ? (
            <motion.div
              className="w-full bg-[#fffdf9] text-black text-xs md:text-sm text-center py-2 tracking-wide"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              ENVÍO GRATIS EN COMPRAS MAYORES A S/149
            </motion.div>
          ) : (
            <div className="w-full bg-[#fffdf9] text-black text-xs md:text-sm text-center py-2 tracking-wide">
              ENVÍO GRATIS EN COMPRAS MAYORES A S/149
            </div>
          ))}

        {/* Navbar */}
        <motion.div
          className={`${bgClass} ${
            scrolled ? "shadow-md backdrop-blur-md" : ""
          } transition-all duration-300`}
        >
          <nav className="max-w-7xl mx-auto px-4 min-[1135px]:px-6 py-3 min-h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              {showLeftMenuButton && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen((prev) => !prev);
                    setMobileGuestMenuOpen(false);
                  }}
                  className={iconButtonClass}
                >
                  <Menu className={iconClass} />
                </button>
              )}
              <Link href="/">
                {(isAdminRoute || isClientRoute) && isUnder1138 ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/auth-icon.png" alt="Logo" className="h-7 w-auto object-contain" />
                  </>
                ) : (
                  <Logo width={135} height={30} isHome={isHome} />
                )}
              </Link>
            </div>

            {/* Menu Desktop */}
            <ul
              className={`hidden min-[1135px]:flex items-center gap-8 text-md font-medium ${textClass}`}
            >
              {centerMenu.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={menuLinkClass(href)}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Icons */}
            <div className={`flex items-center gap-2 ${textClass}`}>
              {!isAdmin && (
                <button
                  aria-label="Buscar"
                  onClick={handleSearchOpen}
                  className={iconButtonClass}
                >
                  <Search className={iconClass} />
                </button>
              )}

              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <button
                    aria-label="Abrir menú de usuario"
                    onClick={() =>
                      setUserMenuOpenPath((prev) =>
                        prev === pathname ? null : pathname
                      )
                    }
                    className={isAdmin ? adminUserButtonClass : iconButtonClass}
                  >
                    <User className={isAdmin ? adminUserIconClass : iconClass} />
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className={isAdmin ? adminUserButtonClass : iconButtonClass}
                  >
                    <User className={isAdmin ? adminUserIconClass : iconClass} />
                  </Link>
                )}

                <AnimatePresence>
                  {isAuthenticated && userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl text-[#364152] md:mt-3 md:w-60 md:rounded-2xl"
                    >
                      <div className="py-1.5 md:py-2">
                        {userMenuItems.map(({ label, href, icon }) => {
                          const ItemIcon = userMenuIconMap[icon];

                          return (
                            <Link
                              key={label}
                              href={href}
                              className="mx-1 flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 md:mx-1.5 md:gap-2.5 md:px-2.5 md:py-2"
                            >
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 md:h-6 md:w-6">
                                <ItemIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                              </span>
                              <span className="text-xs font-medium md:text-sm">{label}</span>
                            </Link>
                          );
                        })}
                      </div>

                      <div className="mx-1 h-px bg-gray-200 md:mx-1.5" />

                      <button
                        onClick={onLogout}
                        className="mx-1 mb-1 mt-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-lg px-2 py-1.5 text-left text-red-600 hover:bg-red-50 md:mx-1.5 md:mb-1.5 md:w-[calc(100%-0.75rem)] md:gap-2.5 md:px-2.5 md:py-2"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 md:h-6 md:w-6">
                          <LogOut className="h-3 w-3 md:h-3.5 md:w-3.5" />
                        </span>
                        <span className="text-xs font-medium hover:cursor-pointer md:text-sm">Cerrar Sesión</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!isAdmin && (
                <Link href="/wishlist" className={iconButtonClass}>
                  <Heart className={iconClass} />
                </Link>
              )}

              {!isAdmin && (
                <Link href="/cart" className={iconButtonClass}>
                  <ShoppingBag className={iconClass} />
                </Link>
              )}

              {showRightMenuButton && (
                <button
                  onClick={() => {
                    setMobileGuestMenuOpen((prev) => !prev);
                    setMobileDrawerOpen(false);
                  }}
                  className={iconButtonClass}
                >
                  {mobileGuestMenuOpen ? <X className={iconClass} /> : <Menu className={iconClass} />}
                </button>
              )}

            </div>
          </nav>

          {showCompactClientMenu && (
            <div className="min-[1135px]:hidden border-t border-black/10">
              <ul className="flex items-center justify-start gap-6 overflow-x-auto px-6 py-3 whitespace-nowrap">
                {centerMenu.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`text-sm md:text-base transition-colors duration-200 ${
                        isActive(href)
                          ? "font-semibold border-b-2 border-black pb-1"
                          : "font-light hover:opacity-75"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <AnimatePresence>
            {mobileGuestMenuOpen && !showCompactClientMenu && (
              <motion.div
                className={`min-[1135px]:hidden border-t ${bgClass}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <motion.ul
                  className={`flex flex-col gap-4 px-4 py-4 ${textClass}`}
                  initial="closed"
                  animate="open"
                  variants={{
                    open: {
                      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
                    },
                    closed: {
                      transition: { staggerChildren: 0.05, staggerDirection: -1 }
                    }
                  }}
                >
                  {centerMenu.map(({ label, href }) => (
                    <motion.li
                      key={href}
                      variants={{
                        open: { opacity: 1, x: 0 },
                        closed: { opacity: 0, x: -20 }
                      }}
                    >
                      <Link
                        href={href}
                        onClick={() => setMobileGuestMenuOpen(false)}
                        className="text-sm font-light md:text-base"
                      >
                        {label}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}
          </AnimatePresence>

          <NavDrawer
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            items={drawerItems}
            title={isAdminRoute ? "Panel Admin" : "Panel Cliente"}
            widthClass="max-w-[320px]"
            side="left"
          />

          {!onSearchOpen && (
            <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
          )}
        </motion.div>
      </header>
    </>
  );
};
