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
      className="group flex flex-col relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Contenedor de Imagen con Efectos */}
      <div className="relative aspect-3/4 overflow-hidden bg-[#FAF9F6] mb-5">
        <Link href={`/product/${product.id_product}`} className="block w-full h-full">
          <motion.img
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          />

          {/* Overlay oscuro para hover */}
          <motion.div
            className="absolute inset-0 bg-black/15 z-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Botón flotante 'Ver Detalle' (Estándar Alta Costura) */}
          <motion.div
            className="absolute bottom-6 left-0 right-0 flex justify-center z-30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="bg-white/95 text-[#632034] px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg border border-[#EBEAE8] hover:bg-[#632034] hover:text-[#FAF9F6] transition-colors">
              Ver Detalle
            </span>
          </motion.div>
        </Link>

        {/* Botón Favoritos dorado */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 bg-white/80 p-2 rounded-full shadow-sm text-[#C5A059] hover:text-[#632034] transition-colors z-20 backdrop-blur-md"
        >
          <Heart size={16} fill={isHovered ? "currentColor" : "none"} strokeWidth={1.5} className="transition-all" />
        </motion.button>
      </div>

      {/* Información del Producto Limpia */}
      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex items-center gap-2">
          {product.is_new_in && (
            <span className="text-[#C5A059] text-[9px] uppercase tracking-[0.25em] font-bold">
              Nuevo •
            </span>
          )}
          <span className="text-[#C5A059] text-[9px] uppercase tracking-[0.25em] font-medium">
            {product.category?.name || "Colección"}
          </span>
        </div>
        
        <Link href={`/product/${product.id_product}`}>
          <h3 className="text-[#594246] dark:text-white font-serif text-[17px] leading-tight tracking-wide line-clamp-1 group-hover:text-[#632034] dark:group-hover:text-[#F3E5AB] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[#632034] dark:text-[#D4AF37] font-medium text-sm tracking-wide">
            S/ {product.base_price.toFixed(2)}
          </p>
          <span className="text-[#594246]/60 dark:text-gray-400 text-[10px] font-bold tracking-widest">-20%</span>
        </div>

        {/* Círculos de Colores sutiles */}
        <div className="flex items-center gap-2 mt-2">
          {uniqueColors.map((color, idx) => (
            <motion.span
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="w-3.5 h-3.5 rounded-full border border-[#EBEAE8] shadow-sm cursor-help"
              title={color}
              style={{ backgroundColor: getColorHex(color) }}
              whileHover={{ y: -2 }}
            />
          ))}
          {product.variants.length > 3 && (
            <span className="text-[10px] text-[#594246]/50 font-medium ml-1">+{product.variants.length - 3}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
