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
            className="fixed inset-0 z-[60] bg-white/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 40 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 40 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Que estás buscando..."
                  className="
                    h-12 w-full rounded-lg
                    pl-11 pr-4 text-sm
                    outline-none
                    transition-shadow
                  "
                />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Cerrar búsqueda"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {query ? (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Resultados para{" "}
                    <strong className="text-gray-900">{query}</strong>
                  </p>

                  {/* Aquí irán las ProductCard */}
                  <div className="text-center py-12 text-gray-400 text-sm">
                    <p>No se encontraron resultados</p>
                    <p className="mt-1">Intenta con otra búsqueda</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
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
