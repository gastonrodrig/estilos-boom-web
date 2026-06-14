"use client";

import { useMemo, useEffect } from "react";
import { 
  History,
  Calendar, 
  Eye,
  FileText,
} from "lucide-react";
import { useStorehouseStore } from "@/hooks";

// Helpers
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount || 0);

const formatDate = (date?: string | Date | null) => {
  if (!date) return "---"; // Si no hay fecha, devuelve un guion
  const d = new Date(date);
  return isNaN(d.getTime()) ? "---" : d.toLocaleDateString();
};

export default function CompletedOrdersPage() {
  const { purchaseOrders, loading } = useStorehouseStore();

  const MOCK_COMPLETED_ORDERS = [
    {
      _id: "mock-retail-complete-1",
      order_number: "OC-2026-003",
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(), // hace 2 días
      delivery_date_actual: new Date(Date.now() - 86400000 * 2).toISOString(),
      id_supplier: { name_company: "Textiles del Sur S.A." },
      items: [{}, {}, {}], // 3 items
      total_amount: 12500,
      quality_rating: 4.5
    },
    {
      _id: "mock-retail-complete-2",
      order_number: "OC-2026-004",
      updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      delivery_date_actual: new Date(Date.now() - 86400000 * 5).toISOString(),
      id_supplier: { name_company: "Confecciones Moda SAC" },
      items: [{}, {}], // 2 items
      total_amount: 8300,
      quality_rating: 5
    }
  ];

  // Filtramos por estado COMPLETADA
  const completedOCs = useMemo(() => {
    if (!purchaseOrders) return MOCK_COMPLETED_ORDERS;
    
    const fromApi = purchaseOrders
      .filter((oc) => (oc.status as string) === 'COMPLETADA') // Solo traerá las que digan COMPLETADA
      .sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      });
      
    return fromApi.length > 0 ? fromApi : MOCK_COMPLETED_ORDERS;
  }, [purchaseOrders]);

  const totalInvestment = useMemo(() => 
    completedOCs.reduce((acc, oc) => acc + (oc.total_amount || 0), 0)
  , [completedOCs]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#D6405F] dark:text-[#F8BBD0]">
            <History className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Almacén</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#40202D] dark:text-white tracking-wide mt-2">Órdenes Finalizadas</h1>
          <p className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-300 mt-1">Historial de mercadería ingresada al inventario.</p>
        </div>

        <div className="flex gap-4">
          <div className="rounded-2xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 p-5 shadow-inner backdrop-blur-md min-w-[200px]">
            <p className="text-[10px] font-black text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">Inversión Total</p>
            <p className="text-2xl font-black text-[#D6405F] dark:text-[#F8BBD0] mt-1">{formatCurrency(totalInvestment)}</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#40202D] to-[#594246] dark:from-white/10 dark:to-white/5 border border-[#EAE0E2]/20 dark:border-white/10 p-5 shadow-inner min-w-[160px]">
            <p className="text-[10px] font-black text-white/60 dark:text-gray-400 uppercase tracking-widest">Órdenes</p>
            <p className="text-2xl font-black text-white mt-1">{completedOCs.length} OCs</p>
          </div>
        </div>
      </header>

      {/* Tabla */}
      <main className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-white/70 backdrop-blur-2xl dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-[2rem] overflow-hidden transition-[background-color,border-color] duration-[600ms]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="relative transition-[background-color,border-color] duration-[600ms]">
              <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Código OC</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Proveedor</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Fecha Llegada</th>
                <th className="px-6 py-5 text-center border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Items</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Inversión</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Calidad</th>
                <th className="px-6 py-5 text-right border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE0E2]/50 dark:divide-white/5 text-[13px]">
              {completedOCs.map((oc, idx) => {
                // ✅ CORRECCIÓN SEGÚN LOG: id_supplier y name_company
                const supplierName = oc.id_supplier?.name_company || "Proveedor Desconocido";

                return (
                  <tr key={oc._id} className={`transition-colors group/row ${idx % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                    <td className="px-6 py-5 font-black text-[#40202D] dark:text-white">
                      {oc.order_number}
                    </td>
                    <td className="px-6 py-5">
                        <p className="font-bold text-[#40202D] dark:text-white">
                            {supplierName}
                        </p>
                        <p className="text-[11px] font-medium text-[#8C6B79] dark:text-gray-400">Mantenimiento</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[#40202D] dark:text-white font-medium">
                        <Calendar className="h-4 w-4 text-[#D6405F] dark:text-[#F8BBD0]" />
                        {/* Si delivery_date_actual es undefined, usamos updated_at */}
                        {formatDate(oc.delivery_date_actual || oc.updated_at)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex rounded-full bg-white/50 dark:bg-white/10 border border-[#EAE0E2] dark:border-white/10 px-3 py-1.5 text-[11px] font-black tracking-widest text-[#D6405F] dark:text-[#F8BBD0] shadow-sm">
                        {oc.items?.length || 0} SKU
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black text-[#40202D] dark:text-white">
                      {formatCurrency(oc.total_amount)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {/* Manejo de calidad si viene undefined */}
                        <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${oc.quality_rating || 0 >= 4 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="font-black text-[#40202D] dark:text-white">{oc.quality_rating || 'N/A'}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      {/* Botón para ver el detalle de la OC (el que ya tenías) */}
                      <button 
                        title="Ver Detalle"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] dark:text-gray-400 hover:bg-[#40202D] dark:hover:bg-white/10 hover:text-white transition-all shadow-sm"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* ✅ NUEVO: Botón para ver Factura */}
                      <button 
                        // 🔗 Vinculamos con la ruta dinámica que creamos
                        onClick={() => window.open(`/admin/storehouse/invoice/${oc._id}`, '_blank')}
                        
                        title="Ver Factura / Comprobante"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#EAE0E2] dark:border-white/10 text-[#D6405F] dark:text-[#F8BBD0] hover:bg-[#D6405F] dark:hover:bg-[#F8BBD0] hover:text-white dark:hover:text-black transition-all shadow-sm"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  </tr>
                );
              })}

              {completedOCs.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <p className="text-[14px] font-bold text-[#8C6B79] dark:text-gray-400">No hay órdenes en estado <b>COMPLETADA</b>.</p>
                    <p className="text-[12px] font-medium text-[#8C6B79] dark:text-gray-500 mt-2">Actualmente hay {purchaseOrders.length} órdenes pero están en otros estados (ej. PENDIENTE).</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}