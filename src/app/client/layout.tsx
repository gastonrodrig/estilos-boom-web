"use client";

import { ReactNode } from "react";
import { Navbar, ClientSidebar } from "@components";
import { clientModules } from "@data";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* MAGICAL BACKGROUND IMAGE (DARK MODE ONLY) */}
      <div className="absolute inset-0 z-[-1] hidden dark:block overflow-hidden bg-[#2d0a1e] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.80] bg-cover bg-center bg-no-repeat blur-[12px] scale-110" style={{ backgroundImage: "url('/assets/FloresRosadas.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8688a]/20 via-[#f0a0c0]/15 to-transparent mix-blend-overlay blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d0a1e] via-[#2d0a1e]/50 to-[#2d0a1e]/80" />
      </div>

      {/* MAGICAL BACKGROUND (LIGHT MODE) */}
      <div className="absolute inset-0 z-[-1] dark:hidden overflow-hidden bg-[#faf7f4] pointer-events-none">
        <div className="absolute top-[30%] left-[50%] w-[600px] h-[600px] bg-[#F2D0D3] rounded-full blur-[100px] opacity-[0.4]" />
      </div>

      <Navbar isHome={false} showTopBar showClientCenterMenu />

      {/* compensar navbar fixed */}
      <div className="flex pt-[114px] min-[1138px]:pt-16 relative z-10">
        <ClientSidebar items={clientModules} />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
