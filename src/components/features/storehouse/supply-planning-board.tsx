"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  AlertTriangle, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Package2, 
  Truck, 
  Lightbulb, 
  Check, 
  Eye, 
  ShoppingCart, 
  ArrowUp,
  FilePlus2,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { Product } from "@/core/models";
import { useProductStore, useStorehouseStore } from "@/hooks";

type SupplySelection = {
  key: string;
  productId: string;
  productName: string;
  variantId: string;
  label: string;
  stock: number;
  minimum: number;
  requestUnits: number;
};


const stockState = (stock: number, minimum: number, pendingTransit: number) => {
  if (pendingTransit > 0) return { label: `En camino`, tone: "text-blue-500", icon: <Truck className="h-3 w-3" /> };
  if (stock <= 0) return { label: "Sin stock", tone: "text-[#F2778D]", icon: null };
  if (stock < minimum) return { label: "Bajo mínimo", tone: "text-[#F291A3]", icon: null };
  return { label: "✓ OK", tone: "text-emerald-500", icon: null };
};

const variantLabel = (product: Product, size: string, colorObj: any) =>
  `${size || "Sin talla"} / ${colorObj?.name || product.gender || "Sin color"}`;

const getProductImage = (product: Product) => product.images?.[0] ?? "";

const getProductStockSummary = (variants: Product["variants"]) => {
  const total = variants?.reduce((acc, v) => acc + Number(v.stock ?? 0), 0) ?? 0;
  // Usamos min_stock_alert con un fallback de 10 por seguridad
  const minTotal = variants?.reduce((acc, v) => acc + Number(v.min_stock_alert ?? 10), 0) ?? 0;
  return { total, minTotal };
};

const getSupplySuggestion = (variants: Product["variants"]) => {
  const deficit = variants?.reduce((acc, v) => {
    const stock = Number(v.stock ?? 0);
    const min = Number(v.min_stock_alert ?? 10); // 👈 Data real
    return acc + Math.max(0, min - stock);
  }, 0) ?? 0;
  
  const minTotal = variants?.reduce((acc, v) => acc + Number(v.min_stock_alert ?? 10), 0) ?? 1;
  const avgMonthlySales = Math.max(1, Math.round(minTotal / 2));
  return { deficit, avgMonthlySales };
};

export const SupplyPlanningBoard = () => {
  const router = useRouter();
  const { products, loading: productsLoading, searchTerm, startLoadingProducts } = useProductStore();
  const { purchaseOrders, startLoadingPurchaseOrders, startLoadingStockByVariant, startLoadingStockBatch, loading: ordersLoading } = useStorehouseStore();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, SupplySelection>>({});
  // Stock real por variante: { [variantId]: available_stock (physical - reserved) }
  const [warehouseStock, setWarehouseStock] = useState<Record<string, number>>({});
  const [loadingStock, setLoadingStock] = useState(false);

  // Estados de paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    void startLoadingProducts({ limit: 100 });
    void startLoadingPurchaseOrders();
  }, [startLoadingProducts, startLoadingPurchaseOrders]);

  const pendingTransitByVariant = useMemo(() => {
    const transit: Record<string, number> = {};
    const activeOrders = purchaseOrders.filter((order) => order.status === "PENDIENTE");
    activeOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!transit[item.id_variant]) transit[item.id_variant] = 0;
        transit[item.id_variant] += item.quantity;
      });
    });
    return transit;
  }, [purchaseOrders]);


  // Carga el stock real de WarehouseStock para TODAS las variantes al montar.
  // Usa startLoadingStockBatch: llamadas paralelas + un solo dispatch de loading.
  // Esto evita el parpadeo que causaba despachar loading true/false por cada variante.
  useEffect(() => {
    if (products.length === 0) return;

    const allVariantIds = products.flatMap(
      (p) => (p.variants ?? []).map((v) => v.id_variant).filter(Boolean)
    ) as string[];

    if (allVariantIds.length === 0) return;

    setLoadingStock(true);
    startLoadingStockBatch(allVariantIds).then((stockMap) => {
      setWarehouseStock((prev) => ({ ...prev, ...stockMap }));
      setLoadingStock(false);
    });
  // Solo relanzar cuando cambie la lista de productos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const alertProducts = useMemo(() => {
    // Todos los productos se muestran en el board de alertas.
    // El stock real viene de WarehouseStock (cargado al expandir cada producto).
    // Los filtros critical/low se evalúan con el stock disponible en warehouseStock;
    // si no se cargó aún se usa un valor alto por defecto para evitar marcar falsamente como crítico/bajo.
    return products.map((product) => {
      const variants = product.variants ?? [];
      const critical = variants.filter((v) => {
        const s = warehouseStock[v.id_variant] !== undefined ? warehouseStock[v.id_variant] : 9999;
        return s <= 0;
      }).length;
      const low = variants.filter((v) => {
        const s = warehouseStock[v.id_variant] !== undefined ? warehouseStock[v.id_variant] : 9999;
        const min = Number(v.min_stock_alert ?? 10);
        return s > 0 && s < min;
      }).length;
      return { product, variants, critical, low };
    });
  }, [products, warehouseStock]);

  const filtered = useMemo(() => { 
    if (!searchTerm.trim()) return alertProducts;
    const q = searchTerm.toLowerCase().trim();
    return alertProducts.filter(({ product, variants }) => {
      const hay = [
        product.name,
        product.sku,
        product.category?.name ?? "",
        ...variants.map((v) => `${v.size} ${v.color?.name || ""}`), // 👈 Mapeo de subpropiedad corregido
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [alertProducts, searchTerm]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, page, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Reiniciar a la primera página al buscar
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const criticalCount = alertProducts.filter((p) => p.critical > 0).length;
  const lowCount = alertProducts.filter((p) => p.critical === 0 && p.low > 0).length;
  const isLoading = productsLoading || ordersLoading;
  const isLoadingAllStock = loadingStock && Object.keys(warehouseStock).length === 0;
  const isStockLoaded = Object.keys(warehouseStock).length > 0;

  const toggleVariant = (next: SupplySelection) => {
    let changedProduct = false;
    setSelected((current) => {
      const currentProductId = Object.values(current)[0]?.productId;
      if (current[next.key]) {
        const copy = { ...current };
        delete copy[next.key];
        return copy;
      }
      if (currentProductId && currentProductId !== next.productId) {
        changedProduct = true;
        return { [next.key]: next };
      }
      return { ...current, [next.key]: next };
    });
    if (changedProduct)
      toast("Solo puedes crear un abastecimiento por producto. Se limpió la selección anterior.", { icon: "↺" });
  };

  const startSupply = () => {
    const selectedList = Object.values(selected);
    if (selectedList.length === 0) return toast.error("Selecciona al menos una variante.");
    
    localStorage.setItem(
      "abastecimiento_prefill",
      JSON.stringify({
        source: "inventory-alert-board",
        selectionTitle:
          selectedList.length === 1
            ? selectedList[0]?.productName
            : "Selección de inventario",
        items: selectedList.map((item) => ({
          id_variant: item.variantId,
          quantity: item.requestUnits,
          unit_cost: 0,
          variant_label: item.label,
          product_name: item.productName,
          product_image:
            products.find((p) => p.id_product === item.productId)?.images?.[0] ?? "",
          product_id: item.productId,
          stock: item.stock,
          minimum: item.minimum,
        })),
      })
    );
    router.push("/admin/storehouse/create");
  };

  return (
    <section className="mx-auto max-w-6xl px-4 space-y-6 pb-24 transition-colors duration-500">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#D6405F] dark:text-[#F8BBD0] mb-2">
            Inventario y alertas
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-[#40202D] dark:text-white tracking-wide">
            Inventario y Alertas
          </h1>
          <p className="text-sm font-medium text-[#8C6B79] dark:text-gray-300 mt-1">
            Sistema de detección automática de stock bajo.
          </p>
        </div>
      </header>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-black/50 backdrop-blur-2xl px-8 py-6 border border-[#EAE0E2] dark:border-white/10 shadow-sm transition-all hover:scale-[1.02]">
          <p className="text-5xl font-black text-[#D6405F] dark:text-[#F8BBD0]">{isStockLoaded ? criticalCount : "…"}</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-wider text-[#8C6B79] dark:text-gray-400">Alertas Críticas</p>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-inner">
            <AlertTriangle className="h-6 w-6 text-[#D6405F] dark:text-[#F8BBD0]" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-black/50 backdrop-blur-2xl px-8 py-6 border border-[#EAE0E2] dark:border-white/10 shadow-sm transition-all hover:scale-[1.02]">
          <p className="text-5xl font-black text-[#40202D] dark:text-white">{isStockLoaded ? lowCount : "…"}</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-wider text-[#8C6B79] dark:text-gray-400">Stock Bajo</p>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-inner">
            <TrendingDown className="h-6 w-6 text-[#8C6B79] dark:text-gray-400" />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-3xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md p-6 text-sm font-medium text-[#8C6B79] dark:text-gray-400 text-center animate-pulse">
          Cargando inventario y estado de órdenes...
        </div>
      )}

      {/* Banner de carga de stock — visible solo mientras se consulta WarehouseStock por primera vez */}
      {!isLoading && isLoadingAllStock && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-100 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-900/10 backdrop-blur-md px-5 py-3 text-sm font-medium text-rose-500 dark:text-rose-400 animate-pulse">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          Consultando stock real en almacén…
        </div>
      )}

      {/* ── Product list ── */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-[#40202D] dark:text-white tracking-wide px-2">
            Productos que Requieren Atención
          </h2>

          {paginatedProducts.map(({ product, variants, critical, low }) => {
            const isOpen = expanded === product.id_product;
            const isProductInTransit = variants.some(
              (v) => (pendingTransitByVariant[v.id_variant] || 0) > 0
            );
            // Stock real del almacén para las variantes de este producto
            const stockTotal = variants.reduce(
              (acc, v) => acc + (warehouseStock[v.id_variant] !== undefined ? warehouseStock[v.id_variant] : 0), 0
            );
            const minTotal = variants.reduce(
              (acc, v) => acc + Number(v.min_stock_alert ?? 10), 0
            );
            const deficit = variants.reduce((acc, v) => {
              const s = warehouseStock[v.id_variant] !== undefined ? warehouseStock[v.id_variant] : 9999;
              const min = Number(v.min_stock_alert ?? 10);
              return acc + Math.max(0, min - s);
            }, 0);
            const avgMonthlySales = Math.max(1, Math.round(minTotal / 2));

            // Verificar si este producto específico tiene selecciones
            const selectedVariantsForThisProduct = Object.values(selected).filter(
              (s) => s.productId === product.id_product
            );
            const hasSelections = selectedVariantsForThisProduct.length > 0;
            const totalRequestUnits = selectedVariantsForThisProduct.reduce((acc, curr) => acc + curr.requestUnits, 0);

            return (
              <article
                key={product.id_product}
                className="overflow-hidden rounded-[32px] border border-[#EAE0E2] dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl shadow-sm transition-all duration-300"
              >
                {/* Cabecera Alineada */}
                <button
                  type="button"
                  onClick={() => {
                    const next = isOpen ? null : product.id_product;
                    setExpanded(next);
                    // Al expandir, refrescar el stock de este producto con batch
                    if (next && variants.length > 0) {
                      const ids = variants.map((v) => v.id_variant).filter(Boolean) as string[];
                      startLoadingStockBatch(ids).then((stockMap) => {
                        setWarehouseStock((prev) => ({ ...prev, ...stockMap }));
                      });
                    }
                  }}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left hover:bg-white/50 dark:hover:bg-white/5 transition-colors group"
                >
                  <div className="flex flex-1 items-center gap-5 min-w-0">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.5rem] border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 shadow-inner group-hover:scale-105 transition-transform">
                      {getProductImage(product) ? (
                        <Image
                          src={getProductImage(product)}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package2 className="h-8 w-8 text-[#8C6B79] dark:text-gray-500" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="truncate text-[18px] font-black text-[#40202D] dark:text-white tracking-wide">
                          {product.name}
                        </span>
                        <span className="rounded-full bg-white/50 dark:bg-white/10 border border-[#EAE0E2] dark:border-white/10 uppercase px-3 py-1 text-[10px] font-black tracking-widest text-[#8C6B79] dark:text-gray-400 shadow-sm">
                          {product.category?.name ?? product.gender}
                        </span>
                        {isStockLoaded && (critical > 0 || low > 0) && (
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase shadow-sm ${
                              critical > 0 ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                            }`}
                          >
                            {critical > 0 ? "Crítico" : "Bajo"}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[13px] font-medium text-[#8C6B79] dark:text-gray-400">
                        Stock: <span className="font-black text-[#D6405F] dark:text-[#F8BBD0]">{isStockLoaded ? `${stockTotal} uds` : "…"}</span>
                        <span className="mx-3 opacity-30">|</span>
                        Mínimo: <span className="font-black text-[#40202D] dark:text-white">{minTotal} uds</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {isStockLoaded && deficit > 0 && (
                      <div className="hidden md:block rounded-xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 px-4 py-2 shadow-inner">
                        <div className="flex items-center gap-1.5">
                          <Lightbulb className="h-4 w-4 text-[#D6405F] dark:text-[#F8BBD0]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#D6405F] dark:text-[#F8BBD0]">
                            Sugerencia
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] font-medium text-[#8C6B79] dark:text-gray-300">
                          Reponer <span className="font-black text-[#40202D] dark:text-white">{deficit} uds</span>
                        </p>
                      </div>
                    )}

                    <div className="shrink-0 text-[#8C6B79] dark:text-gray-400 group-hover:text-[#D6405F] dark:group-hover:text-[#F8BBD0] transition-colors">
                      {isOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                    </div>
                  </div>
                </button>

                {/* Tabla Desplegable */}
                {isOpen && (
                  <div className="border-t border-[#EAE0E2] dark:border-white/10 bg-white/30 dark:bg-white/5 px-6 py-8 transition-all">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-[11px] font-black tracking-widest text-[#8C6B79] dark:text-gray-400 uppercase">
                        Detalle por variante
                      </h3>
                    </div>

                    <div className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-[#faf5f0] dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-[12px] overflow-hidden transition-[background-color,border-color] duration-[600ms]">
                      <table className="w-full text-left border-collapse">
                        <thead className="relative transition-[background-color,border-color] duration-[600ms]">
                          <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Talla</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Color</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Stock</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Mínimo</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Nivel</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Estado</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Métricas</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)] text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAE0E2]/50 dark:divide-white/5">
                          {variants.map((variant, idx) => {
                            // Usar stock real de WarehouseStock; mostrar "…" mientras carga
                            const stockLoaded = warehouseStock[variant.id_variant] !== undefined;
                            const stock = stockLoaded ? warehouseStock[variant.id_variant] : (variant.stock ?? 0);
                            const key = `${product.id_product}-${variant.id_variant}`;
                            
                            // ✅ VINCULACIÓN DIRECTA:
                            const minimum = variant.min_stock_alert ?? 0; 
                            
                            const pendingTransit = pendingTransitByVariant[variant.id_variant] || 0;
                            const status = stockState(stock, minimum, pendingTransit);
                            const percentage = Math.min(100, (stock / Math.max(minimum, 1)) * 100);
                            const checked = Boolean(selected[key]);

                            return (
                              <tr key={key} className={`transition-colors group/row ${idx % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                                <td className="px-4 py-5 text-[13px] font-black text-[#40202D] dark:text-white">
                                  {variant.size || "-"}
                                </td>
                                <td className="px-4 py-5 text-[13px] font-bold text-[#8C6B79] dark:text-gray-300 flex items-center gap-2">
                                  {variant.color?.hex && (
                                    <div className="w-3 h-3 rounded-full border border-[#EAE0E2] dark:border-white/10" style={{ backgroundColor: variant.color.hex }} />
                                  )}
                                  <span>{variant.color?.name || "-"}</span>
                                </td>
                                <td className={`px-4 py-5 text-[15px] font-black ${stock < minimum ? 'text-[#D6405F] dark:text-[#F8BBD0]' : 'text-[#40202D] dark:text-white'}`}>
                                  {stockLoaded ? stock : <span className="text-gray-300 animate-pulse">…</span>}
                                </td>
                                <td className="px-4 py-5">
                                  <div className="inline-flex min-w-[40px] items-center justify-center rounded-xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3 py-1 text-[12px] font-black text-[#8C6B79] dark:text-gray-400 shadow-inner">
                                    {minimum}
                                  </div>
                                </td>
                                <td className="px-4 py-5">
                                  <div className="h-2 w-24 overflow-hidden rounded-full bg-black/5 dark:bg-white/10 shadow-inner">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${stock < minimum ? 'bg-gradient-to-r from-[#D6405F] to-[#F23B69]' : 'bg-[#40202D] dark:bg-gray-400'}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-5">
                                  <span className={`text-[11px] font-black uppercase tracking-wider ${status.tone} flex items-center gap-1.5`}>
                                    {status.icon}
                                    {status.label}
                                  </span>
                                </td>
                                <td className="px-4 py-5">
                                  <div className="flex flex-col gap-1 text-[10px] font-bold tracking-wide uppercase text-[#8C6B79] dark:text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                      <Eye className="h-3 w-3" /> {Math.floor(Math.random() * 500) + 100}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#D6405F] dark:text-[#F8BBD0]">
                                      <ArrowUp className="h-3 w-3" /> {Math.floor(Math.random() * 40) + 5} ventas
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-5 text-center">
                                  {pendingTransit === 0 ? (
                                    <button
                                      onClick={() => toggleVariant({
                                        key,
                                        productId: product.id_product,
                                        productName: product.name,
                                        variantId: variant.id_variant,
                                        label: variantLabel(product, variant.size, variant.color),
                                        stock,
                                        minimum: variant.min_stock_alert ?? 10,
                                        requestUnits: Math.max(1, minimum - stock),
                                      })}
                                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm
                                        ${checked 
                                          ? 'bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white' 
                                          : 'bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 border border-[#EAE0E2] dark:border-white/10'
                                        }`}
                                    >
                                      {checked ? <Check className="h-4 w-4" /> : 'AÑADIR'}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full">En camino</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* ── NUEVO BOTÓN DE ACCIÓN LOCAL ── */}
                    {hasSelections && (
                      <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-[2rem] border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md p-6 md:flex-row shadow-sm">
                        <div className="flex items-center gap-5">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 dark:bg-white/5 text-[#D6405F] dark:text-[#F8BBD0] border border-[#EAE0E2] dark:border-white/10 shadow-inner">
                            <FilePlus2 className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-[14px] font-black text-[#40202D] dark:text-white tracking-wide">Abastecimiento en curso</p>
                            <p className="text-[12px] font-bold text-[#8C6B79] dark:text-gray-400 mt-0.5">
                              {selectedVariantsForThisProduct.length} variantes seleccionadas · <span className="text-[#D6405F] dark:text-[#F8BBD0]">{totalRequestUnits} uds a reponer</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
                          <button
                            onClick={() => setSelected({})}
                            className="flex items-center justify-center gap-2 rounded-xl bg-white/50 dark:bg-white/5 px-6 py-3 text-[12px] font-black text-[#8C6B79] dark:text-gray-400 border border-[#EAE0E2] dark:border-white/10 hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-colors shadow-sm w-full md:w-auto"
                          >
                            <Trash2 className="h-4 w-4" /> Limpiar
                          </button>
                          <button
                            onClick={startSupply}
                            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] px-8 py-3 text-[12px] font-black uppercase tracking-widest text-white shadow-lg hover:scale-[1.02] transition-all w-full md:w-auto"
                          >
                            <Package2 className="h-4 w-4" /> Orden de precompra
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {/* ── Paginación de Productos ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 px-2">
              <span className="text-xs font-bold text-[#8C6B79] dark:text-gray-400 uppercase tracking-wider">
                Mostrando {Math.min(filtered.length, (page - 1) * itemsPerPage + 1)}-
                {Math.min(filtered.length, page * itemsPerPage)} de {filtered.length} productos
              </span>

              <div className="flex items-center gap-1 bg-white/50 dark:bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="p-2 rounded-xl text-[#8C6B79] hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-all disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
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
                      className={`min-w-[36px] h-9 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer
                        ${page === pNum
                          ? "bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white shadow-md"
                          : "text-[#8C6B79] hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10"
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
                  className="p-2 rounded-xl text-[#8C6B79] hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-all disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-3xl border border-[#EAE0E2] dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl px-6 py-12 text-center shadow-sm">
          <Package2 className="h-12 w-12 text-[#8C6B79] dark:text-gray-500 mx-auto mb-4 opacity-50" />
          <p className="text-sm font-medium text-[#8C6B79] dark:text-gray-400 tracking-wide">No hay productos con alertas de stock o coincidiendo con tu búsqueda.</p>
        </div>
      )}
    </section>
  );
};