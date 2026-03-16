
"use client";
import { useProductStore } from "@/hooks/product/use-product-store";
import { useEffect } from "react";
import Image from "next/image";

export default function BestSellerPage() {
  const { products, loading, startLoadingProducts } = useProductStore();

  useEffect(() => {
    startLoadingProducts();
  }, []);

  // Filtrado de Best Sellers
  const bestSellers = products.filter((p) => p.is_best_seller);

  return (
    <div className="container mx-auto pt-32 p-8 md:p-16 min-h-screen bg-white">
      <header className="border-b pb-8 mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-pink-600 mb-4 italic">
          Best Sellers
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          Descubre las prendas favoritas de nuestra comunidad. Los diseños más buscados de **Estilos Boom**.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 h-96 rounded-lg" />
          ))
        ) : bestSellers.length > 0 ? (
          bestSellers.map((product) => (
            <div key={product.id} className="flex flex-col group cursor-pointer">
              <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 border border-gray-100">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-4 text-xl font-serif text-gray-800">{product.name}</h3>
              <span className="text-pink-500 font-medium">S/ {product.price.toFixed(2)}</span>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400 italic">No hay best sellers por el momento.</p>
        )}
      </div>

      <footer className="mt-20 p-8 bg-pink-50 rounded-2xl border border-pink-100">
        <h2 className="text-xl font-semibold text-pink-800 mb-2">¿Necesitas ayuda con tu talla?</h2>
        <p className="text-pink-700 opacity-80">Nuestro equipo está disponible para asesorarte.</p>
      </footer>
    </div>
  );
}