"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { useProductStore, useStorehouseStore,useSupplyStore } from "@/hooks";
import { Search, ChevronDown, ChevronUp, X, MoveRight, AlertCircle, ArrowRightLeft } from "lucide-react";
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
      await startLoadingProducts({});
      await startLoadingSupplies();
    };
    initData();
  }, [startLoadingProducts, startLoadingSupplies]);

  // Carga el stock real de WarehouseStock para TODOS los productos al montar
  // (no espera a que el usuario expanda una fila)
  useEffect(() => {
    if (!products || !Array.isArray(products) || products.length === 0) return;

    const loadAllStocks = async () => {
      for (const prod of products as any[]) {
        for (const variant of prod.variants ?? []) {
          if (!variant._id) continue;
          const res = await startLoadingStockByVariant(variant._id);
          if (Array.isArray(res) && res.length > 0) {
            const findAvailable = (code: string) => {
              const entry = res.find(
                (s: any) => s.id_warehouse?.code === code || s.id_warehouse?.name === code
              );
              return entry ? (entry.physical_stock ?? 0) - (entry.reserved_stock ?? 0) : 0;
            };
            setStocksByVariant((prev) => ({
              ...prev,
              [variant._id]: {
                almacen: findAvailable("ALM-CEN"),
                tienda: findAvailable("TND-PRI"),
              },
            }));
          }
        }
      }
    };
    void loadAllStocks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // Inicializa nuevas variantes en 0 preservando las ya cargadas
  useEffect(() => {
    if (!products || !Array.isArray(products) || products.length === 0) return;
    setStocksByVariant((prev) => {
      const next = { ...prev };
      (products as any[]).forEach((prod) => {
        prod.variants?.forEach((v: any) => {
          if (v._id && next[v._id] === undefined) {
            next[v._id] = { almacen: 0, tienda: 0 };
          }
        });
      });
      return next;
    });
  }, [products]);

  // Al expandir un producto cargamos en caliente la distribución real desde WarehouseStock
  const toggleExpandProduct = async (productId: string, productVariants: any[]) => {
    const isExpanding = !expandedProducts[productId];
    setExpandedProducts(prev => ({ ...prev, [productId]: isExpanding }));

    if (isExpanding && productVariants) {
      for (const variant of productVariants) {
        // Siempre recargamos para tener datos frescos de WarehouseStock
        const res = await startLoadingStockByVariant(variant._id);
        if (Array.isArray(res)) {
          // WarehouseStock retorna: { id_warehouse: { name, code }, physical_stock, reserved_stock }
          // available_stock = physical_stock - reserved_stock (virtual del schema)
          const findAvailable = (warehouseCode: string) => {
            const entry = res.find(
              (s: any) => s.id_warehouse?.code === warehouseCode || s.id_warehouse?.name === warehouseCode
            );
            if (!entry) return 0;
            return (entry.physical_stock ?? 0) - (entry.reserved_stock ?? 0);
          };

          setStocksByVariant(prev => ({
            ...prev,
            [variant._id]: {
              almacen: findAvailable("ALM-CEN"),
              tienda: findAvailable("TND-PRI"),
            }
          }));
        }
      }
    }
  };

  const handleAddProductToOrder = (product: any) => {
    const targetProductId = product.id_product || product._id;

    // Enriquecemos cada variante con max_available (stock disponible en Almacén Central)
    // para que el Wizard pueda leer el límite sin volver a pedir al backend
    const variantsWithStock = (product.variants || []).map((v: any) => ({
      ...v,
      max_available: stocksByVariant[v._id]?.almacen ?? 0,
    }));

    setCartMovement(prev => ({
      ...prev,
      [targetProductId]: {
        id_product: targetProductId,
        name: product.name,
        category: product.id_category?.name || "Sin categoría",
        image: product.images?.[0] || "",
        variants: variantsWithStock,
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
    <div className="min-h-screen bg-[#FAF9F6] p-6 text-[#594246] flex gap-6">
      
      {/* SECCIÓN IZQUIERDA: MATRIZ DE STOCK */}
      <div className="flex-1 space-y-6">
        {/* Filtros superiores */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EBEAE8] rounded-xl outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="p-2.5 bg-white border border-[#EBEAE8] rounded-xl text-sm outline-none">
            <option>Todos los productos</option>
          </select>
          <select className="p-2.5 bg-white border border-[#EBEAE8] rounded-xl text-sm outline-none">
            <option>Todas las ubicaciones</option>
          </select>
        </div>

        {/* Tallas Filter Badges */}
        <div className="flex gap-2">
          {["Todos", "XS", "S", "M", "L", "XL"].map(size => (
            <button 
              key={size}
              onClick={() => setSelectedSizeFilter(size)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedSizeFilter === size ? "bg-[#594246] text-white" : "bg-white border border-[#EBEAE8]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Tabla / Matriz */}
        <div className="bg-white border border-[#EBEAE8] rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-[#FAF9F6] text-xs uppercase font-bold opacity-60 border-b">
              <tr>
                <th className="p-4 w-12 text-center"></th>
                <th className="p-4 min-w-[280px]">Producto</th>
                <th className="p-4 text-center w-36">Total Almacén</th>
                <th className="p-4 text-center w-36">Total Tienda</th>
                <th className="p-4 text-center w-32">Estado</th>
                <th className="p-4 text-center w-28">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF9F6]">
              {products?.map((prod: any, index: number) => {
                // ✅ CORRECCIÓN: Buscamos dinámicamente el ID real que use tu backend (id_product o _id)
                const productId = prod.id_product || prod._id || `fallback-id-${index}`;
                
                // 🚀 AISLAMIENTO DE APERTURA: Ahora sí evaluamos por un ID único garantizado
                const isExpanded = !!expandedProducts[productId];
                const productKey = `prod-row-${productId}`;

                // 🧮 CÁLCULO PREVENTIVO: Evaluamos con el ID correcto
                const hasLoadedAnyVariant = prod.variants?.some((v: any) => stocksByVariant[v._id] !== undefined);
                
                const totalAlmacen = prod.variants?.reduce(
                  (acc: number, v: any) => acc + (stocksByVariant[v._id]?.almacen || 0), 0
                ) ?? 0;

                const totalTienda = prod.variants?.reduce(
                  (acc: number, v: any) => acc + (stocksByVariant[v._id]?.tienda || 0), 0
                ) ?? 0;

                return (
                  <Fragment key={productKey}>
                    {/* FILA PADRE */}
                    <tr className={`transition-colors font-medium border-b ${isExpanded ? "bg-[#FAF9F6]/40" : "hover:bg-[#FAF9F6]/30"}`}>
                      <td className="p-4 text-center">
                        <button 
                          type="button"
                          // ✅ Pasamos el ID correcto para abrir de forma aislada
                          onClick={() => toggleExpandProduct(productId, prod.variants)}
                          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={18} className="text-[#594246]" /> : <ChevronDown size={18} className="text-[#594246]" />}
                        </button>
                      </td>
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg bg-gray-50 border overflow-hidden shrink-0 shadow-sm">
                          <img src={prod.images?.[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 truncate">{prod.name}</p>
                          <p className="text-xs opacity-50 truncate">{prod.id_category?.name || 'Prendas'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-lg text-gray-700">
                        {totalAlmacen}
                      </td>
                      
                      {/* CELDA TOTAL TIENDA */}
                      <td className="p-4 text-center font-bold text-lg text-rose-400">
                        {totalTienda}
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border border-emerald-100">
                          Todo OK
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          type="button"
                          onClick={() => handleAddProductToOrder(prod)}
                          className="px-4 py-1.5 bg-[#F2778D] hover:bg-[#d65c72] text-white text-xs font-bold rounded-full transition-colors shadow-sm"
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
                        <tr key={variantKey} className="bg-[#FAF9F6]/20 text-xs border-b border-gray-100/50">
                          <td></td>
                          {/* 🎨 CELDA DE PRODUCTO ADAPTATIVA Y RESPONSIVA */}
                          <td className="p-3 pl-10">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="w-3 h-3 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: variant.color?.hex }} />
                                <span className="font-bold text-gray-700 text-sm">{variant.size} • {variant.color?.name}</span>
                              </div>
                              <span className="font-mono text-[11px] text-gray-400 bg-gray-100/70 px-2 py-0.5 rounded truncate max-w-[220px]">
                                {variant.sku_variant}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold text-gray-600 text-sm">
                            {hasStockData ? stocksByVariant[variant._id].almacen : <span className="animate-pulse text-gray-300">...</span>}
                          </td>
                          <td className="p-3 text-center font-bold text-rose-400 text-sm">
                            {hasStockData ? stocksByVariant[variant._id].tienda : <span className="animate-pulse text-rose-300">...</span>}
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
      <div className="w-80 bg-white border border-[#EBEAE8] rounded-2xl p-5 shadow-lg flex flex-col h-[calc(100vh-50px)] sticky top-6">
        <div className="flex items-center gap-2 border-b pb-3 mb-4">
          <ArrowRightLeft className="text-[#594246]" size={18} />
          <h3 className="font-serif font-bold text-lg">Orden de movimiento</h3>
        </div>

        {/* Lista de productos seleccionados */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {Object.values(cartMovement).map((item: any, idx: number) => {
            // ✅ LLAVE DE RESPALDO: Si id_product fallara por algún motivo, el índice salva la UI
            const cartItemKey = item.id_product ? `cart-item-${item.id_product}` : `cart-idx-${idx}`;

            return (
              <div 
                key={cartItemKey} // 🚀 Llave única y garantizada para React
                className="flex items-center justify-between p-2 hover:bg-[#FAF9F6] rounded-xl border relative group animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center gap-3">
                  <img src={item.image} className="w-8 h-10 object-cover rounded bg-gray-50" alt="" />
                  <div>
                    <p className="text-xs font-bold text-gray-800 truncate max-w-[140px]">{item.name}</p>
                    <p className="text-[10px] opacity-40">{item.variants?.length} variantes</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    const copy = { ...cartMovement };
                    delete copy[item.id_product];
                    setCartMovement(copy);
                  }}
                  className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
          
          {cartItemsCount === 0 && (
            <div className="text-center py-12 opacity-40 italic text-xs">No hay prendas en la orden.</div>
          )}
        </div>

        {/* Footer del Carrito */}
        <div className="border-t pt-4 mt-4 space-y-3">
          <div className="flex justify-between text-xs font-bold opacity-60">
            <span>Resumen total:</span>
            <span>{cartItemsCount} prod. • {cartVariantsCount} variantes</span>
          </div>
          <button 
            disabled={cartItemsCount === 0}
            onClick={handleGoToWizard}
            className="w-full py-3 bg-[#594246] hover:bg-black text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-30 disabled:pointer-events-none"
          >
            ➔ Crear orden de movimiento
          </button>
          {cartItemsCount > 0 && (
            <button onClick={() => setCartMovement({})} className="text-center w-full text-[11px] font-bold text-red-400 hover:underline">
              Limpiar todo
            </button>
          )}
        </div>
      </div>

    </div>
  );
}