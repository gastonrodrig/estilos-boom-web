"use client";

import { ReactNode } from "react";
import { Navbar, Sidebar } from "@components";
import { storekeeperModules } from "@data";
import { AdminHeaderActions } from "@/components/organisms/admin-header-actions/admin-header-actions";

interface StorekeeperLayoutProps {
  children: ReactNode;
}

export default function StorekeeperLayout({ children }: StorekeeperLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden admin-font-scope relative z-0">
      
      {/* 🌟 MAGICAL BACKGROUND IMAGE (DARK MODE ONLY) */}
      <div className="absolute inset-0 z-[-1] hidden dark:block overflow-hidden bg-[#0A0508] pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.65] bg-cover bg-center bg-no-repeat blur-[16px] scale-110" 
          style={{ backgroundImage: "url('/assets/golden-bg.png')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#E1A0AD]/25 via-[#F2778D]/15 to-transparent mix-blend-overlay blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0508] via-[#0A0508]/60 to-[#0A0508]/80" />
      </div>

      {/* 🌟 MAGICAL BACKGROUND (LIGHT MODE) */}
      <div className="absolute inset-0 z-[-1] dark:hidden overflow-hidden bg-[#F2ECEE] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#F2778D] rounded-full blur-[140px] opacity-[0.15] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#8C6B79] rounded-full blur-[140px] opacity-[0.08] mix-blend-multiply" />
        <div className="absolute top-[30%] left-[50%] w-[600px] h-[600px] bg-white rounded-full blur-[100px] opacity-[0.5]" />
      </div>

      <div className="flex flex-1 overflow-hidden h-screen">
        <Sidebar items={storekeeperModules} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
          <Navbar isHome={false} showTopBar={false} />

          <div className="absolute top-6 right-8 z-50 pointer-events-auto hidden md:block">
            <AdminHeaderActions />
          </div>
          <div className="absolute top-4 right-4 z-50 pointer-events-auto md:hidden">
            <AdminHeaderActions />
          </div>

          <main className="flex-1 overflow-y-auto bg-transparent custom-scrollbar">
            <div className="max-w-[1600px] mx-auto p-4 sm:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
