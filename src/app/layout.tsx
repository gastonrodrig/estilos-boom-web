"use client";

import "./globals.css";
import { Navbar, Footer } from "@components";
import { CartSidebar } from "./(public)/cart/_components";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-white">

        {/* ❌ Ocultar Navbar en admin */}
        {!isAdmin && <Navbar />}

        <main className="flex-1 bg-white">
          {children}
        </main>

        {/* ❌ Ocultar Footer en admin */}
        {!isAdmin && <Footer />}

        {/* ❌ Ocultar Sidebar en admin */}
        {!isAdmin && <CartSidebar />}
      </body>
    </html>
  );
}
