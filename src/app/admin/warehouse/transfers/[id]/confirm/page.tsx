"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, ChevronDown, FileText } from "lucide-react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmMovementPage() {
  const params = useParams();
  const id = params.id as string;
  
  // Fake data for the purpose of the UI demo
  const mockData = {
    "MOV-0125": {
      source: "Almacén Principal",
      target: "Tienda Física Centro",
      status: "Pendiente",
      reasons: ["Reposición de tienda", "Inventario bajo"],
      items: [
        { id: "v1", name: "M - Rosa", sku: "VF-M-RSA", expectedQty: 6 },
        { id: "v2", name: "S - Rosa", sku: "VF-S-RSA", expectedQty: 6 },
        { id: "v3", name: "S - Blanco", sku: "VF-S-BLC", expectedQty: 0 },
      ]
    },
    "MOV-0126": {
      source: "Almacén Principal",
      target: "Cliente Final",
      status: "Pendiente",
      reasons: ["Venta mayorista"],
      items: [
        { id: "v4", name: "32 - Beige", sku: "PL-32-BG", expectedQty: 10 },
        { id: "v5", name: "34 - Beige", sku: "PL-34-BG", expectedQty: 5 },
      ]
    }
  };

  const data = mockData[id as keyof typeof mockData] || mockData["MOV-0125"];

  const [realQuantities, setRealQuantities] = useState<Record<string, number>>(
    data.items.reduce((acc, item) => ({ ...acc, [item.id]: item.expectedQty }), {})
  );

  const [incidents, setIncidents] = useState<Record<string, boolean>>({});
  const [showOriginDocs, setShowOriginDocs] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[700px] mx-auto relative z-10"
    >
        
      {/* HEADER */}
      <Link href="/admin/warehouse/transfers" className="inline-flex items-center gap-2 text-sm font-medium text-[#8C6B79] hover:text-[#40202D] dark:text-[#F8BBD0]/80 dark:hover:text-white mb-6 transition-colors tracking-wide">
        <ArrowLeft className="w-4 h-4" /> Volver a órdenes pendientes
      </Link>
      <h1 className="text-3xl md:text-4xl font-medium text-[#40202D] dark:text-white mb-10 tracking-wide drop-shadow-md">
        Confirmar movimiento
      </h1>

      {/* ORDER SUMMARY */}
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl p-6 md:p-8 mb-8 shadow-sm border border-[#EAE0E2] dark:border-white/5 transition-colors duration-300">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm font-medium text-[#8C6B79] dark:text-gray-400 mb-1 tracking-wide">Orden #{id}</p>
            <h2 className="text-xl font-medium text-[#40202D] dark:text-white tracking-wide flex items-center gap-2">
              {data.source} <span className="text-[#8C6B79] dark:text-[#F2778D]/50 mx-1">→</span> {data.target}
            </h2>
          </div>
          <span className="px-4 py-1.5 bg-white/50 dark:bg-[#F2778D]/10 text-[#5B283A] dark:text-[#F8BBD0] text-[11px] font-medium rounded-full border border-[#F2DEE4] dark:border-white/10 shadow-sm tracking-wide">
            {data.status}
          </span>
        </div>

        <div className="mt-6 pt-6 border-t border-[#EAE0E2] dark:border-white/5">
          <p className="text-xs font-medium text-[#8C6B79] dark:text-gray-400 mb-3 tracking-wide">Motivo(s) de la orden</p>
          <div className="flex flex-wrap gap-2">
            {data.reasons.map((r, i) => (
              <span key={i} className="px-3 py-1.5 bg-white/50 dark:bg-white/5 text-[#40202D] dark:text-[#F8BBD0] text-[11px] font-medium tracking-wide rounded-lg border border-[#F2DEE4] dark:border-[#F2778D]/20">
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SUSTENTO / TRAZABILIDAD DE ORIGEN (EXPANDABLE) */}
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl shadow-sm border border-[#EAE0E2] dark:border-white/5 mb-10 overflow-hidden transition-colors duration-300">
        <button 
          onClick={() => setShowOriginDocs(!showOriginDocs)}
          className="w-full px-6 md:px-8 py-5 flex items-center justify-between hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#F23B69] dark:text-[#F8BBD0]" />
            <span className="font-medium text-[15px] text-[#40202D] dark:text-white tracking-wide">Ver Documentos de Sustento (Origen)</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#8C6B79] dark:text-[#F8BBD0] transition-transform duration-300 ${showOriginDocs ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {showOriginDocs && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 md:px-8 pb-8 pt-4 border-t border-[#EAE0E2] dark:border-white/5"
            >
              <p className="text-[13px] text-[#8C6B79] dark:text-gray-400 mb-6 font-medium tracking-wide">
                Estos documentos avalan el ingreso original de los productos al almacén y justifican su existencia para este movimiento de salida.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 rounded-xl transition-colors">
                  <FileText className="w-5 h-5 text-[#3b82f6] dark:text-[#60a5fa]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-medium text-[#8C6B79] dark:text-gray-500 tracking-wide">Orden de Compra</span>
                    <span className="text-[13px] font-medium text-[#40202D] dark:text-white">#OC-0089</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 rounded-xl transition-colors">
                  <FileText className="w-5 h-5 text-[#10b981] dark:text-[#34d399]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-medium text-[#8C6B79] dark:text-gray-500 tracking-wide">Guía de Remisión</span>
                    <span className="text-[13px] font-medium text-[#40202D] dark:text-white">#GR-1452</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 rounded-xl transition-colors">
                  <FileText className="w-5 h-5 text-[#a855f7] dark:text-[#c084fc]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-medium text-[#8C6B79] dark:text-gray-500 tracking-wide">Factura / Boleta</span>
                    <span className="text-[13px] font-medium text-[#40202D] dark:text-white">#F001-334</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* VERIFY QUANTITIES */}
      <h3 className="text-xl md:text-2xl font-medium mb-6 text-[#40202D] dark:text-white tracking-wide">Verificar cantidades</h3>
      
      <div className="space-y-4 mb-10">
        {data.items.map(item => (
          <div key={item.id} className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border border-[#EAE0E2] dark:border-white/5 transition-colors duration-300">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F23B69] dark:bg-[#F8BBD0]" />
                <span className="font-medium text-[15px] text-[#40202D] dark:text-white tracking-wide">{item.name}</span>
              </div>
              <p className="text-xs text-[#8C6B79] dark:text-gray-400 font-mono font-medium ml-4 tracking-wider">{item.sku}</p>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-medium text-[#8C6B79] dark:text-gray-400 mb-2 tracking-wide">Qty a mover</label>
                <div className="w-full p-4 bg-white/50 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/5 rounded-xl text-sm font-medium text-[#8C6B79] dark:text-gray-500 cursor-not-allowed">
                  {item.expectedQty}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8C6B79] dark:text-gray-400 mb-2 tracking-wide">Qty real movida</label>
                <input 
                  type="number"
                  value={realQuantities[item.id]}
                  onChange={(e) => setRealQuantities({...realQuantities, [item.id]: Number(e.target.value)})}
                  className="w-full p-4 bg-white dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-xl text-sm font-medium text-[#40202D] dark:text-white focus:outline-none focus:border-[#F23B69] dark:focus:border-[#F8BBD0] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#EAE0E2] dark:border-white/5">
              <input 
                type="checkbox" 
                id={`incident-${item.id}`}
                checked={incidents[item.id] || false}
                onChange={(e) => setIncidents({...incidents, [item.id]: e.target.checked})}
                className="w-4 h-4 rounded border-[#EAE0E2] dark:border-white/10 text-[#F23B69] dark:text-[#F2778D] focus:ring-[#F23B69] dark:focus:ring-[#F2778D] dark:bg-white/5"
              />
              <label htmlFor={`incident-${item.id}`} className="text-[13px] text-[#8C6B79] dark:text-[#F8BBD0]/80 font-medium tracking-wide cursor-pointer">
                ¿Hubo incidencia en esta variante?
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="flex justify-end pb-12">
        <Link 
          href={`/admin/warehouse/transfers/${id}/finalize`}
          className="py-4 px-10 bg-[#40202D] hover:bg-[#5B283A] dark:bg-[#F2778D] dark:hover:bg-[#F8BBD0] text-white dark:text-[#1A0B11] text-sm font-medium rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_15px_rgba(242,119,141,0.2)] transition-all tracking-wide"
        >
          Siguiente paso
        </Link>
      </div>

    </motion.div>
  );
}
