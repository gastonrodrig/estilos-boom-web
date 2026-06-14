"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Diamond, Star, Heart } from "lucide-react";
import { useProductStore } from "@/hooks/product/use-product-store";
import { useParams } from "next/navigation";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const FilterDrawer = ({ open, onClose }: FilterDrawerProps) => {
  const { type } = useParams();
  const { startLoadingProducts } = useProductStore();
  
  const [priceRange, setPriceRange] = useState(250);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const groupedCategories = [
    { label: "Parte Superior", icon: Sparkles, items: ["Polos / Tops", "Camisetas", "Blusas"] },
    { label: "Parte Inferior", icon: Diamond, items: ["Pantalones", "Jeans", "Shorts", "Faldas"] },
    { label: "Una Pieza", icon: Star, items: ["Vestidos", "Conjuntos / Sets"] },
    { label: "Ropa Íntima", icon: Heart, items: ["Ropa Interior / Lencería", "Pijamas"] }
  ];
  
  const sizes = ["XS", "S", "M", "L", "XL"];
  const colors = [
    { name: "Negro", hex: "#000000" },
    { name: "Blanco", hex: "#FFFFFF" },
    { name: "Rosa", hex: "#f8b4c2" },
    { name: "Rojo", hex: "#6b1b1b" },
    { name: "Azul", hex: "#5d778a" },
  ];

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleClear = () => {
    setPriceRange(250);
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const handleApplyFilters = () => {
    const baseFilters = {
      category: type === "dresses" ? "Dresses" : undefined,
      section: type !== "dresses" ? (type as string) : undefined,
      maxPrice: priceRange,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      limit: 100,
    };

    startLoadingProducts(baseFilters);
    onClose(); 
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay oscuro */}
          <motion.div
            className="fixed inset-0 z-60 bg-[#1a1018]/40 dark:bg-black/70 backdrop-blur-sm transition-colors duration-400 ease-in-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel Lateral Elegante */}
          <motion.aside
            className="fixed top-0 right-0 z-70 flex h-full w-full max-w-[400px] flex-col bg-[#faf8f6] dark:bg-[#1a0f15] border-l border-[rgba(180,60,100,0.15)] dark:border-[rgba(232,130,154,0.1)] shadow-2xl transition-colors duration-400 ease-in-out"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
          >
            {/* Cabecera FILTROS */}
            <div className="flex items-center justify-between border-b border-[#1a1018]/5 dark:border-white/5 px-8 py-6 transition-colors duration-400 ease-in-out">
              <h2 
                className="text-[#1a1018] dark:text-[#C6A664] uppercase transition-colors duration-400 ease-in-out"
                style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.2em' }}
              >
                Filtros
              </h2>
              <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-[#1a1018]/5 dark:hover:bg-[#C6A664]/10">
                <X strokeWidth={1.5} className="h-6 w-6 text-[#1a1018]/70 dark:text-[#C6A664]/80 transition-colors duration-400 ease-in-out" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
              
              {/* Sección de Categorías con toque de dorado */}
              <div className="space-y-8">
                {groupedCategories.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.label}>
                      <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1018]/50 dark:text-[#C6A664]/70 transition-colors duration-400 ease-in-out">
                        <Icon size={12} strokeWidth={2} className="text-[#1a1018]/40 dark:text-[#C6A664]/60" />
                        {group.label}
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {group.items.map(cat => {
                          const isSelected = selectedCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              onClick={() => toggleCategory(cat)}
                              className={`rounded-full px-[14px] py-[6px] text-[0.75rem] tracking-[0.08em] border transition-all duration-400 ease-in-out ${
                                isSelected 
                                ? "border-[#1a1018] bg-[#1a1018] text-white dark:border-[#C6A664] dark:bg-[#C6A664] dark:text-[#1a0f15]" 
                                : "border-[#1a1018]/20 bg-transparent text-[#1a1018]/70 dark:border-[#C6A664]/30 dark:text-[#C6A664]/80 hover:border-[#1a1018]/40 dark:hover:border-[#C6A664]/60"
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Separador Elegante */}
              <div className="w-full h-[1px] bg-gradient-to-r from-[#1a1018]/15 dark:from-[#C6A664]/30 to-transparent my-10 transition-colors duration-400 ease-in-out" />

              {/* Sección de Tallas */}
              <div>
                <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1018]/50 dark:text-[#C6A664]/70 transition-colors duration-400 ease-in-out">Tallas</h3>
                <div className="flex flex-wrap gap-3">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`rounded-full px-[16px] py-[8px] text-[0.75rem] tracking-[0.08em] border transition-all duration-400 ease-in-out ${
                        selectedSizes.includes(size) 
                        ? "border-[#1a1018] bg-[#1a1018] text-white dark:border-[#C6A664] dark:bg-[#C6A664] dark:text-[#1a0f15]" 
                        : "border-[#1a1018]/20 bg-transparent text-[#1a1018]/70 dark:border-[#C6A664]/30 dark:text-[#C6A664]/80 hover:border-[#1a1018]/40 dark:hover:border-[#C6A664]/60"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-[1px] bg-gradient-to-r from-[#1a1018]/15 dark:from-[#C6A664]/30 to-transparent my-10 transition-colors duration-400 ease-in-out" />

              {/* Sección de Precio */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1018]/50 dark:text-[#C6A664]/70 transition-colors duration-400 ease-in-out">
                    Precio Máximo
                  </h3>
                  <span className="text-[#8B3A52] font-medium text-sm">S/ {priceRange}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="h-[2px] w-full cursor-pointer appearance-none bg-[#1a1018]/10 dark:bg-white/10 accent-[#8B3A52] transition-colors duration-400 ease-in-out"
                />
                <div className="mt-4 flex justify-between text-[9px] uppercase tracking-[0.2em] text-[#1a1018]/40 dark:text-[#C6A664]/50 transition-colors duration-400 ease-in-out">
                  <span>S/ 0</span>
                  <span>S/ 500+</span>
                </div>
              </div>

              <div className="w-full h-[1px] bg-gradient-to-r from-[#1a1018]/15 dark:from-[#C6A664]/30 to-transparent my-10 transition-colors duration-400 ease-in-out" />

              {/* Sección de Colores */}
              <div>
                <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1018]/50 dark:text-[#C6A664]/70 transition-colors duration-400 ease-in-out">Colores</h3>
                <div className="flex flex-wrap gap-4">
                  {colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColors(prev => 
                          prev.includes(color.name) 
                          ? prev.filter(c => c !== color.name) 
                          : [...prev, color.name]
                        );
                      }}
                      className={`group relative flex flex-col items-center gap-2`}
                    >
                      <div 
                        className={`w-6 h-6 rounded-full border border-black/10 dark:border-white/10 transition-all duration-400 ease-in-out ${
                          selectedColors.includes(color.name) ? "ring-1 ring-offset-2 ring-[#8B3A52] dark:ring-offset-[#1a0f15]" : "opacity-80 group-hover:opacity-100"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#1a1018]/50 dark:text-[#C6A664]/60 transition-colors duration-400 ease-in-out">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Panel de Botones */}
            <div className="flex items-center gap-4 border-t border-[#1a1018]/5 dark:border-white/5 bg-[#faf8f6] dark:bg-[#1a0f15] px-8 py-6 transition-colors duration-400 ease-in-out">
              <button 
                onClick={handleClear}
                className="flex-none px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1a1018]/60 dark:text-[#C6A664]/70 transition-colors hover:text-[#1a1018] dark:hover:text-[#C6A664]"
              >
                Limpiar
              </button>
              <button 
                onClick={handleApplyFilters}
                className="flex-1 rounded-full px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-400 ease-in-out bg-[#6b1f35] text-white hover:bg-[#521627] dark:bg-transparent dark:border dark:border-[#e8829a] dark:text-[#e8829a] dark:hover:bg-[#e8829a]/10"
              >
                Aplicar Filtros
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};