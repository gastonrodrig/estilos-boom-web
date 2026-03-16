"use client";
import { useProductStore } from "@/hooks/product/use-product-store";
import { useEffect } from "react";
import Image from "next/image";

export default function DressesPage(){
  const { products, loading, startLoadingProducts } = useProductStore();

  useEffect(() => {
    
    startLoadingProducts();
  }, []);
  return (
    <div className="bg-[#fcfaf9] min-h-screen">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-serif text-gray-800 italic mb-6">
            La Colección de Vestidos
          </h1>
          <div className="h-px w-20 bg-pink-300 mx-auto mb-6"></div>
          <p className="text-gray-500 font-light leading-relaxed text-lg">
            Desde eventos de gala hasta tardes de verano. Encuentra el corte perfecto que celebra tu silueta con elegancia y confort.
          </p>
        </div>

        {/* Estado de carga */}
        {loading && <p className="text-center italic text-gray-400">Cargando colección...</p>}

        {/* Grid de Vestidos Reales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col items-center group">
              <div className="w-full bg-white shadow-sm hover:shadow-xl transition-shadow duration-500 aspect-[2/3] border border-gray-100 p-2">
                <div className="w-full h-full bg-gray-50 relative overflow-hidden">
                  {product.images && product.images[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 italic">
                      Sin foto
                    </div>
                  )}
                </div>
              </div>
              <h3 className="mt-6 text-lg font-serif text-gray-700">{product.name}</h3>
              <span className="text-pink-400 mt-1">S/ {product.price.toFixed(2)}</span>
              <button className="mt-4 text-xs uppercase tracking-widest border-b border-black pb-1 hover:text-pink-500 hover:border-pink-500 transition-colors">
                Explorar detalles
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}