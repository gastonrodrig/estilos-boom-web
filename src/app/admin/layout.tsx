"use client";

import { SidebarAdmin } from "./_components/sidebar-admin";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin-session");
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="w-full flex items-center justify-between bg-white border-b px-6 py-3 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">
            Panel de Administración
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              <User size={20} className="text-pink-600" />
              <div className="text-sm leading-tight">
                <p className="font-semibold">Admin</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="ml-4 text-sm px-4 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-orange-400 text-white font-medium shadow hover:opacity-90"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
