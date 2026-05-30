"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Paperclip, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[700px] mx-auto relative z-10"
    >
        
      {/* HEADER */}
      <Link href={`/admin/warehouse/transfers/${id}/confirm`} className="inline-flex items-center gap-2 text-sm font-bold text-[#8C6B79] hover:text-[#40202D] dark:text-[#F8BBD0]/80 dark:hover:text-white mb-6 transition-colors tracking-wide">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#40202D] dark:text-white mb-10 tracking-wide drop-shadow-md">
        Finalizar orden de movimiento
      </h1>

      {/* DOCUMENTS SECTION */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-serif text-[#40202D] dark:text-white tracking-wide">Documento que avala este movimiento</h3>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          <span className="px-4 py-1.5 bg-[#FCF8F9] dark:bg-[#F2778D]/10 text-[#40202D] dark:text-[#F8BBD0] text-[11px] font-bold rounded-full flex items-center gap-2 border border-[#F2DEE4] dark:border-[#F2778D]/30 shadow-sm tracking-wide">
             📄 Guía de traslado
          </span>
        </div>

        <div className="flex flex-wrap gap-4 mb-5">
          <button className="flex-1 min-w-[150px] py-4 px-6 bg-white/90 dark:bg-black/30 backdrop-blur-md border border-[#EAE0E2] dark:border-[#F2778D]/25 rounded-2xl flex items-center justify-center gap-3 hover:border-[#F23B69] dark:hover:border-[#F8BBD0] transition-colors shadow-sm">
            <ImageIcon className="w-5 h-5 text-[#8C6B79] dark:text-[#F8BBD0]" />
            <span className="text-sm font-bold text-[#40202D] dark:text-white tracking-wide">
              {data.type === "Salida" ? "Subir foto del paquete" : "Subir foto"}
            </span>
          </button>
          
          {data.type !== "Salida" && (
            <button className="flex-1 min-w-[150px] py-4 px-6 bg-white/90 dark:bg-black/30 backdrop-blur-md border border-[#EAE0E2] dark:border-[#F2778D]/25 rounded-2xl flex items-center justify-center gap-3 hover:border-[#F23B69] dark:hover:border-[#F8BBD0] transition-colors shadow-sm">
              <Paperclip className="w-5 h-5 text-[#8C6B79] dark:text-[#F8BBD0]" />
              <span className="text-sm font-bold text-[#40202D] dark:text-white tracking-wide">Adjuntar archivo</span>
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
              className="w-full p-4 bg-white/90 dark:bg-black/30 backdrop-blur-md border border-[#EAE0E2] dark:border-[#F2778D]/25 rounded-2xl text-sm font-bold text-[#40202D] dark:text-white focus:outline-none focus:border-[#F23B69] dark:focus:border-[#F8BBD0] placeholder:font-medium placeholder:text-[#8C6B79] dark:placeholder:text-[#F8BBD0]/40 transition-colors shadow-sm"
            />
            <p className="text-[12px] text-[#8C6B79] dark:text-gray-400 font-medium mt-3 tracking-wide">
              Si no tienes el documento ahora, puedes agregar la referencia y adjuntarlo después.
            </p>
          </>
        )}

        {/* Opciones Especiales para Salida de Venta */}
        {data.type === "Salida" && (
          <div className="mt-8 p-6 bg-[#FCF8F9] dark:bg-[#1A0B11]/60 backdrop-blur-2xl rounded-3xl border border-[#F2DEE4] dark:border-[#F2778D]/25 shadow-sm">
            <h4 className="text-sm font-bold text-[#D6405F] dark:text-[#F8BBD0] mb-4 tracking-wide">Documentos de Salida (Venta)</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 py-3.5 px-4 bg-white dark:bg-black/40 border border-[#EAE0E2] dark:border-[#F2778D]/15 text-[#40202D] dark:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:border-[#F23B69] dark:hover:border-[#F8BBD0] transition-colors shadow-sm tracking-wide">
                <Printer className="w-4 h-4 text-[#8C6B79] dark:text-[#F8BBD0]" /> Imprimir Dirección
              </button>
              <button className="flex-1 py-3.5 px-4 bg-white dark:bg-black/40 border border-[#EAE0E2] dark:border-[#F2778D]/15 text-[#40202D] dark:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:border-[#F23B69] dark:hover:border-[#F8BBD0] transition-colors shadow-sm tracking-wide">
                <Printer className="w-4 h-4 text-[#8C6B79] dark:text-[#F8BBD0]" /> Imprimir Guía
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ORDER SUMMARY CARD */}
      <div className="bg-white/90 dark:bg-[#1A0B11]/60 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-sm border border-[#EAE0E2] dark:border-[#F2778D]/25 mb-10 transition-colors duration-300">
        <h3 className="text-xl font-bold font-serif text-[#40202D] dark:text-white mb-6 tracking-wide drop-shadow-sm">Resumen de la orden</h3>
        
        <div className="space-y-3 mb-8">
          <p className="text-sm font-bold text-[#40202D] dark:text-gray-300 tracking-wide">Tipo de movimiento: <span className="font-medium text-[#8C6B79] dark:text-gray-400 ml-1">{data.typeDescription}</span></p>
          <p className="text-sm font-bold text-[#40202D] dark:text-gray-300 tracking-wide">Total de productos: <span className="font-medium text-[#8C6B79] dark:text-gray-400 ml-1">{data.totalProducts}</span></p>
          <p className="text-sm font-bold text-[#40202D] dark:text-gray-300 tracking-wide">Total de variantes: <span className="font-medium text-[#8C6B79] dark:text-gray-400 ml-1">{data.totalVariants}</span></p>
          <p className="text-sm font-bold text-[#40202D] dark:text-gray-300 tracking-wide">Total de unidades a mover: <span className="font-medium text-[#8C6B79] dark:text-gray-400 ml-1">{data.totalUnits}</span></p>
        </div>

        <div className="space-y-5 border-t border-[#EAE0E2] dark:border-[#F2778D]/15 pt-6">
          {data.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white dark:bg-black/30 border border-[#EAE0E2] dark:border-[#F2778D]/15 rounded-xl overflow-hidden shrink-0 shadow-sm" />
              <div>
                <h4 className="text-sm font-bold text-[#40202D] dark:text-white tracking-wide">{item.name}</h4>
                <p className="text-[12px] text-[#8C6B79] dark:text-gray-400 font-medium tracking-wide mt-0.5">{item.variants} variantes</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="pb-12">
        <button 
          onClick={handleFinish}
          className="w-full py-4 bg-[#40202D] hover:bg-[#5B283A] dark:bg-[#F2778D] dark:hover:bg-[#F8BBD0] text-white dark:text-[#1A0B11] text-sm font-bold tracking-wide rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_15px_rgba(242,119,141,0.2)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_25px_rgba(242,119,141,0.3)] transition-all"
        >
          {data.type === "Salida" ? "Ejecutar salida" : "Crear pre-orden"}
        </button>
      </div>

    </motion.div>
  );
}
