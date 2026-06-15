"use client";

import { Receipt, Search, Filter, Download, Plus } from "lucide-react";

export default function AdminInvoicePage() {
  const dummyInvoices = [
    { id: "FAC-001-00249", client: "Boutique Elegance SAC", date: "25 Oct 2023", amount: 3500.00, status: "Pagada" },
    { id: "BOL-002-00512", client: "Maria Gómez", date: "26 Oct 2023", amount: 120.50, status: "Pendiente" },
    { id: "FAC-001-00250", client: "Importaciones JL", date: "28 Oct 2023", amount: 8400.00, status: "Vencida" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 w-full transition-colors duration-500">
        <div className="flex-1">
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }} className="mb-2 text-[#8B3A52] opacity-60 dark:text-white dark:opacity-35 font-medium uppercase tracking-widest flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span>FINANZAS</span>
          </div>
          <h1 className="text-[#40202D] dark:text-white leading-none mb-2" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2.5rem', fontWeight: 300 }}>
            Facturas y Boletas
          </h1>
          <p className="text-[#8C6B79] dark:text-white tracking-[0.03em] mt-3" style={{ fontSize: '0.78rem', opacity: 0.45 }}>
            Gestiona los comprobantes de pago emitidos.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            className="rounded-2xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] px-6 py-4 text-[11px] font-medium uppercase tracking-widest text-white shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Emitir Comprobante
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8C6B79] dark:text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por cliente o N° comprobante..." 
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all placeholder:text-[#8C6B79]/50"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none h-14 px-6 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-400 font-medium text-[11px] uppercase tracking-widest hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#40202D] dark:hover:text-white transition-colors shadow-sm flex items-center justify-center gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <main className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-white/70 backdrop-blur-2xl dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-[2rem] overflow-hidden transition-[background-color,border-color] duration-[600ms]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="relative transition-[background-color,border-color] duration-[600ms]">
              <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-medium uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Comprobante</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Cliente</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Fecha Emisión</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Monto Total</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Estado</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)] text-right">Descargar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE0E2]/50 dark:divide-white/5 text-[13px]">
              {dummyInvoices.map((inv, idx) => (
                <tr key={inv.id} className={`transition-colors group/row ${idx % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                  <td className="px-6 py-5 font-medium text-[#40202D] dark:text-white">
                    {inv.id}
                  </td>
                  <td className="px-6 py-5 font-bold text-[#40202D] dark:text-white">
                    {inv.client}
                  </td>
                  <td className="px-6 py-5 font-medium text-[#8C6B79] dark:text-gray-300">
                    {inv.date}
                  </td>
                  <td className="px-6 py-5 font-medium text-[#D6405F] dark:text-[#F8BBD0]">
                    S/ {inv.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest border shadow-sm ${
                      inv.status === 'Pagada' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      inv.status === 'Vencida' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button title="Descargar PDF" className="p-2.5 rounded-xl border border-[#EAE0E2] dark:border-white/10 text-[#D6405F] hover:bg-[#D6405F] hover:text-white transition-all shadow-sm">
                      <Download className="h-4 w-4" />
                    </button>
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
