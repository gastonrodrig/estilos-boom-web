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
    <div className="min-h-screen p-4 md:p-8 text-[#40202D] dark:text-[#40202D] dark:text-white transition-colors duration-500">
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center bg-white/30 dark:bg-[#1a0f18]/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-[#EAE0E2] dark:border-[#8B3A52]/20 shadow-sm">
        <Link href="/admin/products" className="flex items-center gap-2 text-sm text-zinc-500 dark:text-[#F8BBD0]/80 hover:text-zinc-800 dark:text-[#fdf6f0]/90 bg-transparent border-none">
          <ArrowLeft size={18} /> Volver al catálogo
        </Link>
        <Link 
          href={`/admin/products/edit/${product._id || product.id_product}`}
          className="flex items-center gap-2 border border-[#8B3A52] text-[#8B3A52] hover:bg-[#8B3A52] hover:text-[#40202D] dark:text-white bg-transparent rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          <Edit3 size={16} /> Editar Producto
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUMNA IZQUIERDA: GALERÍA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-white/70 dark:bg-[#1a0f18]/40 backdrop-blur-2xl border border-[#EAE0E2] dark:border-[#8B3A52]/20 shadow-sm p-2">
            <img src={mainImage || "/placeholder-prenda.png"} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {product.images?.map((img: string, idx: number) => (
              <button 
                key={idx} 
                onClick={() => setMainImage(img)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all flex-shrink-0 ${mainImage === img ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1a0f18] ring-[#D6405F] dark:ring-[#F8BBD0] shadow-md scale-105' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="miniatura" />
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN Y VARIANTES */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Info Principal */}
          <section className="bg-white/70 dark:bg-[#1a0f18]/40 backdrop-blur-2xl p-8 rounded-3xl border border-[#EAE0E2] dark:border-[#8B3A52]/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {product.id_category?.name || 'Sin Categoría'}
              </span>
              <span className="bg-[#8B3A52]/10 text-[#8B3A52] dark:bg-[#8B3A52]/20 dark:text-[#e8c4cc] border border-[#8B3A52]/20 dark:border-[#8B3A52]/40 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Layers size={10}/> {product.origin_type === 'PRODUCCION' ? 'Producción Propia' : 'Retail / Comercial'}
              </span>
              <span className="text-xs text-zinc-600 dark:text-[#F8BBD0]/90 font-mono ml-auto">{product.sku}</span>
            </div>
            <h1 className="text-2xl font-normal text-[#40202D] dark:text-[#fdf6f0] tracking-wide">{product.name}</h1>
            <p className="text-xl font-medium text-[#8B3A52] pb-4 border-b border-zinc-200 dark:border-[#8B3A52]/20">S/ {(product.base_price || 0).toFixed(2)}</p>
            <div className="bg-zinc-100/50 dark:bg-[#2d1a28]/30 border border-zinc-200/50 dark:border-[#8B3A52]/20 rounded-xl text-sm text-zinc-800 dark:text-[#fdf6f0]/90 font-normal leading-relaxed p-4">
              {product.description || 'Sin descripción disponible para este producto.'}
            </div>
          </section>

          {/* Especificaciones Técnicas Básicas */}
          <section className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-100/50 dark:bg-[#2d1a28]/30 border border-zinc-200/50 dark:border-[#8B3A52]/20 rounded-xl p-4 flex flex-col justify-center">
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 bg-[#8B3A52]/10 dark:bg-[#F8BBD0]/10 text-[#8B3A52] dark:text-[#F8BBD0] px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                  <Tag size={12}/> Material
                </span>
              </div>
              <p className="text-sm font-normal text-[#40202D] dark:text-white truncate">{product.composition || 'No especificado'}</p>
            </div>
            <div className="bg-zinc-100/50 dark:bg-[#2d1a28]/30 border border-zinc-200/50 dark:border-[#8B3A52]/20 rounded-xl p-4 flex flex-col justify-center">
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 bg-[#8B3A52]/10 dark:bg-[#F8BBD0]/10 text-[#8B3A52] dark:text-[#F8BBD0] px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                  <Info size={12}/> Género
                </span>
              </div>
              <p className="text-sm font-normal text-[#40202D] dark:text-white">{product.gender}</p>
            </div>
            <div className="bg-zinc-100/50 dark:bg-[#2d1a28]/30 border border-zinc-200/50 dark:border-[#8B3A52]/20 rounded-xl p-4 flex flex-col justify-center">
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 bg-[#8B3A52]/10 dark:bg-[#F8BBD0]/10 text-[#8B3A52] dark:text-[#F8BBD0] px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                  <Package size={12}/> Temporada
                </span>
              </div>
              <p className="text-sm font-normal text-[#40202D] dark:text-white truncate">{product.season || 'Todo el año'}</p>
            </div>
          </section>

          {/* 🧵 RENDERIZADO CONDICIONAL: FICHA TÉCNICA DE INSUMOS */}
          {product.origin_type === 'PRODUCCION' && product.technical_sheet && product.technical_sheet.length > 0 && (
            <section className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-white/70 backdrop-blur-2xl dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-3xl overflow-hidden animate-in fade-in duration-300 transition-[background-color,border-color] duration-[600ms]">
              <div className="p-5 border-b border-zinc-200 dark:border-[#8B3A52]/20 flex items-center gap-2">
                <Scissors size={18} className="text-[#D6405F] dark:text-[#F8BBD0]" />
                <h3 className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#8B3A52] dark:text-[#F8BBD0]">
                  Ficha Técnica de Materiales / Insumos
                </h3>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-zinc-50 dark:bg-[#1a0f18]/80 relative transition-[background-color,border-color] duration-[600ms]">
                    <tr className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 dark:text-[#F8BBD0]/80 border-b border-zinc-200 dark:border-[#8B3A52]/20">
                      <th className="p-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Material Requerido</th>
                      <th className="p-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Unidad de Medida</th>
                      <th className="p-4 text-right border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Cant. por Prenda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
                    {product.technical_sheet.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-zinc-200 dark:border-[#8B3A52]/10 transition-colors hover:bg-zinc-100 dark:hover:bg-[#8B3A52]/10">
                        <td className="p-4 text-sm font-medium text-zinc-700 dark:text-[#fdf6f0]">
                          <div>{item.id_supply?.name ?? item.name ?? '—'}</div>
                          {item.detail && <div className="text-[11px] text-zinc-400 dark:text-[#F8BBD0]/50 font-normal mt-0.5">{item.detail}</div>}
                          {item.applies_to && item.applies_to !== 'TODOS' && (
                            <div className="text-[10px] text-[#8B3A52]/60 mt-0.5">
                              {item.applies_to === 'MISMO_COLOR' ? 'Mismo color que variante' : `Color: ${item.applies_to}`}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-xs text-zinc-500 dark:text-[#F8BBD0]/80 uppercase">{item.id_supply?.unit ?? item.unit ?? '—'}</td>
                        <td className="p-4 text-right text-sm text-zinc-800 dark:text-[#fdf6f0] font-semibold">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TABLA DE VARIANTES E INVENTARIO */}
          <section className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-white/70 backdrop-blur-2xl dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-3xl overflow-hidden transition-[background-color,border-color] duration-[600ms]">
            <div className="p-5 border-b border-zinc-200 dark:border-[#8B3A52]/20 flex justify-between items-center">
              <h3 className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#8B3A52] dark:text-[#F8BBD0]">
                <Palette size={18} className="text-[#D6405F] dark:text-[#F8BBD0]"/> Control de Stock por Variantes
              </h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-50 dark:bg-[#1a0f18]/80 relative transition-[background-color,border-color] duration-[600ms]">
                  <tr className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 dark:text-[#F8BBD0]/80 border-b border-zinc-200 dark:border-[#8B3A52]/20">
                    <th className="px-6 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Talla</th>
                    <th className="px-6 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Color Comercial</th>
                    <th className="px-6 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">SKU Variante</th>
                    <th className="px-6 py-4 text-right border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
                  {product.variants?.map((variant: any, idx: number) => {
                    // 🛡️ Extraemos de forma segura el objeto de color enriquecido { name, hex }
                    const colorName = variant.color?.name || "No definido";
                    const colorHex = variant.color?.hex || "#FFFFFF";
                    const isStockLow = variant.stock <= (variant.min_stock_alert || 10);

                    return (
                      <tr key={variant._id || idx} className="border-b border-zinc-200 dark:border-[#8B3A52]/10 transition-colors hover:bg-zinc-100 dark:hover:bg-[#8B3A52]/10">
                        <td className="px-6 py-2.5 text-sm text-zinc-800 dark:text-[#fdf6f0] font-normal">{variant.size}</td>
                        <td className="px-6 py-2.5">
                          <div className="flex items-center gap-3 text-sm font-normal text-zinc-800 dark:text-[#fdf6f0]">
                            {/* 🎨 Círculo interactivo inyectando el color HEX real de la base de datos */}
                            <div 
                              className="w-4 h-4 rounded-full border border-black/10 dark:border-[#8B3A52]/20 shadow-inner flex-shrink-0" 
                              style={{ backgroundColor: colorHex }}
                              title={`Código HEX: ${colorHex}`}
                            />
                            <span>{colorName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-2.5 text-xs font-mono text-zinc-600 dark:text-[#F8BBD0]/80">{variant.sku_variant}</td>
                        <td className="px-6 py-2.5 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`text-sm font-medium ${isStockLow ? 'text-red-400' : 'text-[#40202D] dark:text-white'}`}>
                              {variant.stock} <span className="text-[10px] text-zinc-500 dark:text-[#F8BBD0]/80 uppercase font-normal">uds</span>
                            </span>
                            {isStockLow && (
                              <span className="text-[9px] flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full font-medium uppercase mt-1">
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