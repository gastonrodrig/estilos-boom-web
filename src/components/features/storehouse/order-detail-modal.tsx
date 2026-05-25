import { Modal } from "@/components/atoms";
import { useEffect } from "react";

  export function OrderDetailsModal({ isOpen, onClose, opp }: any) {
  const oc = opp.id_purchase_order; // Datos de la Orden de Compra (si existe)
  const isConverted = opp.status === "CONVERTIDA" || opp.status === "EN_REVISION" || opp.status === "COMPLETADA";
const formatCurrency = (val: number) => `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "Fecha no disponible";

useEffect(() => {
    console.log("Datos de la OPC:", opp);
    console.log("Datos de la OC vinculada:", oc);
    }, [opp, oc]);
  return (
    <Modal open={isOpen} onClose={onClose} title={`Expediente: ${opp.pre_order_number}`}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        
        {/* --- CABECERA DE ESTADOS --- */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
            <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Estado OPC</p>
            <p className="text-sm font-bold text-[#594246]">{opp.status}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#594246]/5 border border-[#594246]/10">
            <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Vínculo OC</p>
            <p className="text-sm font-bold text-[#F2778D]">
              {oc?.order_number || "Sin OC generada"}
            </p>
          </div>
        </div>

        {/* --- INFORMACIÓN GENERAL --- */}
        <section className="space-y-3">
          <h5 className="text-sm font-bold text-[#594246] border-b border-rose-50 pb-2">Información de Origen</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm">
            <div>
              <p className="text-[#9b8088] text-xs">Solicitante:</p>
              <p className="font-medium text-[#594246]">{opp.id_worker?.first_name || 'Admin'} (Logística)</p>
            </div>
            <div>
              <p className="text-[#9b8088] text-xs">Fecha Solicitud:</p>
              <p className="font-medium text-[#594246]">{formatDate(opp.created_at)}</p>
            </div>
            {isConverted && (
              <>
                <div>
                  <p className="text-[#9b8088] text-xs">Proveedor Elegido:</p>
                  <p className="font-medium text-[#F2778D]">{oc?.id_supplier?.name_company}</p>
                </div>
                <div>
                  <p className="text-[#9b8088] text-xs">Entrega Estimada:</p>
                  <p className="font-medium text-[#594246]">{formatDate(oc?.delivery_date_estimated)}</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* --- TABLA DE ITEMS (RESUMEN TÉCNICO) --- */}
        <section className="space-y-3">
          <h5 className="text-sm font-bold text-[#594246] border-b border-rose-50 pb-2">Desglose de Mercadería</h5>
          <div className="rounded-2xl border border-rose-50 overflow-hidden text-xs">
            <table className="w-full">
              <thead className="bg-rose-50/30 text-[#9b8088]">
                <tr>
                  <th className="p-3 text-left">Variante</th>
                  <th className="p-3 text-center">Cant.</th>
                  <th className="p-3 text-right">Costo Est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {opp.base_items?.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="p-3">
                      <span className="font-bold text-[#594246]">{item.id_variant?.size}</span> - {item.id_variant?.color}
                    </td>
                    <td className="p-3 text-center font-bold text-[#594246]">{item.quantity}</td>
                    <td className="p-3 text-right text-[#9b8088]">
                      {isConverted ? formatCurrency(oc?.items?.[i]?.unit_cost || 0) : 'Pendiente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- LOG DE ACTIVIDAD --- */}
        <section className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <h5 className="text-xs font-bold text-[#9b8088] uppercase mb-2">Notas del Proceso:</h5>
          <p className="text-xs text-[#594246] italic leading-relaxed">
            {opp.notes || "No se registraron observaciones adicionales para este seguimiento."}
          </p>
        </section>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-[#594246] text-white rounded-xl font-bold hover:bg-[#453235] transition-colors"
        >
          Cerrar Expediente
        </button>
      </div>
    </Modal>
  );
}