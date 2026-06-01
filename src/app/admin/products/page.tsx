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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-6 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#D6405F] dark:text-[#F8BBD0] mb-2">
            <Tag className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Catálogo</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-medium text-[#40202D] dark:text-white uppercase tracking-wide drop-shadow-md mb-2">
            Gestionar Productos
          </h1>
          <p className="text-sm font-medium text-[#8C6B79] dark:text-gray-400 tracking-wide">
            {products.length} productos registrados
          </p>
        </div>
      </header>

      {/* Barra de Filtros y Acción */}
      <div className="bg-white/50 dark:bg-black/20 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-2xl p-4 mb-10 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        
        {/* Buscador */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C6B79] dark:text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, código..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#EAE0E2] dark:border-white/10 bg-white/80 dark:bg-black/40 text-[13px] font-bold text-[#40202D] dark:text-white focus:outline-none focus:border-[#D6405F] focus:ring-1 focus:ring-[#D6405F] transition-all placeholder:text-[#8C6B79]/60 shadow-inner"
          />
        </div>

        {/* Contenedor de Filtros */}
        <div className="flex flex-1 gap-3 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar items-center w-full lg:w-auto">
          
          <div className="relative shrink-0">
            <select className="appearance-none pl-5 pr-11 py-3 rounded-xl border border-[#EAE0E2] dark:border-white/10 bg-white/80 dark:bg-black/40 text-[12px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 hover:text-[#40202D] dark:hover:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#D6405F]/50 transition-all cursor-pointer">
              <option value="" className="dark:bg-[#1A0B11]">Géneros</option>
              <option value="MUJER" className="dark:bg-[#1A0B11]">Mujer</option>
              <option value="HOMBRE" className="dark:bg-[#1A0B11]">Hombre</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C6B79] pointer-events-none opacity-50" size={16} />
          </div>

          <div className="relative shrink-0">
            <select className="appearance-none pl-5 pr-11 py-3 rounded-xl border border-[#EAE0E2] dark:border-white/10 bg-white/80 dark:bg-black/40 text-[12px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 hover:text-[#40202D] dark:hover:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#D6405F]/50 transition-all cursor-pointer">
              <option value="" className="dark:bg-[#1A0B11]">Estación</option>
              <option value="PV" className="dark:bg-[#1A0B11]">Pri / Verano</option>
              <option value="OI" className="dark:bg-[#1A0B11]">Oto / Invierno</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C6B79] pointer-events-none opacity-50" size={16} />
          </div>

          {/* Selector de Vistas */}
          <div className="flex bg-white/80 dark:bg-black/40 rounded-xl border border-[#EAE0E2] dark:border-white/10 p-1 shrink-0 ml-auto shadow-inner">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white dark:bg-white/10 text-[#D6405F] shadow-sm" : "text-[#8C6B79] hover:text-[#40202D] dark:hover:text-white"}`}
              title="Vista Cuadrícula"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white dark:bg-white/10 text-[#D6405F] shadow-sm" : "text-[#8C6B79] hover:text-[#40202D] dark:hover:text-white"}`}
              title="Vista Lista"
            >
              <ListIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode("compact")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "compact" ? "bg-white dark:bg-white/10 text-[#D6405F] shadow-sm" : "text-[#8C6B79] hover:text-[#40202D] dark:hover:text-white"}`}
              title="Vista Compacta"
            >
              <AlignJustify size={16} />
            </button>
          </div>
        </div>

        <Link
          href="/admin/products/create"
          className="shrink-0 flex items-center justify-center gap-2 bg-[#40202D] dark:bg-white/10 hover:bg-[#2A151D] dark:hover:bg-white/20 border border-transparent dark:border-white/20 text-white px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full lg:w-auto"
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
            <div className="col-span-full py-16 text-center bg-white/30 dark:bg-white/5 rounded-3xl border border-dashed border-[#EAE0E2] dark:border-white/20">
              <Package className="w-16 h-16 mx-auto text-[#8C6B79]/40 mb-4" />
              <p className="text-[15px] font-bold text-[#8C6B79] dark:text-gray-400">
                No hay productos que mostrar
              </p>
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
        className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-[#EAE0E2] dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center p-3 gap-4 group"
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
               <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${product.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500"}`}>{product.is_active ? "Activo" : "Inactivo"}</span>
             </div>
             <div className="flex items-center gap-2">
                <Link href={`/admin/products/${product.id_product}`} className="p-2 bg-white dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-xl hover:bg-[#D6405F]/10 hover:border-[#D6405F]/30 text-[#40202D] dark:text-white hover:text-[#D6405F] transition-all">
                  <Eye size={16} />
                </Link>
                <button type="button" className="p-2 bg-white dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/30 text-gray-400 hover:text-rose-500 transition-all">
                  <Power size={16} />
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
        className="bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-[#EAE0E2] dark:border-white/10 overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-white/5 transition-all flex flex-col sm:flex-row group"
      >
        <div className="relative h-48 sm:h-auto sm:w-56 shrink-0 bg-gray-100 dark:bg-white/5 border-b sm:border-b-0 sm:border-r border-[#EAE0E2] dark:border-white/10 overflow-hidden">
          {product.images?.[0] ? (
             <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#8C6B79]/40"><Package size={32} className="mb-2" /><span className="text-[9px] font-black uppercase tracking-widest">Sin Foto</span></div>
          )}
          <div className="absolute top-3 left-3">
             <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${product.is_active ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" : "bg-gray-500/20 text-gray-700 dark:text-gray-300 border border-gray-500/30"}`}>
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
                <Link href={`/admin/products/${product.id_product}`} className="flex items-center gap-2 px-5 py-3 border border-[#EAE0E2] dark:border-white/10 rounded-xl hover:border-[#D6405F] bg-white/80 dark:bg-white/5 hover:bg-white transition-all text-[11px] font-black uppercase tracking-widest text-[#40202D] dark:text-white shadow-sm">
                  <Eye size={16} /> Detalles
                </Link>
                <button type="button" className="px-4 py-3 border border-[#EAE0E2] dark:border-white/10 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/30 text-[#8C6B79] hover:text-rose-500 transition-colors bg-white/80 dark:bg-white/5 shadow-sm">
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-3xl border border-[#EAE0E2] dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-white/5 transition-all duration-300 flex flex-col group"
    >
      {/* Imagen Superior */}
      <div className="relative h-48 w-full bg-gray-100 dark:bg-white/5 overflow-hidden border-b border-[#EAE0E2] dark:border-white/10">
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
        
        {/* Badges Flotantes */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span
            className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${
              product.is_active
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "bg-gray-500/20 text-gray-700 dark:text-gray-300 border border-gray-500/30"
            }`}
          >
            {product.is_active ? "Activo" : "Inactivo"}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/80 dark:bg-black/60 text-[#40202D] dark:text-white shadow-sm backdrop-blur-md border border-white/20">
            {product.gender}
          </span>
        </div>
      </div>

      {/* Contenido Inferior */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-bold text-[16px] text-[#40202D] dark:text-white leading-tight mb-2 group-hover:text-[#D6405F] dark:group-hover:text-[#F8BBD0] transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[12px] font-medium text-[#8C6B79] dark:text-gray-400 line-clamp-2 mb-3">
            {product.composition || "Sin composición definida"}
          </p>
        </div>

        <div className="flex items-end justify-between mt-2 pt-4 border-t border-[#EAE0E2] dark:border-white/10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-500 mb-0.5">
              {product.variants?.length || 0} Variantes
            </p>
            <p className="text-xl font-black text-[#D6405F] dark:text-[#F8BBD0]">
              S/ {product.base_price.toFixed(2)}
            </p>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-500 text-right">
            {product.season || "Atópico"}
          </p>
        </div>

        {/* Acciones */}
        <div className="mt-5 flex gap-2">
          <Link
            href={`/admin/products/${product.id_product}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#EAE0E2] dark:border-white/10 rounded-xl hover:border-[#D6405F] dark:hover:border-[#F8BBD0] bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest text-[#40202D] dark:text-white shadow-sm"
          >
            <Eye size={16} />
            Ver Detalles
          </Link>

          <button
            type="button"
            className="px-3 py-2.5 border border-[#EAE0E2] dark:border-white/10 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/30 text-[#8C6B79] hover:text-rose-500 transition-colors bg-white/50 dark:bg-white/5 shadow-sm"
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