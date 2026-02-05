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
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      className="overflow-hidden rounded-lg bg-white shadow-md"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={product.href}>
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />

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
            className="mb-2 font-light text-gray-900"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {product.name}
          </motion.h3>

          <motion.p
            className="font-semibold text-gray-600"
            animate={{
              color: isHovered ? "#f2b6c1" : "#4b5563",
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
