"use client";

import { useEffect, useState } from "react";
import { Carousel, ProductCard } from "@/components/molecules";
import { products as mockProducts } from "@data";
import { motion } from "framer-motion";
import { productApi } from "@api";

export const NewArrivals = () => {
  const [realProducts, setRealProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        // Obtenemos los últimos productos del catálogo
        const { data } = await productApi.get("", { params: { limit: 8, season: "VERANO 2026" } });
        const items = Array.isArray(data?.items) ? data.items : [];
        
        const mapped = items.map((p: any) => ({
          id: p.id_product || p._id || "",
          name: p.name || "Producto",
          price: `S/ ${Number(p.base_price || 0).toFixed(2)}`,
          image: (p.images && p.images.length > 0) ? (p.images[0]?.url ?? p.images[0]) : "/placeholder.jpg",
          href: `/product/${p.id_product || p._id}`
        }));
        
        setRealProducts(mapped);
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
      }
    };
    
    fetchNewArrivals();
  }, []);

  // Desactivamos los mockProducts por ahora, usando realProducts
  // const displayProducts = mockProducts;
  const displayProducts = realProducts;

  return (
    <section className="relative w-full overflow-hidden bg-transparent dark:bg-[#252021]/80 dark:backdrop-blur-xl border-y border-transparent dark:border-white/5 py-24 md:py-32 px-4 transition-colors duration-500 ease-in-out">
      {/* Glow effects for dark mode glassmorphism */}
      <div className="absolute inset-0 hidden dark:block pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.p
            className="text-sm tracking-[0.3em] uppercase text-gray-600 dark:text-gray-400 mb-2"
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: {
                  delay: 0.2,
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                },
              },
            }}
          >
            NUEVOS INGRESOS
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-serif text-[#8B3A52] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-[#e8a0b0]"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  delay: 0.4,
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                },
              },
            }}
          >
            COLECCIÓN VERANO
          </motion.h2>
          <motion.div
            className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500"
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 96, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.6,
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        </motion.div>

        <Carousel
          items={displayProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        />
      </div>
    </section>
  );
};
