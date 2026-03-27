"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/core/models";
import { useCartStore } from "@hooks";
import { CheckoutDrawer } from "@components";
import { useState } from "react";

interface Props {
  product: Product;
}

export const ProductCardCatalogue = ({ product }: Props) => {
  const { addItem } = useCartStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);

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

  const firstVariant = product.variants[0];

  const handleAddToCart = async () => {
    await addItem({
      productId: product.id_product,
      name: product.name,
      price: product.base_price,
      quantity: 1,
      size: firstVariant?.size ?? "UNICA",
      color: firstVariant?.color ?? "Negro",
      image: product.images[0] ?? "/placeholder.jpg",
    });

    setLastAddedProductId(product.id_product);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="group flex flex-col rounded-xl border border-transparent p-2 transition hover:border-[#EBEAE8] hover:bg-[#FAF9F6]">
      {/* Contenedor de Imagen y Botones */}
      <div className="relative mb-4 aspect-3/4 overflow-hidden rounded-lg bg-[#EBEAE8]">
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
              <span className="bg-[#F2778D] px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-white shadow-sm">
              Nuevo
            </span>
          )}
          {/* Ejemplo de badge de descuento (puedes hacerlo dinámico luego) */}
            <span className="bg-[#594246] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            -30%
          </span>
        </div>

        {/* Botón Favoritos */}
          <button className="absolute right-3 top-3 rounded-full bg-white p-1.5 shadow-sm transition-colors hover:text-[#F2778D]">
          <Heart size={16} />
        </button>
      </div>

      {/* Información del Producto */}
        <div className="flex flex-col gap-1.5 px-1">
          <span className="text-[11px] font-medium uppercase tracking-widest text-[#594246]/60">
          {product.category?.name || "Colección"}
        </span>
        
        <Link href={`/product/${product.id_product}`}>
            <h3 className="line-clamp-1 text-lg font-normal leading-tight text-[#594246] transition-colors hover:text-[#F2778D]">
            {product.name}
          </h3>
        </Link>

          <p className="text-base font-bold text-[#F2778D]">
          S/ {product.base_price.toFixed(2)}
        </p>

        <button
          onClick={handleAddToCart}
            className="mt-3 w-full rounded-lg bg-[#F2778D] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#FAF9F6] shadow-sm transition hover:bg-[#F291A3]"
        >
          Agregar al carrito
        </button>

        {/* Círculos de Colores */}
          <div className="mt-2.5 flex gap-1.5">
          {uniqueColors.map((color, idx) => (
            <span
              key={idx}
                className="h-3.5 w-3.5 rounded-full border border-[#EBEAE8] shadow-inner"
              title={color}
              style={{ backgroundColor: getColorHex(color) }}
            />
          ))}
          {product.variants.length > 3 && (
              <span className="self-center text-[10px] text-[#594246]/55">...</span>
          )}
        </div>
      </div>

      </div>

      <CheckoutDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        item={
          lastAddedProductId === product.id_product
            ? {
                productId: product.id_product,
                name: product.name,
                price: product.base_price,
                quantity: 1,
                size: firstVariant?.size ?? "UNICA",
                color: firstVariant?.color ?? "Negro",
                image: product.images[0] ?? "/placeholder.jpg",
              }
            : undefined
        }
      />
    </>
  );
};