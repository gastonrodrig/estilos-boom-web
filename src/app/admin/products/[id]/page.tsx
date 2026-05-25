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
    <div className="min-h-screen bg-[#FAF9F6] p-4 md:p-8 text-[#594246]">
      {/* Header de Navegación */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <Link href="/admin/products" className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity">
          <ArrowLeft size={18} /> Volver al catálogo
        </Link>
        <Link 
          href={`/admin/products/edit/${product._id || product.id_product}`}
          className="flex items-center gap-2 bg-[#594246] text-white px-6 py-2 rounded-lg hover:bg-black transition-all shadow-md text-sm font-bold"
        >
          <Edit3 size={16} /> Editar Producto
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUMNA IZQUIERDA: GALERÍA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-[#EBEAE8] shadow-sm">
            <img src={mainImage || "/placeholder-prenda.png"} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images?.map((img: string, idx: number) => (
              <button 
                key={idx} 
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${mainImage === img ? 'border-[#F2778D]' : 'border-transparent opacity-60'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="miniatura" />
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN Y VARIANTES */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Info Principal */}
          <section>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-[#F2D0D3] text-[#594246] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                {product.id_category?.name || 'Sin Categoría'}
              </span>
              <span className="bg-[#594246]/10 text-[#594246] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                <Layers size={10}/> {product.origin_type === 'PRODUCCION' ? 'Producción Propia' : 'Retail / Comercial'}
              </span>
              <span className="text-xs opacity-40 font-mono ml-auto">{product.sku}</span>
            </div>
            <h1 className="text-4xl font-serif font-bold mb-3">{product.name}</h1>
            <p className="text-2xl font-light text-[#F2778D] mb-4">S/ {(product.base_price || 0).toFixed(2)}</p>
            <div className="p-4 bg-white rounded-xl border border-[#EBEAE8] text-sm leading-relaxed opacity-80">
              {product.description || 'Sin descripción disponible para este producto.'}
            </div>
          </section>

          {/* Especificaciones Técnicas Básicas */}
          <section className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-[#EBEAE8]">
              <div className="flex items-center gap-2 mb-1 opacity-50"><Tag size={13}/><span className="text-[9px] font-bold uppercase tracking-wider">Material</span></div>
              <p className="text-xs font-bold truncate">{product.composition || 'No especificado'}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#EBEAE8]">
              <div className="flex items-center gap-2 mb-1 opacity-50"><Info size={13}/><span className="text-[9px] font-bold uppercase tracking-wider">Género</span></div>
              <p className="text-xs font-bold">{product.gender}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#EBEAE8]">
              <div className="flex items-center gap-2 mb-1 opacity-50"><Package size={13}/><span className="text-[9px] font-bold uppercase tracking-wider">Temporada</span></div>
              <p className="text-xs font-bold truncate">{product.season || 'Todo el año'}</p>
            </div>
          </section>

          {/* 🧵 RENDERIZADO CONDICIONAL: FICHA TÉCNICA DE INSUMOS */}
          {product.origin_type === 'PRODUCCION' && product.technical_sheet && product.technical_sheet.length > 0 && (
            <section className="bg-white rounded-2xl border border-[#EBEAE8] shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="p-4 bg-[#FAF9F6] border-b border-[#EBEAE8] flex items-center gap-2">
                <Scissors size={16} className="text-[#594246]" />
                <h3 className="font-bold uppercase text-xs tracking-wider text-[#594246]">
                  Ficha Técnica de Materiales / Insumos
                </h3>
              </div>
              <div className="p-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50">
                      <th className="p-3">Material Requerido</th>
                      <th className="p-3">Unidad de Medida</th>
                      <th className="p-3 text-right">Cant. por Prenda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {product.technical_sheet.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-[#594246]">{item.name}</td>
                        <td className="p-3 opacity-60 uppercase">{item.unit}</td>
                        <td className="p-3 text-right font-black text-[#F2778D]">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TABLA DE VARIANTES E INVENTARIO */}
          <section className="bg-white rounded-2xl border border-[#EBEAE8] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#FAF9F6] flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 uppercase text-xs tracking-wider">
                <Palette size={16} className="text-[#F2778D]"/> Control de Stock por Variantes
              </h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase opacity-40 bg-[#FAF9F6]">
                  <th className="px-6 py-3">Talla</th>
                  <th className="px-6 py-3">Color Comercial</th>
                  <th className="px-6 py-3">SKU Variante</th>
                  <th className="px-6 py-3 text-right">Stock Inicial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9F6]">
                {product.variants?.map((variant: any, idx: number) => {
                  // 🛡️ Extraemos de forma segura el objeto de color enriquecido { name, hex }
                  const colorName = variant.color?.name || "No definido";
                  const colorHex = variant.color?.hex || "#FFFFFF";
                  const isStockLow = variant.stock <= (variant.min_stock_alert || 10);

                  return (
                    <tr key={variant._id || idx} className="hover:bg-[#FAF9F6]/50 transition-colors">
                      <td className="px-6 py-4 font-black text-sm text-[#594246]">{variant.size}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5 text-sm font-medium">
                          {/* 🎨 Círculo interactivo inyectando el color HEX real de la base de datos */}
                          <div 
                            className="w-4 h-4 rounded-full border border-black/10 shadow-sm flex-shrink-0" 
                            style={{ backgroundColor: colorHex }}
                            title={`Código HEX: ${colorHex}`}
                          />
                          <span>{colorName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono opacity-50">{variant.sku_variant}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold ${isStockLow ? 'text-red-500' : 'text-[#594246]'}`}>
                            {variant.stock} uds
                          </span>
                          {isStockLow && (
                            <span className="text-[9px] flex items-center gap-1 text-red-400 font-bold uppercase mt-0.5">
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
          </section>

        </div>
      </div>
    </div>
  );
}