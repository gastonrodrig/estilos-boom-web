'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShoppingBag, MapPin, Store, Package, CheckCircle2, Calculator, TrendingUp, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFirebaseAuthToken } from '@helpers';
import { useSupplyWarehouseStore } from '@/hooks';

interface SupplyRow {
  id: string;
  label: string;
  unit: string;
  neededQty: number;
  specification: string;
  // filled by user
  storeName: string;
  unitPrice: string;
}

function PurchaseListForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { recordPurchase, loadInventory, productionOrders, loadProductionOrders } = useSupplyWarehouseStore();

  const orderId = params.get('orderId') || '';
  const [rows, setRows] = useState<SupplyRow[]>([]);
  const [globalStore, setGlobalStore] = useState('');
  const [globalAddress, setGlobalAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [marginPct, setMarginPct] = useState('30');

  const order = useMemo(() => productionOrders.find((o: any) => o._id === orderId), [productionOrders, orderId]);

  // Build supply rows from order's technical_sheet + base_items
  useEffect(() => {
    if (!order) return;
    const baseItems = order.base_items || [];
    const technicalSheet = order.base_items?.[0]?.id_variant?.id_product?.technical_sheet || [];

    const built: SupplyRow[] = [];
    technicalSheet.forEach((sheetItem: any) => {
      const supply = sheetItem.id_supply;
      if (!supply) return;
      const supplyId = String(supply._id || supply);
      const name = supply.name || 'Insumo';
      const unit = supply.unit || 'unidades';
      const qtyPerUnit = sheetItem.quantity ?? 1;
      const appliesTo = sheetItem.applies_to || 'TODOS';
      const detail = sheetItem.detail || '';

      const push = (label: string, spec: string, qty: number) =>
        built.push({ id: supplyId, label, unit, neededQty: qty, specification: spec, storeName: '', unitPrice: '' });

      if (appliesTo === 'TODOS') {
        const total = baseItems.reduce((acc: number, i: any) => acc + (i.quantity ?? 0), 0);
        push(`${name}${detail ? ` (${detail})` : ''}`, detail, parseFloat((qtyPerUnit * total).toFixed(3)));
      } else if (appliesTo === 'MISMO_COLOR') {
        const byColor: Record<string, { qty: number }> = {};
        baseItems.forEach((i: any) => {
          const c = i.id_variant?.color?.name || i.id_variant?.color || 'Sin color';
          if (!byColor[c]) byColor[c] = { qty: 0 };
          byColor[c].qty += (i.quantity ?? 0);
        });
        Object.entries(byColor).forEach(([color, { qty }]) => {
          push(`${name} ${color}`, `${detail ? detail + ' · ' : ''}Color: ${color}`, parseFloat((qtyPerUnit * qty).toFixed(3)));
        });
      } else if (appliesTo === 'POR_TALLA') {
        const bySize: Record<string, number> = {};
        baseItems.forEach((i: any) => {
          const s = i.id_variant?.size || 'S/T';
          bySize[s] = (bySize[s] || 0) + (i.quantity ?? 0);
        });
        Object.entries(bySize).forEach(([size, qty]) => {
          push(`${name} Talla ${size}`, `Talla: ${size}${detail ? ' · ' + detail : ''}`, parseFloat((qtyPerUnit * qty).toFixed(3)));
        });
      }
    });
    setRows(built);
  }, [order]);

  useEffect(() => { if (!productionOrders.length) loadProductionOrders(); }, []);

  const totalUnits = useMemo(() => (order?.base_items || []).reduce((acc: number, i: any) => acc + (i.quantity ?? 0), 0), [order]);

  const laborCostPerUnit = useMemo(() => {
    const totalLabor = order?.total_amount || 0;
    return totalUnits > 0 ? totalLabor / totalUnits : 0;
  }, [order, totalUnits]);

  const totalMaterials = useMemo(() =>
    rows.reduce((acc, r) => acc + (r.neededQty * (parseFloat(r.unitPrice) || 0)), 0), [rows]);

  const totalMaterialsPerUnit = totalUnits > 0 ? totalMaterials / totalUnits : 0;
  const totalCostPerUnit = totalMaterialsPerUnit + laborCostPerUnit;
  const margin = parseFloat(marginPct) / 100 || 0.3;
  const suggestedPrice = totalCostPerUnit * (1 + margin);

  const updateRow = (idx: number, field: keyof SupplyRow, val: string) =>
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));

  const applyGlobalStore = () => {
    if (!globalStore.trim()) return;
    setRows(prev => prev.map(r => ({ ...r, storeName: globalStore })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = rows.find(r => !r.storeName.trim() || !r.unitPrice || parseFloat(r.unitPrice) <= 0);
    if (missing) return toast.error(`Completá tienda y precio para: ${missing.label}`);

    setSubmitting(true);
    try {
      const token = await getFirebaseAuthToken();
      for (const row of rows) {
        await recordPurchase({
          supplier_name: row.storeName.trim(),
          notes: globalAddress.trim() ? `Dirección: ${globalAddress}` : 'Compra desde lista de producción',
          items: [{ id_supply: row.id, quantity: row.neededQty, cost: parseFloat(row.unitPrice), specifications: row.specification }],
        });
      }
      await loadInventory();
      setDone(true);
      toast.success('Todas las compras registradas');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white dark:bg-[#0f0810] border-2 border-[rgba(139,58,82,0.12)] dark:border-white/10 rounded-xl outline-none focus:border-[#D6405F] transition-all px-3 py-2.5 text-sm text-[#2d1f25] dark:text-[#e8d8dc] placeholder-[#c4a0ae]/60";

  if (!order && productionOrders.length > 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-400">Orden no encontrada.</p>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
        <CheckCircle2 size={32} className="text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-[#40202D] dark:text-white">¡Compras registradas!</h2>
      <p className="text-sm text-gray-400 text-center">El inventario fue actualizado con todos los insumos.</p>
      <button onClick={() => router.back()} className="mt-2 px-8 py-3 bg-[#8B3A52] text-white rounded-xl font-bold text-sm">
        Volver
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf8f9] dark:bg-[#0f0810]">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#8B3A52] dark:text-[#c4a0ae] text-sm font-medium mb-6 hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} /> Volver a requerimientos
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#8B3A52] to-[#D6405F] rounded-2xl p-6 mb-6 text-white shadow-lg shadow-rose-200/40 dark:shadow-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/15 rounded-xl"><ShoppingBag size={20} /></div>
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Lista de Compras</p>
              <h1 className="text-lg font-bold">{order?.base_items?.[0]?.id_variant?.id_product?.name || 'Producto'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/70 text-xs mt-1">
            <span>Orden: <strong className="text-white">{order?.order_number}</strong></span>
            <span>Taller: <strong className="text-white">{order?.id_winner_workshop?.name_company || '—'}</strong></span>
            <span>Total: <strong className="text-white">{totalUnits} prendas</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Tienda global */}
          <div className="bg-white dark:bg-[#2e1d27] rounded-2xl border border-[rgba(139,58,82,0.08)] dark:border-white/10 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B3A52] mb-4">Proveedor / Tienda</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[#9b8088] uppercase tracking-wider font-bold block mb-1.5">Nombre de tienda</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4a0ae]" />
                    <input type="text" placeholder="Ej: Textil Gamarra SRL" className={inputClass + " pl-9"} value={globalStore} onChange={e => setGlobalStore(e.target.value)} />
                  </div>
                  <button type="button" onClick={applyGlobalStore} className="px-3 py-2.5 bg-[#8B3A52]/10 hover:bg-[#8B3A52]/20 text-[#8B3A52] dark:text-[#c4a0ae] text-xs font-bold rounded-xl transition-colors whitespace-nowrap">
                    Aplicar a todos
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[#9b8088] uppercase tracking-wider font-bold block mb-1.5">Dirección / Local <span className="text-[#c4a0ae] normal-case font-normal">(opcional)</span></label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4a0ae]" />
                  <input type="text" placeholder="Ej: Galería El Rey, Stand 245" className={inputClass + " pl-9"} value={globalAddress} onChange={e => setGlobalAddress(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Supply rows */}
          <div className="bg-white dark:bg-[#2e1d27] rounded-2xl border border-[rgba(139,58,82,0.08)] dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[rgba(139,58,82,0.08)] dark:border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B3A52]">Insumos a Comprar</h3>
            </div>

            <div className="divide-y divide-[rgba(139,58,82,0.06)] dark:divide-white/5">
              {rows.map((row, idx) => {
                const subtotal = row.neededQty * (parseFloat(row.unitPrice) || 0);
                return (
                  <div key={idx} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-[#40202D] dark:text-white">{row.label}</p>
                        {row.specification && <p className="text-[10px] text-[#8B3A52] dark:text-[#c4a0ae] mt-0.5">{row.specification}</p>}
                        <p className="text-[10px] text-[#9b8088] mt-1">Cantidad: <strong>{row.neededQty} {row.unit}</strong></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-[#9b8088] uppercase tracking-wider font-bold mb-0.5">Subtotal</p>
                        <p className={`text-lg font-bold ${subtotal > 0 ? 'text-[#D6405F]' : 'text-[#cbb8bf] dark:text-white/20'}`}>
                          S/ {subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-[#9b8088] uppercase tracking-wider font-bold block mb-1.5">Tienda</label>
                        <div className="relative">
                          <Store size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4a0ae]" />
                          <input type="text" required placeholder="Tienda" className={inputClass + " pl-9 text-xs"} value={row.storeName} onChange={e => updateRow(idx, 'storeName', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#9b8088] uppercase tracking-wider font-bold block mb-1.5">Precio unitario (S/ por {row.unit})</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D6405F] font-bold text-xs">S/</span>
                          <input type="number" min="0.01" step="0.01" required placeholder="0.00" className={inputClass + " pl-9 text-xs"} value={row.unitPrice} onChange={e => updateRow(idx, 'unitPrice', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total materiales */}
            <div className="p-5 bg-[#fdf8f9] dark:bg-black/20 border-t border-[rgba(139,58,82,0.08)] dark:border-white/10 flex justify-between items-center">
              <p className="text-xs font-bold uppercase tracking-wider text-[#9b8088]">Total materiales</p>
              <p className="text-xl font-bold text-[#40202D] dark:text-white">S/ {totalMaterials.toFixed(2)}</p>
            </div>
          </div>

          {/* Calculadora de precio */}
          <div className="bg-white dark:bg-[#2e1d27] rounded-2xl border border-[rgba(139,58,82,0.08)] dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[rgba(139,58,82,0.08)] dark:border-white/10 flex items-center gap-2">
              <Calculator size={16} className="text-[#8B3A52]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B3A52]">Calculadora de Precio Unitario</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#9b8088]">Materiales por prenda</span>
                <span className="font-bold text-[#40202D] dark:text-white">S/ {totalMaterialsPerUnit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1.5">
                  <Scissors size={13} className="text-[#8B3A52]" />
                  <span className="text-[#9b8088]">Mano de obra por prenda</span>
                </div>
                <span className="font-bold text-[#40202D] dark:text-white">S/ {laborCostPerUnit.toFixed(2)}</span>
              </div>
              <div className="h-px bg-[rgba(139,58,82,0.08)] dark:bg-white/10" />
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-[#40202D] dark:text-white">Costo total por prenda</span>
                <span className="font-bold text-[#D6405F] text-base">S/ {totalCostPerUnit.toFixed(2)}</span>
              </div>

              {/* Margen */}
              <div className="flex items-center gap-3 bg-[#fdf8f9] dark:bg-black/20 rounded-xl p-3 mt-2">
                <TrendingUp size={15} className="text-[#8B3A52] shrink-0" />
                <span className="text-xs text-[#9b8088] font-medium">Margen de ganancia</span>
                <div className="flex items-center gap-1 ml-auto">
                  <input type="number" min="0" max="200" step="5" value={marginPct} onChange={e => setMarginPct(e.target.value)}
                    className="w-16 text-center text-sm font-bold bg-white dark:bg-[#1a0e14] border-2 border-[rgba(139,58,82,0.2)] rounded-lg px-2 py-1 outline-none focus:border-[#D6405F]" />
                  <span className="text-sm font-bold text-[#8B3A52]">%</span>
                </div>
              </div>

              {/* Precio sugerido */}
              <div className={`rounded-xl p-4 text-center transition-all ${totalCostPerUnit > 0 ? 'bg-gradient-to-br from-[#8B3A52] to-[#D6405F]' : 'bg-[#fdf8f9] dark:bg-black/20 border border-[rgba(139,58,82,0.08)]'}`}>
                <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${totalCostPerUnit > 0 ? 'text-white/70' : 'text-[#9b8088]'}`}>Precio de venta sugerido</p>
                <p className={`text-3xl font-bold ${totalCostPerUnit > 0 ? 'text-white' : 'text-[#cbb8bf] dark:text-white/20'}`}>
                  S/ {suggestedPrice.toFixed(2)}
                </p>
                {totalCostPerUnit > 0 && (
                  <p className="text-white/60 text-[11px] mt-1">
                    Ganancia por prenda: S/ {(suggestedPrice - totalCostPerUnit).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting || rows.length === 0}
            className="w-full py-4 text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#D6405F] to-[#F23B69] rounded-2xl shadow-lg shadow-rose-200/40 dark:shadow-none hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
            <CheckCircle2 size={18} />
            {submitting ? 'Registrando compras...' : `Confirmar ${rows.length} compras`}
          </button>

        </form>
      </div>
    </div>
  );
}

export default function PurchasePage() {
  return <Suspense><PurchaseListForm /></Suspense>;
}
