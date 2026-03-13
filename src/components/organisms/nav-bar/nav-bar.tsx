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
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/atoms";
import { navbarMenu, getUserMenuItems, UserMenuRole } from "@data";
import { useAuthStore } from "@hooks";
import { usePathname } from "next/navigation";

interface NavbarProps {
  isHome?: boolean;
  onSearchOpen?: () => void;
  showTopBar?: boolean;
}

export const Navbar = ({
  isHome = false,
  onSearchOpen,
  showTopBar = true,
}: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isPrivateRoute = pathname.startsWith("/admin") || pathname.startsWith("/client");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { status, role, onLogout } = useAuthStore();

  const centerMenu = isPrivateRoute ? [] : navbarMenu;
  const isAuthenticated = status === "authenticated";
  const isAdmin = role === "Administrador";
  const isClient = role === "Cliente";
  const currentUserMenuRole: UserMenuRole | null = isAdmin
    ? "admin"
    : isClient
    ? "client"
    : null;

  const userMenuItems = getUserMenuItems(currentUserMenuRole);

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

  useEffect(() => {
    setUserMenuOpen(false);
  }, [pathname]);

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
            <Link href="/">
              <Logo width={135} height={30} isHome={isHome} />
            </Link>

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
                  onClick={onSearchOpen}
                  className={iconButtonClass}
                >
                  <Search className={iconClass} />
                </button>
              )}

              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <button
                    aria-label="Abrir menú de usuario"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className={iconButtonClass}
                  >
                    <div className="flex items-center gap-1">
                      <User className={iconClass} />
                      <ChevronDown className="w-3.5 h-3.5 text-current" />
                    </div>
                  </button>
                ) : (
                  <div className="relative flex items-center h-full justify-center">
                    <button
                      aria-label="Abrir menú de usuario"
                      className={isAdmin ? adminUserButtonClass : iconButtonClass}
                      onClick={() => setIsOpen((prev) => !prev)}
                    >
                      <div className="flex items-center gap-1">
                        <User className={isAdmin ? adminUserIconClass : iconClass} />
                        <ChevronDown className="w-3.5 h-3.5 text-current" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl transition-all duration-200">
                        <Link
                          href="/auth/login"
                          onClick={() => setIsOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Iniciar sesión
                        </Link>
                        <Link
                          href="/auth/register"
                          onClick={() => setIsOpen(false)}
                          className="mt-1 block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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

              {!isAdmin && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`${iconButtonClass} min-[1135px]:hidden`}
                >
                  {mobileMenuOpen ? (
                    <X className={iconClass} />
                  ) : (
                    <Menu className={iconClass} />
                  )}
                </button>
              )}
            </div>
          </nav>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
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
                        onClick={() => setMobileMenuOpen(false)}
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
    </>
  );
};
