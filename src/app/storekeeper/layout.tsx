"use client";

import { ReactNode } from "react";
import { Navbar, Sidebar } from "@components";
import { storekeeperModules } from "@data";

interface StorekeeperLayoutProps {
  children: ReactNode;
}

export default function StorekeeperLayout({ children }: StorekeeperLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar isHome={false} showTopBar={false} />

      {/* compensar navbar fixed */}
      <div className="flex pt-16 ">
        <Sidebar items={storekeeperModules} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
