"use client";

import { Hero, NewArrivals, SummerSale, Benefits } from "@/components/organisms";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Hero />
      <NewArrivals />
      <SummerSale />
      <Benefits />
    </div>
  );
}