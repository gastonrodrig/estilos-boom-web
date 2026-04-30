"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ChevronUp, Package2, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { CTA } from "@/components/atoms";
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

const minimumForStock = (stock: number) => (stock <= 0 ? 10 : Math.max(5, stock + 8));

const stockState = (stock: number, minimum: number, pendingTransit: number) => {
  if (pendingTransit > 0) return { label: `En camino (+${pendingTransit})`, tone: "bg-blue-100 text-blue-700" };
  if (stock <= 0) return { label: "Sin stock", tone: "bg-rose-100 text-rose-700" };
  if (stock < minimum) return { label: "Bajo mínimo", tone: "bg-amber-100 text-amber-800" };
  return { label: "OK", tone: "bg-emerald-100 text-emerald-700" };
};

const variantLabel = (product: Product, size: string, color: string) => `${size || "Sin talla"} / ${color || product.gender || "Sin color"}`;
const getProductImage = (product: Product) => product.images?.[0] ?? "";

// 2. Tipamos correctamente los props en lugar de usar "any"
type FloatingBarProps = {
  selectedCount: number;
  selectedUnits: number;
  onClear: () => void;
  onSubmit: () => void;
};

const FloatingSelectionBar = ({ selectedCount, selectedUnits, onClear, onSubmit }: FloatingBarProps) => {
  if (selectedCount === 0) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-6xl rounded-2xl border border-rose-200 bg-white px-4 py-3 shadow-lg">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400">Abastecimiento en curso</p>
          <p className="mt-1 text-sm text-[#594246]">{selectedCount} variantes seleccionadas · {selectedUnits} unidades a reponer.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <CTA onClick={onClear} className="border border-rose-200 bg-white text-[#594246]">Limpiar selección</CTA>
          <CTA onClick={onSubmit} icon={Package2}>Realizar Abastecimiento</CTA>
        </div>
      </div>
    </div>
  );
};

export const SupplyPlanningBoard = () => {
  const router = useRouter();
  // 3. Quitamos 'setSearchTerm' porque no lo usamos en esta vista
  const { products, loading: productsLoading, searchTerm, startLoadingProducts } = useProductStore();
  const { purchaseOrders, startLoadingPurchaseOrders, loading: ordersLoading } = useStorehouseStore();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, SupplySelection>>({});

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
      const hay = [product.name, product.sku, product.category?.name ?? "", ...variants.map((v) => `${v.size} ${v.color}`)].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [alertProducts, searchTerm]);

  const criticalCount = alertProducts.filter((p) => p.critical > 0).length;
  const lowCount = alertProducts.filter((p) => p.critical === 0 && p.low > 0).length;
  const selectedCount = Object.keys(selected).length;
  const selectedUnits = Object.values(selected).reduce((acc, item) => acc + item.requestUnits, 0);
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
    if (changedProduct) toast("Solo puedes crear un abastecimiento por producto. Se limpió la selección anterior.", { icon: "↺" });
  };

  const startSupply = () => {
    if (!selectedCount) return toast.error("Selecciona al menos una variante.");
    localStorage.setItem(
      "abastecimiento_prefill",
      JSON.stringify({
        source: "inventory-alert-board",
        selectionTitle: selectedCount === 1 ? Object.values(selected)[0]?.productName : "Selección de inventario",
        items: Object.values(selected).map((item) => ({
          id_variant: item.variantId,
          quantity: item.requestUnits,
          unit_cost: 0,
          variant_label: item.label,
          product_name: item.productName,
          product_image: products.find((p) => p.id_product === item.productId)?.images?.[0] ?? "",
          product_id: item.productId,
          stock: item.stock,
          minimum: item.minimum,
        })),
      })
    );
    router.push("/admin/storehouse/create");
  };

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-rose-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-400">Inventario y alertas</p>
            <h1 className="font-(--font-vidaloka) text-3xl text-[#594246]">Inventario y Alertas</h1>
            <p className="text-sm text-[#7d6970]">Sistema de detección automática de stock bajo.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-auto">
            <div className="rounded-2xl bg-rose-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-rose-300">Alertas críticas</p>
              <p className="text-3xl font-semibold text-[#594246]">{criticalCount}</p>
            </div>
            <div className="rounded-2xl bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[#a18d95]">Stock bajo</p>
              <p className="text-3xl font-semibold text-[#594246]">{lowCount}</p>
            </div>
          </div>
        </div>
      </header>

      {isLoading && <div className="rounded-3xl border border-rose-100 bg-white p-6 text-sm text-[#7d6970]">Cargando inventario y estado de órdenes...</div>}

      <div className="space-y-4">
        {/* 4. Quitamos la variable 'low' de los destructurados ya que no se imprime en el HTML */}
        {filtered.map(({ product, variants, critical }) => {
          const isOpen = expanded === product.id_product;
          const isProductInTransit = variants.some(v => (pendingTransitByVariant[v.id_variant] || 0) > 0);

          return (
            <article key={product.id_product} className="rounded-3xl border border-rose-200 bg-white shadow-sm">
              <button type="button" onClick={() => setExpanded(isOpen ? null : product.id_product)} className="flex w-full items-start gap-4 px-4 py-4 text-left">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-rose-100 bg-rose-50">
                  {getProductImage(product) ? (
                    <Image src={getProductImage(product)} alt={product.name} fill sizes="56px" className="object-cover" />
                  ) : (
                    <Package2 className="h-6 w-6 text-rose-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-[#594246]">{product.name}</h2>
                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">{product.category?.name ?? product.gender}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${critical > 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"}`}>{critical > 0 ? "Crítico" : "Bajo"}</span>
                    {isProductInTransit && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                        <Truck className="w-3 h-3" /> En camino
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#8a6f77]">Revisa las variantes para más detalles.</p>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-[#b79ca5]" /> : <ChevronDown className="h-4 w-4 text-[#b79ca5]" />}
              </button>

              {isOpen && (
                <div className="border-t border-rose-100 px-4 pb-4">
                  <div className="mt-4 overflow-auto rounded-2xl border border-rose-100">
                    <table className="min-w-275 w-full text-left text-xs">
                      <thead className="bg-rose-50 text-[10px] uppercase tracking-[0.16em] text-[#8f6f78]">
                        <tr>
                          <th className="px-4 py-3">Talla</th>
                          <th className="px-4 py-3">Color</th>
                          <th className="px-4 py-3">Stock Actual</th>
                          <th className="px-4 py-3 text-blue-600">En Proceso</th>
                          <th className="px-4 py-3 text-emerald-600">Stock Proyectado</th>
                          <th className="px-4 py-3">Mínimo</th>
                          <th className="px-4 py-3">Nivel</th>
                          <th className="px-4 py-3">Estado</th>
                          <th className="px-4 py-3 text-center">Seleccionar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100">
                        {variants.map((variant) => {
                          const stock = Number(variant.stock ?? 0);
                          const key = `${product.id_product}-${variant.id_variant}`;
                          const minimum = selected[key]?.minimum ?? minimumForStock(stock);
                          const pendingTransit = pendingTransitByVariant[variant.id_variant] || 0;
                          const projectedStock = stock + pendingTransit;
                          
                          const status = stockState(stock, minimum, pendingTransit);
                          const progress = Math.min(100, Math.round((stock / Math.max(minimum, 1)) * 100));
                          const isSelectable = pendingTransit === 0; 
                          const checked = Boolean(selected[key]);

                          return (
                            <tr key={key} className={pendingTransit > 0 ? "bg-blue-50/30" : ""}>
                              <td className="px-4 py-4">{variant.size || "-"}</td>
                              <td className="px-4 py-4">{variant.color || "-"}</td>
                              <td className="px-4 py-4 font-semibold">{stock}</td>
                              <td className="px-4 py-4 font-semibold text-blue-600">{pendingTransit > 0 ? `+${pendingTransit}` : "-"}</td>
                              <td className="px-4 py-4 font-semibold text-emerald-600">{projectedStock}</td>
                              <td className="px-4 py-4">{minimum}</td>
                              <td className="px-4 py-4">{progress}%</td>
                              <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${status.tone}`}>{status.label}</span></td>
                              <td className="px-4 py-4 text-center">
                                {isSelectable ? (
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    className="cursor-pointer"
                                    onChange={() => {
                                      toggleVariant({
                                        key, productId: product.id_product, productName: product.name,
                                        variantId: variant.id_variant, label: variantLabel(product, variant.size, variant.color),
                                        stock, minimum, requestUnits: Math.max(1, minimum - stock),
                                      });
                                    }}
                                  />
                                ) : (
                                  <span className="text-[10px] text-blue-500 font-semibold" title="Ya pediste esta variante">Pedido enviado</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <FloatingSelectionBar selectedCount={selectedCount} selectedUnits={selectedUnits} onClear={() => setSelected({})} onSubmit={startSupply} />
    </section>
  );
};