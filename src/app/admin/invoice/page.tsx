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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#D6405F] dark:text-[#F8BBD0]">
            <Receipt className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Finanzas</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#40202D] dark:text-white tracking-wide mt-2">Facturas y Boletas</h1>
          <p className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-300 mt-1">Gestiona los comprobantes de pago emitidos.</p>
        </div>

        <div className="flex gap-3">
          <button 
            className="rounded-2xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] px-6 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
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
                <th className="px-6 py-5">Comprobante</th>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Fecha Emisión</th>
                <th className="px-6 py-5">Monto Total</th>
                <th className="px-6 py-5">Estado</th>
                <th className="px-6 py-5 text-right">Descargar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE0E2]/50 dark:divide-white/5 text-[13px]">
              {dummyInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5 font-black text-[#40202D] dark:text-white">
                    {inv.id}
                  </td>
                  <td className="px-6 py-5 font-bold text-[#40202D] dark:text-white">
                    {inv.client}
                  </td>
                  <td className="px-6 py-5 font-medium text-[#8C6B79] dark:text-gray-300">
                    {inv.date}
                  </td>
                  <td className="px-6 py-5 font-black text-[#D6405F] dark:text-[#F8BBD0]">
                    S/ {inv.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border shadow-sm ${
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
