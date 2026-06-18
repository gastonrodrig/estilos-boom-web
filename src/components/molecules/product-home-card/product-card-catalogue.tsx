"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const uniqueColorNames = Array.from(new Set((product.variants || []).map((v) => v.color).filter(Boolean))).slice(0, 3).map(c => String(c).toUpperCase());
  const colorsText = uniqueColorNames.join(" · ");

  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
  const isSoldOut = totalStock === 0;

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="product-card flex flex-col h-full"
    >
      {/* ZONA IMAGEN */}
      <div className="product-image-wrapper relative overflow-hidden">
        <Link href={`/product/${product.id_product}`} className="block w-full h-full">
          <img
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            className="product-image"
          />
        </Link>

        {isSoldOut && (
          <div className="absolute top-4 -left-10 w-40 z-30 transform -rotate-45 bg-red-700 text-white text-[11px] font-bold py-1 shadow-sm text-center tracking-wider">
            AGOTADO
          </div>
        )}

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

        <button 
          className="btn-carrito"
          onClick={(e) => {
            e.preventDefault();
            router.push(`/product/${product.id_product}`);
          }}
        >
          <span className="text-[14px]">🛒</span> Agregar al carrito
        </button>
      </div>
    </motion.div>
  );
};
