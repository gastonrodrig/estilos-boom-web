"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Sparkles, FileText, Activity, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDocumentsMovementsPage() {
  const [activeTab, setActiveTab] = useState("Pendientes");
  const [showDelayedOnly, setShowDelayedOnly] = useState(false);

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
      items: [
        { name: "Vestido Floral", qty: 12 },
        { name: "Blusa de Seda", qty: 8 }
      ],
      reasons: ["Reposición de tienda", "Inventario bajo"],
      hoursPending: 12,
      status: "Pendientes",
    },
    {
      id: "MOV-0126",
      type: "Salida",
      created_at: "17/5/2026",
      creator: "Carlos Ruiz",
      items: [
        { name: "Pantalón de Lino", qty: 15 }
      ],
      reasons: ["Venta mayorista"],
      hoursPending: 28,
      status: "Pendientes",
      isAlert: true,
    }
  ];

  const filteredData = dummyRequests.filter(req => {
    if (req.status !== activeTab) return false;
    if (activeTab === "Pendientes" && showDelayedOnly && !req.isAlert) return false;
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[800px] mx-auto relative z-10"
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2 opacity-80">
        <FileText className="w-5 h-5 text-[#D6405F] dark:text-[#F3D899] drop-shadow-[0_0_8px_rgba(243,216,153,0.3)] transition-colors" />
        <h2 className="text-xs font-bold text-gray-500 dark:text-[#F8BBD0]/80 uppercase tracking-widest">
          Solicitudes de Movimientos
        </h2>
      </div>
      <h1 className="text-4xl md:text-5xl text-[#40202D] dark:text-white mb-10 uppercase tracking-wide leading-tight drop-shadow-md font-medium">
        Documentos
      </h1>

      {/* TABS ELEGANTES GLASSMORPHISM */}
      <div className="flex flex-wrap gap-2 mb-10 p-1.5 bg-white/90 dark:bg-black/40 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-2xl w-fit shadow-sm">
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
                <Icon className={`w-4 h-4 transition-all duration-300 ${isActive ? "opacity-100 text-[#D6405F] dark:text-[#F3D899] drop-shadow-[0_0_5px_rgba(243,216,153,0.4)]" : "opacity-50 text-current"}`} />
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
      
      {/* FILTRO DE RETRASOS (Solo en Pendientes) */}
      <AnimatePresence>
        {activeTab === "Pendientes" && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setShowDelayedOnly(!showDelayedOnly)}
            className={`flex items-center gap-2 px-4 py-2 mb-8 h-fit rounded-xl border text-[13px] font-medium transition-all backdrop-blur-md shadow-sm ${
              showDelayedOnly 
                ? "bg-[#FFB74D]/10 border-[#FFB74D]/40 text-[#FFB74D]" 
                : "bg-white/5 border-white/10 text-gray-500 dark:text-white/60 hover:border-white/30"
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${showDelayedOnly ? "animate-pulse" : "opacity-50"}`} />
            Con retraso
          </motion.button>
        )}
      </AnimatePresence>

      {/* CARDS LIST */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredData.map(req => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -6, scale: 1.005 }}
              transition={{ layout: { type: "spring", stiffness: 300, damping: 24 } }}
              key={req.id} 
              className="relative overflow-hidden group bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-[2rem] p-6 md:p-8 shadow-sm border border-[#EAE0E2] dark:border-white/5 hover:border-white/20 transition-colors duration-500 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_15px_40px_rgba(255,255,255,0.05)]"
            >
              {/* Subtle internal glow orb on hover */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-white rounded-full mix-blend-screen filter blur-[80px] opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none" />
              
              {/* Mini banderita izquierda de retraso */}
              {req.isAlert && (
                <div className="absolute top-10 left-0 w-1.5 h-8 bg-[#FFB74D] rounded-r-md shadow-[0_0_8px_rgba(255,183,77,0.5)] animate-pulse" />
              )}
              
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4 mt-2 md:mt-0">
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
              <div className="space-y-4 mb-8 bg-white/50 dark:bg-white/5 rounded-2xl p-5 md:p-6 border border-[#F2DEE4] dark:border-white/5 backdrop-blur-md">
                <p className="text-[13px] text-[#8C6B79] dark:text-gray-300 font-medium tracking-wide">
                  Solicitado por <span className="font-medium text-[#40202D] dark:text-white">{req.creator}</span>
                </p>
                
                {/* Mini Cristales para las Unidades */}
                <div className="flex flex-col gap-2.5 mt-2">
                  {req.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/60 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/10 rounded-xl px-4 py-3 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
                      <span className="text-[14px] text-[#40202D] dark:text-white/95 font-medium tracking-wide">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] bg-[#FDF1F3] dark:bg-white/10 text-[#D6405F] dark:text-white/80 px-2.5 py-1 rounded-lg border border-[#F2DEE4] dark:border-white/5 font-medium tracking-wide">
                          {item.qty} uds
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Motivos sin contenedor */}
                <div className="pt-3 mt-1 border-t border-[#F2DEE4] dark:border-white/5">
                  <p className="text-[12px] text-[#8C6B79] dark:text-white/60 font-medium tracking-wide">
                    Motivos: <span className="text-[#40202D] dark:text-white/80 ml-1">{req.reasons.join(" • ")}</span>
                  </p>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className={`flex items-center gap-2 text-[13px] font-medium tracking-wide ${req.isAlert ? "text-[#E87A5D] dark:text-[#FFB74D]/90" : "text-[#8C6B79] dark:text-white/50"}`}>
                  {req.isAlert ? (
                    <AlertTriangle className="w-4 h-4 opacity-80" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                  )}
                  Lleva {req.hoursPending}h en espera
                </div>

                <Link 
                  href={`/admin/warehouse/transfers/${req.id}/confirm`}
                  className="group/btn relative py-3.5 px-8 bg-[#40202D] dark:bg-[#F2778D]/20 hover:bg-[#5B283A] dark:hover:bg-[#F3D899]/20 border border-transparent dark:border-[#F2778D]/40 dark:hover:border-[#F3D899]/60 text-white dark:text-[#F8BBD0] dark:hover:text-[#F3D899] text-[13px] font-bold tracking-wide rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(242,119,141,0.1)] dark:hover:shadow-[0_0_20px_rgba(243,216,153,0.15)] overflow-hidden backdrop-blur-md"
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
            className="text-center py-20 bg-white/90 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-dashed border-[#EAE0E2] dark:border-white/15"
          >
            <FileText className="w-12 h-12 text-[#EAE0E2] dark:text-[#F3D899]/40 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(243,216,153,0.1)]" />
            <p className="text-[15px] text-[#8C6B79] dark:text-gray-400 font-bold tracking-wide">
              No hay solicitudes pendientes en esta categoría.
            </p>
          </motion.div>
        )}
      </div>

    </motion.div>
  );
}