"use client";
import React, { useEffect, useState } from "react";
import { useProductStore } from "@/hooks";
import { Product } from "@/core/models";
import Link from "next/link";
import { Search, Filter, Plus, Eye, Power, Tag, Package, ChevronDown, LayoutGrid, List as ListIcon, AlignJustify } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "grid" | "list" | "compact";

const ProductManagement: React.FC = () => {
  const { products, loading, startLoadingProducts } = useProductStore();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    // Carga inicial con los filtros por defecto
    startLoadingProducts({ limit: 10, offset: 0 });
  }, [startLoadingProducts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-2">
        <div>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }} className="mb-2 text-[#8B3A52] opacity-60 dark:text-white dark:opacity-35 font-medium uppercase">
            Inicio / Gestionar Productos / Catálogo
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
            <h2 className="text-[#40202D] dark:text-white leading-none mb-2" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2rem', fontWeight: 300 }}>
              Gestionar Productos
            </h2>
          </div>
          <p className="text-[#8C6B79] dark:text-white tracking-[0.03em] mt-3" style={{ fontSize: '0.78rem', opacity: 0.45 }}>
            {products.length} productos registrados en el catálogo textil.
          </p>
        </div>
      </header>

      {/* Barra de Filtros y Acción */}
      <div className="flex flex-col lg:flex-row gap-[12px] items-center mb-6 w-full">
        
        {/* Buscador */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 pointer-events-none"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, código..."
            className="w-full rounded-[10px] border border-[#EAE0E2] dark:border-[rgba(255,255,255,0.15)] bg-white/80 dark:bg-[rgba(255,255,255,0.08)] py-[10px] pl-[44px] pr-[16px] text-sm text-[#40202D] dark:text-white shadow-md dark:shadow-none focus:border-[#D6405F] dark:focus:border-[#8B3A52] focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-[#a08088]"
          />
        </div>

        {/* Contenedor de Filtros */}
        <div className="flex flex-1 gap-[12px] overflow-x-auto custom-scrollbar items-center w-full lg:w-auto">
          
          <div className="relative shrink-0">
            <select className="appearance-none pl-[16px] pr-[44px] py-[10px] rounded-[10px] border border-[#EAE0E2] dark:border-[rgba(255,255,255,0.15)] bg-white/80 dark:bg-[rgba(255,255,255,0.08)] text-sm text-[#40202D] dark:text-white shadow-md dark:shadow-none focus:border-[#D6405F] dark:focus:border-[#8B3A52] focus:outline-none transition-all cursor-pointer">
              <option value="" className="dark:bg-[#1A0B11]">Géneros</option>
              <option value="MUJER" className="dark:bg-[#1A0B11]">Mujer</option>
              <option value="HOMBRE" className="dark:bg-[#1A0B11]">Hombre</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C6B79] pointer-events-none opacity-50" size={16} />
          </div>

          <div className="relative shrink-0">
            <select className="appearance-none pl-[16px] pr-[44px] py-[10px] rounded-[10px] border border-[#EAE0E2] dark:border-[rgba(255,255,255,0.15)] bg-white/80 dark:bg-[rgba(255,255,255,0.08)] text-sm text-[#40202D] dark:text-white shadow-md dark:shadow-none focus:border-[#D6405F] dark:focus:border-[#8B3A52] focus:outline-none transition-all cursor-pointer">
              <option value="" className="dark:bg-[#1A0B11]">Estación</option>
              <option value="PV" className="dark:bg-[#1A0B11]">Pri / Verano</option>
              <option value="OI" className="dark:bg-[#1A0B11]">Oto / Invierno</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C6B79] pointer-events-none opacity-50" size={16} />
          </div>

          {/* Selector de Vistas */}
          <div className="flex gap-[8px] shrink-0 lg:ml-auto ml-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-[8px] rounded-[8px] border transition-all ${viewMode === "grid" ? "border-[#8B3A52] bg-white/80 dark:bg-[rgba(255,255,255,0.08)] text-[#D6405F] dark:text-white shadow-md dark:shadow-none" : "border-[#EAE0E2] dark:border-[rgba(255,255,255,0.15)] bg-white/50 dark:bg-[rgba(255,255,255,0.03)] text-gray-400 dark:text-[#a08088] hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 hover:dark:bg-[rgba(255,255,255,0.08)] shadow-sm hover:shadow-md dark:shadow-none"}`}
              title="Vista Cuadrícula"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-[8px] rounded-[8px] border transition-all ${viewMode === "list" ? "border-[#8B3A52] bg-white/80 dark:bg-[rgba(255,255,255,0.08)] text-[#D6405F] dark:text-white shadow-md dark:shadow-none" : "border-[#EAE0E2] dark:border-[rgba(255,255,255,0.15)] bg-white/50 dark:bg-[rgba(255,255,255,0.03)] text-gray-400 dark:text-[#a08088] hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 hover:dark:bg-[rgba(255,255,255,0.08)] shadow-sm hover:shadow-md dark:shadow-none"}`}
              title="Vista Lista"
            >
              <ListIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode("compact")}
              className={`p-[8px] rounded-[8px] border transition-all ${viewMode === "compact" ? "border-[#8B3A52] bg-white/80 dark:bg-[rgba(255,255,255,0.08)] text-[#D6405F] dark:text-white shadow-md dark:shadow-none" : "border-[#EAE0E2] dark:border-[rgba(255,255,255,0.15)] bg-white/50 dark:bg-[rgba(255,255,255,0.03)] text-gray-400 dark:text-[#a08088] hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 hover:dark:bg-[rgba(255,255,255,0.08)] shadow-sm hover:shadow-md dark:shadow-none"}`}
              title="Vista Compacta"
            >
              <AlignJustify size={16} />
            </button>
          </div>
        </div>

        <Link
          href="/admin/products/create"
          className="shrink-0 flex items-center justify-center gap-2 bg-[#8B3A52] hover:bg-[#a04060] text-white shadow-md transition-all font-medium w-full lg:w-auto lg:ml-0"
          style={{ borderRadius: "8px", fontSize: "0.8rem", letterSpacing: "0.05em", padding: "10px 20px" }}
        >
          <Plus size={16} />
          Nuevo Producto
        </Link>
      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#D6405F] dark:text-[#F8BBD0]">
          <div className="w-12 h-12 border-4 border-[#D6405F] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[13px] font-black uppercase tracking-widest text-[#8C6B79]">
            Cargando Catálogo...
          </p>
        </div>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : viewMode === "list"
            ? "flex flex-col gap-5"
            : "flex flex-col gap-3"
        }>
          <AnimatePresence>
            {products.map((product) => (
              <ProductCard key={product.id_product} product={product} viewMode={viewMode} />
            ))}
          </AnimatePresence>

          {!loading && products.length === 0 && (
            <div className="col-span-full rounded-2xl border border-[rgba(139,58,82,0.08)] bg-[#faf5f0] dark:bg-[rgba(255,255,255,0.04)] p-8 text-center text-sm text-gray-500 shadow-sm transition-[background-color,border-color] duration-[600ms]">
              No hay registros disponibles.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProductCard: React.FC<{ product: Product; viewMode: ViewMode }> = ({ product, viewMode }) => {
  // === VISTA COMPACTA ===
  if (viewMode === "compact") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="bg-[#fffcfd] dark:bg-black/40 backdrop-blur-2xl rounded-[1.5rem] border border-pink-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-colors duration-500 flex flex-col sm:flex-row items-center p-3 gap-4 group"
      >
        <div className="relative h-14 w-14 shrink-0 bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden border border-[#EAE0E2] dark:border-white/5">
          {product.images?.[0] ? (
             <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8C6B79]/30"><Package size={20} /></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <div className="flex-1 min-w-0">
             <h3 className="font-bold text-[15px] text-[#40202D] dark:text-white truncate group-hover:text-[#D6405F] transition-colors">{product.name}</h3>
             <div className="flex items-center gap-3 mt-1">
               <span className="text-[10px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">{product.gender}</span>
               <span className="w-1 h-1 rounded-full bg-[#8C6B79]/30"></span>
               <span className="text-[10px] font-medium text-[#8C6B79] dark:text-gray-400">{product.variants?.length || 0} var.</span>
             </div>
          </div>
          
          <div className="flex items-center gap-6 shrink-0">
             <div className="text-right">
               <p className="text-[14px] font-black text-[#D6405F] dark:text-[#F8BBD0]">S/ {product.base_price.toFixed(2)}</p>
               <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${product.is_active ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30" : "bg-gray-500/15 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300 border border-gray-500/30"}`}>{product.is_active ? "Activo" : "Inactivo"}</span>
             </div>
             <div className="flex items-center gap-2">
                <Link
                  href={`/admin/products/${product.id_product}`}
                  className="p-[6px] bg-white dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-lg hover:bg-pink-50 dark:hover:bg-white/10 text-[#40202D] dark:text-white hover:text-[#8B3A52] transition-colors"
                >
                  <Eye size={14} />
                </Link>
                <button
                  type="button"
                  className="p-[6px] bg-white dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Power size={14} />
                </button>
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // === VISTA LISTA ===
  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }}
        className="bg-[#fffcfd] dark:bg-black/40 backdrop-blur-2xl rounded-[1.5rem] border border-pink-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-white/5 transition-colors duration-500 flex flex-col sm:flex-row group"
      >
        <div className="relative h-48 sm:h-auto sm:w-56 shrink-0 bg-gray-100 dark:bg-white/5 border-b sm:border-b-0 sm:border-r border-[#EAE0E2] dark:border-white/10 overflow-hidden">
          {product.images?.[0] ? (
             <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#8C6B79]/40"><Package size={32} className="mb-2" /><span className="text-[9px] font-black uppercase tracking-widest">Sin Foto</span></div>
          )}
          <div className="absolute top-3 left-3">
             <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${product.is_active ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30" : "bg-gray-500/15 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300 border border-gray-500/30"}`}>
               {product.is_active ? "Activo" : "Inactivo"}
             </span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between">
           <div>
             <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-bold text-[18px] text-[#40202D] dark:text-white leading-tight group-hover:text-[#D6405F] transition-colors">{product.name}</h3>
                <span className="shrink-0 inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/80 dark:bg-black/60 text-[#40202D] dark:text-white shadow-sm border border-[#EAE0E2] dark:border-white/20">{product.gender}</span>
             </div>
             <p className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-400 line-clamp-2 mb-4">{product.composition || "Sin composición definida"}</p>
           </div>

           <div className="flex items-center justify-between mt-auto">
             <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-500 mb-1">{product.variants?.length || 0} Variantes • {product.season || "Atópico"}</p>
                <p className="text-2xl font-black text-[#D6405F] dark:text-[#F8BBD0]">S/ {product.base_price.toFixed(2)}</p>
             </div>
             <div className="flex gap-2">
                <Link href={`/admin/products/${product.id_product}`} className="flex items-center gap-2 px-5 py-3 border border-[#EAE0E2] dark:border-white/10 rounded-xl hover:border-pink-200 bg-white/80 dark:bg-white/5 hover:bg-pink-50 transition-colors text-[11px] font-black uppercase tracking-widest text-[#40202D] dark:text-white hover:text-[#8B3A52] shadow-sm">
                  <Eye size={16} /> Detalles
                </Link>
                <button type="button" className="px-4 py-3 border border-[#EAE0E2] dark:border-white/10 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 text-[#8C6B79] hover:text-red-600 transition-colors bg-white/80 dark:bg-white/5 shadow-sm">
                  <Power size={16} />
                </button>
             </div>
           </div>
        </div>
      </motion.div>
    );
  }

  // === VISTA CUADRÍCULA (GRID POR DEFECTO) ===
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-[#fffcfd] dark:bg-black/40 backdrop-blur-2xl rounded-[1.5rem] border border-pink-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-white/5 transition-colors duration-500 flex flex-col group"
    >
      {/* Imagen Superior */}
      <div className="relative h-[140px] w-full bg-gray-100 dark:bg-white/5 overflow-hidden border-b border-[#EAE0E2] dark:border-white/10">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#8C6B79]/50 dark:text-white/20">
            <Package size={40} className="mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Sin Foto
            </span>
          </div>
        )}
      </div>

      {/* Contenido Inferior */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-bold text-[16px] text-[#40202D] dark:text-[#e8d8dc] leading-tight mb-2 group-hover:text-[#8B3A52] transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex gap-[6px] mb-3">
            <span
              className={`inline-flex uppercase`}
              style={{ 
                fontSize: '0.6rem', padding: '2px 8px', borderRadius: '999px',
                background: product.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                color: product.is_active ? 'var(--tw-colors-emerald-700, #047857)' : 'var(--tw-colors-gray-700, #374151)',
                border: product.is_active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(107, 114, 128, 0.3)'
              }}
            >
              {product.is_active ? "Activo" : "Inactivo"}
            </span>
            <span 
              className="inline-flex uppercase"
              style={{ 
                fontSize: '0.6rem', padding: '2px 8px', borderRadius: '999px',
                background: 'rgba(160,80,104,0.15)', color: '#c4a0ae', border: '1px solid rgba(160,80,104,0.25)'
              }}
            >
              {product.gender}
            </span>
          </div>

          <p className="line-clamp-2 mb-3 text-[#40202D] dark:text-white" style={{ fontSize: '0.75rem', opacity: 0.4, fontStyle: 'italic' }}>
            {product.composition || "Sin composición definida"}
          </p>
        </div>

        <div className="flex items-end justify-between mt-2 pt-3 border-t border-[#EAE0E2] dark:border-[rgba(255,255,255,0.1)]">
          <div>
            <p className="uppercase text-[#40202D] dark:text-white mb-0.5" style={{ fontSize: '0.62rem', opacity: 0.35, letterSpacing: '0.08em' }}>
              {product.variants?.length || 0} Variantes
            </p>
            <p className="text-[#40202D] dark:text-[#e8d8dc]" style={{ fontSize: '1rem', fontWeight: 600 }}>
              S/ {product.base_price.toFixed(2)}
            </p>
          </div>
          <p className="uppercase text-[#40202D] dark:text-white text-right" style={{ fontSize: '0.62rem', opacity: 0.35, letterSpacing: '0.08em' }}>
            {product.season || "Atópico"}
          </p>
        </div>

        {/* Acciones */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/admin/products/${product.id_product}`}
            className="flex-1 flex items-center justify-center gap-2 py-2 transition-colors text-[#40202D] dark:text-white shadow-sm bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 hover:bg-pink-50 dark:hover:bg-white/10 hover:text-[#8B3A52] hover:border-pink-200 dark:hover:border-white/20"
            style={{ borderRadius: '8px', fontSize: '0.75rem' }}
          >
            <Eye size={16} />
            Ver Detalles
          </Link>

          <button
            type="button"
            className="w-10 flex items-center justify-center text-gray-400 dark:text-white/40 bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors hover:border-red-200 dark:hover:border-red-500/30"
            style={{ borderRadius: '8px' }}
            title={product.is_active ? "Desactivar" : "Activar"}
          >
            <Power size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductManagement;