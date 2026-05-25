"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";

interface SearchDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const SearchDrawer = ({ open, onClose }: SearchDrawerProps) => {
  const [query, setQuery] = useState("");

  // Bloquear scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-60 bg-[#594246]/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 40 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed top-0 right-0 z-70 flex h-full w-full max-w-md flex-col bg-[#FAF9F6] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 40 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-[#EBEAE8] px-5 py-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Que estás buscando..."
                  className="h-12 w-full rounded-lg border border-[#F2D0D3] bg-white pl-11 pr-4 text-sm text-[#594246] outline-none transition-shadow placeholder:text-[#594246]/50 focus:ring-2 focus:ring-[#F2B6C1]/55"
                />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Cerrar búsqueda"
                className="shrink-0 rounded-full p-2 text-[#594246] transition-colors hover:bg-[#F2D0D3]/45"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 text-[#594246]">
              {query ? (
                <div>
                  <p className="mb-4 text-sm text-[#594246]/70">
                    Resultados para{" "}
                    <strong className="text-[#594246]">{query}</strong>
                  </p>

                  {/* Aquí irán las ProductCard */}
                  <div className="py-12 text-center text-sm text-[#594246]/60">
                    <p>No se encontraron resultados</p>
                    <p className="mt-1">Intenta con otra búsqueda</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-[#594246]/60">
                  <Search className="mx-auto mb-3 h-12 w-12 text-[#F2B6C1]" />
                  <p>Empieza a escribir para buscar productos</p>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
