"use client";

import { ReactNode } from "react";
import { Navbar, Sidebar } from "@components";
import { adminModules } from "@data";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar isHome={false} showTopBar={false} />

      {/* compensar navbar fixed */}
      <div className="flex pt-16 ">
        <Sidebar items={adminModules} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}