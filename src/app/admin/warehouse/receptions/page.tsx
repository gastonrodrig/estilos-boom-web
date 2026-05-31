"use client";

import Link from "next/link";
import { Package, ArrowRight, Sparkles, Plus, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function ReceptionsListPage() {
  const dummyReceptions = [
    { id: "REC-0045", provider: "Confecciones María Elena", status: "Pendiente", date: "Hoy, 09:30 AM", qty: 10 },
    { id: "REC-0046", provider: "Textiles del Norte", status: "En Proceso", date: "Ayer", qty: 45 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[1000px] mx-auto relative z-10"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-medium text-[#40202D] dark:text-white mb-3 flex items-center gap-3 drop-shadow-md tracking-wide">
            Recepciones 
            <motion.div 
              animate={{ rotate: [0, 15, -15, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-6 h-6 text-[#F2778D] dark:text-[#F8BBD0] opacity-90 drop-shadow-[0_0_12px_rgba(248,187,208,0.8)]" />
            </motion.div>
          </h1>
          <p className="text-[#8C6B79] dark:text-[#F8BBD0]/80 text-sm md:text-base font-medium tracking-wide">
            Gestiona y confirma el ingreso de mercadería al almacén.
          </p>
        </div>
        
        <button className="flex items-center gap-2 bg-[#40202D] hover:bg-[#5B283A] dark:bg-[#F2778D] dark:hover:bg-[#F8BBD0] text-white dark:text-[#1A0B11] px-6 py-3 rounded-full font-medium text-sm shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_15px_rgba(242,119,141,0.2)] transition-all transform hover:-translate-y-0.5 tracking-wide">
          <Plus className="w-4 h-4" />
          Nueva Recepción
        </button>
      </div>

      {/* GLASSMORPHISM MAIN CARD */}
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-sm">
        
        <h2 className="text-xl md:text-2xl font-medium text-[#40202D] dark:text-white mb-8 flex items-center gap-2 tracking-wide drop-shadow-sm">
          Órdenes entrantes
        </h2>

        <div className="space-y-5">
          {dummyReceptions.map((rec, i) => (
            <Link 
              key={rec.id} 
              href={`/admin/warehouse/receptions/${rec.id.toLowerCase()}`}
              className="group flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 rounded-[1.5rem] bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:border-white/15 transition-all duration-300 backdrop-blur-md relative overflow-hidden"
            >
              {/* Subtle hover gradient inside card */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#F2778D]/10 flex items-center justify-center shrink-0 border border-[#F5DCE2] dark:border-[#F2778D]/30 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Package className="w-7 h-7 text-[#F23B69] dark:text-[#F8BBD0]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-[#40202D] dark:text-white group-hover:text-[#F23B69] dark:group-hover:text-[#F8BBD0] transition-colors tracking-wide">
                    Orden #{rec.id}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-sm font-medium text-[#8C6B79] dark:text-gray-400 tracking-wide">{rec.provider}</p>
                    <span className="w-1 h-1 rounded-full bg-[#D6B5C0] dark:bg-[#F2778D]/40" />
                    <p className="text-xs font-medium text-[#AD8997] dark:text-[#C9B3BC] flex items-center gap-1.5 tracking-wide">
                      <Clock className="w-3.5 h-3.5" /> {rec.date}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-8 mt-6 md:mt-0 relative z-10 w-full md:w-auto">
                <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-[#EADCE0] dark:border-white/10 pt-4 md:pt-0 md:pl-8 w-full md:w-auto flex md:flex-col justify-between items-center md:items-end">
                  <span className="text-[11px] font-medium text-[#8C6B79] dark:text-[#F8BBD0]/80 uppercase tracking-widest mb-1.5">
                    Unidades
                  </span>
                  <span className="text-2xl font-black text-[#40202D] dark:text-white font-sans drop-shadow-sm">
                    {rec.qty}
                  </span>
                </div>

                <div className="flex items-center gap-5">
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide shadow-sm border ${
                    rec.status === 'Pendiente' 
                      ? 'bg-white dark:bg-[#F2778D]/10 text-[#F23B69] dark:text-[#F8BBD0] border-[#F2DEE4] dark:border-[#F2778D]/30' 
                      : 'bg-white dark:bg-[#FFB74D]/10 text-[#E67A50] dark:text-[#FFCC80] border-[#F2DEE4] dark:border-[#FFB74D]/30'
                  }`}>
                    {rec.status}
                  </span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-[#C9B3BC] dark:text-gray-500 group-hover:text-[#F23B69] dark:group-hover:text-[#F2778D] transition-colors group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
