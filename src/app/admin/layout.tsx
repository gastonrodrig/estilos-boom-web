"use client";

import { ReactNode } from "react";
import { Navbar, Sidebar } from "@components";
import { adminModules } from "@data";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Navbar isHome={false} showTopBar={false} />

      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar items={adminModules} />

        <main className="flex-1 overflow-y-auto bg-background custom-scrollbar">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}