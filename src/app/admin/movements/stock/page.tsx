"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { useProductStore, useStorehouseStore,useSupplyStore } from "@/hooks";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, MoveRight, AlertCircle, ArrowRightLeft, Sparkles, Warehouse, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";


export default function StockActualPage() {
  const router = useRouter();
  const { products, startLoadingProducts } = useProductStore(); // Tu hook de productos base
  const { startLoadingStockBatchDetailed, loading } = useStorehouseStore();
  const { startLoadingSupplies } = useSupplyStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSizeFilter, setSelectedSizeFilter] = useState("Todos");
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  
  // Estado para cruzar los stocks dinámicos de cada almacén por variante
  const [stocksByVariant, setStocksByVariant] = useState<Record<string, { almacen: number; tienda: number }>>({});
  
  // Estado del panel lateral derecho (Carrito de movimiento)
  const [cartMovement, setCartMovement] = useState<Record<string, any>>({});
  // Dirección de la transferencia: "to-store" = Almacén→Tienda, "to-warehouse" = Tienda→Almacén
  const [transferDirection, setTransferDirection] = useState<"to-store" | "to-warehouse">("to-store");

  // Estados de paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const initData = async () => {
      await startLoadingProducts({ limit: 200 });
      await startLoadingSupplies();
    };
    initData();
  }, [startLoadingProducts, startLoadingSupplies]);

  // Filtro y búsqueda local de productos
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter((prod: any) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q || [
        prod.name,
        prod.sku,
        prod.id_category?.name ?? ""
      ].join(" ").toLowerCase().includes(q);

      const matchSize = selectedSizeFilter === "Todos" || prod.variants?.some((v: any) => v.size === selectedSizeFilter);

      return matchSearch && matchSize;
    });
  }, [products, searchTerm, selectedSizeFilter]);

  // Paginación de productos
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reiniciar a la primera página al buscar o filtrar
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedSizeFilter]);

  // Carga el stock real de WarehouseStock para los productos de la página actual en lote (batch)
  useEffect(() => {
    if (!paginatedProducts || paginatedProducts.length === 0) return;

    const visibleVariantIds = paginatedProducts.flatMap(
      (prod: any) => (prod.variants ?? []).map((v: any) => v._id).filter(Boolean)
    );

    if (visibleVariantIds.length === 0) return;

    const loadStockBatch = async () => {
      const stockMap = await startLoadingStockBatchDetailed(visibleVariantIds);
      setStocksByVariant((prev) => ({
        ...prev,
        ...stockMap,
      }));
    };
    void loadStockBatch();
  }, [paginatedProducts, startLoadingStockBatchDetailed]);

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

  // Al expandir un producto cargamos en caliente la distribución real desde WarehouseStock en lote (batch)
  const toggleExpandProduct = async (productId: string, productVariants: any[]) => {
    const isExpanding = !expandedProducts[productId];
    setExpandedProducts(prev => ({ ...prev, [productId]: isExpanding }));

    if (isExpanding && productVariants) {
      const variantIds = productVariants.map((v: any) => v._id).filter(Boolean);
      if (variantIds.length > 0) {
        const stockMap = await startLoadingStockBatchDetailed(variantIds);
        setStocksByVariant(prev => ({
          ...prev,
          ...stockMap
        }));
      }
    }
  };

  const handleAddProductToOrder = (product: any) => {
    const targetProductId = product.id_product || product._id;

    // max_available depende de la dirección elegida:
    // "to-store"     → el stock disponible es el del ALMACÉN CENTRAL
    // "to-warehouse" → el stock disponible es el de TIENDA PRINCIPAL
    const variantsWithStock = (product.variants || []).map((v: any) => ({
      ...v,
      max_available:
        transferDirection === "to-store"
          ? (stocksByVariant[v._id]?.almacen ?? 0)
          : (stocksByVariant[v._id]?.tienda ?? 0),
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
    localStorage.setItem("estilos_boom_pending_transfer", JSON.stringify(cartMovement));
    localStorage.setItem("estilos_boom_transfer_direction", transferDirection);
    router.push("/admin/movements/transfer/");
  };

  return (
    <div className="min-h-screen p-6 text-[#40202D] dark:text-white flex flex-col lg:flex-row gap-6 transition-colors duration-500">
      
      {/* SECCIÓN IZQUIERDA: MATRIZ DE STOCK */}
      <div className="flex-1 space-y-6">
        {/* Filtros superiores */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white/30 dark:bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C6B79] dark:text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/10 border border-[#EAE0E2] dark:border-white/10 rounded-2xl outline-none text-sm text-[#40202D] dark:text-white placeholder:text-[#8C6B79] dark:placeholder:text-gray-500 focus:border-[#D6405F] dark:focus:border-[#8B3A52] transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="p-3 w-full md:w-auto bg-white/50 dark:bg-white/10 border border-[#EAE0E2] dark:border-white/10 rounded-2xl text-sm outline-none focus:border-[#D6405F] dark:focus:border-[#8B3A52] transition-colors text-[#40202D] dark:text-white">
            <option className="text-black dark:text-white">Todos los productos</option>
          </select>
          <select className="p-3 w-full md:w-auto bg-white/50 dark:bg-white/10 border border-[#EAE0E2] dark:border-white/10 rounded-2xl text-sm outline-none focus:border-[#D6405F] dark:focus:border-[#8B3A52] transition-colors text-[#40202D] dark:text-white">
            <option className="text-black dark:text-white">Todas las ubicaciones</option>
          </select>
        </div>

        {/* Tallas Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {["Todos", "XS", "S", "M", "L", "XL"].map(size => (
            <button 
              key={size}
              onClick={() => setSelectedSizeFilter(size)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                selectedSizeFilter === size ? "bg-[#8B3A52] text-white border border-transparent shadow-md scale-105" : "bg-white/70 dark:bg-white/5 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] dark:text-gray-300 hover:scale-105"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Tabla / Matriz */}
        <div className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-white/70 backdrop-blur-2xl dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-[3xl] overflow-hidden transition-[background-color,border-color] duration-[600ms] overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm min-w-[800px] border-collapse">
            <thead className="relative transition-[background-color,border-color] duration-[600ms]">
              <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-medium uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                <th className="p-5 w-12 text-center border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]"></th>
                <th className="p-5 min-w-[280px] border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Producto</th>
                <th className="p-5 text-center w-36 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Total Almacén</th>
                <th className="p-5 text-center w-36 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Total Tienda</th>
                <th className="p-5 text-center w-32 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Estado</th>
                <th className="p-5 text-center w-28 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
              {paginatedProducts?.map((prod: any, index: number) => {
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
                    <tr className={`transition-colors font-medium group/row ${index % 2 === 0 ? "bg-white/40 dark:bg-black/20" : "bg-transparent"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)] ${isExpanded ? "bg-white/80 dark:bg-white/10" : ""}`}>
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
                      <td className="p-4 text-center text-lg text-gray-700 dark:text-zinc-300">
                        {totalAlmacen}
                      </td>
                      
                      {/* CELDA TOTAL TIENDA */}
                      <td className="p-4 text-center text-lg text-rose-500 dark:text-rose-400">
                        {totalTienda}
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-[#A5D6A7] px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase border border-emerald-500/20 shadow-sm">
                          Todo OK
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          type="button"
                          onClick={() => handleAddProductToOrder(prod)}
                          className="px-4 py-1.5 bg-[#D6405F] dark:bg-[#8B3A52] hover:scale-105 text-white dark:text-white text-xs font-bold rounded-full transition-transform shadow-md"
                        >
                          Mover
                        </button>
                      </td>
                    </tr>

                    {/* FILAS DE VARIANTES (HIJOS) */}
                    {isExpanded && prod.variants
                      ?.filter((v: any) => selectedSizeFilter === "Todos" || v.size === selectedSizeFilter)
                      ?.map((variant: any, vIndex: number) => {
                      const variantKey = variant._id ? `sub-${productKey}-${variant._id}` : `sub-${productKey}-v-${vIndex}`;
                      const hasStockData = stocksByVariant[variant._id] !== undefined;

                      return (
                        <tr key={variantKey} className="bg-white/40 dark:bg-white/5 text-xs">
                          <td></td>
                          {/* 🎨 CELDA DE PRODUCTO ADAPTATIVA Y RESPONSIVA */}
                          <td className="p-3 pl-10 border-l-2 border-[#D6405F] dark:border-[#8B3A52]">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10 shadow-inner" style={{ backgroundColor: variant.color?.hex }} />
                                <span className="font-bold text-[#40202D] dark:text-white text-sm">{variant.size} • {variant.color?.name}</span>
                              </div>
                              <span className="font-mono text-[11px] text-[#8C6B79] dark:text-gray-400 bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 px-2 py-0.5 rounded truncate max-w-[220px]">
                                {variant.sku_variant}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#40202D] dark:text-white text-sm">
                            {hasStockData ? stocksByVariant[variant._id].almacen : <span className="animate-pulse opacity-50">...</span>}
                          </td>
                          <td className="p-3 text-center text-[#8B3A52] dark:text-[#e8c4cc] text-sm">
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

          {/* ── Paginación de Productos ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5">
              <span className="text-xs font-bold text-[#8C6B79] dark:text-gray-400 uppercase tracking-wider">
                Mostrando {Math.min(filteredProducts.length, (page - 1) * itemsPerPage + 1)}-
                {Math.min(filteredProducts.length, page * itemsPerPage)} de {filteredProducts.length} productos
              </span>

              <div className="flex items-center gap-1 bg-white/50 dark:bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="p-2 rounded-xl text-[#8C6B79] dark:text-gray-400 hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-all disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setPage(pNum)}
                      className={`min-w-[36px] h-9 rounded-xl text-xs font-medium uppercase tracking-widest transition-all cursor-pointer
                        ${page === pNum
                          ? "bg-gradient-to-r from-[#D6405F] to-[#F23B69] dark:from-[#8B3A52] dark:to-[#D6405F] text-white shadow-md"
                          : "text-[#8C6B79] dark:text-gray-400 hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10"
                        }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="p-2 rounded-xl text-[#8C6B79] dark:text-gray-400 hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-all disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DERECHA: PANEL FLOTANTE "ORDEN DE MOVIMIENTO" */}
      <div className="w-full lg:w-80 bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-3xl p-5 shadow-sm flex flex-col h-[calc(100vh-50px)] sticky top-6 z-10">
        {/* Título */}
        <div className="flex items-center gap-2 border-b border-[#EAE0E2] dark:border-white/10 pb-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#8B3A52]/10 dark:bg-[#8B3A52]/20 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="text-[#8B3A52] dark:text-[#e8c4cc]" size={16} />
          </div>
          <h3 className="font-bold tracking-wide text-lg text-[#40202D] dark:text-white">Orden de movimiento</h3>
        </div>

        {/* Selector de dirección */}
        <div className="mb-4 space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">Dirección del movimiento</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setTransferDirection("to-store"); setCartMovement({}); }}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border text-[11px] font-bold tracking-wide transition-all ${
                transferDirection === "to-store"
                  ? "bg-[#8B3A52]/10 dark:bg-[#8B3A52]/20 border-[#8B3A52]/30 dark:border-[#8B3A52]/40 text-[#8B3A52] dark:text-[#e8c4cc] shadow-sm"
                  : "bg-white/30 dark:bg-white/5 border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] dark:text-gray-400 hover:bg-white/60 dark:hover:bg-white/10"
              }`}
            >
              <Store className="w-5 h-5" />
              <span>A Tienda</span>
            </button>
            <button
              type="button"
              onClick={() => { setTransferDirection("to-warehouse"); setCartMovement({}); }}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border text-[11px] font-bold tracking-wide transition-all ${
                transferDirection === "to-warehouse"
                  ? "bg-[#8B3A52]/10 dark:bg-[#8B3A52]/20 border-[#8B3A52]/30 dark:border-[#8B3A52]/40 text-[#8B3A52] dark:text-[#e8c4cc] shadow-sm"
                  : "bg-white/30 dark:bg-white/5 border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] dark:text-gray-400 hover:bg-white/60 dark:hover:bg-white/10"
              }`}
            >
              <Warehouse className="w-5 h-5" />
              <span>A Almacén</span>
            </button>
          </div>
          <p className="text-[10px] text-[#8C6B79] dark:text-gray-500 font-medium leading-tight">
            {transferDirection === "to-store"
              ? "Almacén Central → Tienda Principal"
              : "Tienda Principal → Almacén Central"}
          </p>
        </div>

        {/* Lista de productos seleccionados */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {Object.values(cartMovement).map((item: any, idx: number) => {
            const cartItemKey = item.id_product ? `cart-item-${item.id_product}` : `cart-idx-${idx}`;
            return (
              <div
                key={cartItemKey}
                className="flex items-center justify-between p-3 hover:bg-white/50 dark:hover:bg-white/5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/30 dark:bg-white/5 relative group animate-in fade-in zoom-in-95 duration-150 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={item.image} className="w-10 h-12 object-cover rounded-xl bg-white/50 dark:bg-white/10 border border-[#EAE0E2] dark:border-white/5" alt="" />
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
          <div className="flex justify-between text-xs font-medium text-[#8C6B79] dark:text-gray-400 tracking-wider uppercase">
            <span>Resumen total:</span>
            <span className="text-[#8B3A52] dark:text-[#e8c4cc]">{cartItemsCount} prod. • {cartVariantsCount} vars</span>
          </div>
          <button
            disabled={cartItemsCount === 0}
            onClick={handleGoToWizard}
            className="w-full py-3.5 bg-[#40202D] hover:bg-[#5B283A] dark:bg-[#8B3A52] dark:hover:bg-[#a64a66] text-white text-sm font-bold rounded-xl transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_15px_rgba(139,58,82,0.3)] disabled:opacity-30 disabled:pointer-events-none disabled:hover:translate-y-0"
          >
            {transferDirection === "to-store" ? "Transferir a Tienda" : "Transferir a Almacén"}
            <ArrowRightLeft className="w-4 h-4" />
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
