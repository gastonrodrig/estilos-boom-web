"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { useProductStore, useStorehouseStore,useSupplyStore } from "@/hooks";
import { Search, ChevronDown, ChevronUp, X, MoveRight, AlertCircle, ArrowRightLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";


export default function StockActualPage() {
  const router = useRouter();
  const { products, startLoadingProducts } = useProductStore(); // Tu hook de productos base
  const { startLoadingStockByVariant, loading } = useStorehouseStore();
  const { startLoadingSupplies } = useSupplyStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSizeFilter, setSelectedSizeFilter] = useState("Todos");
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  
  // Estado para cruzar los stocks dinámicos de cada almacén por variante
  const [stocksByVariant, setStocksByVariant] = useState<Record<string, { almacen: number; tienda: number }>>({});
  
  // Estado del panel lateral derecho (Carrito de movimiento)
  const [cartMovement, setCartMovement] = useState<Record<string, any>>({});

  useEffect(() => {
    const initData = async () => {
      // ✅ SOLUCIÓN: Pásale un objeto vacío para satisfacer el argumento requerido
      await startLoadingProducts({}); 
      await startLoadingSupplies();
    };
    initData();
  }, [startLoadingProducts, startLoadingSupplies]);

  // Al expandir un producto, cargamos en caliente la distribución de stock de sus variantes de la BD
  const toggleExpandProduct = async (productId: string, productVariants: any[]) => {
    const isExpanding = !expandedProducts[productId];
    setExpandedProducts(prev => ({ ...prev, [productId]: isExpanding }));

    if (isExpanding && productVariants) {
      for (const variant of productVariants) {
        if (!stocksByVariant[variant._id]) {
          const res = await startLoadingStockByVariant(variant._id);
          if (res) {
            // Buscamos cuánto hay en cada almacén en el array retornado por NestJS
            const almacenStock = res.find((s: any) => s.id_warehouse?.name === "ALMACEN_CENTRAL")?.stock || 0;
            const tiendaStock = res.find((s: any) => s.id_warehouse?.name === "TIENDA_PRINCIPAL")?.stock || 0;
            
            setStocksByVariant(prev => ({
              ...prev,
              [variant._id]: { almacen: almacenStock, tienda: tiendaStock }
            }));
          }
        }
      }
    }
  };

  const handleAddProductToOrder = (product: any) => {
    // ✅ CAPTURA DE ID BLINDADA: Nos aseguramos de extraer un ID válido
    const targetProductId = product.id_product || product._id;

    setCartMovement(prev => ({
      ...prev,
      [targetProductId]: {
        id_product: targetProductId, // 👈 Forzamos a que se guarde con esta llave exacta
        name: product.name,
        category: product.id_category?.name || "Blusas",
        image: product.images?.[0] || "",
        variants: product.variants || []
      }
    }));
    toast.success(`${product.name} añadido a la orden de movimiento.`);
  };

  const cartItemsCount = Object.keys(cartMovement).length;
  const cartVariantsCount = Object.values(cartMovement).reduce((acc, curr) => acc + curr.variants.length, 0);

  const handleGoToWizard = () => {
    // Serializamos el carrito para procesarlo en la siguiente pantalla del Wizard
    localStorage.setItem("estilos_boom_pending_transfer", JSON.stringify(cartMovement));
    router.push("/admin/movements/transfer/");
  };

  return (
    <div className="min-h-screen p-6 text-[#40202D] dark:text-white flex flex-col lg:flex-row gap-6 transition-colors duration-500">
      
      {/* SECCIÓN IZQUIERDA: MATRIZ DE STOCK */}
      <div className="flex-1 space-y-6">
        {/* Filtros superiores */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white/30 dark:bg-black/30 backdrop-blur-md p-4 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C6B79] dark:text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-2xl outline-none text-sm text-[#40202D] dark:text-white placeholder:text-[#8C6B79] dark:placeholder:text-gray-500 focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="p-3 w-full md:w-auto bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-2xl text-sm outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors text-[#40202D] dark:text-white">
            <option className="text-black">Todos los productos</option>
          </select>
          <select className="p-3 w-full md:w-auto bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-2xl text-sm outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors text-[#40202D] dark:text-white">
            <option className="text-black">Todas las ubicaciones</option>
          </select>
        </div>

        {/* Tallas Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {["Todos", "XS", "S", "M", "L", "XL"].map(size => (
            <button 
              key={size}
              onClick={() => setSelectedSizeFilter(size)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                selectedSizeFilter === size ? "bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] border border-transparent shadow-md scale-105" : "bg-white/70 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] dark:text-gray-300 hover:scale-105"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Tabla / Matriz */}
        <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-3xl overflow-hidden shadow-sm overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-white/50 dark:bg-black/30 text-xs uppercase font-bold text-[#D6405F] dark:text-[#F8BBD0] border-b border-[#EAE0E2] dark:border-white/10">
              <tr>
                <th className="p-5 w-12 text-center"></th>
                <th className="p-5 min-w-[280px]">Producto</th>
                <th className="p-5 text-center w-36">Total Almacén</th>
                <th className="p-5 text-center w-36">Total Tienda</th>
                <th className="p-5 text-center w-32">Estado</th>
                <th className="p-5 text-center w-28">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
              {products?.map((prod: any, index: number) => {
                // ✅ CORRECCIÓN: Buscamos dinámicamente el ID real que use tu backend (id_product o _id)
                const productId = prod.id_product || prod._id || `fallback-id-${index}`;
                
                // 🚀 AISLAMIENTO DE APERTURA: Ahora sí evaluamos por un ID único garantizado
                const isExpanded = !!expandedProducts[productId];
                const productKey = `prod-row-${productId}`;

                // 🧮 CÁLCULO PREVENTIVO: Evaluamos con el ID correcto
                const hasLoadedAnyVariant = prod.variants?.some((v: any) => stocksByVariant[v._id] !== undefined);
                
                const totalAlmacen = hasLoadedAnyVariant
                  ? prod.variants?.reduce((acc: number, v: any) => acc + (stocksByVariant[v._id]?.almacen || 0), 0)
                  : null;

                const totalTienda = hasLoadedAnyVariant
                  ? prod.variants?.reduce((acc: number, v: any) => acc + (stocksByVariant[v._id]?.tienda || 0), 0)
                  : null;

                return (
                  <Fragment key={productKey}>
                    {/* FILA PADRE */}
                    <tr className={`transition-colors font-medium hover:bg-white/50 dark:hover:bg-white/5 ${isExpanded ? "bg-white/80 dark:bg-white/10" : ""}`}>
                      <td className="p-4 text-center">
                        <button 
                          type="button"
                          onClick={() => toggleExpandProduct(productId, prod.variants)}
                          className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={18} className="text-[#40202D] dark:text-white" /> : <ChevronDown size={18} className="text-[#40202D] dark:text-white" />}
                        </button>
                      </td>
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 overflow-hidden shrink-0 shadow-sm">
                          <img src={prod.images?.[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#40202D] dark:text-white truncate">{prod.name}</p>
                          <p className="text-xs text-[#8C6B79] dark:text-gray-400 truncate">{prod.id_category?.name || 'Prendas'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center font-black text-lg text-[#40202D] dark:text-white drop-shadow-sm">
                        {totalAlmacen !== null ? totalAlmacen : <span className="text-xs font-normal opacity-50 flex items-center justify-center gap-1"><Sparkles size={10} className="animate-pulse text-[#D6405F] dark:text-[#F8BBD0]"/> Cargar</span>}
                      </td>
                      <td className="p-4 text-center font-black text-lg text-[#D6405F] dark:text-[#F8BBD0] drop-shadow-sm">
                        {totalTienda !== null ? totalTienda : <span className="text-xs font-normal opacity-50 flex items-center justify-center gap-1"><Sparkles size={10} className="animate-pulse text-[#D6405F] dark:text-[#F8BBD0]"/> Cargar</span>}
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-[#A5D6A7] px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border border-emerald-500/20 shadow-sm">
                          Todo OK
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          type="button"
                          onClick={() => handleAddProductToOrder(prod)}
                          className="px-4 py-1.5 bg-[#D6405F] dark:bg-[#F8BBD0] hover:scale-105 text-white dark:text-[#40202D] text-xs font-bold rounded-full transition-transform shadow-md"
                        >
                          Mover
                        </button>
                      </td>
                    </tr>

                    {/* FILAS DE VARIANTES (HIJOS) */}
                    {isExpanded && prod.variants?.map((variant: any, vIndex: number) => {
                      const variantKey = variant._id ? `sub-${productKey}-${variant._id}` : `sub-${productKey}-v-${vIndex}`;
                      const hasStockData = stocksByVariant[variant._id] !== undefined;

                      return (
                        <tr key={variantKey} className="bg-white/40 dark:bg-white/5 text-xs">
                          <td></td>
                          {/* 🎨 CELDA DE PRODUCTO ADAPTATIVA Y RESPONSIVA */}
                          <td className="p-3 pl-10 border-l-2 border-[#D6405F] dark:border-[#F8BBD0]">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10 shadow-inner" style={{ backgroundColor: variant.color?.hex }} />
                                <span className="font-bold text-[#40202D] dark:text-white text-sm">{variant.size} • {variant.color?.name}</span>
                              </div>
                              <span className="font-mono text-[11px] text-[#8C6B79] dark:text-gray-400 bg-white/50 dark:bg-black/30 border border-[#EAE0E2] dark:border-white/10 px-2 py-0.5 rounded truncate max-w-[220px]">
                                {variant.sku_variant}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold text-[#40202D] dark:text-white text-sm">
                            {hasStockData ? stocksByVariant[variant._id].almacen : <span className="animate-pulse opacity-50">...</span>}
                          </td>
                          <td className="p-3 text-center font-bold text-[#D6405F] dark:text-[#F8BBD0] text-sm">
                            {hasStockData ? stocksByVariant[variant._id].tienda : <span className="animate-pulse opacity-50">...</span>}
                          </td>
                          <td className="p-3"></td>
                          <td></td>
                        </tr>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔴 SECCIÓN DERECHA: PANEL FLOTANTE "ORDEN DE MOVIMIENTO" (Imagen 4) */}
      <div className="w-full lg:w-80 bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-3xl p-5 shadow-sm flex flex-col h-[calc(100vh-50px)] sticky top-6 z-10">
        <div className="flex items-center gap-2 border-b border-[#EAE0E2] dark:border-white/10 pb-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#D6405F]/10 dark:bg-[#F8BBD0]/10 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="text-[#D6405F] dark:text-[#F8BBD0]" size={16} />
          </div>
          <h3 className="font-bold tracking-wide text-lg text-[#40202D] dark:text-white">Orden de movimiento</h3>
        </div>

        {/* Lista de productos seleccionados */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {Object.values(cartMovement).map((item: any, idx: number) => {
            // ✅ LLAVE DE RESPALDO: Si id_product fallara por algún motivo, el índice salva la UI
            const cartItemKey = item.id_product ? `cart-item-${item.id_product}` : `cart-idx-${idx}`;

            return (
              <div 
                key={cartItemKey} // 🚀 Llave única y garantizada para React
                className="flex items-center justify-between p-3 hover:bg-white/50 dark:hover:bg-white/5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/30 dark:bg-white/5 relative group animate-in fade-in zoom-in-95 duration-150 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={item.image} className="w-10 h-12 object-cover rounded-xl bg-white/50 border border-[#EAE0E2] dark:border-white/5" alt="" />
                  <div>
                    <p className="text-xs font-bold text-[#40202D] dark:text-white truncate max-w-[130px]">{item.name}</p>
                    <p className="text-[10px] opacity-60 text-[#8C6B79] dark:text-gray-400 font-bold uppercase tracking-wider">{item.variants?.length} variantes</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    const copy = { ...cartMovement };
                    delete copy[item.id_product];
                    setCartMovement(copy);
                  }}
                  className="text-[#8C6B79] dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
          
          {cartItemsCount === 0 && (
            <div className="text-center py-12 flex flex-col items-center justify-center opacity-40">
              <MoveRight className="w-8 h-8 mb-2 text-[#8C6B79] dark:text-gray-400" />
              <p className="italic text-xs font-medium">No hay prendas en la orden.</p>
            </div>
          )}
        </div>

        {/* Footer del Carrito */}
        <div className="border-t border-[#EAE0E2] dark:border-white/10 pt-4 mt-4 space-y-3">
          <div className="flex justify-between text-xs font-black text-[#8C6B79] dark:text-gray-400 tracking-wider uppercase">
            <span>Resumen total:</span>
            <span className="text-[#D6405F] dark:text-[#F8BBD0]">{cartItemsCount} prod. • {cartVariantsCount} vars</span>
          </div>
          <button 
            disabled={cartItemsCount === 0}
            onClick={handleGoToWizard}
            className="w-full py-3.5 bg-[#40202D] hover:bg-[#5B283A] dark:bg-[#F2778D] dark:hover:bg-[#F8BBD0] text-white dark:text-[#1A0B11] text-sm font-bold rounded-xl transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_15px_rgba(242,119,141,0.2)] disabled:opacity-30 disabled:pointer-events-none disabled:hover:translate-y-0"
          >
            Crear orden <ArrowRightLeft className="w-4 h-4" />
          </button>
          {cartItemsCount > 0 && (
            <button onClick={() => setCartMovement({})} className="text-center w-full text-[11px] font-bold text-red-500 dark:text-red-400 hover:underline uppercase tracking-wider">
              Limpiar todo
            </button>
          )}
        </div>
      </div>

    </div>
  );
}