"use client";

import { View01Hero, View02WhyChooseUs, View03FeaturedProducts, View04Testimonials } from "./views";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <View01Hero onToggleAccessible={() => console.log("Accesible ON/OFF")} />
      <View02WhyChooseUs />
      <View03FeaturedProducts />
      <View04Testimonials />
    </div>
  );
}