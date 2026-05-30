"use client";

import { Package, Zap, AlertTriangle, CheckCircle2, Scissors, ArrowRight, ArrowRightLeft, LogOut } from "lucide-react";

export default function WarehouseDashboardPage() {
  // Obtenemos la fecha en formato humano
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  return (
    <div className="w-full min-h-screen bg-[#F7EEF1] dark:bg-[#150D10] p-4 pt-24 md:p-8 md:pt-28 transition-colors duration-300">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#5B283A] dark:text-[#Fdfcfc] font-serif mb-2 transition-colors duration-300">
          Buenos días, María
        </h1>
        <p className="text-[#844C60] dark:text-[#C9B3BC] capitalize transition-colors duration-300">
          {today} · Almacén Principal
        </p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Stat 1 */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-xl p-5 shadow-[0_8px_30px_rgba(242,119,141,0.06)] border border-[#EEDCE1] dark:border-[#38202A] flex items-center gap-4 transition-colors duration-300">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-[#321A23] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-[#F2778D] dark:text-[#F2b6c1]" />
          </div>
          <div>
            <p className="text-2xl font-bold font-sans text-[#40202D] dark:text-white">3</p>
            <p className="text-xs text-[#8C6B79] dark:text-[#EAE0E2] font-medium uppercase tracking-wide mt-1">Recepciones hoy</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-xl p-5 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-[#38202A] flex items-center gap-4 transition-colors duration-300">
          <div className="w-12 h-12 rounded-full bg-[#F5EBEE] dark:bg-[#321A23] flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-[#844C60] dark:text-[#F2b6c1]" />
          </div>
          <div>
            <p className="text-2xl font-bold font-sans text-[#40202D] dark:text-white">2</p>
            <p className="text-xs text-[#844C60] dark:text-[#EAE0E2] font-medium uppercase tracking-wide mt-1">Órdenes pendientes</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-xl p-5 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-[#38202A] flex items-center gap-4 transition-colors duration-300">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-[#40202D] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-[#D6405F] dark:text-[#F2778D]" />
          </div>
          <div>
            <p className="text-2xl font-bold font-sans text-[#40202D] dark:text-white">1</p>
            <p className="text-xs text-[#844C60] dark:text-[#EAE0E2] font-medium uppercase tracking-wide mt-1">Incidencia abierta</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-xl p-5 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-[#38202A] flex items-center gap-4 transition-colors duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-[#152A20] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold font-sans text-[#40202D] dark:text-white">5</p>
            <p className="text-xs text-[#8C6B79] dark:text-[#EAE0E2] font-medium uppercase tracking-wide mt-1">Tareas completadas hoy</p>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Lo que llega hoy */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-2xl p-6 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-[#38202A] transition-colors duration-300">
          <h2 className="text-xl font-bold font-sans text-[#40202D] dark:text-white mb-6">Lo que llega hoy</h2>
          
          <div className="space-y-4">
            {/* Item 1 */}
            <div className="group flex items-start gap-4 p-5 rounded-xl bg-[#FCF8F9] dark:bg-transparent border border-[#F2DEE4] dark:border-[#38202A] hover:border-[#F2778D]/40 dark:hover:border-[#F2778D]/40 hover:bg-white dark:hover:bg-[#321A23] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(242,119,141,0.08)] dark:hover:shadow-[0_4px_15px_rgba(242,119,141,0.08)] cursor-pointer">
              <div className="mt-1">
                <Scissors className="w-5 h-5 text-[#F2778D] dark:text-[#F2b6c1] group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold font-sans text-[#40202D] dark:text-white">Vestido Floral</h3>
                  <ArrowRight className="w-4 h-4 text-[#C9B3BC] dark:text-[#A78E96] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 mt-1" />
                </div>
                <p className="text-sm leading-relaxed text-[#8C6B79] dark:text-[#EAE0E2] mb-2">Confecciones María Elena</p>
                <div className="text-xs text-[#AD919B] dark:text-[#D3B0BA] font-medium">
                  24 unidades
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="group flex items-start gap-4 p-5 rounded-xl bg-[#FCF8F9] dark:bg-transparent border border-[#F2DEE4] dark:border-[#38202A] hover:border-[#F2778D]/40 dark:hover:border-[#F2778D]/40 hover:bg-white dark:hover:bg-[#321A23] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(242,119,141,0.08)] dark:hover:shadow-[0_4px_15px_rgba(242,119,141,0.08)] cursor-pointer">
              <div className="mt-1">
                <Package className="w-5 h-5 text-[#5B283A] dark:text-[#F2b6c1] group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold font-sans text-[#40202D] dark:text-white">Blusa de Seda</h3>
                    <span className="px-2 py-0.5 bg-white dark:bg-[#40202D] text-[#F2778D] dark:text-[#F2b6c1] rounded text-[10px] font-medium tracking-wide border border-[#F2DEE4] dark:border-[#592633]">
                      Celular de la empresa
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#C9B3BC] dark:text-[#A78E96] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 mt-1" />
                </div>
                <p className="text-sm leading-relaxed text-[#8C6B79] dark:text-[#EAE0E2] mb-2">Textiles del Norte</p>
                <div className="text-xs text-[#AD919B] dark:text-[#D3B0BA] font-medium">
                  18 unidades
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="group flex items-start gap-4 p-5 rounded-xl bg-[#FCF8F9] dark:bg-transparent border border-[#F2DEE4] dark:border-[#38202A] hover:border-[#F2778D]/40 dark:hover:border-[#F2778D]/40 hover:bg-white dark:hover:bg-[#321A23] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(242,119,141,0.08)] dark:hover:shadow-[0_4px_15px_rgba(242,119,141,0.08)] cursor-pointer">
              <div className="mt-1">
                <Scissors className="w-5 h-5 text-[#F2778D] dark:text-[#F2b6c1] group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold font-sans text-[#40202D] dark:text-white">Pantalón de Lino</h3>
                  <ArrowRight className="w-4 h-4 text-[#C9B3BC] dark:text-[#A78E96] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 mt-1" />
                </div>
                <p className="text-sm leading-relaxed text-[#8C6B79] dark:text-[#EAE0E2] mb-2">Taller San José</p>
                <div className="flex flex-col gap-2 mt-3">
                  <span className="text-xs text-[#AD919B] dark:text-[#D3B0BA] font-medium">30 unidades</span>
                  <div className="inline-flex items-center self-start px-2.5 py-1.5 bg-white dark:bg-[#40202D] text-[#5B283A] dark:text-[#F2b6c1] rounded-md text-[11px] font-medium border border-[#F2DEE4] dark:border-[#592633]">
                    Por recoger (producción). Horario: 9am a 6pm
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Órdenes pendientes */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-2xl p-6 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-[#38202A] transition-colors duration-300">
          <div className="flex items-start justify-between mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold font-sans text-[#40202D] dark:text-white">Documentos</h2>
              <h3 className="text-sm font-sans text-[#8C6B79] dark:text-[#C9B3BC] mt-1">Solicitudes de movimiento</h3>
            </div>
            <button className="text-sm font-sans text-[#8C6B79] dark:text-[#EAE0E2] hover:text-[#40202D] dark:hover:text-white font-medium transition-colors mt-1">
              Ver todos
            </button>
          </div>

          <div className="space-y-4">
            {/* Movimiento 1 */}
            <div className="group p-5 rounded-xl bg-[#FCF8F9] dark:bg-transparent border border-[#F2DEE4] dark:border-[#38202A] hover:border-[#F2778D]/40 dark:hover:border-[#F2778D]/40 hover:bg-white dark:hover:bg-[#321A23] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(242,119,141,0.08)] dark:hover:shadow-[0_4px_15px_rgba(242,119,141,0.08)] cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-sans text-[#40202D] dark:text-white">#MOV-0125</span>
                </div>
                <span className="px-2.5 py-1 bg-white dark:bg-[#40202D] text-[#F2778D] dark:text-[#F2b6c1] rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors duration-300 border border-[#F2DEE4] dark:border-transparent">
                  Transferencia interna
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#7A5463] dark:text-[#EAE0E2] mb-4 transition-colors duration-300">
                Vestido Floral (12 uds), Blusa de Seda (8 uds)
              </p>
              <div className="flex justify-between items-center text-xs text-[#AD919B] dark:text-[#D3B0BA] font-medium pt-1 border-t border-[#F2DEE4] dark:border-[#38202A]/50">
                <span>Creado por Ana López</span>
                <span className="text-[#C9B3BC] dark:text-[#A78E96]">Hace 12h</span>
              </div>
            </div>

            {/* Movimiento 2 */}
            <div className="group p-5 rounded-xl bg-[#FCF8F9] dark:bg-transparent border border-[#F2DEE4] dark:border-[#38202A] hover:border-[#F2778D]/40 dark:hover:border-[#F2778D]/40 hover:bg-white dark:hover:bg-[#321A23] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(242,119,141,0.08)] dark:hover:shadow-[0_4px_15px_rgba(242,119,141,0.08)] cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-sans text-[#40202D] dark:text-white">#MOV-0126</span>
                </div>
                <span className="px-2.5 py-1 bg-white dark:bg-[#40202D] text-[#D6405F] dark:text-[#F2778D] rounded-full text-[10px] font-bold tracking-wide uppercase border border-[#F2DEE4] dark:border-transparent transition-colors duration-300">
                  Salida
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#7A5463] dark:text-[#EAE0E2] mb-4 transition-colors duration-300">
                Pantalón de Lino (15 uds)
              </p>
              <div className="flex justify-between items-center text-xs text-[#AD919B] dark:text-[#D3B0BA] font-medium pt-1 border-t border-[#F2DEE4] dark:border-[#38202A]/50">
                <span>Creado por Carlos Ruiz</span>
                <span className="text-[#C9B3BC] dark:text-[#A78E96]">Hace 28h</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
