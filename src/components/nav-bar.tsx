"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAVBAR_HEIGHT = 72;

export const Navbar = () => {
  const pathname = usePathname();

  const menu = [
    { label: "Catálogo", href: "/catalog" },
    { label: "Ofertas", href: "/offers" },
    { label: "Contacto", href: "/contact-us" },
  ];

  return (
    <header
      className="
        sticky top-0 z-[20]
        w-full border-b
        bg-white backdrop-blur
      "
      style={{ height: NAVBAR_HEIGHT }}
    >
      <nav className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">

        {/* LOGO */}
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-semibold text-[15px] shadow-sm">
            EB
          </div>

          <div className="leading-tight">
            <p className="text-[20px] font-semibold text-gray-800 group-hover:text-gray-900 transition">
              Estilos Boom
            </p>
            <p className="text-[11px] tracking-[3px] text-gray-400 -mt-[2px]">
              BOUTIQUE
            </p>
          </div>
        </Link>

        {/* MENÚ CENTRADO */}
        <ul className="hidden md:flex items-center gap-10 text-[16px] font-medium mx-auto">
          {menu.map((item) => {
            const active = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    relative pb-1
                    transition
                    ${active ? "text-pink-600 font-semibold" : "text-gray-700 hover:text-gray-900"}
                  `}
                >
                  {item.label}

                  {/* Línea de subrayado si está activo */}
                  {active && (
                    <span className="absolute left-0 -bottom-[3px] w-full h-[2px] bg-pink-600 rounded-full"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* BOTÓN LOGIN */}
        <Link
          href="/auth/login"
          className="
            px-5 py-2.5 rounded-lg
            text-white font-semibold text-[15px]
            bg-gradient-to-br from-pink-500 to-orange-400
            shadow-md hover:opacity-90 transition
          "
        >
          Iniciar sesión
        </Link>
      </nav>
    </header>
  );
};
