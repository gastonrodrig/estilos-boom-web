'use client';
import React,{ useEffect } from 'react';
import { useProductStore } from '@/hooks';
import { Product } from '@/core/models';
import Link from 'next/link';
import { Search, Filter, Plus, Eye, Power } from 'lucide-react';

const ProductManagement: React.FC = () => {
  const { products, loading, startLoadingProducts } = useProductStore();
  const [openCreateModal, setOpenCreateModal] = React.useState(false);

  useEffect(() => {
    // Carga inicial con los filtros por defecto
    startLoadingProducts({ limit: 10, offset: 0 });
  }, [startLoadingProducts]);

  return (
    <div className="min-h-screen p-8 bg-[#FAF9F6] text-[#594246]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Gestionar Productos</h1>
          <p className="text-sm opacity-70">{products.length} productos registrados</p>
        </div>
        <Link 
			href="/admin/products/create" // Asegúrate de que esta ruta coincida con tu estructura de carpetas
			className="flex items-center gap-2 bg-[#F2778D] hover:bg-[#F291A3] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
			>
			<Plus size={20} />
			Nuevo Producto
			</Link>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
          <input 
            type="text" 
            placeholder="Buscar producto..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[#EBEAE8] focus:outline-none focus:ring-2 focus:ring-[#F2B6C1]"
          />
        </div>
        
        <select className="px-4 py-2 rounded-md border border-[#EBEAE8] bg-white">
          <option>Género</option>
          <option value="MUJER">Mujer</option>
          <option value="HOMBRE">Hombre</option>
        </select>

        <select className="px-4 py-2 rounded-md border border-[#EBEAE8] bg-white">
          <option>Estación</option>
          <option>Primavera / Verano</option>
          <option>Otoño / Invierno</option>
        </select>

        <button className="flex items-center gap-2 px-4 py-2 border border-[#EBEAE8] rounded-md hover:bg-[#EBEAE8] transition-colors">
          <Filter size={18} />
          Más filtros
        </button>
      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="flex justify-center py-20">Cargando catálogo...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id_product} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="bg-white rounded-xl border border-[#EBEAE8] overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex gap-4 mb-4">
          {/* Imagen del Producto */}
          <div className="w-24 h-24 bg-[#EBEAE8] rounded-lg overflow-hidden flex-shrink-0">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] uppercase opacity-40">Sin foto</div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg leading-tight mb-1">{product.name}</h3>
            </div>
            <div className="flex gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${product.is_active ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#F2D0D3] text-[#594246]'}`}>
                {product.is_active ? 'Activo' : 'Suspendido'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-[#EBEAE8]">
                {product.gender}
              </span>
            </div>
            <p className="text-xs opacity-60 line-clamp-1">{product.composition || 'Sin composición definida'}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider">{product.season || 'Toda temporada'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-3 border-y border-[#FAF9F6] text-sm opacity-80">
          <div className="flex items-center gap-1">
            <span className="font-bold">{product.variants.length}</span>
            <span className="text-xs">variantes</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold">S/ {product.base_price.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-[#594246] rounded-md hover:bg-[#594246] hover:text-white transition-all text-sm font-medium">
            <Eye size={16} />
            Ver / Editar
          </button>
          <button className="px-3 py-2 border border-[#EBEAE8] rounded-md hover:bg-red-50 text-red-400 transition-colors">
            <Power size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;