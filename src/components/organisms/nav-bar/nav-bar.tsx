"use client";

import Link from "next/link";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Package,
  LogOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/atoms";
import { navbarMenu, getUserMenuItems, UserMenuRole, adminModules, clientModules, storekeeperModules } from "@data";
import { useAuthStore } from "@hooks";
import { usePathname } from "next/navigation";
import { SearchDrawer } from "../search-drawer";
import { NavDrawer, NavDrawerItem } from "../nav-drawer";
import { CheckoutDrawer } from "../checkout-drawer";
import { useCartStore } from "@/hooks/cart/use-cart-store";
import { ThemeSwitcher } from "../theme-switcher/theme-switcher";

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
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isUnder1138 = useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia("(max-width: 1137px)");
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(max-width: 1137px)").matches,
    () => false
  );
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isClientRoute = pathname.startsWith("/client");
  const isStorekeeperRoute = pathname.startsWith("/storekeeper");
  const isBackofficeRoute = isAdminRoute || isStorekeeperRoute;
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { status, role, onLogout } = useAuthStore();
  const { loadCart, items } = useCartStore();
  const cartItemsCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  const centerMenu = isBackofficeRoute
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
  const isStorekeeper = role === "Almacenero";
  const isBackofficeRole = isAdmin || isStorekeeper;
  const hasSession =
    isAuthenticated || status === "first-login-password" || !!role;
  const isClientPanelNavbar = showClientCenterMenu;
  const isPublicNavbar = !isAdminRoute && !isClientPanelNavbar && !isStorekeeperRoute;
  const isPanelNavbar = isAdminRoute || isClientPanelNavbar || isStorekeeperRoute;
  const currentUserMenuRole: UserMenuRole | null = isAdmin
    ? "admin"
    : isClient
    ? "client"
    : isStorekeeper
    ? "storekeeper"
    : null;

  const userMenuItems = getUserMenuItems(currentUserMenuRole);

  const userMenuIconMap = {
    dashboard: LayoutDashboard,
    package: Package,
    user: User,
  };

  const bgClass = isBackofficeRoute
    ? "bg-transparent"
    : isHome
    ? scrolled
      ? "bg-gradient-to-r from-[#FAF9F6]/90 via-white/80 to-[#FAF9F6]/90 dark:from-[#0A0508]/70 dark:via-[#40202D]/40 dark:to-[#0A0508]/70 backdrop-blur-[40px] border-b border-black/5 dark:border-white/5 shadow-inner"
      : "bg-transparent"
    : "bg-gradient-to-r from-[#FAF9F6]/90 via-white/80 to-[#FAF9F6]/90 dark:from-[#0A0508]/70 dark:via-[#40202D]/40 dark:to-[#0A0508]/70 backdrop-blur-[40px] border-b border-black/5 dark:border-white/5 shadow-inner";

  const textClass = isBackofficeRoute
    ? "text-[#40202D] dark:text-gray-200"
    : isHome
    ? scrolled
      ? "text-[#594246] dark:text-gray-200"
      : "text-white"
    : "text-[#594246] dark:text-gray-200";

  const isActive = (href: string) => pathname === href;

  const iconClass =
    "w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110";

  const adminFloatingButtonClass = 
    "group flex w-[38px] h-[38px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] backdrop-blur-[8px] transition-all duration-300 hover:bg-[rgba(196,96,127,0.2)] hover:border-[rgba(196,96,127,0.4)] text-[#8B3A52] dark:text-[#ddc0c8] hover:text-[#D6405F] dark:hover:text-[#ffffff] cursor-pointer";

  const iconButtonClass = isBackofficeRoute
    ? adminFloatingButtonClass
    : "group flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[#D6405F]/10 dark:hover:bg-[#F8BBD0]/10 hover:text-[#D6405F] dark:hover:text-[#F8BBD0] hover:cursor-pointer";

  const adminUserButtonClass = isBackofficeRoute 
    ? adminFloatingButtonClass
    : "group flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/10 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-[#D6405F]/20 dark:hover:border-[#D6405F]/40 hover:cursor-pointer shadow-sm";

  const adminUserIconClass =
    "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110";

  const menuLinkClass = (href: string) =>
    `transition-all duration-300 ${
      isActive(href)
        ? "font-bold text-[#D6405F] dark:text-[#F8BBD0] border-b-2 border-[#D6405F] dark:border-[#F8BBD0] pb-1 drop-shadow-[0_0_8px_rgba(214,64,95,0.4)]"
        : "hover:text-[#D6405F] dark:hover:text-[#F8BBD0] font-light"
    }`;

  const drawerItems: NavDrawerItem[] = isAdminRoute
  ? adminModules
      .filter((item) => !item.requiredRoles || (role && item.requiredRoles.includes(role)))
      .map((item) => ({
        label: item.label,
        href: item.href || "",
        // 2. Filtramos también los hijos de cada módulo
        children: item.children
          ?.filter((child) => !child.requiredRoles || (role && child.requiredRoles.includes(role)))
          .map((child) => ({
            label: child.label,
            href: child.href || "",
          })),
      }))

  : isStorekeeperRoute
  ? storekeeperModules
      .filter((item) => !item.requiredRoles || (role && item.requiredRoles.includes(role)))
      .map((item) => ({
        label: item.label,
        href: item.href || "",
        children: item.children
          ?.filter((child) => !child.requiredRoles || (role && child.requiredRoles.includes(role)))
          .map((child) => ({
            label: child.label,
            href: child.href || "",
          })),
      }))

  : isClientRoute
  ? clientModules
      .filter((item) => !item.requiredRoles || (role && item.requiredRoles.includes(role)))
      .map((item) => ({
        label: item.label,
        href: item.href || "",
        children: item.children
          ?.filter((child) => !child.requiredRoles || (role && child.requiredRoles.includes(role)))
          .map((child) => ({
            label: child.label,
            href: child.href || "",
          })),
      }))

  : centerMenu.map(({ label, href }) => ({
      label,
      href,
    }));

  const isAuthenticatedOutsidePanels = isPublicNavbar && hasSession;
  const useHomeAuthenticatedLogo = isHome && isPublicNavbar && hasSession;
  const compactLogoSrc = useHomeAuthenticatedLogo
    ? "/assets/logo-eb.png"
    : "/assets/auth-icon.png";

  const useCompactMobileLogo =
    isUnder1138 && (isPanelNavbar || isAuthenticatedOutsidePanels);

  const showLeftMenuButton =
    isUnder1138 && isPanelNavbar;

  const showRightMenuButton =
    isUnder1138 && isPublicNavbar;

  const handleSearchOpen = () => {
    if (onSearchOpen) {
      onSearchOpen();
      return;
    }

    setSearchOpen(true);
  };

  useEffect(() => {
    if (isBackofficeRole) return;
    void loadCart();
  }, [isBackofficeRole, loadCart]);

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
        setUserMenuOpen(false);
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className={`${isBackofficeRoute ? "sticky" : "fixed"} top-0 left-0 w-full z-50`}>

        {/* Navbar */}
        <motion.div
          className={`${bgClass} ${
            scrolled ? "shadow-md backdrop-blur-md" : ""
          } transition-all duration-300`}
        >
          <nav className="max-w-7xl mx-auto px-4 min-[1135px]:px-6 py-3 min-h-16 flex items-center justify-between relative">
            {/* Left Button */}
            {showLeftMenuButton && (
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setMobileDrawerOpen((prev) => !prev);
                    setMobileGuestMenuOpen(false);
                  }}
                  className={iconButtonClass}
                >
                  <Menu className={iconClass} />
                </button>
              </div>
            )}

            {/* Logo */}
            {!isBackofficeRoute && (
              <div className="flex items-center gap-2">
                <Link href="/">
                  {useCompactMobileLogo ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={compactLogoSrc} alt="Logo" className="h-7 w-auto object-contain" />
                    </>
                  ) : (
                    <Logo width={isHome ? 135 : 135} height={isHome ? 30 : 30} isHome={isHome} />
                  )}
                </Link>
              </div>
            )}

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
            <div className={`flex items-center ${isBackofficeRoute ? "w-full justify-end gap-[10px] pr-[24px]" : "gap-2"} ${textClass}`}>
              {!isBackofficeRole && (
                <button
                  aria-label="Buscar"
                  onClick={handleSearchOpen}
                  className={iconButtonClass}
                >
                  <Search className={iconClass} />
                </button>
              )}

              {/* Theme Switcher and Admin User logic moved to data-table.tsx via AdminHeaderActions */}

              {!isBackofficeRoute && (
                <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <button
                    aria-label="Abrir menú de usuario"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className={isBackofficeRoute ? adminUserButtonClass : iconButtonClass}
                  >
                    <div className="flex items-center">
                      <User className={isBackofficeRoute ? adminUserIconClass : iconClass} />
                      <ChevronDown className="-ml-1 w-3.5 h-3.5 text-current" />
                    </div>
                  </button>
                ) : (
                  <div className="relative flex items-center h-full justify-center">
                    <button
                      aria-label="Abrir menú de usuario"
                      className={isBackofficeRoute ? adminUserButtonClass : iconButtonClass}
                      onClick={() => setIsOpen((prev) => !prev)}
                    >
                      <div className="flex items-center">
                        <User className={isBackofficeRoute ? adminUserIconClass : iconClass} />
                        <ChevronDown className="-ml-1 w-3.5 h-3.5 text-current" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl transition-all duration-200">
                        <Link
                          href="/auth/login"
                          onClick={() => setIsOpen(false)}
                          className="block rounded-md px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 md:text-sm"
                        >
                          Iniciar sesión
                        </Link>
                        <Link
                          href="/auth/register"
                          onClick={() => setIsOpen(false)}
                          className="mt-1 block rounded-md px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 md:text-sm"
                        >
                          Regístrate Ahora
                        </Link>
                      </div>
                    )}
                  </div>
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
                        {userMenuItems.map(({ label, href, icon, requiredRoles }) => {
                          // VALIDACIÓN NUEVA:
                          if (requiredRoles && role && !requiredRoles.includes(role)) return null;
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
              )}

              {!isBackofficeRole && (
                <Link href="/wishlist" className={iconButtonClass}>
                  <Heart className={iconClass} />
                </Link>
              )}

              {!isBackofficeRole && (
                <button
                  aria-label="Abrir carrito"
                  onClick={() => setCartDrawerOpen(true)}
                  className={`${iconButtonClass} relative`}
                >
                  <ShoppingBag className={iconClass} />
                  {cartItemsCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold leading-none text-white">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
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

        </motion.div>
      </header>

      <NavDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        items={drawerItems}
        title={isAdminRoute ? "Panel Admin" : isStorekeeperRoute ? "Panel Almacén" : "Panel Cliente"}
        widthClass="max-w-[320px]"
        side="left"
      />

      {!onSearchOpen && (
        <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
      )}

      <CheckoutDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
};
