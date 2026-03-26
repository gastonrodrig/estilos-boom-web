"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Product } from "@/core/models";

interface Props {
  product: Product;
}

export const ProductCardCatalogue = ({ product }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  // Colores del diseño previo
  const colors = {
    pinkMain: "#F2778D",
    pinkLight: "#F2B6C1",
    textDark: "#594246",
  };

  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color))).slice(0, 3);

  const getColorHex = (colorName: string) => {
    const colorMap: Record<string, string> = {
      "Negro": "#000000",
      "Blanco": "#FFFFFF",
      "Rojo Vino": "#6b1b1b",
      "Rosa Pastel": "#ffc1cc",
      "Azul Vintage": "#5d778a",
    };
    return colorMap[colorName] || "#e5e7eb";
  };

  return (
    <motion.div
      className="group flex flex-col bg-white rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.3 }
      }}
    >
      {/* Contenedor de Imagen con Efectos */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF9F6] rounded-sm mb-4">
        <Link href={`/product/${product.id_product}`}>
          <motion.img
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          />

          {/* EFECTO DE BRILLO (Shine) */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"
            initial={{ x: "-100%", skewX: -20 }}
            animate={{ x: isHovered ? "200%" : "-100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

          {/* Overlay de oscuridad suave */}
          <motion.div
            className="absolute inset-0 bg-black/5 z-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </Link>

        {/* Badges dinámicos */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {product.is_new_in && (
            <motion.span 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-[#F2778D] text-white text-[9px] px-2 py-1 font-bold uppercase tracking-widest shadow-sm"
            >
              Nuevo
            </motion.span>
          )}
          <span className="bg-[#594246]/80 text-white text-[9px] px-2 py-1 font-bold uppercase tracking-widest backdrop-blur-sm">
            -20%
          </span>
        </div>

        {/* Botón Favoritos con escala */}
        <motion.button 
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-sm text-[#594246] hover:text-[#F2778D] transition-colors z-20"
        >
          <Heart size={16} fill={isHovered ? "currentColor" : "none"} className="transition-all" />
        </motion.button>
      </div>

      {/* Información del Producto con Animación de Texto */}
      <div className="flex flex-col gap-1 px-2 pb-4">
        <span className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium">
          {product.category?.name || "Colección"}
        </span>
        
        <Link href={`/product/${product.id_product}`}>
          <motion.h3 
            className="text-[#594246] font-light text-sm leading-tight tracking-wide line-clamp-1"
            animate={{ 
              color: isHovered ? "#000" : "#594246",
              x: isHovered ? 2 : 0 
            }}
          >
            {product.name}
          </motion.h3>
        </Link>

        <motion.p 
          className="font-bold text-sm mt-1"
          animate={{ 
            scale: isHovered ? 1.05 : 1,
            color: isHovered ? "#F2778D" : "#594246" 
          }}
          transition={{ duration: 0.2 }}
        >
          S/ {product.base_price.toFixed(2)}
        </motion.p>

        {/* Círculos de Colores con stagger effect */}
        <div className="flex items-center gap-1.5 mt-3">
          {uniqueColors.map((color, idx) => (
            <motion.span
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="w-3 h-3 rounded-full border border-gray-100 shadow-sm cursor-help"
              title={color}
              style={{ backgroundColor: getColorHex(color) }}
              whileHover={{ y: -2 }}
            />
          ))}
          {product.variants.length > 3 && (
            <span className="text-[9px] text-gray-400 ml-1">+{product.variants.length - 3}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};