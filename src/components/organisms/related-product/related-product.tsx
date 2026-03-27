"use client";

import { useEffect, useMemo } from "react";
import { useProductStore } from "@/hooks/product/use-product-store";
import { ProductCardCatalogue } from "@/components/molecules/product-home-card/product-card-catalogue";// Reutilizamos tu card
import { motion } from "framer-motion";

interface Props {
  currentCategoryId?: string;
  currentProductId: string;
}

export const RelatedProducts = ({ currentCategoryId, currentProductId }: Props) => {
  const { products, startLoadingProducts, loading } = useProductStore();

  useEffect(() => {
    if (currentCategoryId) {
      // Cargamos productos de la misma categoría
      // Usamos un limit de 5 por si el actual está entre ellos
      startLoadingProducts({ category: currentCategoryId, limit: 5 });
    }
  }, [currentCategoryId]);

  // Filtramos el producto actual y nos quedamos con los 4 primeros
  const related = useMemo(() => {
    return products
      .filter((p) => p.id_product !== currentProductId)
      .slice(0, 4);
  }, [products, currentProductId]);

  if (related.length === 0 && !loading) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 border-t border-[#EBEAE8]">
      <h2 className="text-xl font-serif uppercase tracking-widest text-[#594246] mb-12 text-center md:text-left">
        También te puede interesar
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 aspect-[3/4] rounded-sm" />
          ))
        ) : (
          related.map((product) => (
            <motion.div 
              key={product.id_product}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <ProductCardCatalogue product={product} />
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};