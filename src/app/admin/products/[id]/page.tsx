'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProductStore } from '@/hooks';
import { Product } from '@/core/models';
import { 
  ArrowLeft, Edit3, Package, Palette, Ruler, 
  Tag, Info, ChevronRight, AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { getProductById, loading } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      const data = await getProductById(id as string);
      if (data) {
        setProduct(data);
        setMainImage(data.images[0] || '');
      }
    };
    fetchProduct();
  }, [id, getProductById]);

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="animate-pulse text-[#F2778D] font-serif italic text-xl">Cargando detalles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 md:p-8 text-[#594246]">
      {/* Header de Navegación */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <Link href="/admin/products" className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity">
          <ArrowLeft size={18} /> Volver al catálogo
        </Link>
        <Link 
          href={`/admin/products/edit/${product.id_product}`}
          className="flex items-center gap-2 bg-[#594246] text-white px-6 py-2 rounded-lg hover:bg-black transition-all shadow-md"
        >
          <Edit3 size={18} /> Editar Producto
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUMNA IZQUIERDA: GALERÍA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-[#EBEAE8] shadow-sm">
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${mainImage === img ? 'border-[#F2778D]' : 'border-transparent opacity-60'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN Y VARIANTES */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Info Principal */}
          <section>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#F2D0D3] text-[#594246] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                {product.category?.name || 'Sin Categoría'}
              </span>
              <span className="text-xs opacity-40 font-mono">{product.sku}</span>
            </div>
            <h1 className="text-4xl font-serif font-bold mb-4">{product.name}</h1>
            <p className="text-2xl font-light text-[#F2778D] mb-6">S/ {product.base_price.toFixed(2)}</p>
            <div className="p-4 bg-white rounded-xl border border-[#EBEAE8] text-sm leading-relaxed opacity-80">
              {product.description || 'Sin descripción disponible para este producto.'}
            </div>
          </section>

          {/* Especificaciones Técnicas */}
          <section className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-[#EBEAE8]">
              <div className="flex items-center gap-2 mb-1 opacity-50"><Tag size={14}/> <span className="text-[10px] font-bold uppercase">Material</span></div>
              <p className="text-sm font-medium">{product.composition || 'No especificado'}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#EBEAE8]">
              <div className="flex items-center gap-2 mb-1 opacity-50"><Info size={14}/> <span className="text-[10px] font-bold uppercase">Género</span></div>
              <p className="text-sm font-medium">{product.gender}</p>
            </div>
          </section>

          {/* TABLA DE VARIANTES E INVENTARIO */}
          <section className="bg-white rounded-2xl border border-[#EBEAE8] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#FAF9F6] flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 uppercase text-xs tracking-wider">
                <Package size={16} className="text-[#F2778D]"/> Gestión de Inventario
              </h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase opacity-40 bg-[#FAF9F6]">
                  <th className="px-6 py-3">Talla</th>
                  <th className="px-6 py-3">Color</th>
                  <th className="px-6 py-3">SKU Variante</th>
                  <th className="px-6 py-3 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9F6]">
                {product.variants.map((variant) => (
                  <tr key={variant.id_variant} className="hover:bg-[#FAF9F6]/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm">{variant.size}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-[#F2B6C1]" />
                        {variant.color}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono opacity-50">{variant.sku_variant}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-bold ${variant.stock <= (variant.min_stock_alert || 0) ? 'text-red-500' : 'text-[#594246]'}`}>
                          {variant.stock} uds
                        </span>
                        {variant.stock <= (variant.min_stock_alert || 0) && (
                          <span className="text-[9px] flex items-center gap-1 text-red-400 font-bold uppercase">
                            <AlertTriangle size={10}/> Stock Bajo
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

        </div>
      </div>
    </div>
  );
}