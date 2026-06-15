"use client";

import Link from "next/link";
import { Hero, NewArrivals, SummerSale, Benefits } from "@/components/organisms";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-background dark:bg-background transition-colors duration-500 ease-in-out">
      <Hero />
      <NewArrivals />
      <SummerSale />
      <Benefits />

      {/* Botón discreto de presentación (temporal - tesis) */}
      <div className="flex justify-center pb-6 pt-2">
        <Link
          href="/presentacion"
          className="text-[10px] text-gray-300/25 dark:text-white/15 hover:text-gray-400/50 dark:hover:text-white/30 transition-colors duration-300 tracking-widest uppercase"
        >
          · flujo operativo ·
        </Link>
      </div>
    </div>
  );
}