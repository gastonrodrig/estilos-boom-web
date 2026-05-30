"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Paperclip, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function FinalizeMovementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  // Fake data for the purpose of the UI demo
  const mockData = {
    "MOV-0125": {
      type: "Transferencia Interna",
      typeDescription: "Transferencia a tienda",
      totalProducts: 3,
      totalVariants: 5,
      totalUnits: 12, // Qty a mover
      items: [
        { name: "Blusa Floral", variants: 2, image: "https://via.placeholder.com/40" },
        { name: "Vestido de Verano", variants: 1, image: "https://via.placeholder.com/40" },
        { name: "Pantalón de Lino", variants: 2, image: "https://via.placeholder.com/40" },
      ]
    },
    "MOV-0126": {
      type: "Salida",
      typeDescription: "Salida por Venta Virtual",
      totalProducts: 1,
      totalVariants: 2,
      totalUnits: 15,
      items: [
        { name: "Pantalón de Lino", variants: 2, image: "https://via.placeholder.com/40" },
      ]
    }
  };

  const data = mockData[id as keyof typeof mockData] || mockData["MOV-0125"];
  const [reference, setReference] = useState("");

  const handleFinish = () => {
    toast.success("Movimiento ejecutado y registrado exitosamente.");
    router.push("/admin/warehouse/transfers");
  };

  return (
    <div className="min-h-screen bg-[#F7EEF1] dark:bg-[#150D10] p-4 pt-24 md:p-8 md:pt-28 text-[#333333] dark:text-white font-sans transition-colors duration-300">
      <div className="max-w-[700px] mx-auto">
        
        {/* HEADER */}
        <Link href={`/admin/warehouse/transfers/${id}/confirm`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#594246] dark:text-white mb-12">
          Finalizar orden de movimiento
        </h1>

        {/* DOCUMENTS SECTION */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold font-serif text-[#594246] dark:text-white">Documento que avala este movimiento</h3>
          </div>
          
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full flex items-center gap-1.5 border border-blue-100">
               📄 Guía de traslado
            </span>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <button className="flex-1 min-w-[150px] py-4 px-6 bg-white dark:bg-[#1A1114] border border-[#EBEAE8] dark:border-[#38202A] rounded-2xl flex items-center justify-center gap-3 hover:border-[#F2778D] transition-colors">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-bold text-[#594246] dark:text-gray-300">
                {data.type === "Salida" ? "Subir foto del paquete" : "Subir foto"}
              </span>
            </button>
            
            {data.type !== "Salida" && (
              <button className="flex-1 min-w-[150px] py-4 px-6 bg-white dark:bg-[#1A1114] border border-[#EBEAE8] dark:border-[#38202A] rounded-2xl flex items-center justify-center gap-3 hover:border-[#F2778D] transition-colors">
                <Paperclip className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-bold text-[#594246] dark:text-gray-300">Adjuntar archivo</span>
              </button>
            )}
          </div>

          {data.type !== "Salida" && (
            <>
              <input 
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="O ingresa la referencia (Ej: Factura #0042)"
                className="w-full p-4 bg-white dark:bg-[#1A1114] border border-[#EBEAE8] dark:border-[#38202A] rounded-2xl text-sm font-bold focus:outline-none focus:border-[#F2778D] placeholder:font-normal placeholder:text-gray-400"
              />
              <p className="text-[11px] text-gray-400 font-medium mt-3">
                Si no tienes el documento ahora, puedes agregar la referencia y adjuntarlo después.
              </p>
            </>
          )}

          {/* Opciones Especiales para Salida de Venta */}
          {data.type === "Salida" && (
            <div className="mt-8 p-6 bg-[#FDF1F3] dark:bg-[#321A23] rounded-2xl border border-[#F2DEE4] dark:border-[#592633]">
              <h4 className="text-sm font-bold text-[#D6405F] dark:text-[#F2778D] mb-4">Documentos de Salida (Venta)</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 py-3 px-4 bg-white dark:bg-[#1A1114] text-[#594246] dark:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-md transition-all">
                  <Printer className="w-4 h-4" /> Imprimir Dirección Acordada
                </button>
                <button className="flex-1 py-3 px-4 bg-white dark:bg-[#1A1114] text-[#594246] dark:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-md transition-all">
                  <Printer className="w-4 h-4" /> Imprimir Guía de Remisión
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ORDER SUMMARY CARD */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-[#38202A] mb-8 transition-colors duration-300">
          <h3 className="text-xl font-bold font-serif text-[#594246] dark:text-white mb-6">Resumen de la orden</h3>
          
          <div className="space-y-2 mb-8">
            <p className="text-sm font-bold text-[#594246] dark:text-gray-300">Tipo de movimiento: <span className="font-normal text-gray-500">{data.typeDescription}</span></p>
            <p className="text-sm font-bold text-[#594246] dark:text-gray-300">Total de productos: <span className="font-normal text-gray-500">{data.totalProducts}</span></p>
            <p className="text-sm font-bold text-[#594246] dark:text-gray-300">Total de variantes: <span className="font-normal text-gray-500">{data.totalVariants}</span></p>
            <p className="text-sm font-bold text-[#594246] dark:text-gray-300">Total de unidades a mover: <span className="font-normal text-gray-500">{data.totalUnits}</span></p>
          </div>

          <div className="space-y-4">
            {data.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {/* Using a solid color placeholder instead of actual image for simplicity */}
                  <div className="w-full h-full bg-[#EBEAE8] dark:bg-[#38202A]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#594246] dark:text-white">{item.name}</h4>
                  <p className="text-[11px] text-gray-400 font-medium">{item.variants} variantes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button 
          onClick={handleFinish}
          className="w-full py-4 bg-[#594246] hover:bg-black dark:bg-[#F2778D] dark:hover:bg-[#D6405F] text-white font-bold rounded-2xl shadow-lg transition-all"
        >
          {data.type === "Salida" ? "Ejecutar salida" : "Crear pre-orden"}
        </button>

      </div>
    </div>
  );
}
