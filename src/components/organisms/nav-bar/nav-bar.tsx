"use client";

import Link from "next/link";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/atoms";
import { navbarMenu } from "@/core/data";

interface NavbarProps {
  isHome?: boolean;
  onSearchOpen?: () => void;
}

export const Navbar = ({ isHome = false, onSearchOpen }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();

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
    "w-5 h-5 cursor-pointer transition-transform duration-200 hover:scale-110";

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

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50">
        {/* Top bar */}
        {isHome ? (
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
        )}

        {/* Navbar */}
        <motion.div
          className={`${bgClass} ${
            scrolled ? "shadow-md backdrop-blur-md" : ""
          } transition-all duration-300`}
        >
          <nav className="max-w-7xl mx-auto px-4 min-[1135px]:px-6 py-3 min-h-[64px] flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <Logo width={135} height={30} isHome={isHome} />
            </Link>

            {/* Menu Desktop */}
            <ul
              className={`hidden min-[1135px]:flex items-center gap-8 text-md font-medium ${textClass}`}
            >
              {navbarMenu.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={menuLinkClass(href)}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Icons */}
            <div className={`flex items-center gap-4 ${textClass}`}>
              {/* Search */}
              <button
                aria-label="Buscar"
                onClick={onSearchOpen}
              >
                <Search className={iconClass} />
              </button>

              <Link href="/auth/login">
                <User className={iconClass} />
              </Link>

              <Link href="/wishlist">
                <Heart className={iconClass} />
              </Link>

              <Link href="/cart">
                <ShoppingBag className={iconClass} />
              </Link>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-[1135px]:hidden"
              >
                {mobileMenuOpen ? (
                  <X className={iconClass} />
                ) : (
                  <Menu className={iconClass} />
                )}
              </button>
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
                  {navbarMenu.map(({ label, href }) => (
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
