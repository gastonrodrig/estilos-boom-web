// src/app/(admin)/layout.tsx
'use client';

import { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/atoms";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-[#F6F7F9] text-white p-6">
        <div className="w-full justify-center flex">
          <Logo />
        </div>
        <div className="h-px w-full bg-gray-200 mb-6" />


        <nav className="space-y-3">
          <Link href="/admin/dashboard" className="block hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block hover:underline">
            Usuarios
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
