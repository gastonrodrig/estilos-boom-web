'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProductStore } from '@/hooks';
import { 
  ArrowLeft, Edit3, Package, Palette, Ruler, 
  Tag, Info, AlertTriangle, Layers, Scissors 
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { getProductById, loading } = useProductStore();
  const [product, setProduct] = useState<any>(null); // Usamos any adaptivo por los nuevos modelos dinámicos
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
    <div className="min-h-screen p-4 md:p-8 text-[#40202D] dark:text-white transition-colors duration-500">
      {/* Header de Navegación */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-4 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <Link href="/admin/products" className="flex items-center gap-2 text-sm font-bold opacity-70 hover:opacity-100 transition-opacity uppercase tracking-wider">
          <ArrowLeft size={18} /> Volver al catálogo
        </Link>
        <Link 
          href={`/admin/products/edit/${product._id || product.id_product}`}
          className="flex items-center gap-2 bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] px-6 py-2.5 rounded-xl hover:scale-[1.02] shadow-lg transition-all text-sm font-bold tracking-wide"
        >
          <Edit3 size={16} /> Editar Producto
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUMNA IZQUIERDA: GALERÍA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 shadow-sm p-2">
            <img src={mainImage || "/placeholder-prenda.png"} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {product.images?.map((img: string, idx: number) => (
              <button 
                key={idx} 
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white/50 dark:bg-black/50 backdrop-blur-md p-1 ${mainImage === img ? 'border-[#D6405F] dark:border-[#F8BBD0] shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
              >
                <img src={img} className="w-full h-full object-cover rounded-xl" alt="miniatura" />
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN Y VARIANTES */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Info Principal */}
          <section className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl p-8 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-white/50 dark:bg-white/10 border border-[#EAE0E2] dark:border-white/20 text-[#D6405F] dark:text-[#F8BBD0] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                {product.id_category?.name || 'Sin Categoría'}
              </span>
              <span className="bg-white/50 dark:bg-white/10 border border-[#EAE0E2] dark:border-white/20 text-[#40202D] dark:text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <Layers size={10}/> {product.origin_type === 'PRODUCCION' ? 'Producción Propia' : 'Retail / Comercial'}
              </span>
              <span className="text-xs opacity-50 font-mono ml-auto tracking-widest">{product.sku}</span>
            </div>
            <h1 className="text-4xl font-black tracking-wide">{product.name}</h1>
            <p className="text-3xl font-bold text-[#D6405F] dark:text-[#F8BBD0] drop-shadow-sm pb-4 border-b border-[#EAE0E2] dark:border-white/10">S/ {(product.base_price || 0).toFixed(2)}</p>
            <div className="p-5 bg-white/50 dark:bg-white/5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 text-sm leading-relaxed opacity-90 shadow-inner">
              {product.description || 'Sin descripción disponible para este producto.'}
            </div>
          </section>

          {/* Especificaciones Técnicas Básicas */}
          <section className="grid grid-cols-3 gap-4">
            <div className="p-5 bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-2 mb-2 opacity-60"><Tag size={14} className="text-[#D6405F] dark:text-[#F8BBD0]"/><span className="text-[9px] font-bold uppercase tracking-wider">Material</span></div>
              <p className="text-sm font-black truncate">{product.composition || 'No especificado'}</p>
            </div>
            <div className="p-5 bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-2 mb-2 opacity-60"><Info size={14} className="text-[#D6405F] dark:text-[#F8BBD0]"/><span className="text-[9px] font-bold uppercase tracking-wider">Género</span></div>
              <p className="text-sm font-black">{product.gender}</p>
            </div>
            <div className="p-5 bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-2 mb-2 opacity-60"><Package size={14} className="text-[#D6405F] dark:text-[#F8BBD0]"/><span className="text-[9px] font-bold uppercase tracking-wider">Temporada</span></div>
              <p className="text-sm font-black truncate">{product.season || 'Todo el año'}</p>
            </div>
          </section>

          {/* 🧵 RENDERIZADO CONDICIONAL: FICHA TÉCNICA DE INSUMOS */}
          {product.origin_type === 'PRODUCCION' && product.technical_sheet && product.technical_sheet.length > 0 && (
            <section className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="p-5 bg-white/50 dark:bg-black/30 border-b border-[#EAE0E2] dark:border-white/10 flex items-center gap-2">
                <Scissors size={18} className="text-[#D6405F] dark:text-[#F8BBD0]" />
                <h3 className="font-bold uppercase text-xs tracking-wider text-[#D6405F] dark:text-[#F8BBD0]">
                  Ficha Técnica de Materiales / Insumos
                </h3>
              </div>
              <div className="p-2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[#8C6B79] dark:text-gray-400 font-bold uppercase tracking-wider border-b border-[#EAE0E2] dark:border-white/10">
                      <th className="p-4">Material Requerido</th>
                      <th className="p-4">Unidad de Medida</th>
                      <th className="p-4 text-right">Cant. por Prenda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
                    {product.technical_sheet.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 font-black text-[#40202D] dark:text-white">{item.name}</td>
                        <td className="p-4 opacity-70 uppercase text-xs">{item.unit}</td>
                        <td className="p-4 text-right font-black text-[#D6405F] dark:text-[#F8BBD0]">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TABLA DE VARIANTES E INVENTARIO */}
          <section className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 uppercase text-xs tracking-wider text-[#D6405F] dark:text-[#F8BBD0]">
                <Palette size={18} className="text-[#D6405F] dark:text-[#F8BBD0]"/> Control de Stock por Variantes
              </h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase font-bold text-[#8C6B79] dark:text-gray-400 border-b border-[#EAE0E2] dark:border-white/10">
                    <th className="px-6 py-4">Talla</th>
                    <th className="px-6 py-4">Color Comercial</th>
                    <th className="px-6 py-4">SKU Variante</th>
                    <th className="px-6 py-4 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
                  {product.variants?.map((variant: any, idx: number) => {
                    // 🛡️ Extraemos de forma segura el objeto de color enriquecido { name, hex }
                    const colorName = variant.color?.name || "No definido";
                    const colorHex = variant.color?.hex || "#FFFFFF";
                    const isStockLow = variant.stock <= (variant.min_stock_alert || 10);

                    return (
                      <tr key={variant._id || idx} className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-black text-sm text-[#40202D] dark:text-white">{variant.size}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 text-sm font-bold text-[#40202D] dark:text-white">
                            {/* 🎨 Círculo interactivo inyectando el color HEX real de la base de datos */}
                            <div 
                              className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 shadow-inner flex-shrink-0" 
                              style={{ backgroundColor: colorHex }}
                              title={`Código HEX: ${colorHex}`}
                            />
                            <span>{colorName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono opacity-70">{variant.sku_variant}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`font-black text-lg drop-shadow-sm ${isStockLow ? 'text-red-500' : 'text-[#D6405F] dark:text-[#F8BBD0]'}`}>
                              {variant.stock} <span className="text-xs opacity-70 font-bold uppercase">uds</span>
                            </span>
                            {isStockLow && (
                              <span className="text-[9px] flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full font-bold uppercase mt-1">
                                <AlertTriangle size={10}/> Stock Bajo
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}