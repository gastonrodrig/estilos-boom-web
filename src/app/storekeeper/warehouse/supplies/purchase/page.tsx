'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShoppingBag, CheckCircle2, Calculator, TrendingUp, Scissors, Camera, X, Plus, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSupplyWarehouseStore } from '@/hooks';

interface StoreEntry {
  id: string;
  name: string;
  address: string;
  evidenceFile: File | null;
  evidencePreview: string | null;
}

interface SupplyRow {
  id: string;
  label: string;
  unit: string;
  neededQty: number;
  specification: string;
  unitPrice: string;
  storeId: string;
}

function uid() { return Math.random().toString(36).slice(2); }

function PurchaseListForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { recordPurchase, loadInventory, loadTransactions, inventory, transactions, productionOrders, loadProductionOrders } = useSupplyWarehouseStore();

  const orderId = params.get('orderId') || '';
  const [rows, setRows] = useState<SupplyRow[]>([]);
  const [stockedCostTotal, setStockedCostTotal] = useState(0);

  const [stores, setStores] = useState<StoreEntry[]>([
    { id: 'main', name: '', address: '', evidenceFile: null, evidencePreview: null },
  ]);

  const [marginPct, setMarginPct] = useState('30');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const order = useMemo(() => productionOrders.find((o: any) => o._id === orderId), [productionOrders, orderId]);

  useEffect(() => {
    if (!productionOrders.length) loadProductionOrders();
    loadInventory();
    loadTransactions();
  }, []);

  useEffect(() => {
    if (!order) return;
    const baseItems = order.base_items || [];
    const technicalSheet = order.base_items?.[0]?.id_variant?.id_product?.technical_sheet || [];
    const built: SupplyRow[] = [];
    let stockedCost = 0;

    // Helper: último precio de compra para un insumo
    const lastPrice = (supplyId: string): string => {
      const purchases = transactions
        .filter((tx: any) => tx.type === 'PURCHASE')
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      for (const tx of purchases) {
        const item = (tx.items || []).find((i: any) => String(i.id_supply?._id || i.id_supply) === supplyId);
        if (item?.cost > 0) return String(item.cost);
      }
      return '';
    };

    const invFor = (supplyId: string, spec: string) =>
      inventory.find((s: any) =>
        (String(s.id_supply) === supplyId || String(s._id) === supplyId) &&
        (s.specification || '') === (spec || '')
      );

    const push = (supplyId: string, label: string, unit: string, spec: string, neededQty: number) => {
      const inv = invFor(supplyId, spec);
      const stock = inv?.physical_stock ?? 0;
      const avgCost = inv?.average_cost ?? 0;
      const missing = neededQty - stock;
      if (missing <= 0) {
        // ya en stock: acumular costo usando costo promedio del inventario
        stockedCost += neededQty * avgCost;
        return;
      }
      // parcialmente en stock: acumular la parte cubierta
      if (stock > 0) stockedCost += stock * avgCost;
      built.push({ id: supplyId, label, unit, neededQty: parseFloat(missing.toFixed(3)), specification: spec, unitPrice: lastPrice(supplyId), storeId: 'main' });
    };

    technicalSheet.forEach((sheetItem: any) => {
      const supply = sheetItem.id_supply;
      if (!supply) return;
      const supplyId = String(supply._id || supply);
      const name = supply.name || 'Insumo';
      const unit = supply.unit || 'unidades';
      const qtyPerUnit = sheetItem.quantity ?? 1;
      const appliesTo = sheetItem.applies_to || 'TODOS';
      const detail = sheetItem.detail || '';

      if (appliesTo === 'TODOS') {
        const total = baseItems.reduce((acc: number, i: any) => acc + (i.quantity ?? 0), 0);
        push(supplyId, `${name}${detail ? ` (${detail})` : ''}`, unit, detail, qtyPerUnit * total);
      } else if (appliesTo === 'MISMO_COLOR') {
        const byColor: Record<string, number> = {};
        baseItems.forEach((i: any) => {
          const c = i.id_variant?.color?.name || i.id_variant?.color || 'Sin color';
          byColor[c] = (byColor[c] || 0) + (i.quantity ?? 0);
        });
        Object.entries(byColor).forEach(([color, qty]) =>
          push(supplyId, `${name} ${color}`, unit, `${detail ? detail + ' · ' : ''}Color: ${color}`, qtyPerUnit * qty));
      } else if (appliesTo === 'POR_TALLA') {
        const bySize: Record<string, number> = {};
        baseItems.forEach((i: any) => { const s = i.id_variant?.size || 'S/T'; bySize[s] = (bySize[s] || 0) + (i.quantity ?? 0); });
        Object.entries(bySize).forEach(([size, qty]) =>
          push(supplyId, `${name} Talla ${size}`, unit, `Talla: ${size}${detail ? ' · ' + detail : ''}`, qtyPerUnit * qty));
      }
    });
    setRows(built);
    setStockedCostTotal(stockedCost);
  }, [order, inventory, transactions]);

  const totalUnits = useMemo(() => (order?.base_items || []).reduce((acc: number, i: any) => acc + (i.quantity ?? 0), 0), [order]);
  const laborCostPerUnit = useMemo(() => { const t = order?.total_amount || 0; return totalUnits > 0 ? t / totalUnits : 0; }, [order, totalUnits]);
  const totalMaterials = useMemo(
    () => rows.reduce((acc, r) => acc + (r.neededQty * (parseFloat(r.unitPrice) || 0)), 0) + stockedCostTotal,
    [rows, stockedCostTotal]
  );
  const totalMaterialsPerUnit = totalUnits > 0 ? totalMaterials / totalUnits : 0;
  const totalCostPerUnit = totalMaterialsPerUnit + laborCostPerUnit;
  const margin = parseFloat(marginPct) / 100 || 0.3;
  const suggestedPrice = totalCostPerUnit * (1 + margin);

  const updateRow = (idx: number, patch: Partial<SupplyRow>) =>
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));

  const updateStore = (id: string, patch: Partial<StoreEntry>) =>
    setStores(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  const setEvidenceForStore = (id: string, file: File | null) => {
    if (!file) return updateStore(id, { evidenceFile: null, evidencePreview: null });
    const reader = new FileReader();
    reader.onload = ev => updateStore(id, { evidenceFile: file, evidencePreview: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const addStore = () => setStores(prev => [...prev, { id: uid(), name: '', address: '', evidenceFile: null, evidencePreview: null }]);

  const removeStore = (id: string) => {
    setStores(prev => prev.filter(s => s.id !== id));
    setRows(prev => prev.map(r => r.storeId === id ? { ...r, storeId: 'main' } : r));
  };

  const storeColors = ['#8B3A52', '#3A6B8B', '#3A8B5A', '#8B6B3A', '#6B3A8B'];
  const storeColor = (id: string) => storeColors[stores.findIndex(s => s.id === id) % storeColors.length];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stores[0].name.trim()) return toast.error('Ingresá el nombre de la tienda principal');
    const usedStoreIds = [...new Set(rows.map(r => r.storeId))];
    for (const sid of usedStoreIds) {
      const s = stores.find(st => st.id === sid);
      if (!s?.name.trim()) return toast.error('Completá el nombre de todas las tiendas usadas');
    }
    const missing = rows.find(r => !r.unitPrice || parseFloat(r.unitPrice) <= 0);
    if (missing) return toast.error(`Falta el precio de: ${missing.label}`);

    setSubmitting(true);
    try {
      let allOk = true;
      for (const store of stores) {
        const storeRows = rows.filter(r => r.storeId === store.id);
        if (!storeRows.length) continue;
        const ok = await recordPurchase({
          supplier_name: store.name.trim(),
          notes: store.address.trim() ? `Dirección: ${store.address}` : undefined,
          evidence_files: store.evidenceFile ? [store.evidenceFile] : [],
          items: storeRows.map(r => ({ id_supply: r.id, quantity: r.neededQty, cost: parseFloat(r.unitPrice), specifications: r.specification })),
        });
        if (!ok) { allOk = false; break; }
      }
      if (allOk) {
        await loadInventory();
        setDone(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white dark:bg-[#0f0810] border-2 border-[rgba(139,58,82,0.12)] dark:border-white/10 rounded-xl outline-none focus:border-[#D6405F] transition-all px-3 py-2.5 text-sm text-[#2d1f25] dark:text-[#e8d8dc] placeholder-[#c4a0ae]/60";
  const multiStore = stores.length > 1;

  if (done) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
        <CheckCircle2 size={32} className="text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-[#40202D] dark:text-white">¡Compras registradas!</h2>
      <p className="text-sm text-gray-400 text-center">El inventario fue actualizado.</p>
      <button onClick={() => router.back()} className="mt-2 px-8 py-3 bg-[#8B3A52] text-white rounded-xl font-bold text-sm">Volver</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf8f9] dark:bg-[#0f0810]">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#8B3A52] dark:text-[#c4a0ae] text-sm font-medium mb-6 hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="bg-gradient-to-br from-[#8B3A52] to-[#D6405F] rounded-2xl p-6 mb-6 text-white shadow-lg shadow-rose-200/40 dark:shadow-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/15 rounded-xl"><ShoppingBag size={20} /></div>
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Lista de Compras</p>
              <h1 className="text-lg font-bold">{order?.base_items?.[0]?.id_variant?.id_product?.name || 'Producto'}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-white/70 text-xs mt-1">
            <span>Orden: <strong className="text-white">{order?.order_number}</strong></span>
            <span>Total: <strong className="text-white">{totalUnits} prendas</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── TIENDAS ── */}
          <div className="space-y-3">
            {stores.map((store, storeIdx) => (
              <div key={store.id} className="bg-white dark:bg-[#2e1d27] rounded-2xl border border-[rgba(139,58,82,0.08)] dark:border-white/10 shadow-sm overflow-hidden"
                style={{ borderLeftWidth: 4, borderLeftColor: storeColor(store.id) }}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(139,58,82,0.06)]">
                  <div className="flex items-center gap-2">
                    <Store size={14} style={{ color: storeColor(store.id) }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: storeColor(store.id) }}>
                      {storeIdx === 0 ? 'Tienda principal' : `Tienda ${storeIdx + 1}`}
                    </span>
                    <span className="text-[10px] text-[#c4a0ae]">· {rows.filter(r => r.storeId === store.id).length} insumos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {multiStore && (
                      <button type="button"
                        onClick={() => setRows(prev => prev.map(r => ({ ...r, storeId: store.id })))}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:opacity-70"
                        style={{ borderColor: storeColor(store.id), color: storeColor(store.id) }}>
                        Asignar todos
                      </button>
                    )}
                    {storeIdx > 0 && (
                      <button type="button" onClick={() => removeStore(store.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#c4a0ae] hover:text-rose-500 hover:bg-rose-50 transition-colors">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-[#9b8088] uppercase tracking-wider font-bold block mb-1.5">Nombre *</label>
                      <input required type="text" placeholder="Ej: Textil Gamarra SRL" className={inputClass}
                        value={store.name} onChange={e => updateStore(store.id, { name: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#9b8088] uppercase tracking-wider font-bold block mb-1.5">Local / Stand <span className="text-[#c4a0ae] normal-case font-normal">(opcional)</span></label>
                      <input type="text" placeholder="Ej: Galería El Rey, Stand 245" className={inputClass}
                        value={store.address} onChange={e => updateStore(store.id, { address: e.target.value })} />
                    </div>
                  </div>

                  {store.evidencePreview ? (
                    <div className="relative inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={store.evidencePreview} alt="Boleta" className="h-28 rounded-xl object-cover border-2 border-[rgba(139,58,82,0.12)]" />
                      <button type="button" onClick={() => setEvidenceForStore(store.id, null)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 px-4 py-2.5 border-2 border-dashed border-[rgba(139,58,82,0.15)] hover:border-[#D6405F]/50 rounded-xl cursor-pointer transition-colors w-fit">
                      <Camera size={15} className="text-[#c4a0ae]" />
                      <span className="text-xs text-[#9b8088]">Boleta o yape <span className="text-[#c4a0ae]">(opcional)</span></span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => setEvidenceForStore(store.id, e.target.files?.[0] || null)} />
                    </label>
                  )}
                </div>
              </div>
            ))}

            <button type="button" onClick={addStore}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[rgba(139,58,82,0.2)] hover:border-[#D6405F]/60 rounded-2xl text-sm text-[#9b8088] hover:text-[#8B3A52] transition-colors font-medium">
              <Plus size={15} /> Agregar otra tienda
            </button>
          </div>

          {/* ── INSUMOS ── */}
          <div className="bg-white dark:bg-[#2e1d27] rounded-2xl border border-[rgba(139,58,82,0.08)] dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[rgba(139,58,82,0.06)]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B3A52]">Insumos a Comprar</h3>
              {multiStore && <p className="text-[11px] text-[#9b8088] mt-1">Asigná cada insumo a la tienda donde lo compraste</p>}
            </div>

            <div className="divide-y divide-[rgba(139,58,82,0.06)] dark:divide-white/5">
              {rows.map((row, idx) => {
                const subtotal = row.neededQty * (parseFloat(row.unitPrice) || 0);
                return (
                  <div key={idx} className="p-5 space-y-3">
                    {/* Color strip indicator when multi-store */}
                    {multiStore && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: storeColor(row.storeId) }} />
                        <span className="text-[10px] font-semibold" style={{ color: storeColor(row.storeId) }}>
                          {stores.find(s => s.id === row.storeId)?.name || 'Tienda principal'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-[#40202D] dark:text-white">{row.label}</p>
                        {row.specification && <p className="text-[10px] text-[#8B3A52] dark:text-[#c4a0ae] mt-0.5">{row.specification}</p>}
                        <p className="text-[10px] text-[#9b8088] mt-1">Cantidad: <strong>{row.neededQty} {row.unit}</strong></p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] text-[#9b8088] uppercase tracking-wider font-bold mb-0.5">Subtotal</p>
                        <p className={`text-base font-bold ${subtotal > 0 ? 'text-[#D6405F]' : 'text-[#cbb8bf] dark:text-white/20'}`}>S/ {subtotal.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="text-[10px] text-[#9b8088] uppercase tracking-wider font-bold block mb-1.5">Precio por {row.unit}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D6405F] font-bold text-sm">S/</span>
                          <input type="number" min="0.01" step="0.01" required placeholder="0.00"
                            className={inputClass + " pl-9"}
                            value={row.unitPrice} onChange={e => updateRow(idx, { unitPrice: e.target.value })} />
                        </div>
                      </div>

                      {/* Selector de tienda — solo si hay más de una */}
                      {multiStore && (
                        <div className="shrink-0">
                          <label className="text-[10px] text-[#9b8088] uppercase tracking-wider font-bold block mb-1.5">Tienda</label>
                          <div className="flex gap-1.5">
                            {stores.map((s, si) => (
                              <button key={s.id} type="button"
                                onClick={() => updateRow(idx, { storeId: s.id })}
                                title={s.name || `Tienda ${si + 1}`}
                                className="w-9 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all border-2"
                                style={{
                                  backgroundColor: row.storeId === s.id ? storeColor(s.id) : 'transparent',
                                  borderColor: storeColor(s.id),
                                  color: row.storeId === s.id ? '#fff' : storeColor(s.id),
                                }}>
                                {si + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 bg-[#fdf8f9] dark:bg-black/20 border-t border-[rgba(139,58,82,0.06)] flex justify-between items-center">
              <p className="text-xs font-bold uppercase tracking-wider text-[#9b8088]">Total materiales</p>
              <p className="text-xl font-bold text-[#40202D] dark:text-white">S/ {totalMaterials.toFixed(2)}</p>
            </div>
          </div>

          {/* ── CALCULADORA ── */}
          <div className="bg-white dark:bg-[#2e1d27] rounded-2xl border border-[rgba(139,58,82,0.08)] dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[rgba(139,58,82,0.06)] flex items-center gap-2">
              <Calculator size={16} className="text-[#8B3A52]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B3A52]">Calculadora de Precio</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088]">Materiales por prenda</span>
                <span className="font-bold text-[#40202D] dark:text-white">S/ {totalMaterialsPerUnit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-[#9b8088]"><Scissors size={13} className="text-[#8B3A52]" /> Mano de obra por prenda</span>
                <span className="font-bold text-[#40202D] dark:text-white">S/ {laborCostPerUnit.toFixed(2)}</span>
              </div>
              <div className="h-px bg-[rgba(139,58,82,0.08)]" />
              <div className="flex justify-between text-sm">
                <span className="font-bold text-[#40202D] dark:text-white">Costo total por prenda</span>
                <span className="font-bold text-[#D6405F] text-base">S/ {totalCostPerUnit.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3 bg-[#fdf8f9] dark:bg-black/20 rounded-xl p-3">
                <TrendingUp size={15} className="text-[#8B3A52] shrink-0" />
                <span className="text-xs text-[#9b8088] font-medium flex-1">Margen de ganancia</span>
                <div className="flex items-center gap-1">
                  <input type="number" min="0" max="200" step="5" value={marginPct} onChange={e => setMarginPct(e.target.value)}
                    className="w-14 text-center text-sm font-bold bg-white dark:bg-[#1a0e14] border-2 border-[rgba(139,58,82,0.2)] rounded-lg px-2 py-1 outline-none focus:border-[#D6405F]" />
                  <span className="text-sm font-bold text-[#8B3A52]">%</span>
                </div>
              </div>
              <div className={`rounded-xl p-4 text-center ${totalCostPerUnit > 0 ? 'bg-gradient-to-br from-[#8B3A52] to-[#D6405F]' : 'bg-[#fdf8f9] dark:bg-black/20 border border-[rgba(139,58,82,0.08)]'}`}>
                <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${totalCostPerUnit > 0 ? 'text-white/70' : 'text-[#9b8088]'}`}>Precio de venta sugerido</p>
                <p className={`text-3xl font-bold ${totalCostPerUnit > 0 ? 'text-white' : 'text-[#cbb8bf] dark:text-white/20'}`}>S/ {suggestedPrice.toFixed(2)}</p>
                {totalCostPerUnit > 0 && <p className="text-white/60 text-[11px] mt-1">Ganancia por prenda: S/ {(suggestedPrice - totalCostPerUnit).toFixed(2)}</p>}
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting || rows.length === 0}
            className="w-full py-4 text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#D6405F] to-[#F23B69] rounded-2xl shadow-lg shadow-rose-200/40 dark:shadow-none hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
            <CheckCircle2 size={18} />
            {submitting ? 'Registrando...' : `Confirmar · ${stores.filter(s => rows.some(r => r.storeId === s.id)).length} ${stores.filter(s => rows.some(r => r.storeId === s.id)).length === 1 ? 'tienda' : 'tiendas'}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PurchasePage() {
  return <Suspense><PurchaseListForm /></Suspense>;
}
