"use client";

import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

export default function ReceptionsListPage() {
  return (
    <div className="w-full min-h-screen bg-[#FDFBFB] dark:bg-[#100B0D] p-4 pt-24 md:p-8 md:pt-28 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold font-serif text-[#40202D] dark:text-white mb-2">
          Recepciones
        </h1>
        <p className="text-[#8C6B79] dark:text-[#A78E96] mb-8">
          Gestiona todas las órdenes de entrada al almacén.
        </p>

        {/* Dummy List */}
        <div className="bg-white dark:bg-[#1A1114] rounded-2xl p-6 shadow-[0_8px_30px_rgba(242,119,141,0.04)] dark:shadow-none border border-[#F5E6EA] dark:border-[#2A1A20]">
          
          <Link href="/admin/warehouse/receptions/rec-0045" className="group flex items-center justify-between p-4 rounded-xl border border-[#FAF0F3] dark:border-[#38202A] hover:border-[#F2D5DB] dark:hover:border-[#F2778D]/40 hover:bg-[#FDF7F9] dark:hover:bg-[#321A23] transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-[#321A23] flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-[#F2778D] dark:text-[#F2b6c1]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#40202D] dark:text-white">Orden #REC-0045</h3>
                <p className="text-sm text-[#8C6B79] dark:text-[#A78E96]">Confecciones María Elena</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-[#FDF1F3] dark:bg-[#40202D] text-[#D6405F] dark:text-[#F2778D] rounded-full text-xs font-bold tracking-wide border border-rose-100 dark:border-transparent">
                Pendiente
              </span>
              <ArrowRight className="w-5 h-5 text-[#C9B3BC] dark:text-[#A78E96] group-hover:text-[#F2778D] group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
