"use client";

import { useEffect, useState, useMemo } from "react";
import { Package, CheckCircle2, Sparkles, Truck, ShoppingBag, ArrowRight, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useStorehouseStore, useAuthStore, useSupplyWarehouseStore } from "@/hooks";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface DocGroup {
  key: string;
  label: string;
  icon: React.ElementType;
  color: 'rose' | 'orange' | 'amber' | 'violet';
  count: number;
  docs: { _id: string; title: string; subtitle: string; tag: string; href: string; date: string }[];
  listHref: string;
}

const colorMap = {
  rose:   { card: "from-rose-50 to-white dark:from-rose-950/40 dark:to-[#1a0e14]", border: "border-rose-100 dark:border-rose-800/40", icon: "bg-rose-100 dark:bg-rose-900/50 text-rose-500 dark:text-rose-400", count: "text-rose-600 dark:text-rose-400", tag: "bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 border-rose-100 dark:border-rose-800/40", dot: "bg-rose-500" },
  orange: { card: "from-orange-50 to-white dark:from-orange-950/40 dark:to-[#1a0e14]", border: "border-orange-100 dark:border-orange-800/40", icon: "bg-orange-100 dark:bg-orange-900/50 text-orange-500 dark:text-orange-400", count: "text-orange-600 dark:text-orange-400", tag: "bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 border-orange-100 dark:border-orange-800/40", dot: "bg-orange-400" },
  amber:  { card: "from-amber-50 to-white dark:from-amber-950/40 dark:to-[#1a0e14]",  border: "border-amber-100 dark:border-amber-800/40",  icon: "bg-amber-100 dark:bg-amber-900/50 text-amber-500 dark:text-amber-400",   count: "text-amber-600 dark:text-amber-400",   tag: "bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-800/40",   dot: "bg-amber-400" },
  violet: { card: "from-violet-50 to-white dark:from-violet-950/40 dark:to-[#1a0e14]", border: "border-violet-100 dark:border-violet-800/40", icon: "bg-violet-100 dark:bg-violet-900/50 text-violet-500 dark:text-violet-400", count: "text-violet-600 dark:text-violet-400", tag: "bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 border-violet-100 dark:border-violet-800/40", dot: "bg-violet-500" },
};

export default function WarehouseDashboardPage() {
  const { startLoadingWarehouseDocuments, loading: loadingDocs } = useStorehouseStore();
  const { loadProductionOrders, productionOrders, loading: loadingOrders } = useSupplyWarehouseStore();
  const { role } = useAuthStore();
  const [docs, setDocs] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const isStorekeeperBoom = role === "Almacenero Boom";
  const myCode = isStorekeeperBoom ? "ALM-CEN" : "TND-PRI";

  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  useEffect(() => {
    const load = async () => {
      const data = await startLoadingWarehouseDocuments();
      if (Array.isArray(data)) {
        setDocs(data.filter((d) => {
          if (role === "Almacenero Boom") return d.id_source_warehouse?.code === "ALM-CEN" || d.id_target_warehouse?.code === "ALM-CEN";
          if (role === "Almacenero Tienda") return d.id_source_warehouse?.code === "TND-PRI" || d.id_target_warehouse?.code === "TND-PRI";
          return true;
        }));
      }
    };
    void load();
    if (isStorekeeperBoom) loadProductionOrders();
  }, [role]);

  const pending = useMemo(() => docs.filter(d => d.status === "PENDIENTE"), [docs]);
  const completed = useMemo(() => docs.filter(d => d.status === "COMPLETADO"), [docs]);

  const toDoc = (d: any, href: string) => ({
    _id: d._id,
    title: d.document_number || d._id,
    subtitle: d.notes || "",
    tag: `${d.items?.reduce((acc: number, i: any) => acc + (i.quantity_expected ?? 0), 0) ?? 0} uds`,
    href,
    date: d.created_at,
  });

  const groups = useMemo<DocGroup[]>(() => {
    const receptionDocs = pending
      .filter(d => (d.type === "INGRESO_COMPRA" || d.type === "INGRESO_PRODUCCION") && d.id_target_warehouse?.code === myCode)
      .map(d => toDoc(d, `/storekeeper/warehouse/receptions/${d._id}`));

    const dispatchDocs = pending
      .filter(d => d.type === "SALIDA_VENTA" && d.id_source_warehouse?.code === myCode)
      .map(d => toDoc(d, `/storekeeper/warehouse/dispatches/${d._id}`));

    const transferDocs = pending
      .filter(d => d.type === "TRANSFERENCIA")
      .map(d => toDoc(d, `/storekeeper/warehouse/transfers/${d._id}/confirm`));

    const result: DocGroup[] = [
      { key: "receptions", label: "Documentos de Recepción",    icon: Package,     color: "rose",   count: receptionDocs.length, docs: receptionDocs, listHref: "/storekeeper/warehouse/receptions" },
      { key: "dispatches", label: "Documentos de Despacho",     icon: Truck,       color: "orange", count: dispatchDocs.length,  docs: dispatchDocs,  listHref: "/storekeeper/warehouse/dispatches" },
      { key: "transfers",  label: "Documentos de Transferencia",icon: Zap,         color: "amber",  count: transferDocs.length,  docs: transferDocs,  listHref: "/storekeeper/warehouse/transfers" },
    ];

    if (isStorekeeperBoom) {
      const supplyDocs = productionOrders
        .filter(o => ['COMPARANDO', 'EN_PRODUCCION'].includes(o.status) && !o.insumos_confirmados)
        .map(o => ({
          _id: o._id,
          title: o.order_number || o._id,
          subtitle: o.base_items?.[0]?.id_variant?.id_product?.name || "",
          tag: `${(o.base_items || []).reduce((acc: number, i: any) => acc + (i.quantity ?? 0), 0)} prendas`,
          href: `/storekeeper/warehouse/supplies`,
          date: o.created_at,
        }));
      result.push({ key: "supplies", label: "Documentos de Compra de Insumos", icon: ShoppingBag, color: "violet", count: supplyDocs.length, docs: supplyDocs, listHref: "/storekeeper/warehouse/supplies" });
    }

    return result;
  }, [pending, productionOrders, isStorekeeperBoom, myCode]);

  const totalPending = groups.reduce((acc, g) => acc + g.count, 0);
  const loading = loadingDocs || loadingOrders;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 max-w-4xl mx-auto">

      {/* HEADER */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-[#40202D] dark:text-white flex items-center gap-3 mb-1">
          {greeting}
          <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <Sparkles className="w-5 h-5 text-[#F2778D] dark:text-[#F8BBD0]" />
          </motion.div>
        </h1>
        <p className="text-sm text-[#8C6B79] dark:text-[#F8BBD0]/70 capitalize flex items-center gap-2">
          <span>{today}</span>
          <span className="w-1 h-1 rounded-full bg-[#F2778D]" />
          <span>{isStorekeeperBoom ? "Almacén BOOM (Central)" : "Tienda Principal (Ventas)"}</span>
        </p>
      </motion.div>

      {/* RESUMEN */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-8">
        {[
          { label: "Documentos pendientes", value: totalPending, emerald: false },
          { label: "Documentos completados", value: completed.length, emerald: true },
        ].map(({ label, value, emerald }) => (
          <div key={label} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${
            emerald ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20"
            : value > 0 ? "bg-[#fdf1f3] dark:bg-[#F2778D]/10 border-[#F2DEE4] dark:border-[#F2778D]/20"
            : "bg-white/70 dark:bg-white/5 border-[#EAE0E2] dark:border-white/10"
          }`}>
            <span className={`text-2xl font-bold ${emerald ? "text-emerald-600 dark:text-emerald-400" : value > 0 ? "text-[#D6405F] dark:text-[#F8BBD0]" : "text-[#40202D] dark:text-white"}`}>
              {loading ? "…" : value}
            </span>
            <span className="text-xs text-[#8C6B79] dark:text-gray-400 font-medium">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* GRID 2x2 */}
      {loading ? (
        <motion.div variants={itemVariants} className="text-sm text-[#8C6B79] italic py-16 text-center">Cargando documentos…</motion.div>
      ) : totalPending === 0 ? (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          <p className="text-base font-semibold text-[#40202D] dark:text-white">Todo al día</p>
          <p className="text-sm text-[#8C6B79]">No hay documentos pendientes.</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map(group => {
            const Icon = group.icon;
            const c = colorMap[group.color];
            const isOpen = expanded === group.key;

            return (
              <div key={group.key} className={`rounded-2xl border bg-gradient-to-br ${c.card} ${c.border} overflow-hidden transition-all duration-300`}>
                {/* Card header — siempre visible */}
                <button
                  onClick={() => setExpanded(isOpen ? null : group.key)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:opacity-80 transition-opacity"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#8C6B79] dark:text-gray-400 font-medium mb-0.5">Documentos</p>
                    <p className="text-sm font-bold text-[#40202D] dark:text-white leading-tight">
                      {group.label.replace("Documentos de ", "")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-3xl font-bold ${c.count}`}>{group.count}</p>
                    <p className="text-[10px] text-[#8C6B79] dark:text-gray-500">{group.count === 1 ? "pendiente" : "pendientes"}</p>
                  </div>
                </button>

                {/* Documentos expandidos */}
                {isOpen && group.count > 0 && (
                  <div className="border-t border-[#EAE0E2]/60 dark:border-white/10">
                    <div className="divide-y divide-[#EAE0E2]/60 dark:divide-white/5">
                      {group.docs.slice(0, 4).map(doc => (
                        <Link key={doc._id} href={doc.href}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-white/60 dark:hover:bg-white/5 transition-colors group">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#40202D] dark:text-white group-hover:text-[#D6405F] dark:group-hover:text-[#F8BBD0] transition-colors truncate">{doc.title}</p>
                            {doc.subtitle && <p className="text-[10px] text-[#8C6B79] dark:text-gray-400 truncate mt-0.5">{doc.subtitle}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium ${c.tag}`}>{doc.tag}</span>
                            <span className="text-[10px] text-[#c4a0ae] dark:text-gray-500 flex items-center gap-0.5">
                              <Clock size={9} />
                              {new Date(doc.date).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#C9B3BC] group-hover:text-[#D6405F] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link href={group.listHref}
                      className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[#8B3A52] dark:text-[#c4a0ae] hover:bg-white/40 dark:hover:bg-white/5 transition-colors border-t border-[#EAE0E2]/60 dark:border-white/10">
                      Ver todos los documentos <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Footer con link cuando está cerrado */}
                {!isOpen && (
                  <div className={`px-5 pb-4 flex items-center justify-between`}>
                    <p className="text-[11px] text-[#8C6B79] dark:text-gray-500">
                      {isOpen ? "" : group.count > 0 ? "Toca para ver los documentos" : "Sin pendientes"}
                    </p>
                    <Link href={group.listHref} onClick={e => e.stopPropagation()}
                      className={`text-[11px] font-semibold flex items-center gap-1 hover:underline ${c.count}`}>
                      Ver todos <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

    </motion.div>
  );
}
