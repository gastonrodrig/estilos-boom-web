// @ts-nocheck
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
  ClipboardList, 
  Lightbulb, 
  Check, 
  Eye, 
  ArrowUp,
  FilePlus2,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { Product } from "@/core/models";
import { useProductStore, useStorehouseStore } from "@/hooks";
import { productApi } from "@/api/product/product-api";

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
  if (pendingTransit > 0) return { label: `En pre-producción`, tone: "text-blue-500", icon: <ClipboardList className="h-3 w-3" /> };
  if (stock <= 0) return { label: "Sin stock", tone: "text-[#F2778D]", icon: null };
  if (stock < minimum) return { label: "Bajo mínimo", tone: "text-[#F291A3]", icon: null };
  return { label: "✓ OK", tone: "text-emerald-500", icon: null };
};

const variantLabel = (product: Product, size: string, color: any) =>
  `${size || "Sin talla"} / ${(typeof color === 'string' ? color : color?.name) || product.gender || "Sin color"}`;

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

export const PreProductionBoard = () => {
  const router = useRouter();
  const { products, loading: productsLoading, searchTerm, startLoadingProducts } = useProductStore();
  const { purchaseOrders, startLoadingPurchaseOrders, loading: ordersLoading } = useStorehouseStore();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, SupplySelection>>({});
  const [metricsMap, setMetricsMap] = useState<Record<string, { favorites: number; variants: { id_variant: string; sales: number }[] }>>({});

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
        ...variants.map((v) => `${v.size} ${typeof v.color === 'string' ? v.color : v.color?.name}`),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [alertProducts, searchTerm]);

  const criticalCount = alertProducts.filter((p) => p.critical > 0).length;
  const lowCount = alertProducts.filter((p) => p.critical === 0 && p.low > 0).length;
  const isLoading = productsLoading || ordersLoading;

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

  const startPreProduction = () => {
    const selectedList = Object.values(selected);
    if (selectedList.length === 0) return toast.error("Selecciona al menos una variante.");
    
    localStorage.setItem(
      "pre_produccion_prefill",
      JSON.stringify({
        source: "pre-production-board",
        selectionTitle:
          selectedList.length === 1
            ? selectedList[0]?.productName
            : "Selección de pre-producción",
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
    router.push("/admin/pre-production/create");
  };

  return (
    <section className="mx-auto max-w-6xl px-4 space-y-6 pb-24">
      {/* ── Header ── */}
      <header>
        <p className="text-[15px] font-semibold uppercase tracking-[0.24em] text-[#b79ca5]">
          Planeamiento de Pre-Producción
        </p>
        <h1 className="font-(--font-vidaloka) mt-1 text-3xl text-[#594246]">
          Crear Órdenes de Pre-Producción
        </h1>
        <p className="mt-0.5 text-[12px] text-[#9b8088]">
          Sistema de planeamiento para órdenes de pre-producción basado en alertas de stock.
        </p>
      </header>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-rose-100 px-6 py-5">
          <p className="text-5xl font-bold text-[#594246]">{criticalCount}</p>
          <p className="mt-1 text-sm font-medium text-[#594246]">Alertas Críticas</p>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-rose-300/50">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[#ede8e9] px-6 py-5">
          <p className="text-5xl font-bold text-[#594246]">{lowCount}</p>
          <p className="mt-1 text-sm font-medium text-[#9b8088]">Stock Bajo</p>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-[#594246]">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-rose-100 bg-white p-5 text-sm text-[#9b8088]">
          Cargando inventario y estado de órdenes...
        </div>
      )}

      {/* ── Product list ── */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[20px] font-normal text-[#594246]">
            Productos para Pre-Producción
          </h2>

          {filtered.map(({ product, variants, critical }) => {
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
                className="overflow-hidden rounded-2xl border border-[#F2778D] bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => {
                    const nextId = isOpen ? null : product.id_product;
                    setExpanded(nextId);
                    if (nextId && !metricsMap[nextId]) {
                      productApi.get(`/${nextId}/metrics`)
                        .then(r => setMetricsMap(prev => ({ ...prev, [nextId]: r.data })))
                        .catch(() => {});
                    }
                  }}
                  className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left hover:bg-rose-50/30 transition-colors"
                >
                  <div className="flex flex-1 items-center gap-4 min-w-0">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-rose-100 bg-rose-50">
                      {getProductImage(product) ? (
                        <Image
                          src={getProductImage(product)}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package2 className="h-6 w-6 text-rose-300" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[16px] font-semibold text-[#594246]">
                          {product.name}
                        </span>
                        <span className="rounded-sm bg-[#F291A3] capitalize px-2 py-0.5 text-[13px] font-bold text-white">
                          {product.category?.name ?? product.gender.toLowerCase()}
                        </span>
                        <span
                          className={`rounded-sm px-2 py-0.5 text-[13px] font-semibold text-white ${
                            critical > 0 ? "bg-[#F2D0D3]" : "bg-[#F2778D]"
                          }`}
                        >
                          {critical > 0 ? "Crítico" : "Bajo"}
                        </span>
                      </div>

                      <p className="mt-1 text-[12px] text-[#9b8088]">
                        Stock: <span className="font-semibold text-[#F2778D]">{stockTotal} unidades</span>
                        <span className="mx-2 text-rose-200">|</span>
                        Mínimo: <span className="font-semibold text-[#594246]">{minTotal} unidades</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {deficit > 0 && (
                      <div className="hidden md:block rounded-xl bg-rose-50 border border-rose-100 px-4 py-2 max-w-[280px]">
                        <div className="flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                            Sugerencia
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] leading-tight text-[#9b8088]">
                          Producir <span className="font-bold text-[#594246]">{deficit} unidades</span>
                        </p>
                      </div>
                    )}

                    <div className="shrink-0 text-[#c5adb5]">
                      {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[#F2D0D3] bg-[#FAF9F6] px-6 py-6 transition-all">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-[13px] font-bold tracking-wider text-[#594246] uppercase">
                        Detalle por prenda
                      </h3>
                    </div>

                    <div className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-[#faf5f0] dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-[12px] overflow-hidden transition-[background-color,border-color] duration-[600ms]">
                      <table className="w-full text-left border-collapse">
                        <thead className="relative transition-[background-color,border-color] duration-[600ms]">
                          <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-medium uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Talla</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Color</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Stock Actual</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Mínimo</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Nivel</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Estado</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Métricas</th>
                            <th className="px-4 py-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)] text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((variant) => {
                            const stock = Number(variant.stock ?? 0);
                            const key = `${product.id_product}-${variant.id_variant}`;
                            const minimum = selected[key]?.minimum ?? minimumForStock(stock);
                            const pendingTransit = pendingTransitByVariant[variant.id_variant] || 0;
                            const status = stockState(stock, minimum, pendingTransit);
                            const percentage = Math.min(100, (stock / Math.max(minimum, 1)) * 100);
                            const checked = Boolean(selected[key]);

                            return (
                              <tr key={key} className="group bg-white transition-shadow hover:shadow-sm">
                                <td className="rounded-l-xl px-4 py-4 text-sm font-semibold text-[#594246]">
                                  {variant.size || "-"}
                                </td>
                                <td className="px-4 py-4 text-sm text-[#9b8088]">
                                  {typeof variant.color === 'string' ? variant.color : variant.color?.name || "-"}
                                </td>
                                <td className={`px-4 py-4 text-base font-bold ${stock < minimum ? 'text-[#F2778D]' : 'text-[#594246]'}`}>
                                  {stock}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="inline-flex min-w-[40px] items-center justify-center rounded-lg border border-[#F2D0D3] bg-[#FAF9F6] px-3 py-1 text-sm font-bold text-[#594246]">
                                    {minimum}
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#EBEAE8]">
                                    <div 
                                      className={`h-full rounded-full ${stock < minimum ? 'bg-[#F2778D]' : 'bg-[#594246]'}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <span className={`text-[12px] font-bold ${status.tone} flex items-center gap-1`}>
                                    {status.icon}
                                    {status.label}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  {(() => {
                                    const m = metricsMap[product.id_product];
                                    const vMetric = m?.variants?.find(v => v.id_variant === variant.id_variant);
                                    return (
                                      <div className="flex flex-col gap-0.5 text-[10px] text-[#9b8088]">
                                        <div className="flex items-center gap-1.5">
                                          <ArrowUp className="h-3 w-3 text-rose-400" />
                                          <span className="font-bold text-rose-400">{vMetric ? `${vMetric.sales} ventas` : '—'}</span>
                                        </div>
                                        {m && (
                                          <div className="flex items-center gap-1.5">
                                            <Eye className="h-3 w-3" />
                                            <span>{m.favorites} favoritos</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="rounded-r-xl px-4 py-4 text-center">
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
                                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-[10px] font-bold transition-all
                                        ${checked 
                                          ? 'bg-[#594246] text-white shadow-md' 
                                          : 'bg-rose-100 text-[#F2778D] hover:bg-rose-200'
                                        }`}
                                    >
                                      {checked ? <Check className="h-3 w-3" /> : 'SELECCIONAR'}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-bold text-blue-400 uppercase">En proceso</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {hasSelections && (
                      <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/50 p-5 md:flex-row">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#F2778D] shadow-sm">
                            <FilePlus2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[#594246]">Pre-producción en curso</p>
                            <p className="text-[11px] text-[#9b8088]">
                              {selectedVariantsForThisProduct.length} variantes · {totalRequestUnits} unidades totales
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected({})}
                            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[12px] font-bold text-[#9b8088] border border-rose-100 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" /> Limpiar
                          </button>
                          <button
                            onClick={startPreProduction}
                            className="flex items-center gap-2 rounded-xl bg-[#F2778D] px-6 py-2 text-[12px] font-bold text-white shadow-lg shadow-rose-200 hover:bg-[#d9657a] transition-all"
                          >
                            <ClipboardList className="h-4 w-4" /> Crear orden de pre-producción
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-2xl border border-rose-100 bg-white px-6 py-10 text-center">
          <p className="text-sm text-[#9b8088]">No hay productos con alertas de stock.</p>
        </div>
      )}
    </section>
  );
};
