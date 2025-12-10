"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, PackageSearch, Settings, Tag } from "lucide-react";

export function SidebarAdmin() {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/admin" },
    { name: "Ventas", icon: <Tag size={18} />, href: "/admin/sales" },
    { name: "Productos", icon: <ShoppingCart size={18} />, href: "/admin/products" },

    // ⭐ NUEVO MENÚ: ORDERS
    { name: "Orders", icon: <PackageSearch size={18} />, href: "/admin/orders" },

    { name: "Configuración", icon: <Settings size={18} />, href: "/admin/settings" },
  ];

  return (
    <aside className="w-60 bg-gradient-to-b from-pink-600 to-pink-700 text-white min-h-screen py-6 px-4">
      <h2 className="text-xl font-semibold px-2 mb-6">Estilos Boom</h2>

      <nav className="space-y-1">
        {menu.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition
                ${active ? "bg-white/20 font-semibold" : "hover:bg-white/10"}
              `}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
