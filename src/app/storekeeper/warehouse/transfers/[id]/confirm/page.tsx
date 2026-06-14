"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, ChevronDown, FileText, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStorehouseStore } from "@/hooks";

export default function ConfirmMovementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const { startLoadingWarehouseDocuments, loading } = useStorehouseStore();
  const [doc, setDoc] = useState<any>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [incidents, setIncidents] = useState<Record<string, boolean>>({});
  const [showOriginDocs, setShowOriginDocs] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await startLoadingWarehouseDocuments();
      if (Array.isArray(data)) {
        const found = data.find((d) => d._id === id);
        if (found) {
          setDoc(found);
          const init: Record<string, number> = {};
          const initInc: Record<string, boolean> = {};
          (found.items ?? []).forEach((item: any) => {
            const vId = typeof item.id_variant === "object" ? item.id_variant._id : item.id_variant;
            init[vId] = item.quantity_expected ?? 0;
            initInc[vId] = false;
          });
          setQuantities(init);
          setIncidents(initInc);
        }
      }
    };
    void load();
  }, [id, startLoadingWarehouseDocuments]);

  const handleNext = () => {
    if (!doc) return;
    // Guardar cantidades revisadas para la página de finalización
    const reviewed = (doc.items ?? []).map((item: any) => {
      const vId = typeof item.id_variant === "object" ? item.id_variant._id : item.id_variant;
      return {
        id_variant: vId,
        quantity_received: quantities[vId] ?? item.quantity_expected ?? 0,
        incidence_note: incidents[vId] ? "Incidencia reportada por almacenero" : "",
      };
    });
    localStorage.setItem("warehouse_transfer_review", JSON.stringify(reviewed));
    router.push(`/storekeeper/warehouse/transfers/${id}/finalize`);
  };

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8C6B79] text-sm italic">Cargando documento…</p>
      </div>
    );
  }

  const srcName = doc.id_source_warehouse?.name?.replace(/_/g, " ") ?? "Origen";
  const tgtName = doc.id_target_warehouse?.name?.replace(/_/g, " ") ?? "Destino";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[700px] mx-auto relative z-10"
    >
      {/* HEADER */}
      <Link 
        href="/storekeeper/warehouse/transfers" 
        className="inline-flex items-center gap-2 text-sm font-medium text-[#8C6B79] hover:text-[#40202D] dark:text-[#F8BBD0]/80 dark:hover:text-white mb-6 transition-colors tracking-wide"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a transferencias
      </Link>
      <h1 className="text-3xl md:text-4xl font-medium text-[#40202D] dark:text-white mb-10 tracking-wide drop-shadow-md">
        {doc.status === "PENDIENTE" ? "Confirmar envío" : "Confirmar recepción"}
      </h1>

      {/* ORDER SUMMARY */}
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl p-6 md:p-8 mb-8 shadow-sm border border-[#EAE0E2] dark:border-white/5 transition-colors duration-300">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm font-medium text-[#8C6B79] dark:text-gray-400 mb-1 tracking-wide">Orden #{doc.document_number}</p>
            <h2 className="text-xl font-medium text-[#40202D] dark:text-white tracking-wide flex items-center gap-2">
              {srcName} <span className="text-[#8C6B79] dark:text-[#F2778D]/50 mx-1">→</span> {tgtName}
            </h2>
          </div>
          <span className="px-4 py-1.5 bg-white/50 dark:bg-[#F2778D]/10 text-[#5B283A] dark:text-[#F8BBD0] text-[11px] font-medium rounded-full border border-[#F2DEE4] dark:border-white/10 shadow-sm tracking-wide">
            {doc.status}
          </span>
        </div>

        {doc.notes && (
          <div className="mt-6 pt-6 border-t border-[#EAE0E2] dark:border-white/5">
            <p className="text-xs font-medium text-[#8C6B79] dark:text-gray-400 mb-3 tracking-wide">Notas de la orden</p>
            <p className="text-sm text-[#40202D] dark:text-[#F8BBD0]">{doc.notes}</p>
          </div>
        )}
      </div>

      {/* SUSTENTO / TRAZABILIDAD DE ORIGEN (EXPANDABLE) */}
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl shadow-sm border border-[#EAE0E2] dark:border-white/5 mb-10 overflow-hidden transition-colors duration-300">
        <button 
          onClick={() => setShowOriginDocs(!showOriginDocs)}
          className="w-full px-6 md:px-8 py-5 flex items-center justify-between hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#F23B69] dark:text-[#F8BBD0]" />
            <span className="font-medium text-[15px] text-[#40202D] dark:text-white tracking-wide">Ver Documentos de Sustento (Origen)</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#8C6B79] dark:text-[#F8BBD0] transition-transform duration-300 ${showOriginDocs ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {showOriginDocs && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 md:px-8 pb-8 pt-4 border-t border-[#EAE0E2] dark:border-white/5"
            >
              <p className="text-[13px] text-[#8C6B79] dark:text-gray-400 mb-6 font-medium tracking-wide">
                Documentos vinculados al origen de la mercadería:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 rounded-xl transition-colors">
                  <FileText className="w-5 h-5 text-[#3b82f6] dark:text-[#60a5fa]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-medium text-[#8C6B79] dark:text-gray-500 tracking-wide">Transferencia de almacén</span>
                    <span className="text-[13px] font-medium text-[#40202D] dark:text-white">#{doc.document_number}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 rounded-xl transition-colors">
                  <FileText className="w-5 h-5 text-[#10b981] dark:text-[#34d399]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-medium text-[#8C6B79] dark:text-gray-500 tracking-wide">Fecha Registro</span>
                    <span className="text-[13px] font-medium text-[#40202D] dark:text-white">{new Date(doc.created_at).toLocaleDateString("es-PE")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* VERIFY QUANTITIES */}
      <h3 className="text-xl md:text-2xl font-medium mb-6 text-[#40202D] dark:text-white tracking-wide">Verificar cantidades</h3>
      
      <div className="space-y-4 mb-10">
        {(doc.items ?? []).map((item: any, idx: number) => {
          const variant   = item.id_variant;
          const vId       = typeof variant === "object" ? variant._id : variant;
          const sku       = typeof variant === "object" ? variant.sku_variant : vId;
          const size      = typeof variant === "object" ? variant.size : "—";
          const colorName = typeof variant === "object" ? variant.color?.name : "—";
          const colorHex  = typeof variant === "object" ? variant.color?.hex : "#ccc";
          const product   = typeof variant === "object" ? variant.id_product?.name : "Prenda";

          const hasIncidence = incidents[vId] || false;
          const currentQty = quantities[vId] ?? item.quantity_expected ?? 0;

          return (
            <div key={vId ?? idx} className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border border-[#EAE0E2] dark:border-white/5 transition-colors duration-300">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: colorHex }} />
                  <span className="font-medium text-[15px] text-[#40202D] dark:text-white tracking-wide">
                    {product} — {size} / {colorName}
                  </span>
                </div>
                <p className="text-xs text-[#8C6B79] dark:text-gray-400 font-mono font-medium ml-5 tracking-wider">{sku}</p>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-medium text-[#8C6B79] dark:text-gray-400 mb-2 tracking-wide">Qty a mover</label>
                  <div className="w-full p-4 bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 rounded-xl text-sm font-medium text-[#8C6B79] dark:text-gray-500 cursor-not-allowed">
                    {item.quantity_expected}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8C6B79] dark:text-gray-400 mb-2 tracking-wide">Qty real movida</label>
                  <input 
                    type="number"
                    min={0}
                    value={currentQty}
                    onChange={(e) => setQuantities({ ...quantities, [vId]: Number(e.target.value) || 0 })}
                    className="w-full p-4 bg-white dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-xl text-sm font-medium text-[#40202D] dark:text-white focus:outline-none focus:border-[#F23B69] dark:focus:border-[#F8BBD0] transition-colors"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group w-fit mt-4 pt-4 border-t border-[#EAE0E2] dark:border-white/5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${hasIncidence ? 'bg-[#D6405F] dark:bg-[#F2778D] border-[#D6405F] dark:border-[#F2778D]' : 'bg-[#FCF8F9] dark:bg-white/5 border-[#EEDCE1] dark:border-white/10 group-hover:border-[#D6405F]'}`}>
                  {hasIncidence && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={hasIncidence}
                  onChange={(e) => setIncidents({ ...incidents, [vId]: e.target.checked })}
                />
                <span className="text-[13px] text-[#8C6B79] dark:text-[#F8BBD0]/80 font-medium tracking-wide">¿Hubo incidencia en esta variante?</span>
              </label>

              {hasIncidence && currentQty < item.quantity_expected && (
                <p className="text-xs text-amber-500 flex items-center gap-1 mt-4">
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                  Diferencia de {item.quantity_expected - currentQty} unidad(es).
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="flex justify-end pb-12">
        <button 
          onClick={handleNext}
          disabled={loading}
          className="py-4 px-10 bg-[#40202D] hover:bg-[#5B283A] dark:bg-[#F2778D] dark:hover:bg-[#F8BBD0] text-white dark:text-[#1A0B11] disabled:opacity-40 text-sm font-medium rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_15px_rgba(242,119,141,0.2)] transition-all tracking-wide"
        >
          Siguiente paso
        </button>
      </div>

    </motion.div>
  );
}
