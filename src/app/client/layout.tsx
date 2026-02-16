// src/app/(client)/layout.tsx
'use client';

import { ReactNode } from "react";
import Link from "next/link";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-pink-400 text-white p-4 flex justify-between">
        <h1 className="text-lg font-bold">Client Panel</h1>
        <nav>
          <Link href="/client/home" className="mr-4 hover:underline">
            Home
          </Link>
          <Link href="/client/profile" className="hover:underline">
            Perfil
          </Link>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>

      {/* Footer */}
      <footer className="bg-pink-400 text-white p-4 text-center">
        © 2026 Cliente
      </footer>
    </div>
  );
}
