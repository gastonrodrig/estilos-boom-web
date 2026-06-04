"use client";

import { Hero, NewArrivals, SummerSale, Benefits } from "@/components/organisms";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-background dark:bg-background transition-colors duration-500 ease-in-out">
      <Hero />
      <NewArrivals />
      <SummerSale />
      <Benefits />
    </div>
  );
}