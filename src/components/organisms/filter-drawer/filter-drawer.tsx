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

  // LOG DE SEGUIMIENTO: Ver el estado actual cada vez que cambia algo en el Drawer
  console.log("🛠️ FilterDrawer State:", {
    type,
    priceRange,
    selectedSizes,
    selectedColors
  });

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleClear = () => {
    console.log("🧹 Limpiando filtros...");
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

    // LOG CRÍTICO: Ver qué le estamos mandando al Store/API
    console.log("🚀 Aplicando filtros al Store:", baseFilters);

    startLoadingProducts(baseFilters);
    onClose(); 
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-60 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed top-0 right-0 z-70 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 40 }}
          >
            <div className="flex items-center justify-between px-6 py-6 border-b">
              <h2 className="text-xl font-serif uppercase tracking-widest text-gray-800">Filtros</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              
              {/* Sección de Precio */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-6 tracking-tighter">
                  Precio Máximo: <span className="text-pink-500">S/ {priceRange}</span>
                </h3>
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  value={priceRange}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    console.log("💰 Cambio de precio:", val);
                    setPriceRange(val);
                  }}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold">
                  <span>S/ 0</span>
                  <span>S/ 500+</span>
                </div>
              </div>

              {/* Sección de Tallas */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-4 tracking-tighter">Tallas</h3>
                <div className="flex flex-wrap gap-3">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        console.log("📏 Seleccionando talla:", size);
                        toggleSize(size);
                      }}
                      className={`w-12 h-12 border text-xs font-bold transition-all ${
                        selectedSizes.includes(size) 
                        ? "border-black bg-black text-white" 
                        : "border-gray-200 text-gray-400 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sección de Colores */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-4 tracking-tighter">Colores</h3>
                <div className="flex flex-wrap gap-4">
                  {colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => {
                        console.log("🎨 Seleccionando color:", color.name);
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
                          selectedColors.includes(color.name) ? "border-pink-500 scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] text-gray-400 font-medium uppercase">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button 
                onClick={handleClear}
                className="flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 transition-colors"
              >
                <RotateCcw size={14} /> Limpiar
              </button>
              <button 
                onClick={handleApplyFilters}
                className="flex-[2] bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
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