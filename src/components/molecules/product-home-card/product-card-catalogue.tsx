"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Product } from "@/core/models";
import { favoritesApi } from "@api";
import { getFirebaseAuthToken } from "@helpers";
import { getAuthConfig } from "@utils";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export const ProductCardCatalogue = ({ product }: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Colores únicos para mostrar como texto
  const uniqueColorNames = Array.from(new Set((product.variants || []).map((v) => v.color).filter(Boolean))).slice(0, 3).map(c => String(c).toUpperCase());
  const colorsText = uniqueColorNames.join(" · ");

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let token;
      try {
        token = await getFirebaseAuthToken();
      } catch (err) {
        toast.error("Debes iniciar sesión para agregar a favoritos");
        return;
      }
      const config = getAuthConfig({ token });
      const productId = product.id_product;
      
      try {
        await favoritesApi.post("/", { productId }, config);
        setIsFavorited(true);
        toast.success("Producto agregado a tus favoritos");
      } catch (err: any) {
        if (err.response?.status === 409) {
          // If conflict (already favorited), delete it
          await favoritesApi.delete(`/${productId}`, config);
          setIsFavorited(false);
          toast.success("Producto eliminado de tus favoritos");
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Hubo un error al procesar tu solicitud.");
    }
  };

  return (
    <motion.div
      className="group flex flex-col relative bg-[#ffffff] dark:bg-[#2a1a22] border border-[rgba(180,60,100,0.1)] dark:border-[rgba(255,255,255,0.07)] shadow-[0_4px_20px_rgba(0,0,0,0.07)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-[6px] hover:shadow-[0_16px_40px_rgba(180,60,100,0.15)] dark:hover:border-[rgba(180,60,100,0.3)] dark:hover:shadow-[0_16px_40px_rgba(180,60,100,0.25)] rounded-[16px] overflow-hidden transition-all duration-500 h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Contenedor de Imagen con Efectos */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF9F6] rounded-t-[16px]">
        <Link href={`/product/${product.id_product}`} className="block w-full h-full">
          <motion.img
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.03 : 1 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          />

          {/* Overlay oscuro para hover */}
          <motion.div
            className="absolute inset-0 bg-black/5 z-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        </Link>

        {/* Botón Favoritos dorado */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-[32px] h-[32px] flex items-center justify-center bg-[rgba(255,255,255,0.85)] backdrop-blur-[4px] rounded-full shadow-sm text-[#C5A059] hover:text-[#632034] transition-colors z-20"
        >
          <Heart size={16} fill={isFavorited || isHovered ? "currentColor" : "none"} strokeWidth={1.5} className="transition-all" />
        </motion.button>
      </div>

      {/* Información del Producto */}
      <div className="flex flex-col p-[14px_16px_16px] flex-1 bg-[#ffffff] dark:bg-[#2a1a22] transition-colors duration-500">
        
        {/* Line 1: Nombre */}
        <Link href={`/product/${product.id_product}`}>
          <h3 className="text-[#1a1018] dark:text-white line-clamp-1 group-hover:text-[#632034] dark:group-hover:text-[#F3E5AB] transition-colors mb-1"
              style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.05rem', fontWeight: 500 }}>
            {product.name}
          </h3>
        </Link>

        {/* Line 2: Precios y Badge alineados a la izquierda y derecha */}
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[#632034] dark:text-white font-bold tracking-wide" style={{ fontSize: '0.9rem' }}>
            S/ {product.base_price.toFixed(2)}
          </p>
          <span className="text-[#1a1018] dark:text-[#e8829a] line-through opacity-45" style={{ fontSize: '0.9rem' }}>
            S/ {(product.base_price * 1.2).toFixed(2)}
          </span>
          <span className="bg-[#8B3A52] text-white px-[8px] py-[2px] font-bold ml-auto rounded-full" style={{ fontSize: '0.65rem' }}>
            -20%
          </span>
        </div>

        {/* Line 3: Tags (Categoría y Nuevo) */}
        <div className="mt-auto mb-1 flex items-center gap-2">
          {product.is_new_in && (
            <span className="text-[#8B3A52] dark:text-[#e8829a] uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', opacity: 0.8 }}>
              NUEVO
            </span>
          )}
          {product.is_new_in && <span className="text-[#1a1018] dark:text-white opacity-20" style={{ fontSize: '0.65rem' }}>•</span>}
          <span className="text-[#1a1018] dark:text-white uppercase opacity-45" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            {product.category?.name || "COLECCIÓN"}
          </span>
        </div>

        {/* Line 4: Colores como texto */}
        <div>
          <span className="text-[#1a1018] dark:text-white opacity-50 uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
            {colorsText || "VARIOS COLORES"} {product.variants.length > 3 && `· +${product.variants.length - 3}`}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
