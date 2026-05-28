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

      {/* Añadimos pt-[140px] para que el contenido empiece 
          justo debajo del Navbar. 
          En el Home o Catálogo no lo ponemos para que las portadas 
          sí se metan debajo del menú y no dejen líneas en blanco.
      */}
      <div className={`relative ${!removePadding ? "pt-[80px] md:pt-[100px]" : ""}`}>
        <main className="min-h-[70vh]">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
