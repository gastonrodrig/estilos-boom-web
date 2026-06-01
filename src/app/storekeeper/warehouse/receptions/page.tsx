"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowRight, Sparkles, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useStorehouseStore } from "@/hooks";

const STATUS_STYLES: Record<string, string> = {
  PENDIENTE:   "bg-white dark:bg-[#F2778D]/10 text-[#F23B69] dark:text-[#F8BBD0] border-[#F2DEE4]",
  EN_TRANSITO: "bg-sky-50 text-sky-600 border-sky-100",
  COMPLETADO:  "bg-emerald-50 text-emerald-600 border-emerald-100",
  CANCELADO:   "bg-gray-50 text-gray-400 border-gray-100",
};

export default function ReceptionsListPage() {
  const { startLoadingWarehouseDocuments, loading } = useStorehouseStore();
  const [receptions, setReceptions] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await startLoadingWarehouseDocuments();
      if (Array.isArray(data))
        setReceptions(data.filter((d) => d.type === "INGRESO_COMPRA"));
    };
    void load();
  }, [startLoadingWarehouseDocuments]);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[1000px] mx-auto relative z-10">

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-medium text-[#40202D] dark:text-white mb-3 flex items-center gap-3 drop-shadow-md tracking-wide">
            Recepciones
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <Sparkles className="w-6 h-6 text-[#F2778D] dark:text-[#F8BBD0] opacity-90" />
            </motion.div>
          </h1>
          <p className="text-[#8C6B79] dark:text-[#F8BBD0]/80 text-sm font-medium tracking-wide">
            Confirma el ingreso físico de mercadería al almacén.
          </p>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-sm">
        <h2 className="text-xl font-medium text-[#40202D] dark:text-white mb-8 tracking-wide">Órdenes entrantes</h2>

        {loading ? (
          <p className="text-sm text-[#8C6B79] italic py-10 text-center">Cargando recepciones…</p>
        ) : receptions.length === 0 ? (
          <p className="text-sm text-[#8C6B79] italic text-center py-12">No hay recepciones registradas.</p>
        ) : (
          <div className="space-y-5">
            {receptions.map((doc) => {
              const srcName = doc.id_source_warehouse?.name?.replace(/_/g, " ") ?? "Proveedor externo";
              const tgtName = doc.id_target_warehouse?.name?.replace(/_/g, " ") ?? "—";
              const totalUnits = (doc.items ?? []).reduce((s: number, i: any) => s + (i.quantity_expected ?? 0), 0);

              return (
                <Link key={doc._id} href={`/storekeeper/warehouse/receptions/${doc._id}`}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 rounded-[1.5rem] bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#F2778D]/10 flex items-center justify-center shrink-0 border border-[#F5DCE2] shadow-sm group-hover:scale-105 transition-transform">
                      <Package className="w-7 h-7 text-[#F23B69] dark:text-[#F8BBD0]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-[#40202D] dark:text-white group-hover:text-[#F23B69] transition-colors tracking-wide">
                        {doc.document_number}
                      </h3>
                      <p className="text-sm text-[#8C6B79] mt-1">{srcName} → {tgtName}</p>
                      <p className="text-xs text-[#AD8997] flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(doc.created_at).toLocaleDateString("es-PE")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 mt-6 md:mt-0 relative z-10 w-full md:w-auto">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-medium text-[#8C6B79] uppercase tracking-widest">Unidades</span>
                      <span className="text-2xl font-black text-[#40202D] dark:text-white">{totalUnits}</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-medium border ${STATUS_STYLES[doc.status] ?? "bg-gray-50 text-gray-400 border-gray-100"}`}>
                      {doc.status}
                    </span>
                    <ArrowRight className="w-5 h-5 text-[#C9B3BC] group-hover:text-[#F23B69] transition-colors group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
