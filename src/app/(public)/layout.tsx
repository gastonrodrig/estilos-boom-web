"use client";

import { Navbar, Footer } from "@components";
import { CartSidebar } from "./cart/_components";

export default function PublicLayout({ children } : { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        {children}
      </main>
      <Footer />
      <CartSidebar />
    </>
  );
}
