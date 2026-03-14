"use client";

import { ReactNode } from "react";
import { Navbar, Sidebar } from "@components";
import { clientModules } from "@data";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar isHome={false} showTopBar showClientCenterMenu />

      {/* compensar navbar fixed */}
      <div className="flex pt-36 min-[1138px]:pt-25">
        <Sidebar items={clientModules} hasTopBar />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
