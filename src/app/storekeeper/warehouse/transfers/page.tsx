"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Sparkles, FileText, Activity, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStorehouseStore } from "@/hooks";

type Tab = "PENDIENTE" | "COMPLETADO";

const TAB_CONFIG = [
  { id: "PENDIENTE" as Tab,   label: "Pendientes",  Icon: Activity },
  { id: "COMPLETADO" as Tab,  label: "Completados", Icon: CheckCircle2 },
];

const DOC_ROUTE = (doc: any) => `/storekeeper/warehouse/transfers/${doc._id}/confirm`;

export default function AdminDocumentsMovementsPage() {
  const { startLoadingWarehouseDocuments, loading } = useStorehouseStore();
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("PENDIENTE");

  useEffect(() => {
    const load = async () => {
      const data = await startLoadingWarehouseDocuments();
      if (Array.isArray(data))
        setAllDocs(data.filter((d) => d.type === "TRANSFERENCIA"));
    };
    void load();
  }, [startLoadingWarehouseDocuments]);

  const filtered = allDocs.filter((d) => d.status === activeTab);
  const pendingCount = allDocs.filter((d) => d.status === "PENDIENTE").length;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[800px] mx-auto relative z-10">

      <div className="flex items-center gap-4 mb-2 opacity-80">
        <FileText className="w-5 h-5 text-[#D6405F] dark:text-white" />
        <h2 className="text-xs font-bold text-gray-500 dark:text-[#F8BBD0]/80 uppercase tracking-widest">
          Solicitudes de Movimientos
        </h2>
      </div>
      <h1 className="text-4xl md:text-5xl text-[#40202D] dark:text-white mb-10 uppercase tracking-wide leading-tight drop-shadow-md font-medium">
        Transferencias
      </h1>

      {/* TABS */}
      <div className="flex w-full gap-2 mb-10 p-2 bg-white/90 dark:bg-black/40 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-[2rem] shadow-sm">
        {TAB_CONFIG.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              className="relative flex-1 py-3.5 rounded-[1.5rem] text-sm font-medium transition-all focus:outline-none flex justify-center items-center gap-2 group tracking-wide">
              {isActive && (
                <motion.div layoutId="transferTabs"
                  className="absolute inset-0 bg-white dark:bg-[#F2778D]/10 rounded-[1.5rem] shadow-sm border border-[#F2DEE4] dark:border-[#F2778D]/30"
                  initial={false} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <span className={`relative z-10 flex items-center gap-2 transition-colors duration-300 ${isActive ? "text-[#D6405F] dark:text-[#F8BBD0]" : "text-gray-500 dark:text-gray-400 group-hover:text-[#40202D]"}`}>
                <Icon className={`w-4 h-4 ${isActive ? "opacity-100" : "opacity-50"}`} />
                {label}
                {id === "PENDIENTE" && pendingCount > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-[#FDF1F3] text-[#D6405F]" : "bg-gray-100 text-gray-500"}`}>
                    {pendingCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* LISTA */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <p className="text-sm text-[#8C6B79] italic text-center py-12">Cargando transferencias…</p>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 bg-white/90 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-dashed border-[#EAE0E2] dark:border-white/15">
              <FileText className="w-12 h-12 text-[#EAE0E2] mx-auto mb-4" />
              <p className="text-[15px] text-[#8C6B79] font-bold tracking-wide">
                No hay transferencias {activeTab === "PENDIENTE" ? "pendientes" : "completadas"}.
              </p>
            </motion.div>
          ) : (
            filtered.map((doc) => {
              const srcName = doc.id_source_warehouse?.name?.replace(/_/g, " ") ?? "Origen";
              const tgtName = doc.id_target_warehouse?.name?.replace(/_/g, " ") ?? "Destino";
              const totalUnits = (doc.items ?? []).reduce((s: number, i: any) => s + (i.quantity_expected ?? 0), 0);
              const msSince = Date.now() - new Date(doc.created_at).getTime();
              const hoursSince = Math.round(msSince / 1000 / 3600);

              return (
                <motion.div layout key={doc._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -6, scale: 1.005 }}
                  className="relative overflow-hidden group bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-[2rem] p-6 md:p-8 shadow-sm border border-[#EAE0E2] dark:border-white/5 hover:border-white/20 transition-colors duration-500">

                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4 mt-2">
                    <div>
                      <h3 className="text-2xl font-black text-[#40202D] dark:text-white tracking-wide group-hover:text-[#D6405F] transition-colors">
                        {doc.document_number}
                      </h3>
                      <p className="text-[13px] text-[#8C6B79] mt-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(doc.created_at).toLocaleDateString("es-PE")}
                      </p>
                    </div>
                    <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[11px] font-black tracking-widest uppercase rounded-full border border-amber-100 w-fit">
                      {doc.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-8 bg-white/50 dark:bg-white/5 rounded-2xl p-5 border border-[#F2DEE4] dark:border-white/5">
                    <p className="text-[13px] text-[#8C6B79] font-medium">
                      Origen: <span className="font-medium text-[#40202D] dark:text-white">{srcName}</span>
                      {" → "}
                      Destino: <span className="font-medium text-[#40202D] dark:text-white">{tgtName}</span>
                    </p>
                    <p className="text-[13px] text-[#8C6B79]">{doc.items?.length ?? 0} variantes · {totalUnits} unidades totales</p>
                    {doc.notes && <p className="text-[12px] text-[#8C6B79] italic">{doc.notes}</p>}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className={`flex items-center gap-2 text-[13px] font-medium tracking-wide ${hoursSince > 24 ? "text-[#E87A5D]" : "text-[#8C6B79]"}`}>
                      {hoursSince > 24 && <AlertTriangle className="w-4 h-4 opacity-80" />}
                      Hace {hoursSince}h en espera
                    </div>

                    {doc.status === "PENDIENTE" && (
                      <Link href={DOC_ROUTE(doc)}
                        className="group/btn relative py-3.5 px-8 bg-[#40202D] dark:bg-[#F2778D]/20 hover:bg-[#5B283A] border border-transparent dark:border-[#F2778D]/40 text-white dark:text-[#F8BBD0] text-[13px] font-bold tracking-wide rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm overflow-hidden backdrop-blur-md">
                        <span className="relative z-10">Ejecutar movimiento</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
