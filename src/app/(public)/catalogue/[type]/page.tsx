"use client";
import { useParams } from "next/navigation";
import { useProductStore } from "@/hooks/product/use-product-store";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, LayoutGrid, List, Search } from "lucide-react";
import { ProductCardCatalogue } from "@/components/molecules/product-catalog-card/product-catalog-card";
import { FilterDrawer, SearchDrawer } from "@/components";

export default function CollectionPage() {
  const { type } = useParams();
  const { products, loading, startLoadingProducts } = useProductStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // 1. Definimos los filtros base
    const categoryFilter = type === "dresses" ? "Dresses" : undefined;
    const sectionFilter = type !== "dresses" ? (type as string) : undefined;

    // 2. CAMBIO: Envolvemos los argumentos en un objeto {}
    startLoadingProducts({
      section: sectionFilter,
      category: categoryFilter,
    });
  }, [type, startLoadingProducts]);

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
    <div className="min-h-screen bg-white">
      <div className="bg-[#f8b4c2] text-white py-2 text-center text-xs font-medium tracking-wide">
        ✨ Envío gratis en compras mayores a S/149 | Descuentos hasta 40% en
        toda la tienda
      </div>

      <header className="bg-linear-to-b from-[#fce4ec] to-white pt-24 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-[#4a4a4a] mb-4">
          {headerContent.title}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto italic">
          {headerContent.sub}
        </p>
      </header>

      <main className="container mx-auto px-6 pb-20">
        <div className="flex justify-between items-center py-6 border-b border-gray-100 mb-10">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
            >
              <Search size={16} /> Buscar
            </button>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
            >
              <SlidersHorizontal size={16} /> Filtros
            </button>
            <span className="text-gray-400 text-sm">
              {products.length} productos
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LayoutGrid size={20} className="text-gray-800 cursor-pointer" />
            <List size={20} className="text-gray-300 cursor-pointer" />
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
