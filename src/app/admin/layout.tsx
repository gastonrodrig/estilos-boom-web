// src/app/(admin)/layout.tsx
'use client';

import { ReactNode } from "react";
import Link from "next/link";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex justify-between">
        <h1 className="text-lg font-bold">Admin Panel</h1>
        <nav>
          <Link href="/admin/dashboard" className="mr-4 hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/users" className="hover:underline">
            Usuarios
          </Link>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 p-6 bg-gray-100">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2026 Admin Panel
      </footer>
    </div>
  );
}
