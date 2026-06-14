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
        titleMain: "Más Vendidos",
        titleItalic: "Favoritos",
        sub: "Las prendas favoritas de nuestra comunidad, ahora a tu alcance.",
      },
      dresses: {
        titleMain: "Rebajas Especiales",
        titleItalic: "50% Menos",
        sub: "Descubre prendas exclusivas a mitad de precio. ¡Solo por tiempo limitado!",
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
    <>
      <style>{`
        /* PALETA NUEVA */
        :root {
          --neutral-bg:     #f5f0eb;
          --neutral-card:   #faf7f4;
          --neutral-dark:   #1c1410;
          --rose-accent:    #b5445a;
          --gold-accent:    #c9a84c;
          --text-primary:   #1c1410;
          --text-secondary: #7a6a5a;
          --text-muted:     #b0a090;
        }

        /* FONDO GENERAL */
        .catalogue-page, .catalogue-wrapper, .page-content, main {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 50% 40% at 90% 5%,  rgba(201,168,76,0.1)  0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 5%  90%, rgba(181,68,90,0.08)  0%, transparent 50%),
            var(--neutral-bg);
        }

        /* ELIMINAR FONDOS INTERNOS */
        .products-grid,
        .products-wrapper,
        .products-container,
        .catalogue-content,
        .catalogue-section,
        .products-section,
        .main-content,
        .page-wrapper,
        .content-wrapper {
          background: transparent !important;
          background-color: transparent !important;
        }

        html.dark .catalogue-page, html.dark .catalogue-wrapper, html.dark main,
        [data-theme="dark"] .catalogue-page, [data-theme="dark"] .catalogue-wrapper, [data-theme="dark"] main {
          background: #1a0618;
          animation: none;
        }

        /* HERO */
        .hero, .banner, .catalogue-hero {
          height: 80vh;
          min-height: 550px;
          position: relative;
          overflow: hidden;
        }
        .hero img, .hero-image {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center 30%;
          filter: brightness(0.85);
          transform: scale(1.02);
          transition: transform 8s ease;
        }
        .hero:hover img, .hero:hover .hero-image { transform: scale(1.06); }
        .hero::before {
          content: '';
          position: absolute; inset: 0; z-index: 1;
          background:
            linear-gradient(to bottom,
              rgba(10,6,4,0.05) 0%,
              rgba(10,6,4,0.15) 35%,
              rgba(10,6,4,0.65) 80%,
              rgba(10,6,4,0.82) 100%),
            radial-gradient(ellipse at 50% 60%,
              rgba(181,68,90,0.12) 0%,
              transparent 65%);
        }
        .hero::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px; z-index: 3;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(201,168,76,0.6) 30%,
            rgba(201,168,76,0.6) 70%,
            transparent 100%);
        }

        .hero-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 2;
          width: 100%;
          padding: 0 24px;
        }
        .hero-title-main {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 7vw, 5.5rem);
          font-weight: 300;
          color: #faf7f4;
          line-height: 1.1;
          text-shadow: 0 2px 30px rgba(0,0,0,0.4);
          letter-spacing: -0.02em;
        }
        .hero-title-italic {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(2rem, 5vw, 4.2rem);
          color: #c9a84c;
          text-shadow: 0 2px 30px rgba(0,0,0,0.4);
          display: block;
        }
        .hero-divider {
          width: 50px; height: 1px;
          margin: 18px auto;
          background: linear-gradient(90deg, transparent, #e8b86d, transparent);
        }
        .hero-subtitle {
          font-size: 0.72rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(250,247,244,0.55);
        }

        /* BARRA FILTROS */
        .barra-filtros, .filters-bar {
          margin: 32px auto;
          max-width: 1200px;
          padding: 14px 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(250,247,244,0.9) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(201,168,76,0.18);
          box-shadow: 0 2px 20px rgba(28,20,16,0.06);
        }
        html.dark .barra-filtros, [data-theme="dark"] .barra-filtros {
          background: rgba(26,8,18,0.8) !important;
          border-color: rgba(201,168,76,0.15);
        }
        .btn-buscar, .btn-filtros {
          padding: 8px 16px;
          border-radius: 4px;
          border: 1px solid rgba(28,20,16,0.15);
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 500;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.2s ease;
          cursor: pointer;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .btn-buscar:hover, .btn-filtros:hover {
          border-color: #c9a84c;
          color: var(--text-primary);
        }
        .contador-productos {
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .contador-productos span, .contador-productos strong {
          font-weight: 700;
          color: var(--gold-accent);
          font-size: 1.1rem;
        }

        /* CARDS */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          padding: 32px 32px 80px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .products-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }

        .product-card {
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          background: var(--neutral-card);
          border: none;
          box-shadow: 0 1px 3px rgba(28,20,16,0.08);
        }
        .product-card:hover {
          transform: translateY(-6px);
          box-shadow:
            0 20px 50px rgba(28,20,16,0.12),
            0 4px 12px rgba(28,20,16,0.06);
        }
        html.dark .product-card, [data-theme="dark"] .product-card {
          background: rgba(26,8,18,0.8);
          border-color: rgba(196,84,122,0.15);
          backdrop-filter: blur(12px);
        }
        .product-image-wrapper {
          position: relative;
          aspect-ratio: 2/3;
          overflow: hidden;
        }
        .product-image {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: top center;
          transition: transform 0.5s ease;
        }
        .product-card:hover .product-image {
          transform: scale(1.07);
        }
        .product-image-wrapper::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 45%,
            rgba(15,5,10,0.5) 100%
          );
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .product-categoria-overlay {
          position: absolute;
          bottom: 12px; left: 12px;
          z-index: 2;
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(250,247,244,0.75);
          font-weight: 400;
        }
        .badge-descuento {
          position: absolute; top: 12px; left: 12px;
          z-index: 3;
          background: var(--neutral-dark);
          color: #faf7f4;
          font-size: 0.65rem;
          padding: 3px 8px;
          border-radius: 2px;
          letter-spacing: 0.1em;
          box-shadow: none;
        }
        html.dark .badge-descuento, [data-theme="dark"] .badge-descuento { background: #fdeef5; color: #1a0618; }
        .btn-favorito {
          position: absolute; top: 12px; right: 12px;
          z-index: 3;
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(250,247,244,0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(28,20,16,0.1);
          color: rgba(28,20,16,0.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          transition: all 0.22s ease;
          cursor: pointer;
        }
        .btn-favorito:hover, .btn-favorito.active {
          color: var(--rose-accent);
          border-color: var(--rose-accent);
          background: rgba(181,68,90,0.06);
          transform: scale(1.12);
        }
        .product-info {
          padding: 16px 14px 18px;
          border-top: 1px solid rgba(28,20,16,0.06);
        }
        .product-nombre {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem; font-weight: 400;
          color: var(--text-primary);
          margin-bottom: 10px; line-height: 1.3;
          letter-spacing: 0.01em;
        }
        html.dark .product-nombre, [data-theme="dark"] .product-nombre { color: #fdeef5; }
        .product-precios {
          display: flex; align-items: baseline;
          gap: 8px; margin-bottom: 12px;
        }
        .precio-actual {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          color: var(--text-primary);
        }
        html.dark .precio-actual, [data-theme="dark"] .precio-actual { color: #fdeef5; }
        .precio-original {
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .btn-carrito {
          width: 100%; padding: 10px;
          border-radius: 2px;
          border: 1px solid rgba(28,20,16,0.2);
          background: transparent;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem; font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex; align-items: center;
          justify-content: center; gap: 8px;
          transition: all 0.2s ease; cursor: pointer;
        }
        .btn-carrito:hover {
          background: var(--text-primary);
          border-color: var(--text-primary);
          color: #faf7f4;
        }
        .btn-carrito:disabled {
          opacity: 0.3; cursor: not-allowed;
        }
        html.dark .btn-carrito, [data-theme="dark"] .btn-carrito {
          color: #fdeef5;
          border-color: rgba(253,238,245,0.2);
          background: transparent;
        }
        html.dark .btn-carrito:hover, [data-theme="dark"] .btn-carrito:hover {
          background: #fdeef5;
          color: #1a0618;
        }
      `}</style>
    <div className="catalogue-page relative">
      {/* Noise Texture para Dark Mode */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block mix-blend-overlay z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E")' }}></div>

      <header className="hero catalogue-hero">
        <img 
          src="/assets/PetalosArbol.png" 
          className="hero-image dark:hidden" 
          alt="Hero background" 
        />
        <img 
          src="/assets/fondoNocheFlores.jpg" 
          className="hero-image hidden dark:block" 
          alt="Hero background" 
        />
        
        <div className="hero-content">
          <h1 className="hero-title-main">
            {headerContent.titleMain}
            <span className="hero-title-italic">{headerContent.titleItalic}</span>
          </h1>
          
          <div className="hero-divider"></div>
          
          <p className="hero-subtitle">
            {headerContent.sub}
          </p>
        </div>
      </header>

      <main className="container mx-auto pb-20 relative z-10 catalogue-content">
        {/* Toolbar Flotante Editorial */}
        <div className="barra-filtros filters-bar">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="btn-buscar"
          >
            <Search size={14} /> Buscar
          </button>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="btn-filtros"
          >
            <SlidersHorizontal size={14} /> Filtros
          </button>
          
          <div className="contador-productos ml-auto">
            <span>{products.length}</span> Productos
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
              className="products-grid"
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
    </>
  );
}
