"use client";
import { useParams } from "next/navigation";
import { useProductStore } from "@/hooks/product/use-product-store";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, LayoutGrid, List, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCardCatalogue } from "@/components/molecules/product-home-card/product-card-catalogue";
import { FilterDrawer, SearchDrawer } from "@/components";

export default function CollectionPage() {
  const { type } = useParams();
  const { products, loading, startLoadingProducts } = useProductStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [type, products.length]);

  useEffect(() => {
  // Convertimos a string y minúsculas para comparar seguro
  const currentType = String(type).toLowerCase();

  // 1. Definimos los filtros base
  // Si es dresses, mandamos "Dresses" (con D mayúscula como está en tu DB)
  const categoryFilter = currentType === "dresses" ? "Dresses" : undefined;
  
  // Solo mandamos section si NO es una categoría
  const sectionFilter = currentType !== "dresses" ? currentType : undefined;

  console.log("📡 Petición Catálogo:", { section: sectionFilter, category: categoryFilter });

  startLoadingProducts({
    section: sectionFilter,
    category: categoryFilter,
  });
}, [type]);

  const headerContent = useMemo(() => {
    const titles = {
      "new-in": {
        titleMain: "Nueva Colección",
        titleItalic: "Primavera 2026",
        sub: "Descubre las últimas tendencias en moda femenina.",
      },
      "best-seller": {
        titleMain: "Best Sellers",
        titleItalic: "Favoritos",
        sub: "Las prendas más amadas por nuestra comunidad.",
      },
      dresses: {
        titleMain: "Vestidos",
        titleItalic: "Exclusivos",
        sub: "Diseños pensados para resaltar tu esencia.",
      },
    };
    return (
      titles[type as keyof typeof titles] || {
        titleMain: "Colección",
        titleItalic: "Boom",
        sub: "Moda que inspira.",
      }
    );
  }, [type]);

  return (
    <div className="min-h-screen bg-transparent dark:bg-[#1a1018] relative">
      {/* Noise Texture para Dark Mode */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block mix-blend-overlay z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E")' }}></div>

      <header className="relative min-h-[70vh] pt-24 pb-20 px-6 text-center overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-[rgba(250,247,244,0.3)] to-[rgba(250,247,244,0.3)] dark:bg-gradient-to-br dark:from-[rgba(14,8,12,0.5)] dark:to-[rgba(14,8,12,0.6)] z-10">
        {/* Imagen de fondo Light Mode */}
        <div 
          className="absolute inset-0 z-0 mix-blend-multiply pointer-events-none transition-opacity duration-500 ease-in-out opacity-40 dark:opacity-0"
          style={{
            backgroundImage: "url('/assets/PetalosArbol.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Imagen de fondo Dark Mode */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 ease-in-out opacity-0 dark:opacity-60"
          style={{
            backgroundImage: "url('/assets/fondoNocheFlores.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-[80px]">
          <h1 
            className="text-[#1a1018] dark:text-white text-center"
            style={{ 
              fontFamily: 'var(--font-cormorant), serif', 
              fontWeight: 300, 
              letterSpacing: '0.05em',
              lineHeight: '1.1'
            }}
          >
            <span className="text-[3.5rem] md:text-[6.5rem]">{headerContent.titleMain}</span><br />
            <span className="italic text-[3rem] md:text-[6rem]">{headerContent.titleItalic}</span>
          </h1>
          
          <div className="w-[60px] h-[1px] bg-current opacity-70 my-8 text-[#1a1018] dark:text-white"></div>
          
          <p 
            className="text-[#1a1018]/70 dark:text-white/60 max-w-2xl mx-auto text-center"
            style={{
              fontFamily: 'var(--font-raleway), sans-serif',
              fontWeight: 300,
              letterSpacing: '0.25em',
              fontSize: '1rem',
              textTransform: 'uppercase'
            }}
          >
            {headerContent.sub}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-20 relative z-10">
        {/* Toolbar Flotante Editorial */}
        <div className="relative flex flex-wrap justify-between items-center py-5 px-6 sm:px-8 my-8 mx-auto gap-4 bg-white/80 dark:bg-[#1a0f15]/80 backdrop-blur-md border border-[#1a1018]/15 dark:border-[#C6A664]/30 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(198,166,100,0.05)] transition-colors duration-400">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-2 rounded-full border border-[#1a1018]/20 dark:border-[#C6A664]/40 bg-white dark:bg-[#12080e] px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.15em] text-[#1a1018] dark:text-[#C6A664] hover:bg-[#1a1018] hover:text-white dark:hover:bg-[#C6A664] dark:hover:text-[#1a0f15] transition-all duration-400 ease-out shadow-sm"
              >
                <Search size={14} className="transition-transform group-hover:scale-110" /> Buscar
              </button>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="group flex items-center gap-2 rounded-full border border-[#1a1018]/20 dark:border-[#C6A664]/40 bg-white dark:bg-[#12080e] px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.15em] text-[#1a1018] dark:text-[#C6A664] hover:bg-[#1a1018] hover:text-white dark:hover:bg-[#C6A664] dark:hover:text-[#1a0f15] transition-all duration-400 ease-out shadow-sm"
              >
                <SlidersHorizontal size={14} className="transition-transform group-hover:scale-110" /> Filtros
              </button>
            </div>
            
            {/* Contador Editorial */}
            <div className="hidden sm:flex items-center gap-3 ml-4 border-l border-[#1a1018]/10 dark:border-[#C6A664]/20 pl-6 py-1">
              <span className="text-[#1a1018] dark:text-[#C6A664] transition-colors duration-400" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.75rem', fontStyle: 'italic', lineHeight: '1' }}>
                {products.length}
              </span>
              <span className="text-[#1a1018]/60 dark:text-[#C6A664]/70 text-[0.65rem] font-bold tracking-[0.25em] uppercase transition-colors duration-400 mt-1">
                Productos
              </span>
            </div>
          </div>

          {/* Vistas (Grid/List) Editorial */}
          <div className="flex items-center gap-5">
            <span className="text-[#1a1018]/50 dark:text-[#C6A664]/60 text-[0.65rem] tracking-[0.2em] uppercase hidden md:block transition-colors duration-400 font-bold">
              Vista
            </span>
            <div className="flex items-center gap-3 bg-white/50 dark:bg-[#12080e]/50 border border-[#1a1018]/10 dark:border-[#C6A664]/20 rounded-full px-4 py-2">
              <button className="text-[#1a1018] dark:text-[#C6A664] hover:scale-110 transition-all duration-400">
                <LayoutGrid size={16} strokeWidth={2} />
              </button>
              <div className="w-[1px] h-4 bg-[#1a1018]/15 dark:bg-[#C6A664]/30 transition-colors duration-400" />
              <button className="text-[#1a1018]/30 dark:text-[#C6A664]/30 hover:text-[#1a1018] dark:hover:text-[#C6A664] hover:scale-110 transition-all duration-400">
                <List size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Productos usando el Componente Reutilizable */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-100 aspect-3/4 rounded-lg"
                />
              ))}
          </div>
        ) : (
          <>
            <motion.div
              key={`page-${currentPage}-${type}`}
              className="grid grid-cols-2 lg:grid-cols-4 gap-7"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
            >
              {currentProducts.map((product) => (
                <motion.div
                  key={product.id_product}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4, ease: "easeOut" },
                    },
                  }}
                >
                  <ProductCardCatalogue product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-20 flex flex-col items-center justify-center space-y-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-[#594246] hover:text-[#8B3A52] disabled:opacity-30 disabled:hover:text-[#594246] transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-all ${
                            isActive
                              ? "text-[#8B3A52] border-b-2 border-[#8B3A52]"
                              : "text-[#594246]/60 hover:text-[#8B3A52]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-[#594246] hover:text-[#8B3A52] disabled:opacity-30 disabled:hover:text-[#594246] transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <span className="text-[#594246]/60 text-xs font-medium tracking-wide">
                  Mostrando {products.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                  {Math.min(currentPage * itemsPerPage, products.length)} de {products.length} productos
                </span>
              </div>
            )}
          </>
        )}

        {/* Barra lateral flotante de acciones para mobile/desktop */}
        <aside className="fixed right-4 bottom-6 z-40 flex flex-col gap-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F2778D] text-white shadow-lg hover:brightness-95 transition"
            aria-label="Abrir búsqueda"
          >
            <Search size={18} />
          </button>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#594246] text-[#FAF9F6] shadow-lg hover:brightness-95 transition"
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal size={18} />
          </button>
        </aside>
      </main>

      <SearchDrawer
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <FilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
}
