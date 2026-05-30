"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, ChevronDown, FileText } from "lucide-react";
import { useParams } from "next/navigation";

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
    <div className="min-h-screen bg-[#F7EEF1] dark:bg-[#150D10] p-4 pt-24 md:p-8 md:pt-28 text-[#333333] dark:text-white font-sans transition-colors duration-300">
      <div className="max-w-[700px] mx-auto">
        
        {/* HEADER */}
        <Link href="/admin/warehouse/transfers" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a órdenes pendientes
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#333333] dark:text-white mb-8">
          Confirmar movimiento
        </h1>

        {/* ORDER SUMMARY */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-2xl p-6 mb-8 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-[#38202A] transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Orden #{id}</p>
              <h2 className="text-lg font-bold">{data.source} <span className="text-gray-400 mx-1">→</span> {data.target}</h2>
            </div>
            <span className="px-3 py-1 bg-gray-100 dark:bg-[#321A23] text-gray-600 dark:text-gray-300 text-[11px] font-bold rounded-full">
              {data.status}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Motivo(s) de la orden</p>
            <div className="flex flex-wrap gap-2">
              {data.reasons.map((r, i) => (
                <span key={i} className="px-3 py-1 bg-[#FAF9F6] dark:bg-[#201519] text-gray-600 dark:text-gray-300 text-[11px] font-bold rounded-md">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SUSTENTO / TRAZABILIDAD DE ORIGEN (EXPANDABLE) */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-2xl shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-[#38202A] mb-8 overflow-hidden transition-colors duration-300">
          <button 
            onClick={() => setShowOriginDocs(!showOriginDocs)}
            className="w-full px-6 md:px-8 py-5 flex items-center justify-between hover:bg-[#FCF8F9] dark:hover:bg-[#201519] transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#D6405F] dark:text-[#F2B6C1]" />
              <span className="font-bold text-[15px] text-[#40202D] dark:text-white">Ver Documentos de Sustento (Origen)</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-[#844C60] dark:text-[#F2B6C1] transition-transform duration-300 ${showOriginDocs ? 'rotate-180' : ''}`} />
          </button>
          
          {showOriginDocs && (
            <div className="px-6 md:px-8 pb-8 pt-4 border-t border-[#EEDCE1] dark:border-[#38202A]">
              <p className="text-[13px] text-[#844C60] dark:text-[#C9B3BC] mb-6 font-medium">
                Estos documentos avalan el ingreso original de los productos al almacén y justifican su existencia para este movimiento de salida.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#FCF8F9] dark:bg-[#150D10] border border-[#EEDCE1] dark:border-[#38202A] rounded-xl transition-colors">
                  <FileText className="w-5 h-5 text-[#3b82f6] dark:text-[#60a5fa]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#844C60] dark:text-[#C9B3BC]">Orden de Compra</span>
                    <span className="text-[13px] font-bold text-[#40202D] dark:text-white">#OC-0089</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-[#FCF8F9] dark:bg-[#150D10] border border-[#EEDCE1] dark:border-[#38202A] rounded-xl transition-colors">
                  <FileText className="w-5 h-5 text-[#10b981] dark:text-[#34d399]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#844C60] dark:text-[#C9B3BC]">Guía de Remisión</span>
                    <span className="text-[13px] font-bold text-[#40202D] dark:text-white">#GR-1452</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-[#FCF8F9] dark:bg-[#150D10] border border-[#EEDCE1] dark:border-[#38202A] rounded-xl transition-colors">
                  <FileText className="w-5 h-5 text-[#a855f7] dark:text-[#c084fc]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#844C60] dark:text-[#C9B3BC]">Factura / Boleta</span>
                    <span className="text-[13px] font-bold text-[#40202D] dark:text-white">#F001-334</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* VERIFY QUANTITIES */}
        <h3 className="text-lg font-bold font-serif mb-4">Verificar cantidades</h3>
        
        <div className="space-y-4 mb-8">
          {data.items.map(item => (
            <div key={item.id} className="bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-2xl p-6 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-[#38202A] transition-colors duration-300">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#B53E5C]" />
                  <span className="font-bold text-[15px]">{item.name}</span>
                </div>
                <p className="text-xs text-gray-400 font-mono font-medium ml-5">{item.sku}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Qty a mover</label>
                  <div className="w-full p-3 bg-[#FAF9F6] dark:bg-[#201519] rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed">
                    {item.expectedQty}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Qty real movida</label>
                  <input 
                    type="number"
                    value={realQuantities[item.id]}
                    onChange={(e) => setRealQuantities({...realQuantities, [item.id]: Number(e.target.value)})}
                    className="w-full p-3 bg-white dark:bg-[#1A1114] border border-[#F5E6EA] dark:border-[#38202A] rounded-xl text-sm font-bold focus:outline-none focus:border-[#D6405F]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id={`incident-${item.id}`}
                  checked={incidents[item.id] || false}
                  onChange={(e) => setIncidents({...incidents, [item.id]: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-[#B53E5C] focus:ring-[#B53E5C]"
                />
                <label htmlFor={`incident-${item.id}`} className="text-[13px] text-gray-500 font-medium">
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
            className="py-3.5 px-8 bg-[#333333] hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black text-sm font-bold rounded-full transition-colors"
          >
            Siguiente
          </Link>
        </div>

      </div>
    </div>
  );
}
