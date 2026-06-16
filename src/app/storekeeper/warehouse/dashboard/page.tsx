"use client";

import { useEffect, useState, useMemo } from "react";
import { Package, Zap, AlertTriangle, CheckCircle2, Scissors, ArrowRight, Clock, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useStorehouseStore, useAuthStore } from "@/hooks";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const DOC_TYPE_LABELS: Record<string, string> = {
  INGRESO_COMPRA: "Recepción de compra",
  INGRESO_PRODUCCION: "Ingreso por producción",
  SALIDA_VENTA: "Salida por venta",
  TRANSFERENCIA: "Transferencia interna",
  AJUSTE: "Ajuste de inventario",
};

export default function WarehouseDashboardPage() {
  const { startLoadingWarehouseDocuments, loading } = useStorehouseStore();
  const { role } = useAuthStore();
  const [docs, setDocs] = useState<any[]>([]);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  useEffect(() => {
    const load = async () => {
      const data = await startLoadingWarehouseDocuments();
      if (Array.isArray(data)) {
        const roleFiltered = data.filter((d) => {
          if (role === "Almacenero Boom") {
            return (
              d.id_source_warehouse?.code === "ALM-CEN" ||
              d.id_target_warehouse?.code === "ALM-CEN"
            );
          }
          if (role === "Almacenero Tienda") {
            return (
              d.id_source_warehouse?.code === "TND-PRI" ||
              d.id_target_warehouse?.code === "TND-PRI"
            );
          }
          return true;
        });
        setDocs(roleFiltered);
      }
    };
    void load();
  }, [startLoadingWarehouseDocuments, role]);

  const pending    = useMemo(() => docs.filter((d) => d.status === "PENDIENTE"), [docs]);
  const completed  = useMemo(() => docs.filter((d) => d.status === "COMPLETADO"), [docs]);

  const receptions = useMemo(() => {
    return pending.filter((d) => {
      if (d.type !== "INGRESO_COMPRA" && d.type !== "INGRESO_PRODUCCION" && d.type !== "TRANSFERENCIA") return false;
      const targetCode = role === "Almacenero Boom" ? "ALM-CEN" : "TND-PRI";
      return d.id_target_warehouse?.code === targetCode;
    });
  }, [pending, role]);

  const transfers = useMemo(() => {
    return pending.filter((d) => {
      if (d.type !== "TRANSFERENCIA") return false;
      const sourceCode = role === "Almacenero Boom" ? "ALM-CEN" : "TND-PRI";
      return d.id_source_warehouse?.code === sourceCode;
    });
  }, [pending, role]);

  const dispatches = useMemo(() => {
    return pending.filter((d) => {
      if (d.type !== "SALIDA_VENTA") return false;
      const sourceCode = role === "Almacenero Boom" ? "ALM-CEN" : "TND-PRI";
      return d.id_source_warehouse?.code === sourceCode;
    });
  }, [pending, role]);

  const recentPending = useMemo(() => {
    return [...pending]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [pending]);

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show"
      className="relative z-10 max-w-[1400px] mx-auto"
    >
      {/* HEADER */}
      <motion.div variants={itemVariants} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-5 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[#40202D] dark:text-white flex items-center gap-3 drop-shadow-md tracking-wide">
              Buenos días, {role === "Almacenero Boom" ? "Almacenero BOOM" : role === "Almacenero Tienda" ? "Almacenero Tienda" : "Almacenero"}
              <motion.div 
                animate={{ rotate: [0, 15, -15, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-6 h-6 text-[#F2778D] dark:text-[#F8BBD0] opacity-90 drop-shadow-[0_0_12px_rgba(248,187,208,0.8)]" />
              </motion.div>
            </h1>
            <span className="text-[11px] md:text-xs font-medium text-[#8C6B79]/60 dark:text-white/20 italic pb-1 tracking-wide">
              &quot;Tus manos crean el orden que hace posible la magia.&quot;
            </span>
          </div>
          <p className="text-base text-[#8C6B79] dark:text-[#F8BBD0]/80 capitalize font-medium flex items-center gap-2 drop-shadow-sm tracking-wide">
            <span>{today}</span> 
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2778D] dark:bg-[#F8BBD0] opacity-80" /> 
            <span>
              {role === "Almacenero Boom" ? "Almacén BOOM (Central)" : role === "Almacenero Tienda" ? "Tienda Principal (Ventas)" : "Almacén Principal"}
            </span>
          </p>
        </div>
      </motion.div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {[
          { label: "Recepciones pendientes",    value: receptions.length, Icon: Package,     color: "rose" },
          { label: "Transferencias pendientes", value: transfers.length,  Icon: Zap,          color: "orange" },
          { label: "Despachos pendientes",      value: dispatches.length, Icon: Truck,        color: "rose" },
          { label: "Documentos completados",    value: completed.length,  Icon: CheckCircle2,  color: "emerald" },
        ].map(({ label, value, Icon, color }) => (
          <motion.div 
            key={label} 
            variants={itemVariants} 
            whileHover={{ y: -4, scale: 1.01 }} 
            className="group bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] dark:hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-colors duration-300 ${
                color === "emerald" ? "bg-emerald-50 border-emerald-100 dark:bg-white/5 dark:border-white/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/10"
                : color === "orange" ? "bg-orange-50 border-orange-100 dark:bg-white/5 dark:border-white/20 group-hover:bg-orange-100 dark:group-hover:bg-[#F2778D]/10"
                : "bg-rose-50 border-rose-100 dark:bg-[#F2778D]/10 dark:border-[#F2778D]/30 group-hover:bg-rose-100 dark:group-hover:bg-[#F2778D]/20"
              }`}>
                <Icon className={`w-7 h-7 ${
                  color === "emerald" ? "text-emerald-500 dark:text-[#A5D6A7]" 
                  : color === "orange" ? "text-[#E67A50] dark:text-[#F8BBD0]" 
                  : "text-[#D6405F] dark:text-[#F8BBD0]"
                }`} />
              </div>
              <div>
                <p className="text-3xl font-bold font-sans text-[#40202D] dark:text-white drop-shadow-sm tracking-wide">
                  {loading ? "…" : value}
                </p>
                <p className="text-sm text-[#8C6B79] dark:text-gray-300 font-medium mt-0.5 tracking-wide">
                  {label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TWO COLUMNS (Listas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
        
        {/* LEFT COLUMN: Lo que llega hoy (Recepciones Pendientes) */}
        <motion.div variants={itemVariants} className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#40202D] dark:text-white drop-shadow-sm tracking-wide">Lo que llega hoy</h2>
            <Link href="/storekeeper/warehouse/receptions" className="text-sm font-bold text-[#8C6B79] dark:text-[#F2778D] hover:text-[#40202D] dark:hover:text-[#F8BBD0] transition-colors tracking-wide">
              Ver todas
            </Link>
          </div>
          
          {loading ? (
            <p className="text-sm text-[#8C6B79] italic py-8 text-center">Cargando recepciones…</p>
          ) : receptions.length === 0 ? (
            <p className="text-sm text-[#8C6B79] italic text-center py-8">Sin recepciones pendientes para hoy.</p>
          ) : (
            <div className="space-y-5">
              {receptions.slice(0, 3).map((doc) => {
                const totalQty = doc.items?.reduce((acc: number, item: any) => acc + (item.quantity_expected ?? 0), 0) ?? 0;
                return (
                  <Link 
                    key={doc._id} 
                    href={`/storekeeper/warehouse/receptions/${doc._id}`}
                    className="group flex items-center gap-5 p-4 md:p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:border-white/15 transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#F2778D]/10 flex items-center justify-center shrink-0 border border-[#F5DCE2] dark:border-[#F2778D]/30 shadow-sm">
                      <Scissors className="w-6 h-6 text-[#F2778D] dark:text-[#F8BBD0]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-medium text-[#40202D] dark:text-white group-hover:text-[#F23B69] dark:group-hover:text-[#F8BBD0] transition-colors tracking-wide truncate">
                        {doc.document_number}
                      </h3>
                      <p className="text-sm text-[#8C6B79] dark:text-gray-400 mt-0.5 tracking-wide truncate">
                        {doc.notes || "Recepción de compra externa"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[12px] bg-[#FDF1F3] dark:bg-white/10 text-[#D6405F] dark:text-white/80 px-2.5 py-1 rounded-lg border border-[#F2DEE4] dark:border-white/5 font-medium tracking-wide">
                        {totalQty} uds
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-[#C9B3BC] dark:text-gray-500 group-hover:text-[#F23B69] dark:group-hover:text-[#F2778D] transition-colors group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* RIGHT COLUMN: Documentos pendientes / recientes */}
        <motion.div variants={itemVariants} className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#40202D] dark:text-white drop-shadow-sm tracking-wide">Documentos</h2>
            <Link href="/storekeeper/warehouse/transfers" className="text-sm font-bold text-[#8C6B79] dark:text-[#F2778D] hover:text-[#40202D] dark:hover:text-[#F8BBD0] transition-colors tracking-wide">
              Ver transferencias
            </Link>
          </div>
          
          <h3 className="text-base font-semibold text-[#8C6B79] dark:text-gray-400 mb-5 tracking-wide">Solicitudes pendientes</h3>

          {loading ? (
            <p className="text-sm text-[#8C6B79] italic py-8 text-center">Cargando documentos pendientes…</p>
          ) : recentPending.length === 0 ? (
            <p className="text-sm text-[#8C6B79] italic text-center py-8">Sin documentos pendientes.</p>
          ) : (
            <div className="space-y-5">
              {recentPending.map((doc) => {
                const href = doc.type === "TRANSFERENCIA"
                  ? `/storekeeper/warehouse/transfers/${doc._id}/confirm`
                  : doc.type === "SALIDA_VENTA"
                  ? `/storekeeper/warehouse/dispatches/${doc._id}`
                  : `/storekeeper/warehouse/receptions/${doc._id}`;
                return (
                  <Link 
                    key={doc._id} 
                    href={href}
                    className="group flex flex-col p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:border-white/15 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-base font-medium text-[#40202D] dark:text-white tracking-wide truncate max-w-[65%]">
                        {doc.document_number}
                      </span>
                      <span className="px-3 py-1 bg-white dark:bg-[#F2778D]/10 text-[#F23B69] dark:text-[#F8BBD0] rounded-full text-xs font-medium border border-[#F2DEE4] dark:border-[#F2778D]/30 shadow-sm tracking-normal">
                        {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-2 mb-4 mt-1">
                      {(doc.items || []).slice(0, 2).map((item: any, idx: number) => {
                        const variantName = (item.id_variant && typeof item.id_variant === "object") 
                          ? `${item.id_variant.id_product?.name || "Prenda"} (${item.id_variant.size}/${item.id_variant.color?.name || ""})`
                          : "Variante";
                        return (
                          <div key={idx} className="flex justify-between items-center bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/10 rounded-xl px-4 py-2.5 backdrop-blur-md">
                            <span className="text-[13px] text-[#40202D] dark:text-white/95 font-medium tracking-wide truncate max-w-[70%]">
                              {variantName}
                            </span>
                            <span className="text-[11px] bg-[#FDF1F3] dark:bg-white/10 text-[#D6405F] dark:text-white/80 px-2 py-0.5 rounded-lg border border-[#F2DEE4] dark:border-white/5 font-medium">
                              {item.quantity_expected} uds
                            </span>
                          </div>
                        );
                      })}
                      {doc.items && doc.items.length > 2 && (
                        <p className="text-[11px] text-[#8C6B79] dark:text-gray-400 italic pl-1">
                          + {doc.items.length - 2} variantes más
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-[#8C6B79] dark:text-gray-400 tracking-wide pt-3 border-t border-[#F2DEE4] dark:border-white/5">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(doc.created_at).toLocaleDateString("es-PE")}</span>
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
