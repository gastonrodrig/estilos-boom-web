"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CTA } from "@/components/atoms";

export const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      
      {/* Image */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Image
          src="/assets/hero-img.png"
          alt="Nueva colección Estilos Boom"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Overlay */}
      <motion.div 
        className="absolute inset-0 bg-black/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="text-center text-white px-6">

          {/* Subtitle */}
          <motion.p 
            className="mb-4 text-sm tracking-[0.3em] uppercase opacity-90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            New Arrivals
          </motion.p>

          {/* Title */}
          <motion.h1 
            className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Fashion Daily
          </motion.h1>

          {/* Description */}
          <motion.p 
            className="mt-4 text-sm md:text-base opacity-90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Prendas que elevan tu estilo diario
          </motion.p>

          {/* Button */}
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <CTA href="/new-in">
              SHOP NOW
            </CTA>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
