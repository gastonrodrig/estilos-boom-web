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

  // Colores únicos para mostrar como texto
  const uniqueColorNames = Array.from(new Set((product.variants || []).map((v) => v.color).filter(Boolean))).slice(0, 3).map(c => String(c).toUpperCase());
  const colorsText = uniqueColorNames.join(" · ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="product-card flex flex-col h-full"
    >
      {/* ZONA IMAGEN */}
      <div className="product-image-wrapper">
        <Link href={`/product/${product.id_product}`} className="block w-full h-full">
          <img
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            className="product-image"
          />
        </Link>

        {/* Badge descuento sobre la imagen */}
        <span className="badge-descuento">
          -20%
        </span>

        {/* Botón favorito */}
        <button className={`btn-favorito ${isHovered ? 'active' : ''}`}>
          <Heart size={16} fill={isHovered ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>

        {/* Categoría flotando sobre imagen en la parte inferior */}
        <span className="product-categoria-overlay">
          {product.is_new_in ? "NUEVO · " : ""}{product.category?.name || "COLECCIÓN"}
        </span>
      </div>

      {/* ZONA INFO — más limpia */}
      <div className="product-info flex flex-col flex-1 h-full">
        <Link href={`/product/${product.id_product}`}>
          <h3 className="product-nombre line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="product-precios mt-auto">
          <span className="precio-actual">
            S/ {product.base_price.toFixed(2)}
          </span>
          <span className="precio-original">
            S/ {(product.base_price * 1.2).toFixed(2)}
          </span>
        </div>

        <button className="btn-carrito">
          <span className="text-[14px]">🛒</span> Agregar al carrito
        </button>
      </div>
    </motion.div>
  );
};
