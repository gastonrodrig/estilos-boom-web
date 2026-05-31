"use client";
import { useParams } from "next/navigation";
import { useProductStore } from "@/hooks/product/use-product-store";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, LayoutGrid, List, Search } from "lucide-react";
import { ProductCardCatalogue } from "@/components/molecules/product-home-card/product-card-catalogue";
import { FilterDrawer, SearchDrawer } from "@/components";

export default function CollectionPage() {
  const { type } = useParams();
  const { products, loading, startLoadingProducts } = useProductStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
        title: "Nueva Colección Primavera 2026",
        sub: "Descubre las últimas tendencias en moda femenina.",
      },
      "best-seller": {
        title: "Best Sellers Favoritos",
        sub: "Las prendas más amadas por nuestra comunidad.",
      },
      dresses: {
        title: "Vestidos Exclusivos",
        sub: "Diseños pensados para resaltar tu esencia.",
      },
    };
    return (
      titles[type as keyof typeof titles] || {
        title: "Colección Boom",
        sub: "Moda que inspira.",
      }
    );
  }, [type]);

  return (
    <div className="min-h-screen bg-transparent">
      <header className="relative pt-24 pb-20 px-6 text-center overflow-hidden flex flex-col items-center justify-center">
        {/* Imagen de fondo (Pétalos) con baja opacidad para mantener la elegancia */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: "url('/assets/PetalosArbol.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* Degradado para que se funda suavemente con la página */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FDF9F3]/40 via-[#FDF9F3]/60 to-[#FDF9F3] pointer-events-none" />

        {/* Contenido (Textos) */}
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="hidden sm:block h-px w-16 bg-[#632034]/40"></div>
            <h1 className="text-4xl md:text-5xl text-[#632034]">
              {headerContent.title}
            </h1>
            <div className="hidden sm:block h-px w-16 bg-[#632034]/40"></div>
          </div>
          <p className="text-[#594246]/80 max-w-2xl mx-auto font-medium tracking-wide">
            {headerContent.sub}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-20">
        <div className="flex flex-wrap justify-between items-center py-6 border-b border-[#EBEAE8] mb-10 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 border border-[#EBEAE8] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#594246] hover:border-[#632034] hover:text-[#632034] transition-all shadow-sm"
            >
              <Search size={15} strokeWidth={2.5} /> Buscar
            </button>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 border border-[#EBEAE8] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#594246] hover:border-[#632034] hover:text-[#632034] transition-all shadow-sm"
            >
              <SlidersHorizontal size={15} strokeWidth={2.5} /> Filtros
            </button>
            <span className="hidden sm:inline-block text-[#594246]/60 text-xs font-medium tracking-wide ml-2">
              {products.length} PRODUCTOS
            </span>
          </div>
          <div className="flex items-center gap-4 border border-[#EBEAE8] bg-white p-2 shadow-sm">
            <LayoutGrid size={18} className="text-[#632034] cursor-pointer" />
            <List size={18} className="text-[#EBEAE8] cursor-pointer hover:text-[#594246] transition-colors" />
          </div>
        </div>

        {/* Grid de Productos usando el Componente Reutilizable */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {loading
            ? Array(8)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-100 aspect-3/4 rounded-lg"
                  />
                ))
            : products.map((product) => (
                <ProductCardCatalogue
                  key={product.id_product}
                  product={product}
                />
              ))}
        </div>

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
