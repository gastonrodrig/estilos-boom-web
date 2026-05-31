"use client";

import { FileText, Plus, Search, Eye, Filter, Download } from "lucide-react";
import Link from "next/link";

export default function AdminQuotationsPage() {
  const dummyQuotations = [
    { id: "COT-2023-001", client: "Maria Gómez", date: "15 Oct 2023", total: 1500.00, status: "Aprobada" },
    { id: "COT-2023-002", client: "Tienda La Principal", date: "16 Oct 2023", total: 4250.50, status: "Pendiente" },
    { id: "COT-2023-003", client: "Boutique Elegance", date: "18 Oct 2023", total: 890.00, status: "Rechazada" },
    { id: "COT-2023-004", client: "Juan Pérez", date: "20 Oct 2023", total: 2100.00, status: "Enviada" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#D6405F] dark:text-[#F8BBD0]">
            <FileText className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Ventas</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#40202D] dark:text-white tracking-wide mt-2">Cotizaciones</h1>
          <p className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-300 mt-1">Gestiona los presupuestos emitidos a clientes.</p>
        </div>

        <div className="flex gap-3">
          <Link 
            href="/admin/quotations/add"
            className="rounded-2xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] px-6 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Cotización
          </Link>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8C6B79] dark:text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por cliente o código..." 
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all placeholder:text-[#8C6B79]/50"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none h-14 px-6 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-400 font-black text-[11px] uppercase tracking-widest hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#40202D] dark:hover:text-white transition-colors shadow-sm flex items-center justify-center gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <main className="overflow-hidden rounded-[2rem] border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/30 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 border-b border-[#EAE0E2] dark:border-white/10">
                <th className="px-6 py-5">Código</th>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Fecha</th>
                <th className="px-6 py-5">Total</th>
                <th className="px-6 py-5">Estado</th>
                <th className="px-6 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE0E2]/50 dark:divide-white/5 text-[13px]">
              {dummyQuotations.map((q) => (
                <tr key={q.id} className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5 font-black text-[#40202D] dark:text-white">
                    {q.id}
                  </td>
                  <td className="px-6 py-5 font-bold text-[#40202D] dark:text-white">
                    {q.client}
                  </td>
                  <td className="px-6 py-5 font-medium text-[#8C6B79] dark:text-gray-300">
                    {q.date}
                  </td>
                  <td className="px-6 py-5 font-black text-[#D6405F] dark:text-[#F8BBD0]">
                    S/ {q.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      q.status === 'Aprobada' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      q.status === 'Rechazada' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                      q.status === 'Enviada' ? 'bg-sky-500/10 text-sky-600 border-sky-500/20' :
                      'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button title="Ver Detalle" className="p-2.5 rounded-xl border border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] hover:bg-[#40202D] hover:text-white transition-all shadow-sm">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button title="Descargar PDF" className="p-2.5 rounded-xl border border-[#EAE0E2] dark:border-white/10 text-[#D6405F] hover:bg-[#D6405F] hover:text-white transition-all shadow-sm">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}