"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/core/models";

interface Props {
  product: Product;
}

export const ProductCardCatalogue = ({ product }: Props) => {
  // Extraemos colores únicos de las variantes para los circulitos
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color))).slice(0, 3);

  // Helper para mapear nombres de colores a códigos hexadecimales
  const getColorHex = (colorName: string) => {
    const colors: Record<string, string> = {
      "Negro": "#000000",
      "Blanco": "#FFFFFF",
      "Rojo Vino": "#6b1b1b",
      "Rosa Pastel": "#ffc1cc",
      "Azul Vintage": "#5d778a",
      // Agrega más según tu base de datos
    };
    return colors[colorName] || "#e5e7eb"; // Gris claro por defecto
  };

  return (
    <div className="group flex flex-col">
      {/* Contenedor de Imagen y Botones */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 rounded-sm mb-4">
        <Link href={`/product/${product.id_product}`}>
          <img
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges dinámicos */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_new_in && (
            <span className="bg-[#f06292] text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-tighter shadow-sm">
              Nuevo
            </span>
          )}
          {/* Ejemplo de badge de descuento (puedes hacerlo dinámico luego) */}
          <span className="bg-gray-800/60 text-white text-[10px] px-2 py-0.5 font-bold shadow-sm">
            -30%
          </span>
        </div>

        {/* Botón Favoritos */}
        <button className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-sm hover:text-pink-500 transition-colors">
          <Heart size={16} />
        </button>
      </div>

      {/* Información del Producto */}
      <div className="flex flex-col gap-1 px-1">
        <span className="text-gray-400 text-[11px] uppercase tracking-widest">
          {product.category?.name || "Colección"}
        </span>
        
        <Link href={`/product/${product.id_product}`}>
          <h3 className="text-gray-800 font-semibold text-sm leading-tight hover:text-pink-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-[#f06292] font-bold text-sm">
          S/ {product.base_price.toFixed(2)}
        </p>

        {/* Círculos de Colores */}
        <div className="flex gap-1.5 mt-2">
          {uniqueColors.map((color, idx) => (
            <span
              key={idx}
              className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-inner"
              title={color}
              style={{ backgroundColor: getColorHex(color) }}
            />
          ))}
          {product.variants.length > 3 && (
            <span className="text-[10px] text-gray-400 self-center">...</span>
          )}
        </div>
      </div>
    </div>
  );
};