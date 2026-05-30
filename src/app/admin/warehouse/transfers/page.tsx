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
    <div className="w-full min-h-screen bg-[#F7EEF1] dark:bg-[#150D10] p-4 pt-24 md:p-8 md:pt-28 font-sans relative overflow-hidden transition-colors duration-500">
      
      {/* Luz ambiental sutil (Efecto Glass/Glow en dark mode) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#F2778D]/10 dark:bg-[#F2778D]/5 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#D6405F]/10 dark:bg-[#D6405F]/5 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="max-w-[800px] mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-2 opacity-80">
          <FileText className="w-5 h-5 text-[#D6405F] dark:text-[#F2778D]" />
          <h2 className="text-xs font-bold text-gray-500 dark:text-[#C5AAB2] uppercase tracking-[0.2em]">
            Solicitudes de Movimientos
          </h2>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-[#333333] dark:text-[#FFFFFF] mb-8 uppercase tracking-wide leading-tight">
          Documentos
        </h1>

        {/* TABS ELEGANTES */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-white/50 dark:bg-[#201519]/80 backdrop-blur-xl border border-gray-100 dark:border-[#38202A] rounded-2xl w-fit shadow-sm">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all focus:outline-none flex items-center gap-2 group"
              >
                {isActive && (
                  <motion.div
                    layoutId="documentTabs"
                    className="absolute inset-0 bg-white dark:bg-[#321A23] rounded-xl shadow-sm border border-gray-50 dark:border-[#4A2633]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-2 transition-colors duration-300 ${
                  isActive 
                    ? "text-[#D6405F] dark:text-[#F2B6C1]" 
                    : "text-gray-500 dark:text-[#9A7D87] group-hover:text-gray-800 dark:group-hover:text-[#FFFFFF]"
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? "opacity-100" : "opacity-50"}`} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
                      isActive 
                        ? "bg-[#FDF1F3] dark:bg-[#4A2633] text-[#D6405F] dark:text-[#F2B6C1]" 
                        : "bg-gray-100 dark:bg-[#2A1A20] text-gray-500 dark:text-[#9A7D87]"
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
                className="group bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-[#38202A] hover:border-[#F2778D]/40 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(242,119,141,0.06)]"
              >
                
                {/* Card Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
                  <div>
                    <h3 className="text-xl font-black text-[#333333] dark:text-[#FFFFFF] tracking-tight group-hover:text-[#D6405F] dark:group-hover:text-[#F2B6C1] transition-colors">
                      #{req.id}
                    </h3>
                    <p className="text-[13px] font-medium text-gray-400 dark:text-[#9A7D87] mt-1 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-[#4A2633]" />
                      Creado el {req.created_at}
                    </p>
                  </div>
                  <span className="px-4 py-1.5 bg-[#FDF1F3] dark:bg-[#321A23] text-[#D6405F] dark:text-[#F2B6C1] text-[11px] font-black tracking-widest uppercase rounded-full border border-[#F2DEE4] dark:border-[#4A2633] shadow-inner w-fit">
                    {req.type}
                  </span>
                </div>

                {/* Info Area (Glass Morphism in dark mode) */}
                <div className="space-y-4 mb-8 bg-gray-50/50 dark:bg-[#2A1A20]/60 rounded-2xl p-5 border border-gray-100 dark:border-[#38202A] backdrop-blur-sm">
                  <p className="text-[13px] text-gray-500 dark:text-[#C5AAB2] font-medium">
                    Solicitado por <span className="font-bold text-[#333333] dark:text-[#FFFFFF]">{req.creator}</span>
                  </p>
                  <p className="text-[15px] font-bold text-[#333333] dark:text-[#FFFFFF] leading-relaxed">
                    {req.summary}
                  </p>
                  
                  {/* Pills */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {req.reasons.map((r, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white dark:bg-[#321A23] text-gray-600 dark:text-[#C5AAB2] text-[11px] font-bold rounded-lg border border-gray-200 dark:border-[#4A2633] shadow-sm">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className={`flex items-center gap-2 text-[13px] font-bold ${req.isAlert ? "text-[#E87A5D] dark:text-[#FF9D80]" : "text-gray-400 dark:text-[#8E767C]"}`}>
                    {req.isAlert ? (
                      <AlertTriangle className="w-4 h-4 animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                    )}
                    Lleva {req.hoursPending}h en espera
                  </div>

                  <Link 
                    href={`/admin/warehouse/transfers/${req.id}/confirm`}
                    className="group/btn relative py-3.5 px-8 bg-[#B53E5C] dark:bg-[#D6405F] hover:bg-[#8F2E45] dark:hover:bg-[#F2778D] text-white text-[13px] font-bold tracking-wide rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_5px_15px_rgba(181,62,92,0.2)] dark:shadow-[0_5px_15px_rgba(214,64,95,0.2)] hover:shadow-[0_8px_25px_rgba(181,62,92,0.3)] dark:hover:shadow-[0_8px_25px_rgba(242,119,141,0.3)] overflow-hidden"
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
              className="text-center py-20 bg-white/50 dark:bg-[#201519]/50 backdrop-blur-md rounded-[2rem] border border-dashed border-gray-200 dark:border-[#38202A]"
            >
              <FileText className="w-12 h-12 text-gray-300 dark:text-[#4A2633] mx-auto mb-4" />
              <p className="text-[15px] text-gray-400 dark:text-[#9A7D87] font-bold">
                No hay solicitudes pendientes en esta categoría.
              </p>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}