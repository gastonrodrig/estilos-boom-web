"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useStorehouseStore, useAuthStore } from "@/hooks";

type Tab = "COMPLETADO";

const DOC_ROUTE = (doc: any) => `/storekeeper/warehouse/transfers/${doc._id}/confirm`;

export default function AdminDocumentsMovementsPage() {
  const { startLoadingWarehouseDocuments, loading } = useStorehouseStore();
  const { role } = useAuthStore();
  const [allDocs, setAllDocs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await startLoadingWarehouseDocuments();
      if (Array.isArray(data)) {
        const typeFiltered = data.filter((d) => d.type === "TRANSFERENCIA");
        const roleFiltered = typeFiltered.filter((d) => {
          const isSourceBoom = d.id_source_warehouse?.code === "ALM-CEN";
          const isTargetBoom = d.id_target_warehouse?.code === "ALM-CEN";
          const isSourceTienda = d.id_source_warehouse?.code === "TND-PRI";
          const isTargetTienda = d.id_target_warehouse?.code === "TND-PRI";

          if (role === "Almacenero Boom") {
            return (
              (d.status === "PENDIENTE" && isSourceBoom) ||
              (d.status === "EN_TRANSITO" && isTargetBoom) ||
              (d.status === "COMPLETADO" && (isSourceBoom || isTargetBoom))
            );
          }
          if (role === "Almacenero Tienda") {
            return (
              (d.status === "PENDIENTE" && isSourceTienda) ||
              (d.status === "EN_TRANSITO" && isTargetTienda) ||
              (d.status === "COMPLETADO" && (isSourceTienda || isTargetTienda))
            );
          }
          return true;
        });
        setAllDocs(roleFiltered);
      }
    };
    void load();
  }, [startLoadingWarehouseDocuments, role]);

  const filtered = allDocs.filter((d) => d.status === "COMPLETADO");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[800px] mx-auto relative z-10"
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2 opacity-80">
        <FileText className="w-5 h-5 text-[#D6405F] dark:text-white drop-shadow-sm transition-colors" />
        <h2 className="text-xs font-bold text-gray-500 dark:text-[#F8BBD0]/80 uppercase tracking-widest">
          Solicitudes de Movimientos
        </h2>
      </div>
      <h1 className="text-4xl md:text-5xl text-[#40202D] dark:text-white mb-10 uppercase tracking-wide leading-tight drop-shadow-md font-medium">
        Movimientos completados
      </h1>


      {/* CARDS LIST */}
      <div className="space-y-3">
        <div>
          {loading ? (
            <p className="text-sm text-[#8C6B79] italic py-12 text-center">Cargando transferencias…</p>
          ) : filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white/90 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-dashed border-[#EAE0E2] dark:border-white/15"
            >
              <FileText className="w-12 h-12 text-[#EAE0E2] dark:text-[#F23B69]/40 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(242,119,141,0.1)]" />
              <p className="text-[15px] text-[#8C6B79] dark:text-gray-400 font-bold tracking-wide">
                No hay movimientos completados.
              </p>
            </motion.div>
          ) : (
            filtered.map((doc) => {
              const srcName = doc.id_source_warehouse?.name?.replace(/_/g, " ") ?? "Origen";
              const tgtName = doc.id_target_warehouse?.name?.replace(/_/g, " ") ?? "Destino";
              const totalUnits = (doc.items ?? []).reduce((s: number, i: any) => s + (i.quantity_expected ?? 0), 0);
              const msSince = Date.now() - new Date(doc.created_at).getTime();
              const hoursSince = Math.round(msSince / 1000 / 3600);
              const isAlert = false;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -6, scale: 1.005 }}
                  transition={{ layout: { type: "spring", stiffness: 300, damping: 24 } }}
                  key={doc._id} 
                  className="relative overflow-hidden group bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-2xl p-4 shadow-sm border border-[#EAE0E2] dark:border-white/5 hover:border-white/20 transition-colors duration-300 hover:shadow-md"
                >
                  {/* Internal glow orb on hover */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-white rounded-full mix-blend-screen filter blur-[80px] opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none" />
                  
                  {/* Left alert banderita */}
                  {isAlert && (
                    <div className="absolute top-10 left-0 w-1.5 h-8 bg-[#FFB74D] rounded-r-md shadow-[0_0_8px_rgba(255,183,77,0.5)] animate-pulse" />
                  )}
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-[#40202D] dark:text-white tracking-wide group-hover:text-[#D6405F] dark:group-hover:text-[#F8BBD0] transition-colors">
                        {doc.document_number}
                      </h3>
                      <span className="px-2.5 py-0.5 bg-white dark:bg-[#F2778D]/10 text-[#D6405F] dark:text-[#F8BBD0] text-[10px] font-bold tracking-widest uppercase rounded-full border border-[#F2DEE4] dark:border-[#F2778D]/30">
                        {doc.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8C6B79] dark:text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString("es-PE")}
                    </span>
                  </div>

                  {/* Route */}
                  <p className="text-[12px] text-[#8C6B79] dark:text-gray-400 mb-3">
                    <span className="font-medium text-[#40202D] dark:text-white">{srcName}</span>
                    <span className="mx-1.5">→</span>
                    <span className="font-medium text-[#40202D] dark:text-white">{tgtName}</span>
                    <span className="ml-2 text-[#D6405F] dark:text-[#F8BBD0] font-semibold">{totalUnits} uds</span>
                  </p>

                  {/* Items compactos */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(doc.items || []).slice(0, 4).map((item: any, idx: number) => {
                      const variant = item.id_variant;
                      const size  = variant && typeof variant === "object" ? variant.size || "—" : "—";
                      const color = variant && typeof variant === "object" ? variant.color?.name || variant.color || "—" : "—";
                      return (
                        <span key={idx} className="text-[11px] bg-white/60 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/10 rounded-lg px-2.5 py-1 text-[#40202D] dark:text-white/80">
                          {size} / {color} · <span className="text-[#D6405F] dark:text-[#F8BBD0] font-semibold">{item.quantity_expected}</span>
                        </span>
                      );
                    })}
                    {doc.items && doc.items.length > 4 && (
                      <span className="text-[11px] text-[#8C6B79] dark:text-gray-400 italic px-1 self-center">+{doc.items.length - 4} más</span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-1.5 text-[11px] ${isAlert ? "text-[#E87A5D]" : "text-[#8C6B79] dark:text-white/40"}`}>
                      {isAlert ? <AlertTriangle className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />}
                      <span>{hoursSince}h en espera</span>
                    </div>
                    {(doc.status === "PENDIENTE" || doc.status === "EN_TRANSITO") && (
                      <Link
                        href={DOC_ROUTE(doc)}
                        className="flex items-center gap-2 py-2 px-5 bg-[#40202D] dark:bg-[#F2778D]/20 hover:bg-[#5B283A] dark:hover:bg-[#F2778D]/30 border border-transparent dark:border-[#F2778D]/30 text-white dark:text-[#F8BBD0] text-[12px] font-bold rounded-xl transition-all"
                      >
                        {doc.status === "PENDIENTE" ? "Ejecutar envío" : "Confirmar recepción"}
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>

                </motion.div>
              );
            })
          )}
        </div>
      </div>

    </motion.div>
  );
}
