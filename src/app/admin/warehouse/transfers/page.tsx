"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Sparkles, FileText, Activity, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDocumentsMovementsPage() {
  const [activeTab, setActiveTab] = useState("Pendientes");

  const TABS = [
    { id: "Pendientes", label: "Pendientes", count: 2, icon: Activity },
    { id: "En proceso", label: "En proceso", icon: Sparkles },
    { id: "Completados", label: "Completados", icon: CheckCircle2 },
  ];

  const dummyRequests = [
    {
      id: "MOV-0125",
      type: "Transferencia Interna",
      created_at: "18/5/2026",
      creator: "Ana López",
      summary: "Vestido Floral (12 uds), Blusa de Seda (8 uds)",
      reasons: ["Reposición de tienda", "Inventario bajo"],
      hoursPending: 12,
      status: "Pendientes",
    },
    {
      id: "MOV-0126",
      type: "Salida",
      created_at: "17/5/2026",
      creator: "Carlos Ruiz",
      summary: "Pantalón de Lino (15 uds)",
      reasons: ["Venta mayorista"],
      hoursPending: 28,
      status: "Pendientes",
      isAlert: true,
    }
  ];

  const filteredData = dummyRequests.filter(req => req.status === activeTab);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[800px] mx-auto relative z-10"
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2 opacity-80">
        <FileText className="w-5 h-5 text-[#D6405F] dark:text-[#F8BBD0]" />
        <h2 className="text-xs font-bold text-gray-500 dark:text-[#F8BBD0]/80 uppercase tracking-widest">
          Solicitudes de Movimientos
        </h2>
      </div>
      <h1 className="text-4xl md:text-5xl font-serif text-[#40202D] dark:text-white mb-10 uppercase tracking-wide leading-tight drop-shadow-md">
        Documentos
      </h1>

      {/* TABS ELEGANTES GLASSMORPHISM */}
      <div className="flex flex-wrap gap-2 mb-10 p-1.5 bg-white/90 dark:bg-[#1A0B11]/60 backdrop-blur-2xl border border-[#EAE0E2] dark:border-[#F2778D]/25 rounded-2xl w-fit shadow-sm">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all focus:outline-none flex items-center gap-2 group tracking-wide"
            >
              {isActive && (
                <motion.div
                  layoutId="documentTabs"
                  className="absolute inset-0 bg-white dark:bg-[#F2778D]/10 rounded-xl shadow-sm border border-[#F2DEE4] dark:border-[#F2778D]/30"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-2 transition-colors duration-300 ${
                isActive 
                  ? "text-[#D6405F] dark:text-[#F8BBD0]" 
                  : "text-gray-500 dark:text-gray-400 group-hover:text-[#40202D] dark:group-hover:text-white"
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? "opacity-100" : "opacity-50"}`} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
                    isActive 
                      ? "bg-[#FDF1F3] dark:bg-[#F2778D]/20 text-[#D6405F] dark:text-[#F8BBD0]" 
                      : "bg-gray-100 dark:bg-black/30 text-gray-500 dark:text-gray-400"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* CARDS LIST */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredData.map(req => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={req.id} 
              className="group bg-white/90 dark:bg-[#1A0B11]/60 backdrop-blur-2xl rounded-[2rem] p-6 md:p-8 shadow-sm border border-[#EAE0E2] dark:border-[#F2778D]/25 hover:border-[#F2778D]/40 transition-all duration-500 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
            >
              
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
                <div>
                  <h3 className="text-2xl font-black text-[#40202D] dark:text-white tracking-wide group-hover:text-[#D6405F] dark:group-hover:text-[#F8BBD0] transition-colors drop-shadow-sm">
                    #{req.id}
                  </h3>
                  <p className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-400 mt-1.5 flex items-center gap-1.5 tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6B5C0] dark:bg-[#F2778D]/40" />
                    Creado el {req.created_at}
                  </p>
                </div>
                <span className="px-4 py-1.5 bg-white dark:bg-[#F2778D]/10 text-[#D6405F] dark:text-[#F8BBD0] text-[11px] font-black tracking-widest uppercase rounded-full border border-[#F2DEE4] dark:border-[#F2778D]/30 shadow-sm w-fit">
                  {req.type}
                </span>
              </div>

              {/* Info Area (Glass Morphism in dark mode) */}
              <div className="space-y-4 mb-8 bg-[#FCF8F9] dark:bg-black/30 rounded-2xl p-5 md:p-6 border border-[#F2DEE4] dark:border-[#F2778D]/15 backdrop-blur-md">
                <p className="text-[13px] text-[#8C6B79] dark:text-gray-400 font-medium tracking-wide">
                  Solicitado por <span className="font-bold text-[#40202D] dark:text-white">{req.creator}</span>
                </p>
                <p className="text-[15px] font-bold text-[#40202D] dark:text-white leading-relaxed tracking-wide">
                  {req.summary}
                </p>
                
                {/* Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {req.reasons.map((r, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white dark:bg-[#F2778D]/10 text-[#5B283A] dark:text-[#F8BBD0] text-[11px] font-bold tracking-wide rounded-lg border border-[#F5DCE2] dark:border-[#F2778D]/20 shadow-sm">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className={`flex items-center gap-2 text-[13px] font-bold tracking-wide ${req.isAlert ? "text-[#E87A5D] dark:text-[#FFB74D]" : "text-[#8C6B79] dark:text-[#F8BBD0]/60"}`}>
                  {req.isAlert ? (
                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                  )}
                  Lleva {req.hoursPending}h en espera
                </div>

                <Link 
                  href={`/admin/warehouse/transfers/${req.id}/confirm`}
                  className="group/btn relative py-3.5 px-8 bg-[#40202D] dark:bg-[#F2778D] hover:bg-[#5B283A] dark:hover:bg-[#F8BBD0] text-white dark:text-[#1A0B11] text-[13px] font-bold tracking-wide rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_15px_rgba(242,119,141,0.2)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_25px_rgba(242,119,141,0.3)] overflow-hidden"
                >
                  <span className="relative z-10">Ejecutar movimiento</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                </Link>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredData.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/90 dark:bg-[#1A0B11]/40 backdrop-blur-2xl rounded-[2.5rem] border border-dashed border-[#EAE0E2] dark:border-[#F2778D]/25"
          >
            <FileText className="w-12 h-12 text-[#EAE0E2] dark:text-[#F2778D]/30 mx-auto mb-4" />
            <p className="text-[15px] text-[#8C6B79] dark:text-gray-400 font-bold tracking-wide">
              No hay solicitudes pendientes en esta categoría.
            </p>
          </motion.div>
        )}
      </div>

    </motion.div>
  );
}