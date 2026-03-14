"use client";

import { Navbar, Footer } from "@/components/organisms";
import { usePathname } from "next/navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/home";

  return (
    <>
      <Navbar isHome={isHome} />

      <div className="relative">
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}
