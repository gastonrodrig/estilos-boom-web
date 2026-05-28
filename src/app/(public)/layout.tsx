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
  const isCatalogue = pathname.startsWith("/catalogue");
  const removePadding = isHome || isCatalogue;

  return (
    <>
      <Navbar isHome={isHome} />

      {/* Añadimos pt-[64px] para que el contenido empiece 
          exactamente debajo del Navbar (cuyo alto es 64px). 
          En el Home o Catálogo no lo ponemos para que las portadas 
          sí se metan debajo del menú y no dejen líneas en blanco.
      */}
      <div className={`relative ${!removePadding ? "pt-[64px]" : ""}`}>
        <main className="min-h-[70vh]">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
