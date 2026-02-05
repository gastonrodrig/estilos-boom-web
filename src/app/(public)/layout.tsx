"use client";

import { Navbar, Footer, SearchDrawer } from "@/components/organisms";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/home";

  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Navbar isHome={isHome} onSearchOpen={() => setSearchOpen(true)} />

      <div className="relative">
        <main>{children}</main>
        <Footer />
      </div>

      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
