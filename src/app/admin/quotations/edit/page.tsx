"use client";

import { Edit3 } from "lucide-react";

export default function AdminQuotationsEditPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 transition-colors duration-500 min-h-[calc(100vh-100px)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#D6405F] dark:text-[#F8BBD0] mb-2">
            <Edit3 className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Cotizaciones</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#40202D] dark:text-white tracking-wide">Editar Cotización</h1>
          <p className="text-sm font-medium text-[#8C6B79] dark:text-gray-300 mt-1">Aquí podrás modificar una cotización existente.</p>
        </div>
      </header>

      {/* Main Container Placeholder */}
      <main className="rounded-[32px] border border-[#EAE0E2] dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl shadow-sm p-8 transition-all min-h-[400px] flex items-center justify-center">
         <div className="text-center space-y-4">
             <div className="bg-white/50 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center shadow-inner mx-auto">
                 <Edit3 className="h-10 w-10 text-[#8C6B79] dark:text-gray-500" />
             </div>
             <p className="text-[#8C6B79] dark:text-gray-400 font-medium tracking-wide">Módulo para editar cotización listo para implementación.</p>
         </div>
      </main>
    </div>
  );
}
