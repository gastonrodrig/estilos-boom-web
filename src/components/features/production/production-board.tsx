"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  AlertTriangle, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp, 
  Package2, 
  Factory, 
  Lightbulb, 
  Check, 
  Eye, 
  ArrowUp,
  FilePlus2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { Product } from "@/core/models";
import { useProductStore, useProductionStore } from "@/hooks";

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

const minimumForStock = (stock: number) => (stock <= 0 ? 10 : Math.max(5, stock + 8));

const stockState = (stock: number, minimum: number, pendingTransit: number) => {
  if (pendingTransit > 0) return { label: `En producción`, tone: "text-blue-500", icon: <Factory className="h-3 w-3" /> };
  if (stock <= 0) return { label: "Sin stock", tone: "text-[#F2778D]", icon: null };
  if (stock < minimum) return { label: "Bajo mínimo", tone: "text-[#F291A3]", icon: null };
  return { label: "✓ OK", tone: "text-emerald-500", icon: null };
};

const variantLabel = (product: Product, size: string, color: any) => {
  const colorName = typeof color === 'object' ? color?.name : color;
  return `${size || "Sin talla"} / ${colorName || product.gender || "Sin color"}`;
};

const getProductImage = (product: Product) => product.images?.[0] ?? "";

const getProductStockSummary = (variants: Product["variants"]) => {
  const total = variants?.reduce((acc, v) => acc + Number(v.stock ?? 0), 0) ?? 0;
  const minTotal = variants?.reduce((acc, v) => acc + minimumForStock(Number(v.stock ?? 0)), 0) ?? 0;
  return { total, minTotal };
};

const getSupplySuggestion = (variants: Product["variants"]) => {
  const deficit = variants?.reduce((acc, v) => {
    const stock = Number(v.stock ?? 0);
    const min = minimumForStock(stock);
    return acc + Math.max(0, min - stock);
  }, 0) ?? 0;
  const minTotal = variants?.reduce((acc, v) => acc + minimumForStock(Number(v.stock ?? 0)), 0) ?? 1;
  const avgMonthlySales = Math.max(1, Math.round(minTotal / 2));
  return { deficit, avgMonthlySales };
};

export const ProductionBoard = () => {
  const router = useRouter();
  const { products, loading: productsLoading, searchTerm, startLoadingProducts } = useProductStore();
  const { orders, startLoadingProductionOrders, loading: ordersLoading } = useProductionStore();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, SupplySelection>>({});

  useEffect(() => {
    void startLoadingProducts({ limit: 100, origin_type: "PRODUCCION" });
    void startLoadingProductionOrders();
  }, [startLoadingProducts, startLoadingProductionOrders]);

  const pendingTransitByVariant = useMemo(() => {
    const transit: Record<string, number> = {};
    const activeOrders = orders.filter((order) => order.status !== "COMPLETADA" && order.status !== "RECHAZADA");
    activeOrders.forEach((order) => {
      order.base_items?.forEach((item: any) => {
        const varId = typeof item.id_variant === 'string' ? item.id_variant : item.id_variant?._id;
        if (varId) {
          if (!transit[varId]) transit[varId] = 0;
          transit[varId] += item.quantity;
        }
      });
    });
    return transit;
  }, [orders]);

  const alertProducts = useMemo(() => {
    return products
      .map((product) => {
        const variants = product.variants ?? [];
        const critical = variants.filter((v) => Number(v.stock ?? 0) <= 0).length;
        const low = variants.filter((v) => {
          const stock = Number(v.stock ?? 0);
          return stock > 0 && stock < minimumForStock(stock);
        }).length;
        return { product, variants, critical, low };
      })
      .filter((item) => item.critical > 0 || item.low > 0);
  }, [products]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return alertProducts;
    const q = searchTerm.toLowerCase().trim();
    return alertProducts.filter(({ product, variants }) => {
      const hay = [
        product.name,
        product.sku,
        product.category?.name ?? "",
        ...variants.map((v) => `${v.size} ${typeof v.color === 'object' ? (v.color as any)?.name : v.color}`),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [alertProducts, searchTerm]);

  const criticalCount = alertProducts.filter((p) => p.critical > 0).length;
  const lowCount = alertProducts.filter((p) => p.critical === 0 && p.low > 0).length;
  const isLoading = productsLoading || ordersLoading;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

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
      toast("Solo puedes crear una orden por producto. Se limpió la selección anterior.", { icon: "↺" });
  };

  const startProduction = () => {
    const selectedList = Object.values(selected);
    if (selectedList.length === 0) return toast.error("Selecciona al menos una variante.");
    
    localStorage.setItem(
      "produccion_prefill",
      JSON.stringify({
        source: "production-board",
        selectionTitle:
          selectedList.length === 1
            ? selectedList[0]?.productName
            : "Selección de producción",
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
    router.push("/admin/production/create");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 font-sans transition-colors duration-500">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-2">
        <div>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }} className="mb-2 text-[#8B3A52] opacity-60 dark:text-white dark:opacity-35 font-medium uppercase">
            Inicio / Producción / Planeamiento
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
            <h1 className="text-[#40202D] dark:text-white leading-none mb-2" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2rem', fontWeight: 300 }}>
              Crear Órdenes de Producción
            </h1>
          </div>
          <p className="text-[#8C6B79] dark:text-white tracking-[0.03em] mt-3" style={{ fontSize: '0.78rem', opacity: 0.45 }}>
            Sistema de planeamiento para órdenes de producción basado en alertas de stock.
          </p>
        </div>
      </header>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-[#fffcfd] dark:bg-black/40 backdrop-blur-2xl px-8 py-6 border border-pink-100 dark:border-white/5 shadow-sm transition-all hover:scale-[1.02]">
          <p className="text-5xl font-medium text-[#D6405F] dark:text-[#F8BBD0]">{criticalCount}</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-wider text-[#8C6B79] dark:text-gray-400">Alertas Críticas</p>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/50 dark:bg-white/5 border border-pink-100 dark:border-white/10 shadow-inner">
            <AlertTriangle className="h-6 w-6 text-[#D6405F] dark:text-[#F8BBD0]" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.5rem] bg-[#fffcfd] dark:bg-black/40 backdrop-blur-2xl px-8 py-6 border border-pink-100 dark:border-white/5 shadow-sm transition-all hover:scale-[1.02]">
          <p className="text-5xl font-medium text-[#40202D] dark:text-white">{lowCount}</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-wider text-[#8C6B79] dark:text-gray-400">Stock Bajo</p>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/50 dark:bg-white/5 border border-pink-100 dark:border-white/10 shadow-inner">
            <TrendingDown className="h-6 w-6 text-[#8C6B79] dark:text-gray-400" />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-3xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md p-6 text-sm font-medium text-[#8C6B79] dark:text-gray-400 text-center animate-pulse">
          Cargando inventario y estado de órdenes...
        </div>
      )}

      {/* ── Product list ── */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <h2 className="text-xl font-medium text-[#40202D] dark:text-white tracking-wide">
              Productos para Producción
            </h2>
            <div className="text-sm font-medium text-[#8C6B79] dark:text-gray-400">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)} - {Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length}
            </div>
          </div>

          {paginatedItems.map(({ product, variants, critical }) => {
            const isOpen = expanded === product.id_product;
            const isProductInTransit = variants.some(
              (v) => (pendingTransitByVariant[v.id_variant] || 0) > 0
            );
            const { total: stockTotal, minTotal } = getProductStockSummary(variants);
            const { deficit, avgMonthlySales } = getSupplySuggestion(variants);

            const selectedVariantsForThisProduct = Object.values(selected).filter(
              (s) => s.productId === product.id_product
            );
            const hasSelections = selectedVariantsForThisProduct.length > 0;
            const totalRequestUnits = selectedVariantsForThisProduct.reduce((acc, curr) => acc + curr.requestUnits, 0);

            return (
              <article
                key={product.id_product}
                className="overflow-hidden rounded-[1.5rem] border border-pink-100 dark:border-white/5 bg-[#fffcfd] dark:bg-black/40 backdrop-blur-2xl shadow-sm transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : product.id_product)}
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
                        <span className="truncate text-[18px] font-medium text-[#40202D] dark:text-white tracking-wide">
                          {product.name}
                        </span>
                        <span className="rounded-full bg-white/50 dark:bg-white/10 border border-[#EAE0E2] dark:border-white/10 uppercase px-3 py-1 text-[10px] font-medium tracking-widest text-[#8C6B79] dark:text-gray-400 shadow-sm">
                          {product.category?.name ?? product.gender}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-medium tracking-widest uppercase shadow-sm ${
                            critical > 0 ? "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-500/30" : "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {critical > 0 ? "Crítico" : "Bajo"}
                        </span>
                      </div>

                      <p className="mt-1 text-[13px] font-medium text-[#8C6B79] dark:text-gray-400">
                        Stock: <span className="font-medium text-[#D6405F] dark:text-[#F8BBD0]">{stockTotal} uds</span>
                        <span className="mx-3 opacity-30">|</span>
                        Mínimo: <span className="font-medium text-[#40202D] dark:text-white">{minTotal} uds</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {deficit > 0 && (
                      <div className="hidden md:block rounded-xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 px-4 py-2 shadow-inner">
                        <div className="flex items-center gap-1.5">
                          <Lightbulb className="h-4 w-4 text-[#D6405F] dark:text-[#F8BBD0]" />
                          <span className="text-[10px] font-medium uppercase tracking-widest text-[#D6405F] dark:text-[#F8BBD0]">
                            Sugerencia
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] font-medium text-[#8C6B79] dark:text-gray-300">
                          Producir <span className="font-medium text-[#40202D] dark:text-white">{deficit} uds</span>
                        </p>
                      </div>
                    )}

                    <div className="shrink-0 text-[#8C6B79] dark:text-gray-400 group-hover:text-[#D6405F] dark:group-hover:text-[#F8BBD0] transition-colors">
                      {isOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-pink-100 dark:border-white/5 bg-white/50 dark:bg-black/20 px-6 py-8 transition-all">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-[11px] font-medium tracking-widest text-[#8C6B79] dark:text-gray-400 uppercase">
                        Detalle por variante
                      </h3>
                    </div>

                    <div className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-[#faf5f0] dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-[12px] overflow-hidden transition-[background-color,border-color] duration-[600ms]">
                      <table className="w-full text-left border-collapse">
                        <thead className="relative transition-[background-color,border-color] duration-[600ms]">
                          <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-medium uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
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
                            const stock = Number(variant.stock ?? 0);
                            const key = `${product.id_product}-${variant.id_variant}`;
                            const minimum = selected[key]?.minimum ?? minimumForStock(stock);
                            const pendingTransit = pendingTransitByVariant[variant.id_variant] || 0;
                            const status = stockState(stock, minimum, pendingTransit);
                            const percentage = Math.min(100, (stock / Math.max(minimum, 1)) * 100);
                            const checked = Boolean(selected[key]);

                            return (
                              <tr key={key} className={`transition-colors group/row ${idx % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                                <td className="px-4 py-5 text-[13px] font-medium text-[#40202D] dark:text-white">
                                  {variant.size || "-"}
                                </td>
                                <td className="px-4 py-5 text-[13px] font-bold text-[#8C6B79] dark:text-gray-300">
                                  {typeof variant.color === 'object' ? (variant.color as any)?.name : variant.color || "-"}
                                </td>
                                <td className={`px-4 py-5 text-[15px] font-medium ${stock < minimum ? 'text-[#D6405F] dark:text-[#F8BBD0]' : 'text-[#40202D] dark:text-white'}`}>
                                  {stock}
                                </td>
                                <td className="px-4 py-5">
                                  <div className="inline-flex min-w-[40px] items-center justify-center rounded-xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3 py-1 text-[12px] font-medium text-[#8C6B79] dark:text-gray-400 shadow-inner">
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
                                  <span className={`text-[11px] font-medium uppercase tracking-wider ${status.tone} flex items-center gap-1.5`}>
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
                                        minimum,
                                        requestUnits: Math.max(1, minimum - stock),
                                      })}
                                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-[10px] font-medium uppercase tracking-widest transition-all shadow-sm
                                        ${checked 
                                          ? 'bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white' 
                                          : 'bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 border border-[#EAE0E2] dark:border-white/10'
                                        }`}
                                    >
                                      {checked ? <Check className="h-4 w-4" /> : 'AÑADIR'}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-medium text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full">En proceso</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {hasSelections && (
                      <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-[2rem] border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md p-6 md:flex-row shadow-sm">
                        <div className="flex items-center gap-5">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 dark:bg-white/5 text-[#D6405F] dark:text-[#F8BBD0] border border-[#EAE0E2] dark:border-white/10 shadow-inner">
                            <FilePlus2 className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-[#40202D] dark:text-white tracking-wide">Producción en curso</p>
                            <p className="text-[12px] font-bold text-[#8C6B79] dark:text-gray-400 mt-0.5">
                              {selectedVariantsForThisProduct.length} variantes seleccionadas · <span className="text-[#D6405F] dark:text-[#F8BBD0]">{totalRequestUnits} uds totales</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
                          <button
                            onClick={() => setSelected({})}
                            className="flex items-center justify-center gap-2 rounded-xl bg-white/50 dark:bg-white/5 px-6 py-3 text-[12px] font-medium text-[#8C6B79] dark:text-gray-400 border border-[#EAE0E2] dark:border-white/10 hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-colors shadow-sm w-full md:w-auto"
                          >
                            <Trash2 className="h-4 w-4" /> Limpiar
                          </button>
                          <button
                            onClick={startProduction}
                            className="flex items-center justify-center gap-2 bg-[#8B3A52] hover:bg-[#a04060] text-white shadow-md transition-all font-medium w-full md:w-auto"
                            style={{ borderRadius: "8px", fontSize: "0.8rem", letterSpacing: "0.05em", padding: "10px 20px" }}
                          >
                            <Factory className="h-4 w-4" /> Crear Orden
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2 pb-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] dark:text-gray-400 hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-1.5 bg-white/50 dark:bg-[rgba(255,255,255,0.04)] backdrop-blur-md rounded-[999px] px-3 py-1.5 border border-[#EAE0E2] dark:border-[rgba(255,255,255,0.05)] shadow-sm">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  // Logica simple para mostrar un rango si hay muchas paginas
                  if (
                    totalPages > 5 &&
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(currentPage - page) > 1
                  ) {
                    if (page === 2 || page === totalPages - 1) {
                      return <span key={page} className="text-[#8C6B79] dark:text-gray-500 text-xs px-1">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition-all
                        ${currentPage === page 
                          ? "bg-[#8B3A52] text-white shadow-md shadow-[#8B3A52]/20 border border-[#8B3A52]" 
                          : "text-[#8C6B79] dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 hover:text-[#40202D] dark:hover:text-white"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] dark:text-gray-400 hover:text-[#40202D] dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-[1.5rem] border border-pink-100 dark:border-white/10 bg-[#fffcfd] dark:bg-black/40 backdrop-blur-2xl px-6 py-12 text-center shadow-sm">
          <Package2 className="h-12 w-12 text-[#8C6B79] dark:text-gray-500 mx-auto mb-4 opacity-50" />
          <p className="text-sm font-medium text-[#8C6B79] dark:text-gray-400 tracking-wide">No hay productos con alertas de stock o coincidiendo con tu búsqueda.</p>
        </div>
      )}
    </section>
  );
};
