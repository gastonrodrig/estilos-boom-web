import { Modal } from "@/components/atoms";
import { useEffect } from "react";
import { FileText, ExternalLink } from "lucide-react";

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
          <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-inner backdrop-blur-md">
            <p className="text-[10px] font-black tracking-widest text-[#8C6B79] dark:text-gray-400 uppercase">Estado OPC</p>
            <p className="text-[14px] font-black text-[#40202D] dark:text-white mt-1">{opp.status}</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#40202D]/5 to-[#594246]/5 dark:from-white/5 dark:to-white/10 border border-[#40202D]/10 dark:border-white/10 shadow-inner backdrop-blur-md">
            <p className="text-[10px] font-black tracking-widest text-[#8C6B79] dark:text-gray-400 uppercase">Vínculo OC</p>
            <p className="text-[14px] font-black text-[#D6405F] dark:text-[#F8BBD0] mt-1">
              {oc?.order_number || "Sin OC generada"}
            </p>
          </div>
        </div>

        {/* --- INFORMACIÓN GENERAL --- */}
        <section className="space-y-4">
          <h5 className="text-[12px] font-black text-[#40202D] dark:text-white border-b border-[#EAE0E2] dark:border-white/10 pb-2 tracking-wide">Información de Origen</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-[13px] bg-white/30 dark:bg-black/20 p-5 rounded-2xl border border-[#EAE0E2] dark:border-white/10">
            <div>
              <p className="text-[#8C6B79] dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Solicitante:</p>
              <p className="font-bold text-[#40202D] dark:text-white">{opp.id_worker?.first_name || 'Admin'} <span className="font-medium text-[#8C6B79]">(Logística)</span></p>
            </div>
            <div>
              <p className="text-[#8C6B79] dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Fecha Solicitud:</p>
              <p className="font-bold text-[#40202D] dark:text-white">{formatDate(opp.created_at)}</p>
            </div>
            {isConverted && (
              <>
                <div>
                  <p className="text-[#8C6B79] dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Proveedor Elegido:</p>
                  <p className="font-black text-[#D6405F] dark:text-[#F8BBD0]">{oc?.id_supplier?.name_company}</p>
                </div>
                <div>
                  <p className="text-[#8C6B79] dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Entrega Estimada:</p>
                  <p className="font-bold text-[#40202D] dark:text-white">{formatDate(oc?.delivery_date_estimated)}</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* --- TABLA DE ITEMS (RESUMEN TÉCNICO) --- */}
        <section className="space-y-4">
          <h5 className="text-[12px] font-black text-[#40202D] dark:text-white border-b border-[#EAE0E2] dark:border-white/10 pb-2 tracking-wide">Desglose de Mercadería</h5>
          <div className="rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 shadow-inner overflow-hidden text-[13px]">
            <table className="w-full">
              <thead className="bg-white/50 dark:bg-white/5">
                <tr className="text-[10px] font-black text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">
                  <th className="p-4 text-left">Variante</th>
                  <th className="p-4 text-center">Cant.</th>
                  <th className="p-4 text-right">Costo Est.</th>
                </tr>
              </thead>
              <tbody>
                {opp.base_items?.map((item: any, i: number) => {
                  const matchingPoItem = oc?.items?.find(
                    (poItem: any) =>
                      (poItem.id_variant?._id || poItem.id_variant) ===
                      (item.id_variant?._id || item.id_variant)
                  );
                  const unitCost = matchingPoItem?.unit_cost || 0;
                  const colorHex = item.id_variant?.color?.hex;
                  const colorName = item.id_variant?.color?.name ?? (typeof item.id_variant?.color === 'string' ? item.id_variant.color : null) ?? item.color ?? '—';

                  return (
                     <tr key={i} className={`transition-colors group/row ${i % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                    <td className="p-4 flex items-center gap-3">
                        <span className="font-bold text-[#40202D] dark:text-white">{item.id_variant?.size || item.size}</span>
                        <span className="text-[#EAE0E2] dark:text-gray-600">|</span>
                        {colorHex && (
                          <div 
                            className="w-3.5 h-3.5 rounded-full border border-[#EAE0E2] dark:border-white/10 shrink-0 shadow-sm" 
                            style={{ backgroundColor: colorHex }} 
                          />
                        )}
                        <span className="font-medium text-[#8C6B79] dark:text-gray-300">{colorName}</span>
                      </td>
                      <td className="p-4 text-center font-black text-[#40202D] dark:text-white">{item.quantity}</td>
                      <td className="p-4 text-right font-bold text-[#D6405F] dark:text-[#F8BBD0]">
                        {isConverted ? formatCurrency(unitCost) : <span className="text-[#8C6B79] font-medium text-[11px] uppercase tracking-widest">Pendiente</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- LOG DE ACTIVIDAD --- */}
        <section className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-inner backdrop-blur-md">
          <h5 className="text-[10px] font-black tracking-widest text-[#8C6B79] dark:text-gray-400 uppercase mb-2">Notas del Proceso:</h5>
          <p className="text-[13px] text-[#40202D] dark:text-white font-medium italic leading-relaxed">
            {opp.notes || "No se registraron observaciones adicionales para este seguimiento."}
          </p>
        </section>

        {/* --- DOCUMENTOS ADJUNTOS --- */}
        {oc?.attachments && oc.attachments.length > 0 && (
          <section className="space-y-4">
            <h5 className="text-[12px] font-black text-[#40202D] dark:text-white border-b border-[#EAE0E2] dark:border-white/10 pb-2 tracking-wide">Documentos Adjuntos (PDF)</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/30 dark:bg-black/20 p-5 rounded-2xl border border-[#EAE0E2] dark:border-white/10">
              {oc.attachments.map((url: string, index: number) => {
                const filename = url.split('/').pop()?.split('-').slice(1).join('-') || `Documento_${index + 1}.pdf`;
                return (
                  <a 
                    key={index} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-[#EAE0E2] dark:border-white/10 hover:border-[#D6405F] hover:bg-white dark:hover:bg-white/10 transition-all text-xs font-bold text-[#40202D] dark:text-white"
                  >
                    <FileText className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="truncate flex-1">{filename}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-55" />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <button 
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] shadow-lg transition-all"
        >
          Cerrar Expediente
        </button>
      </div>
    </Modal>
  );
}