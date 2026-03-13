"use client";

import { ReactNode } from "react";
import { Navbar, Sidebar } from "@components";
import { adminModules } from "@data";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-white">
      <Navbar isHome={false} showTopBar={false} />

      <Sidebar items={adminModules} />

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
