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

      {/* Añadimos pt-[140px] para que el contenido empiece 
          justo debajo del Navbar. 
          En el Home (isHome) no lo ponemos para que la imagen 
          de portada sí se meta debajo del menú transparente.
      */}
      <div className={`relative ${!isHome ? "pt-[80px] md:pt-[100px]" : ""}`}>
        <main className="min-h-[70vh]">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
