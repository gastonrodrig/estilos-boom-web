"use client";
import { useProductStore } from "@/hooks/product/use-product-store";
import { useEffect } from "react";
import Image from "next/image";

export default function NewInPage() {
  const { products, loading, startLoadingProducts } = useProductStore();

  useEffect(() => {
    startLoadingProducts();
    console.log("productos",products)
  }, []);

  // Filtrado de Novedades
  const newItems = products.filter((p) => p.is_new_in === true);

  return (
    <div className="container mx-auto px-6 py-12 pt-32 min-h-screen">
      <span className="bg-black text-white px-3 py-1 text-xs uppercase tracking-widest font-bold mb-4 inline-block">
        Recién Llegado
      </span>
      
      <header className="mb-12">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-gray-900 leading-none">
          New <span className="text-pink-500">In</span>
        </h1>
        <p className="text-xl text-gray-600 mt-4 max-w-lg border-l-4 border-black pl-4">
          Nuestra última colección cápsula ya está aquí. Piezas limitadas diseñadas para destacar.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 aspect-[3/4] animate-pulse rounded-sm" />
          ))
        ) : newItems.length > 0 ? (
          newItems.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="bg-gray-100 aspect-[3/4] relative overflow-hidden rounded-sm border">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 text-white font-bold backdrop-blur-[2px]">
                  Ver detalle
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-bold uppercase tracking-tight">{product.name}</p>
                <p className="text-pink-600 font-semibold">S/ {product.price.toFixed(2)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400">Próximamente nuevas novedades...</p>
        )}
      </div>
    </div>
  );
}