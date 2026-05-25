"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
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
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

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

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleClear = () => {
    setPriceRange(250);
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
    };

    startLoadingProducts(baseFilters);
    onClose(); 
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-60 bg-[#594246]/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed top-0 right-0 z-70 flex h-full w-full max-w-md flex-col bg-[#FAF9F6] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 40 }}
          >
            <div className="flex items-center justify-between border-b border-[#EBEAE8] px-6 py-6">
              <h2 className="text-xl uppercase tracking-widest text-[#594246]">Filtros</h2>
              <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-[#F2D0D3]/45">
                <X className="h-6 w-6 text-[#594246]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              
              {/* Sección de Precio */}
              <div>
                <h3 className="mb-6 text-sm font-bold uppercase tracking-tighter text-[#594246]">
                  Precio Máximo: <span className="text-[#F2778D]">S/ {priceRange}</span>
                </h3>
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#EBEAE8] accent-[#F2778D]"
                />
                <div className="mt-2 flex justify-between text-[10px] font-bold text-[#594246]/60">
                  <span>S/ 0</span>
                  <span>S/ 500+</span>
                </div>
              </div>

              {/* Sección de Tallas */}
              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-tighter text-[#594246]">Tallas</h3>
                <div className="flex flex-wrap gap-3">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`w-12 h-12 border text-xs font-bold transition-all ${
                        selectedSizes.includes(size) 
                        ? "border-[#594246] bg-[#594246] text-[#FAF9F6]" 
                        : "border-[#EBEAE8] text-[#594246]/60 hover:border-[#F291A3]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sección de Colores */}
              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-tighter text-[#594246]">Colores</h3>
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
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColors.includes(color.name) ? "border-[#F2778D] scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] font-medium uppercase text-[#594246]/60">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex gap-4 border-t border-[#EBEAE8] bg-[#FAF9F6] p-6">
              <button 
                onClick={handleClear}
                className="flex flex-1 items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest text-[#594246]/70 transition-colors hover:text-[#594246]"
              >
                <RotateCcw size={14} /> Limpiar
              </button>
              <button 
                onClick={handleApplyFilters}
                className="flex-2 bg-[#F2778D] py-4 text-xs font-bold uppercase tracking-widest text-[#FAF9F6] transition-all hover:bg-[#F291A3]"
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