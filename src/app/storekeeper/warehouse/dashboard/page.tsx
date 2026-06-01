"use client";

import { useEffect, useState } from "react";
import { Package, Zap, AlertTriangle, CheckCircle2, Scissors, ArrowRight, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStorehouseStore } from "@/hooks";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const DOC_TYPE_LABELS: Record<string, string> = {
  INGRESO_COMPRA: "Recepción de compra",
  SALIDA_VENTA: "Salida por venta",
  TRANSFERENCIA: "Transferencia interna",
  AJUSTE: "Ajuste de inventario",
};

export default function WarehouseDashboardPage() {
  const { startLoadingWarehouseDocuments, loading } = useStorehouseStore();
  const [docs, setDocs] = useState<any[]>([]);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  });

  useEffect(() => {
    const load = async () => {
      const data = await startLoadingWarehouseDocuments();
      if (Array.isArray(data)) setDocs(data);
    };
    void load();
  }, [startLoadingWarehouseDocuments]);

  const pending    = docs.filter((d) => d.status === "PENDIENTE");
  const completed  = docs.filter((d) => d.status === "COMPLETADO");
  const receptions = pending.filter((d) => d.type === "INGRESO_COMPRA");
  const transfers  = pending.filter((d) => d.type === "TRANSFERENCIA");

  const recentPending = [...pending]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 max-w-[1200px] mx-auto">

      {/* HEADER */}
      <motion.div variants={itemVariants} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#40202D] dark:text-white flex items-center gap-3 drop-shadow-md tracking-wide">
            Bienvenido al Almacén
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <Sparkles className="w-6 h-6 text-[#F2778D] dark:text-[#F8BBD0] opacity-90" />
            </motion.div>
          </h1>
          <p className="text-base text-[#8C6B79] dark:text-[#F8BBD0]/80 capitalize font-medium flex items-center gap-2 mt-1 tracking-wide">
            <span>{today}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2778D] opacity-80" />
            <span>Almacén Principal</span>
          </p>
        </div>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Recepciones pendientes",    value: receptions.length, Icon: Package,     color: "rose" },
          { label: "Transferencias pendientes", value: transfers.length,  Icon: Zap,          color: "orange" },
          { label: "Con incidencia potencial",  value: 0,                 Icon: AlertTriangle, color: "rose" },
          { label: "Documentos completados",    value: completed.length,  Icon: CheckCircle2,  color: "emerald" },
        ].map(({ label, value, Icon, color }) => (
          <motion.div key={label} variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }}
            className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/5 rounded-3xl p-6 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                color === "emerald" ? "bg-emerald-50 border-emerald-100"
                : color === "orange" ? "bg-orange-50 border-orange-100"
                : "bg-rose-50 border-rose-100"}`}>
                <Icon className={`w-7 h-7 ${color === "emerald" ? "text-emerald-500" : color === "orange" ? "text-[#E67A50]" : "text-[#D6405F]"}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-[#40202D] dark:text-white">{loading ? "…" : value}</p>
                <p className="text-sm text-[#8C6B79] dark:text-gray-300 font-medium mt-0.5 leading-tight">{label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DOS COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Recepciones */}
        <motion.div variants={itemVariants}
          className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#40202D] dark:text-white tracking-wide">Recepciones pendientes</h2>
            <Link href="/storekeeper/warehouse/receptions" className="text-xs font-bold text-[#F2778D] hover:underline">Ver todas</Link>
          </div>

          {loading ? (
            <p className="text-sm text-[#8C6B79] italic py-8 text-center">Cargando…</p>
          ) : receptions.length === 0 ? (
            <p className="text-sm text-[#8C6B79] italic text-center py-8">Sin recepciones pendientes.</p>
          ) : (
            <div className="space-y-4">
              {receptions.slice(0, 3).map((doc) => (
                <Link key={doc._id} href={`/storekeeper/warehouse/receptions/${doc._id}`}
                  className="group flex items-center gap-5 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#F2778D]/10 flex items-center justify-center shrink-0 border border-[#F5DCE2] shadow-sm">
                    <Scissors className="w-6 h-6 text-[#F2778D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-[#40202D] dark:text-white truncate">{doc.document_number}</h3>
                    <p className="text-xs text-[#8C6B79] mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.created_at).toLocaleDateString("es-PE")} · {doc.items?.length ?? 0} variantes
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 shrink-0 text-[#C9B3BC] group-hover:text-[#F23B69] transition-colors group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Documentos recientes */}
        <motion.div variants={itemVariants}
          className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#40202D] dark:text-white tracking-wide">Documentos recientes</h2>
            <Link href="/storekeeper/warehouse/transfers" className="text-xs font-bold text-[#F2778D] hover:underline">Ver transferencias</Link>
          </div>

          {loading ? (
            <p className="text-sm text-[#8C6B79] italic py-8 text-center">Cargando…</p>
          ) : recentPending.length === 0 ? (
            <p className="text-sm text-[#8C6B79] italic text-center py-8">Sin documentos pendientes.</p>
          ) : (
            <div className="space-y-4">
              {recentPending.map((doc) => {
                const href = doc.type === "TRANSFERENCIA"
                  ? `/storekeeper/warehouse/transfers/${doc._id}/confirm`
                  : `/storekeeper/warehouse/receptions/${doc._id}`;
                return (
                  <Link key={doc._id} href={href}
                    className="group flex flex-col p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base font-medium text-[#40202D] dark:text-white truncate">{doc.document_number}</span>
                      <span className="ml-2 shrink-0 px-2.5 py-1 bg-white dark:bg-[#F2778D]/10 text-[#F23B69] rounded-full text-[10px] font-medium border border-[#F2DEE4]">
                        {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#8C6B79] mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(doc.created_at).toLocaleDateString("es-PE")} · {doc.items?.length ?? 0} variantes
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}
