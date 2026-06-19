'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSupplyStore, useSupplyWarehouseStore } from '@/hooks';
import { workshopApi } from '@/api';
import { getFirebaseAuthToken } from '@helpers';
import { Plus, Archive, ArrowUpRight, ShoppingBag, ChevronDown, X, CheckCircle2, AlertTriangle, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StorekeeperSupplyWarehousePage() {
  const router = useRouter();
  const { supplies, startLoadingSupplies } = useSupplyStore();
  const {
    loading: warehouseLoading,
    inventory,
    transactions,
    productionOrders,
    loadInventory,
    loadTransactions,
    loadProductionOrders,
    recordPurchase,
    recordDispatch,
    recordReturn
  } = useSupplyWarehouseStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'production_orders' | 'purchase' | 'dispatch' | 'return' | 'history'>('inventory');
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const inventoryByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    inventory.forEach(item => {
      const cat = item.category || 'Otros';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    return grouped;
  }, [inventory]);

  // States for Quick Purchase Modal
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [quickPurchaseData, setQuickPurchaseData] = useState<{
    id_supply: string;
    specification: string;
    name: string;
    quantity: number;
    cost: number;
    supplier_name: string;
  } | null>(null);

  // Load baseline dependencies
  useEffect(() => {
    startLoadingSupplies();
    loadInventory();
    loadTransactions();
    loadProductionOrders();

    const loadWorkshops = async () => {
      try {
        const token = await getFirebaseAuthToken();
        const { data } = await workshopApi.get('/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWorkshops(data);
      } catch (error) {
        console.error("Error al cargar talleres:", error);
      }
    };
    loadWorkshops();
  }, [startLoadingSupplies, loadInventory, loadTransactions, loadProductionOrders]);

  const handleQuickPurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPurchaseData) return;
    
    if (quickPurchaseData.quantity <= 0) return toast.error("La cantidad debe ser mayor a 0.");
    if (quickPurchaseData.cost <= 0) return toast.error("El costo debe ser mayor a 0.");
    if (!quickPurchaseData.supplier_name.trim()) return toast.error("Debe ingresar un proveedor.");

    const success = await recordPurchase({
      supplier_name: quickPurchaseData.supplier_name,
      notes: 'Compra rápida desde Requerimientos',
      items: [{
        id_supply: quickPurchaseData.id_supply,
        quantity: quickPurchaseData.quantity,
        cost: quickPurchaseData.cost,
        specifications: quickPurchaseData.specification
      }]
    });

    if (success) {
      toast.success("Insumo comprado y agregado al stock");
      setShowPurchaseModal(false);
      setQuickPurchaseData(null);
      loadInventory();
      loadTransactions();
    }
  };

  const handleQuickDispatch = async (order: any, requiredItems: any[]) => {
    if (!order.id_winner_workshop) {
      return toast.error("La orden no tiene un taller asignado.");
    }

    const wId = typeof order.id_winner_workshop === 'object' ? order.id_winner_workshop._id : order.id_winner_workshop;
    
    const dispatchItemsList = requiredItems.map(req => ({
      id_supply: req.id_supply,
      quantity: req.requiredQty,
      specifications: req.specification
    }));

    const success = await recordDispatch({
      id_workshop: wId,
      notes: `Despacho automático para OP ${order.order_number}`,
      items: dispatchItemsList
    });

    if (success) {
      toast.success("Insumos despachados correctamente");
      loadInventory();
      loadTransactions();
    }
  };

  const inputClass = "w-full bg-[#fdf8f9] dark:bg-[#1a0e14] border border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.1)] rounded-[10px] outline-none focus:border-[rgba(139,58,82,0.5)] dark:focus:border-[rgba(160,80,104,0.5)] transition-all p-[12px_16px] text-[0.85rem] text-[#2d1f25] dark:text-[#e8d8dc]";
  const labelClass = "text-[0.7rem] tracking-[0.1em] text-[#8B3A52] dark:text-[#a05068] uppercase mb-[6px] block font-medium";
  const btnClass = "px-6 py-3 bg-[#8B3A52] hover:bg-[#a05068] text-white font-medium rounded-[10px] transition-all text-[0.82rem] uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50";

  return (
    <div className="min-h-screen text-[#2d1f25] dark:text-[#e8d8dc]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 border-b border-[#e8d5c4]/40 dark:border-[#2d1a28]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#8B3A52] dark:text-[#e8c4cc] uppercase">Almacén de Insumos</h1>
            <p className="text-xs text-gray-500 font-medium">Panel del Almacenero Boom para registrar ingresos de insumos, despachos a producción y devoluciones.</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 border-b border-[#e8d5c4]/40 dark:border-[#2d1a28] pb-3">
          {[
            { id: 'inventory', label: 'Inventario de Insumos', icon: Archive },
            { id: 'production_orders', label: 'Órdenes y Requerimientos', icon: ShoppingBag },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer
                  ${active 
                    ? 'bg-[#8B3A52] text-white shadow-md' 
                    : 'bg-white/50 dark:bg-black/30 text-[#8B3A52]/70 dark:text-[#c4a0ae] hover:bg-[#8B3A52]/10'}`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* LOADING INDICATOR */}
        {warehouseLoading && (
          <div className="text-center py-12">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-[#8B3A52] rounded-full" role="status"></div>
            <p className="text-xs mt-2 opacity-60 uppercase font-bold">Procesando almacén...</p>
          </div>
        )}

        {!warehouseLoading && (
          <div className="bg-white/70 backdrop-blur-2xl dark:bg-[#2e1d27] border border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 shadow-sm">
            
            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold tracking-wider text-[#8B3A52] uppercase">Stock Disponible</h2>
                
                {Object.keys(inventoryByCategory).length === 0 ? (
                  <div className="p-8 text-center bg-[#fdf8f9]/50 dark:bg-black/10 rounded-xl border border-[#e8d5c4]/40 dark:border-[#2d1a28]">
                    <p className="text-xs opacity-50 italic">No hay insumos registrados en el inventario.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(inventoryByCategory).map(([category, items]) => {
                      const isOpen = openCategories[category] ?? true;
                      return (
                        <div key={category} className="border border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.1)] rounded-[12px] overflow-hidden bg-[#fdf8f9]/30 dark:bg-black/20">
                          <button
                            type="button"
                            onClick={() => setOpenCategories(prev => ({ ...prev, [category]: !isOpen }))}
                            className="w-full flex items-center justify-between p-4 bg-[#fdf8f9] dark:bg-[#1a0e14] hover:bg-[rgba(139,58,82,0.05)] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold uppercase tracking-wider text-[#8B3A52] dark:text-[#F8BBD0]">{category}</span>
                              <span className="text-[10px] bg-[rgba(139,58,82,0.1)] text-[#8B3A52] dark:text-[#e8d8dc] px-2 py-0.5 rounded-full font-bold">
                                {items.length} {items.length === 1 ? 'insumo' : 'insumos'}
                              </span>
                            </div>
                            <ChevronDown size={16} className={`text-[#8B3A52] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isOpen && (
                            <div className="overflow-x-auto border-t border-[rgba(139,58,82,0.1)] dark:border-[rgba(255,255,255,0.05)]">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-[#8B3A52]/5 text-xs font-bold uppercase tracking-widest text-[#8B3A52] dark:text-[#e8c4cc] border-b border-[#e8d5c4]/40 dark:border-[#2d1a28]">
                                  <tr>
                                    <th className="p-4">Insumo</th>
                                    <th className="p-4 text-center">Unidad</th>
                                    <th className="p-4 text-right">Costo Promedio (S/.)</th>
                                    <th className="p-4 text-right">Stock Físico</th>
                                    <th className="p-4">Ubicación</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e8d5c4]/40 dark:divide-[#2d1a28]">
                                  {items.map((item, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? "bg-transparent" : "bg-[#fdf8f9]/50 dark:bg-black/10"}>
                                      <td className="p-4 font-bold text-[#40202D] dark:text-white">{item.name}</td>
                                      <td className="p-4 text-center text-xs uppercase font-medium">{item.unit}</td>
                                      <td className="p-4 text-right font-mono text-xs">S/. {Number(item.average_cost || 0).toFixed(2)}</td>
                                      <td className="p-4 text-right font-mono font-bold text-[#8B3A52] dark:text-[#F8BBD0]">{item.physical_stock}</td>
                                      <td className="p-4 text-xs opacity-75">{item.location || 'Sin Ubicación'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PRODUCTION ORDERS TAB (BOM view) */}
            {activeTab === 'production_orders' && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold tracking-wider text-[#8B3A52] uppercase">Requerimientos de Producción Activa</h2>
                <div className="space-y-4">
                  {productionOrders.map((order, idx) => {
                    // Build detailed purchase list from technical_sheet + base_items using applies_to logic
                    const purchaseList: Array<{
                      id: string; name: string; unit: string;
                      totalQuantity: number; specification: string; label: string;
                    }> = [];

                    const product = order.base_items?.[0]?.id_variant?.id_product;
                    const technicalSheet = product?.technical_sheet || [];
                    const baseItems = order.base_items || [];

                    technicalSheet.forEach((sheetItem: any) => {
                      const supply = sheetItem.id_supply;
                      if (!supply) return;
                      const supplyId = supply._id || supply;
                      const name = supply.name || 'Insumo';
                      const unit = supply.unit || 'unidades';
                      const qtyPerUnit = sheetItem.quantity ?? 1;
                      const appliesTo = sheetItem.applies_to || 'TODOS';
                      const detail = sheetItem.detail || '';

                      if (appliesTo === 'TODOS') {
                        const totalUnits = baseItems.reduce((acc: number, i: any) => acc + (i.quantity ?? 0), 0);
                        purchaseList.push({
                          id: String(supplyId), name, unit, specification: detail,
                          totalQuantity: parseFloat((qtyPerUnit * totalUnits).toFixed(3)),
                          label: `${name}${detail ? ` (${detail})` : ''}`,
                        });
                      } else if (appliesTo === 'MISMO_COLOR') {
                        const byColor: Record<string, { qty: number; colorName: string }> = {};
                        baseItems.forEach((i: any) => {
                          const colorName = i.id_variant?.color?.name || i.id_variant?.color || 'Sin color';
                          if (!byColor[colorName]) byColor[colorName] = { qty: 0, colorName };
                          byColor[colorName].qty += (i.quantity ?? 0);
                        });
                        Object.values(byColor).forEach(({ qty, colorName }) => {
                          purchaseList.push({
                            id: String(supplyId), name, unit,
                            specification: `${detail ? detail + ' · ' : ''}Color: ${colorName}`,
                            totalQuantity: parseFloat((qtyPerUnit * qty).toFixed(3)),
                            label: `${name} ${colorName}${detail ? ` (${detail})` : ''}`,
                          });
                        });
                      } else if (appliesTo === 'POR_TALLA') {
                        const bySize: Record<string, number> = {};
                        baseItems.forEach((i: any) => {
                          const size = i.id_variant?.size || 'S/T';
                          bySize[size] = (bySize[size] || 0) + (i.quantity ?? 0);
                        });
                        Object.entries(bySize).forEach(([size, qty]) => {
                          purchaseList.push({
                            id: String(supplyId), name, unit,
                            specification: `Talla: ${size}${detail ? ' · ' + detail : ''}`,
                            totalQuantity: parseFloat((qtyPerUnit * qty).toFixed(3)),
                            label: `${name} Talla ${size}`,
                          });
                        });
                      } else {
                        // specific color name
                        const matchingItems = baseItems.filter((i: any) => {
                          const colorName = i.id_variant?.color?.name || i.id_variant?.color || '';
                          return colorName.toLowerCase() === appliesTo.toLowerCase();
                        });
                        const qty = matchingItems.reduce((acc: number, i: any) => acc + (i.quantity ?? 0), 0);
                        if (qty > 0) {
                          purchaseList.push({
                            id: String(supplyId), name, unit,
                            specification: `${detail ? detail + ' · ' : ''}Color: ${appliesTo}`,
                            totalQuantity: parseFloat((qtyPerUnit * qty).toFixed(3)),
                            label: `${name} ${appliesTo}${detail ? ` (${detail})` : ''}`,
                          });
                        }
                      }
                    });

                    // Fallback to stored supplies if no technical sheet
                    const displaySupplies = purchaseList.length > 0 ? purchaseList : (order.supplies || []).map((s: any) => ({
                      ...s, label: s.name, specification: s.specification || ''
                    }));

                    return (
                    <div key={idx} className="p-4 bg-white/40 dark:bg-black/20 border border-[#e8d5c4]/30 dark:border-[#2d1a28] rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8d5c4]/20 pb-2">
                        <div>
                          <span className="text-xs font-mono font-bold text-[#8B3A52] dark:text-[#F8BBD0]">{order.order_number}</span>
                          <h3 className="text-sm font-bold mt-0.5 text-[#40202D] dark:text-white">
                            Taller: {order.id_winner_workshop?.name_company || 'Taller por confirmar'}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 uppercase tracking-wider">
                            {({'CONTACTO_INICIAL':'Contacto inicial','COMPARANDO':'Cotizando','EN_PRODUCCION':'En preparación','CONTROL_CALIDAD':'Control calidad','COMPLETADA':'Completada'} as any)[order.status] || order.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => router.push(`/storekeeper/warehouse/supplies/purchase?orderId=${order._id}`)}
                            className="px-4 py-2 text-[10px] font-bold uppercase rounded-lg shadow-sm transition-all flex items-center gap-1.5 bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white hover:opacity-90"
                          >
                            <ShoppingBag size={12} /> Ir a Comprar
                          </button>
                        </div>
                      </div>

                      {/* supplies requirement list */}
                      <div>
                        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Lista de Compras — Insumos Requeridos:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {displaySupplies.map((sup: any, sIdx: number) => {
                            const invMatch = inventory.find(inv =>
                              (String(inv.id_supply) === String(sup.id) || String(inv._id) === String(sup.id)) &&
                              (inv.specification || '') === (sup.specification || '')
                            );
                            const currentStock = invMatch ? invMatch.physical_stock : 0;
                            const hasEnough = currentStock >= sup.totalQuantity;
                            const missingQty = hasEnough ? 0 : (sup.totalQuantity - currentStock);

                            const stockPct = sup.totalQuantity > 0 ? Math.min(100, (currentStock / sup.totalQuantity) * 100) : 0;
                            return (
                              <div key={sIdx} className={`rounded-2xl border-2 overflow-hidden flex flex-col transition-all ${hasEnough ? 'border-green-200 dark:border-green-800/40 bg-white dark:bg-[#1a2a1a]' : 'border-[rgba(214,64,95,0.25)] dark:border-[rgba(214,64,95,0.2)] bg-white dark:bg-[#2e1d27]'}`}>
                                {/* color strip */}
                                <div className={`h-1 w-full ${hasEnough ? 'bg-green-400' : 'bg-gradient-to-r from-[#D6405F] to-[#F23B69]'}`} />
                                <div className="p-4 flex flex-col gap-3 flex-1">
                                  {/* name + status badge */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-bold text-[#40202D] dark:text-white leading-tight">{sup.label || sup.name}</p>
                                      {sup.specification && (
                                        <p className="text-[10px] text-[#8B3A52] dark:text-[#c4a0ae] mt-0.5 font-medium">{sup.specification}</p>
                                      )}
                                    </div>
                                    {hasEnough
                                      ? <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/40 rounded-full px-2 py-0.5 uppercase tracking-wider"><PackageCheck size={10}/> OK</span>
                                      : <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700/40 rounded-full px-2 py-0.5 uppercase tracking-wider"><AlertTriangle size={10}/> Falta</span>
                                    }
                                  </div>

                                  {/* quantities */}
                                  <div className="flex items-end justify-between text-xs">
                                    <div>
                                      <p className="text-[9px] text-[#9b8088] uppercase tracking-wider font-bold mb-0.5">Requerido</p>
                                      <p className="font-bold text-[#40202D] dark:text-white">{sup.totalQuantity} <span className="font-normal text-[#9b8088]">{sup.unit}</span></p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] text-[#9b8088] uppercase tracking-wider font-bold mb-0.5">En stock</p>
                                      <p className={`font-bold ${hasEnough ? 'text-green-600 dark:text-green-400' : 'text-rose-500'}`}>{currentStock} <span className="font-normal text-[#9b8088]">{sup.unit}</span></p>
                                    </div>
                                  </div>

                                  {/* progress bar */}
                                  <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${hasEnough ? 'bg-green-400' : 'bg-gradient-to-r from-[#D6405F] to-[#F23B69]'}`}
                                      style={{ width: `${stockPct}%` }}
                                    />
                                  </div>

                                  {!hasEnough && (
                                    <p className="text-[10px] text-rose-500 font-bold text-center">
                                      Faltan {missingQty} {sup.unit}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Botón confirmar insumos */}
                        {(() => {
                          const allReady = displaySupplies.every((sup: any) => {
                            const invMatch = inventory.find((inv: any) =>
                              (String(inv.id_supply) === String(sup.id) || String(inv._id) === String(sup.id)) &&
                              (inv.specification || '') === (sup.specification || '')
                            );
                            return (invMatch ? invMatch.physical_stock : 0) >= sup.totalQuantity;
                          });

                          if (order.insumos_confirmados) {
                            return (
                              <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/40 text-green-700 dark:text-green-300 text-xs font-medium">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                Insumos confirmados — producción puede iniciar
                              </div>
                            );
                          }

                          return (
                            <button
                              type="button"
                              disabled={!allReady}
                              onClick={async () => {
                                try {
                                  const token = await getFirebaseAuthToken();
                                  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/production-orders/${order._id}/confirm-supplies`, {
                                    method: 'PATCH',
                                    headers: { Authorization: `Bearer ${token}` },
                                  });
                                  toast.success('Insumos confirmados. La producción puede iniciar.');
                                  loadProductionOrders();
                                } catch {
                                  toast.error('Error al confirmar insumos');
                                }
                              }}
                              className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                allReady
                                  ? 'bg-[#8B3A52] hover:bg-[#a05068] text-white shadow-sm'
                                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30 cursor-not-allowed'
                              }`}
                            >
                              <CheckCircle2 size={14} />
                              {allReady ? 'Confirmar — todos los insumos están listos' : 'Faltan insumos por comprar'}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  );
                  })}
                  {productionOrders.length === 0 && (
                    <p className="text-center py-8 text-xs opacity-50 italic text-gray-400">No hay órdenes de producción activas registradas.</p>
                  )}
                </div>
              </div>
            )}



          </div>
        )}

      </div>

      {/* QUICK PURCHASE MODAL */}
      {showPurchaseModal && quickPurchaseData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a0e14] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#e8d5c4] dark:border-[#2d1a28]">
            <div className="bg-[#8B3A52] px-5 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                <Plus size={16} /> Compra Rápida de Insumo
              </h3>
              <button onClick={() => setShowPurchaseModal(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleQuickPurchaseSubmit} className="p-5 space-y-4">
              
              <div className="p-3 bg-[#fdf8f9] dark:bg-black/20 rounded-xl border border-[rgba(139,58,82,0.1)]">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Insumo a Comprar</p>
                <p className="text-sm font-bold text-[#8B3A52] dark:text-[#c4a0ae]">{quickPurchaseData.name}</p>
              </div>

              <div>
                <label className={labelClass}>Cantidad (Faltante sugerido)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className={inputClass}
                  value={quickPurchaseData.quantity}
                  onChange={(e) => setQuickPurchaseData({...quickPurchaseData, quantity: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className={labelClass}>Proveedor / Tienda</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Textil Gamarra SRL"
                  className={inputClass}
                  value={quickPurchaseData.supplier_name}
                  onChange={(e) => setQuickPurchaseData({...quickPurchaseData, supplier_name: e.target.value})}
                />
              </div>

              <div>
                <label className={labelClass}>Costo Total o Unitario (S/.)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="0.00"
                  className={inputClass}
                  value={quickPurchaseData.cost || ''}
                  onChange={(e) => setQuickPurchaseData({...quickPurchaseData, cost: Number(e.target.value)})}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowPurchaseModal(false)} className="flex-1 py-3 text-xs font-bold uppercase text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#8B3A52] hover:bg-[#a05068] text-white text-xs font-bold uppercase rounded-xl shadow-md transition-colors">
                  Confirmar Compra
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
