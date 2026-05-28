"use client";

import { ReactNode } from "react";
import { Navbar, ClientSidebar } from "@components";
import { clientModules } from "@data";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen relative">
      <Navbar isHome={false} showTopBar showClientCenterMenu />

      {/* compensar navbar fixed */}
      <div className="flex pt-36 min-[1138px]:pt-25 relative z-10">
        <ClientSidebar items={clientModules} hasTopBar />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
