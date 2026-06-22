"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  href: string;
  isSoldOut?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.07)] dark:bg-white/5 dark:backdrop-blur-[10px] dark:border dark:border-white/[0.08] dark:shadow-none transition-all duration-500 ease-in-out"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        y: -4,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={product.href}>
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-transparent">
          <Image
            src={(typeof product.image === "string" && product.image.trim() !== "") ? product.image : (typeof product.image === "object" && (product.image as any)?.url ? (product.image as any).url : "/assets/logo-eb.png")}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />

          {product.isSoldOut && (
            <div className="absolute top-4 -left-10 w-40 z-30 transform -rotate-45 bg-red-700 text-white text-[11px] font-bold py-1 shadow-sm text-center tracking-wider">
              AGOTADO
            </div>
          )}

          {/* Shine effect */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%", skewX: -20 }}
            animate={{ x: isHovered ? "200%" : "-100%" }}
            transition={{ duration: 0.8 }}
          />

          {/* Hover overlay */}
          <motion.div
            className="absolute inset-0 bg-black/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.5 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <motion.div
          className="p-4 text-center"
          animate={{ y: isHovered ? -5 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.h3
            className="mb-2 font-light text-gray-900 dark:text-gray-100"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {product.name}
          </motion.h3>

          <motion.p
            className={`font-semibold transition-colors duration-200 ${isHovered ? "text-[#f2b6c1] dark:text-[#ffb3c6]" : "text-gray-600 dark:text-[#e8829a]"}`}
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {product.price}
          </motion.p>
        </motion.div>
      </Link>
    </motion.article>
  );
};
