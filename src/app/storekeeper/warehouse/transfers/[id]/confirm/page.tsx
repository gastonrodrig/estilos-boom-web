"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStorehouseStore } from "@/hooks";

export default function ConfirmMovementPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params.id as string;

  const { startLoadingWarehouseDocuments, loading } = useStorehouseStore();
  const [doc, setDoc] = useState<any>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [incidents, setIncidents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      const data = await startLoadingWarehouseDocuments();
      if (Array.isArray(data)) {
        const found = data.find((d) => d._id === id);
        if (found) {
          setDoc(found);
          const init: Record<string, number> = {};
          (found.items ?? []).forEach((item: any) => {
            const vId = typeof item.id_variant === "object" ? item.id_variant._id : item.id_variant;
            init[vId] = item.quantity_expected ?? 0;
          });
          setQuantities(init);
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

  if (!doc) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#8C6B79] text-sm italic">Cargando documento…</p>
    </div>
  );

  const srcName = doc.id_source_warehouse?.name?.replace(/_/g, " ") ?? "Origen";
  const tgtName = doc.id_target_warehouse?.name?.replace(/_/g, " ") ?? "Destino";

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[700px] mx-auto relative z-10">

      <Link href="/storekeeper/warehouse/transfers"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#8C6B79] hover:text-[#40202D] dark:text-[#F8BBD0]/80 dark:hover:text-white mb-6 transition-colors tracking-wide">
        <ArrowLeft className="w-4 h-4" /> Volver a órdenes pendientes
      </Link>
      <h1 className="text-3xl font-medium text-[#40202D] dark:text-white mb-10 tracking-wide">
        Confirmar movimiento
      </h1>

      {/* Resumen */}
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl p-6 md:p-8 mb-8 shadow-sm border border-[#EAE0E2] dark:border-white/5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-[#8C6B79] mb-1">{doc.document_number}</p>
            <h2 className="text-xl font-medium text-[#40202D] dark:text-white">
              {srcName} → {tgtName}
            </h2>
          </div>
          <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[11px] font-medium rounded-full border border-amber-100">
            {doc.status}
          </span>
        </div>
        {doc.notes && (
          <p className="text-sm text-[#8C6B79] mt-4 pt-4 border-t border-[#EAE0E2]">{doc.notes}</p>
        )}
      </div>

      {/* Variantes */}
      <h3 className="text-xl font-medium text-[#40202D] dark:text-white mb-6 tracking-wide">Verificar cantidades</h3>

      <div className="space-y-4 mb-10">
        {(doc.items ?? []).map((item: any, idx: number) => {
          const variant   = item.id_variant;
          const vId       = typeof variant === "object" ? variant._id : variant;
          const sku       = typeof variant === "object" ? variant.sku_variant : vId;
          const size      = typeof variant === "object" ? variant.size : "—";
          const colorName = typeof variant === "object" ? variant.color?.name : "—";
          const colorHex  = typeof variant === "object" ? variant.color?.hex : "#ccc";
          const product   = typeof variant === "object" ? variant.id_product?.name : "Prenda";

          return (
            <div key={vId ?? idx} className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border border-[#EAE0E2] dark:border-white/5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: colorHex }} />
                <span className="font-medium text-[15px] text-[#40202D] dark:text-white tracking-wide">
                  {product} — {size} / {colorName}
                </span>
                <span className="text-xs font-mono text-[#8C6B79] ml-auto">{sku}</span>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-medium text-[#8C6B79] mb-2">Qty a mover</label>
                  <div className="w-full p-4 bg-white/50 dark:bg-white/5 border border-[#F2DEE4] rounded-xl text-sm font-medium text-[#8C6B79] cursor-not-allowed">
                    {item.quantity_expected}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8C6B79] mb-2">Qty real movida</label>
                  <input type="number" min={0}
                    value={quantities[vId] ?? item.quantity_expected}
                    onChange={(e) => setQuantities((prev) => ({ ...prev, [vId]: Number(e.target.value) }))}
                    className="w-full p-4 bg-white dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-xl text-sm font-medium text-[#40202D] dark:text-white focus:outline-none focus:border-[#F23B69] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#EAE0E2] dark:border-white/5">
                <input type="checkbox" id={`inc-${vId}`}
                  checked={incidents[vId] || false}
                  onChange={(e) => setIncidents((prev) => ({ ...prev, [vId]: e.target.checked }))}
                  className="w-4 h-4 rounded border-[#EAE0E2] text-[#F23B69] focus:ring-[#F23B69]"
                />
                <label htmlFor={`inc-${vId}`} className="text-[13px] text-[#8C6B79] font-medium cursor-pointer">
                  ¿Hubo incidencia en esta variante?
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pb-12">
        <button onClick={handleNext} disabled={loading}
          className="py-4 px-10 bg-[#40202D] hover:bg-[#5B283A] disabled:opacity-40 text-white text-sm font-medium rounded-2xl shadow-sm transition-all tracking-wide">
          Siguiente paso
        </button>
      </div>
    </motion.div>
  );
}
