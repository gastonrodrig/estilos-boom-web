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
      <main className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-white/70 backdrop-blur-2xl dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-[2rem] overflow-hidden transition-[background-color,border-color] duration-[600ms]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="relative transition-[background-color,border-color] duration-[600ms]">
              <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Código</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Cliente</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Fecha</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Total</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Estado</th>
                <th className="px-6 py-5 text-right border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE0E2]/50 dark:divide-white/5 text-[13px]">
              {dummyQuotations.map((q, idx) => (
                <tr key={q.id} className={`transition-colors group/row ${idx % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
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