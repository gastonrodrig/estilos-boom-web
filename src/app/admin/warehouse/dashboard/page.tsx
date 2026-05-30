"use client";

import { Package, Zap, AlertTriangle, CheckCircle2, Scissors, ArrowRight, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function WarehouseDashboardPage() {
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

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
            <h1 className="text-3xl md:text-4xl font-bold text-[#40202D] dark:text-white font-serif flex items-center gap-3 drop-shadow-md tracking-wide">
              Buenos días, María 
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
            <span>Almacén Principal</span>
          </p>
        </div>
      </motion.div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        
        <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} className="group bg-white dark:bg-[#1A0B11]/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-[#F2778D]/25 rounded-3xl p-6 shadow-sm hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] dark:hover:border-[#F2778D]/40 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-[#F2778D]/10 flex items-center justify-center shrink-0 border border-rose-100 dark:border-[#F2778D]/30 group-hover:bg-rose-100 dark:group-hover:bg-[#F2778D]/20 transition-colors duration-300">
              <Package className="w-7 h-7 text-[#F23B69] dark:text-[#F8BBD0]" />
            </div>
            <div>
              <p className="text-3xl font-bold font-sans text-[#40202D] dark:text-white drop-shadow-sm tracking-wide">3</p>
              <p className="text-sm text-[#8C6B79] dark:text-gray-300 font-medium mt-0.5 tracking-wide">Recepciones hoy</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} className="group bg-white dark:bg-[#1A0B11]/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-[#F2778D]/25 rounded-3xl p-6 shadow-sm hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] dark:hover:border-[#F2778D]/40 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-orange-100 dark:border-white/20 group-hover:bg-orange-100 dark:group-hover:bg-[#F2778D]/10 transition-colors duration-300">
              <Zap className="w-7 h-7 text-[#E67A50] dark:text-[#F8BBD0]" />
            </div>
            <div>
              <p className="text-3xl font-bold font-sans text-[#40202D] dark:text-white drop-shadow-sm tracking-wide">2</p>
              <p className="text-sm text-[#8C6B79] dark:text-gray-300 font-medium mt-0.5 tracking-wide">Órdenes pendientes</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} className="group bg-white dark:bg-[#1A0B11]/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-[#F2778D]/25 rounded-3xl p-6 shadow-sm hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] dark:hover:border-[#F2778D]/40 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-[#F2778D]/10 flex items-center justify-center shrink-0 border border-rose-100 dark:border-[#F2778D]/30 group-hover:bg-rose-100 dark:group-hover:bg-[#F2778D]/20 transition-colors duration-300">
              <AlertTriangle className="w-7 h-7 text-[#D6405F] dark:text-[#F48FB1]" />
            </div>
            <div>
              <p className="text-3xl font-bold font-sans text-[#40202D] dark:text-white drop-shadow-sm tracking-wide">1</p>
              <p className="text-sm text-[#8C6B79] dark:text-gray-300 font-medium mt-0.5 tracking-wide">Incidencia abierta</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} className="group bg-white dark:bg-[#1A0B11]/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-[#F2778D]/25 rounded-3xl p-6 shadow-sm hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] dark:hover:border-[#F2778D]/40 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-white/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/10 transition-colors duration-300">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 dark:text-[#A5D6A7]" />
            </div>
            <div>
              <p className="text-3xl font-bold font-sans text-[#40202D] dark:text-white drop-shadow-sm tracking-wide">5</p>
              <p className="text-sm text-[#8C6B79] dark:text-gray-300 font-medium mt-0.5 tracking-wide">Tareas completadas</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* TWO COLUMNS (Listas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
        
        {/* LEFT COLUMN: Lo que llega hoy */}
        <motion.div variants={itemVariants} className="bg-white/90 dark:bg-[#1A0B11]/60 backdrop-blur-2xl border border-[#EAE0E2] dark:border-[#F2778D]/25 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-[#40202D] dark:text-white mb-6 drop-shadow-sm tracking-wide">Lo que llega hoy</h2>
          
          <div className="space-y-5">
            {/* Item 1 */}
            <div className="group flex items-center gap-5 p-4 md:p-5 rounded-2xl bg-[#FCF8F9] dark:bg-black/30 border border-[#F2DEE4] dark:border-[#F2778D]/15 hover:bg-white dark:hover:bg-black/50 hover:border-[#F2778D]/50 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#F2778D]/10 flex items-center justify-center shrink-0 border border-[#F5DCE2] dark:border-[#F2778D]/30 shadow-sm">
                <Scissors className="w-6 h-6 text-[#F2778D] dark:text-[#F8BBD0]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-[#40202D] dark:text-white group-hover:text-[#F23B69] dark:group-hover:text-[#F8BBD0] transition-colors tracking-wide">Vestido Floral</h3>
                <p className="text-sm text-[#8C6B79] dark:text-gray-400 mt-0.5 tracking-wide">Confecciones María Elena &middot; <span className="font-semibold text-[#5B283A] dark:text-gray-200">24 unidades</span></p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-[#C9B3BC] dark:text-gray-500 group-hover:text-[#F23B69] dark:group-hover:text-[#F2778D] transition-colors group-hover:translate-x-1" />
              </div>
            </div>

            {/* Item 2 */}
            <div className="group flex items-center gap-5 p-4 md:p-5 rounded-2xl bg-[#FCF8F9] dark:bg-black/30 border border-[#F2DEE4] dark:border-[#F2778D]/15 hover:bg-white dark:hover:bg-black/50 hover:border-[#F2778D]/50 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#F2778D]/10 flex items-center justify-center shrink-0 border border-[#F5DCE2] dark:border-[#F2778D]/30 shadow-sm">
                <Package className="w-6 h-6 text-[#5B283A] dark:text-[#F8BBD0]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-[#40202D] dark:text-white group-hover:text-[#F23B69] dark:group-hover:text-[#F8BBD0] transition-colors flex items-center gap-3 tracking-wide">
                  Blusa de Seda
                  <span className="px-2 py-1 bg-white dark:bg-[#F2778D]/20 text-[#F23B69] dark:text-[#F8BBD0] rounded text-[11px] font-bold border border-[#F2DEE4] dark:border-[#F2778D]/40 shadow-sm tracking-normal">
                    Prioridad
                  </span>
                </h3>
                <p className="text-sm text-[#8C6B79] dark:text-gray-400 mt-0.5 tracking-wide">Textiles del Norte &middot; <span className="font-semibold text-[#5B283A] dark:text-gray-200">18 unidades</span></p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-[#C9B3BC] dark:text-gray-500 group-hover:text-[#F23B69] dark:group-hover:text-[#F2778D] transition-colors group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Órdenes pendientes */}
        <motion.div variants={itemVariants} className="bg-white/90 dark:bg-[#1A0B11]/60 backdrop-blur-2xl border border-[#EAE0E2] dark:border-[#F2778D]/25 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#40202D] dark:text-white drop-shadow-sm tracking-wide">Documentos</h2>
            <button className="text-sm font-bold text-[#8C6B79] dark:text-[#F2778D] hover:text-[#40202D] dark:hover:text-[#F8BBD0] transition-colors tracking-wide">
              Ver todos
            </button>
          </div>
          
          <h3 className="text-base font-semibold text-[#8C6B79] dark:text-gray-400 mb-5 tracking-wide">Solicitudes de movimiento</h3>

          <div className="space-y-5">
            {/* Movimiento 1 */}
            <div className="group flex flex-col p-5 rounded-2xl bg-[#FCF8F9] dark:bg-black/30 border border-[#F2DEE4] dark:border-[#F2778D]/15 hover:bg-white dark:hover:bg-black/50 hover:border-[#F2778D]/50 transition-all duration-300 cursor-pointer">
              <div className="flex justify-between items-center mb-3">
                <span className="text-base font-bold text-[#40202D] dark:text-white tracking-wide">#MOV-0125</span>
                <span className="px-3 py-1 bg-white dark:bg-[#F2778D]/10 text-[#F23B69] dark:text-[#F8BBD0] rounded-full text-xs font-bold border border-[#F2DEE4] dark:border-[#F2778D]/30 shadow-sm tracking-normal">
                  Transferencia interna
                </span>
              </div>
              <p className="text-base text-[#5B283A] dark:text-gray-200 mb-3 tracking-wide">Vestido Floral (12 uds), Blusa de Seda (8 uds)</p>
              <div className="flex items-center gap-2 text-sm font-medium text-[#8C6B79] dark:text-gray-400 tracking-wide">
                <Clock className="w-4 h-4" /> Hace 12h &middot; Ana López
              </div>
            </div>

            {/* Movimiento 2 */}
            <div className="group flex flex-col p-5 rounded-2xl bg-[#FCF8F9] dark:bg-black/30 border border-[#F2DEE4] dark:border-[#F2778D]/15 hover:bg-white dark:hover:bg-black/50 hover:border-[#F2778D]/50 transition-all duration-300 cursor-pointer">
              <div className="flex justify-between items-center mb-3">
                <span className="text-base font-bold text-[#40202D] dark:text-white tracking-wide">#MOV-0126</span>
                <span className="px-3 py-1 bg-[#D6405F] dark:bg-[#F2778D] text-white rounded-full text-xs font-bold shadow-sm shadow-[#F2778D]/20 tracking-normal">
                  Salida
                </span>
              </div>
              <p className="text-base text-[#5B283A] dark:text-gray-200 mb-3 tracking-wide">Pantalón de Lino (15 uds)</p>
              <div className="flex items-center gap-2 text-sm font-medium text-[#8C6B79] dark:text-gray-400 tracking-wide">
                <Clock className="w-4 h-4" /> Hace 28h &middot; Carlos Ruiz
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
