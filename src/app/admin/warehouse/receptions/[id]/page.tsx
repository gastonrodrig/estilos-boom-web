"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Camera, Check, ChevronDown, FileText, Home } from "lucide-react";

export default function ReceptionConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Estado para las variantes y sus incidencias
  const [variants, setVariants] = useState([
    {
      id: "var-1",
      size: "M",
      color: "Rosa",
      colorCode: "#D6405F",
      sku: "VF-M-RSA",
      qtyOrdered: 6,
      qtyReceived: 6,
      hasIncidence: true,
      incidenceReason: "",
      incidenceCustomReason: "",
      incidenceQty: 0,
      incidencePhoto: null
    },
    {
      id: "var-2",
      size: "S",
      color: "Rosa",
      colorCode: "#D6405F",
      sku: "VF-S-RSA",
      qtyOrdered: 4,
      qtyReceived: 4,
      hasIncidence: false,
      incidenceReason: "",
      incidenceCustomReason: "",
      incidenceQty: 0,
      incidencePhoto: null
    }
  ]);

  const incidenceOptions = [
    "Prenda dañada",
    "Faltó unidad",
    "Talla incorrecta",
    "Color incorrecto",
    "Prenda con mancha",
    "Costura defectuosa",
    "Otro motivo"
  ];

  const handleVariantChange = (id: string, field: string, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (isConfirmed) {
    return (
      <div className="w-full min-h-screen bg-[#F7EEF1] dark:bg-transparent flex items-center justify-center p-4 font-sans transition-colors duration-300">
        <div className="bg-white dark:bg-black/50 backdrop-blur-2xl rounded-2xl p-8 md:p-12 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-white/5 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-[#FDF1F3] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-[#D6405F] dark:text-[#F2778D]" />
          </div>
          
          <h1 className="text-2xl font-bold font-serif text-[#5B283A] dark:text-[#Fdfcfc] mb-2 transition-colors duration-300">¡Recepción confirmada!</h1>
          <p className="text-[#844C60] dark:text-[#C9B3BC] text-sm mb-8 transition-colors duration-300 leading-relaxed">
            La recepción <span className="font-bold text-[#40202D] dark:text-white">#{id.toUpperCase()}</span> ha sido procesada exitosamente.
          </p>

          <div className="bg-[#FCF8F9] dark:bg-white/5 border border-[#EEDCE1] dark:border-white/5 rounded-xl p-5 text-left mb-8">
            <h3 className="font-bold text-[#40202D] dark:text-white mb-4 text-[13px] uppercase tracking-wider">Resumen de operación</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-[#844C60] dark:text-[#C9B3BC] font-medium text-[13px]">Producto:</span>
                <span className="text-[#40202D] dark:text-white font-bold">Vestido Floral</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-[#844C60] dark:text-[#C9B3BC] font-medium text-[13px]">Proveedor:</span>
                <span className="text-[#40202D] dark:text-white font-bold">Confecciones María Elena</span>
              </li>
              <li className="flex justify-between items-center pt-3 border-t border-[#EEDCE1] dark:border-white/10">
                <span className="text-[#844C60] dark:text-[#C9B3BC] font-medium text-[13px]">Total unidades:</span>
                <span className="text-[#D6405F] dark:text-[#F2778D] font-bold text-lg">10</span>
              </li>
            </ul>
          </div>

          <Link href="/admin/warehouse/dashboard" className="w-full flex items-center justify-center gap-2 bg-[#FCF8F9] dark:bg-white/5 border border-[#EEDCE1] dark:border-white/5 hover:border-[#F2778D] hover:bg-white dark:hover:bg-white/10 rounded-xl px-6 py-3.5 text-[#40202D] dark:text-white font-medium transition-all duration-300 transform hover:-translate-y-1">
            <Home className="w-4 h-4" />
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F7EEF1] dark:bg-transparent p-4 pt-24 md:p-8 md:pt-28 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* TOP NAV */}
        <Link 
          href="/admin/warehouse/receptions" 
          className="inline-flex items-center gap-2 text-[13px] font-bold tracking-wide uppercase text-[#844C60] dark:text-[#C9B3BC] hover:text-[#40202D] dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a recepciones
        </Link>

        {/* PAGE TITLE */}
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-[#5B283A] dark:text-[#Fdfcfc] mb-8 transition-colors duration-300">
          Confirmar recepción
        </h1>

        {/* HEADER CARD */}
        <div className="bg-white dark:bg-black/50 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-white/5 mb-8 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#40202D] dark:text-white">Orden #{id.toUpperCase()}</h2>
              <p className="text-[14px] text-[#844C60] dark:text-[#C9B3BC] mt-1.5 font-medium flex items-center gap-2">
                Confecciones María Elena <ArrowLeft className="w-3 h-3 rotate-180 text-[#D6405F]" /> Almacén Principal
              </p>
            </div>
            <span className="px-4 py-1.5 bg-[#FDF1F3] dark:bg-[#40202D] text-[#D6405F] dark:text-[#F2b6c1] rounded-full text-[11px] uppercase tracking-wider font-bold border border-[#F2DEE4] dark:border-[#592633] self-start md:self-auto">
              Pendiente
            </span>
          </div>
        </div>

        {/* PURCHASE ORDER (EXPANDABLE) */}
        <div className="bg-white dark:bg-black/50 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-white/5 mb-8 overflow-hidden transition-colors duration-300">
          <button 
            onClick={() => setShowPurchaseOrder(!showPurchaseOrder)}
            className="w-full px-6 md:px-8 py-5 flex items-center justify-between hover:bg-[#FCF8F9] dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#D6405F] dark:text-[#F2B6C1]" />
              <span className="font-bold text-[15px] text-[#40202D] dark:text-white">Ver Orden de Compra Original</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-[#844C60] dark:text-[#F2B6C1] transition-transform duration-300 ${showPurchaseOrder ? 'rotate-180' : ''}`} />
          </button>
          
          {showPurchaseOrder && (
            <div className="px-6 md:px-8 pb-8 pt-4 border-t border-[#EEDCE1] dark:border-white/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-1.5">Proveedor</p>
                  <p className="text-[14px] font-bold text-[#40202D] dark:text-white">Confecciones María Elena</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-1.5">Fecha de emisión</p>
                  <p className="text-[14px] font-bold text-[#40202D] dark:text-white">25 Mayo 2026</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-1.5">Total unidades</p>
                  <p className="text-[14px] font-bold text-[#40202D] dark:text-white">10 unds.</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-1.5">Elaborado por</p>
                  <p className="text-[14px] font-bold text-[#40202D] dark:text-white">Ana López</p>
                </div>
              </div>
              <div className="bg-[#FCF8F9] dark:bg-white/5 rounded-xl p-5 border border-[#EEDCE1] dark:border-white/5">
                <p className="text-[11px] font-bold text-[#844C60] dark:text-[#C9B3BC] mb-3 uppercase tracking-wider">Artículos solicitados (Sin precios)</p>
                <ul className="space-y-3 text-[14px] text-[#40202D] dark:text-[#EAE0E2] font-medium">
                  <li className="flex justify-between items-center border-b border-[#EEDCE1] dark:border-white/5 pb-3 last:border-0 last:pb-0">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#D6405F] dark:bg-[#F2778D]"></div>
                      Vestido Floral (M Rosa)
                    </span> 
                    <span className="font-bold text-[#40202D] dark:text-white">6 unds.</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-[#EEDCE1] dark:border-white/5 pb-3 last:border-0 last:pb-0">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#D6405F] dark:bg-[#F2778D]"></div>
                      Vestido Floral (S Rosa)
                    </span> 
                    <span className="font-bold text-[#40202D] dark:text-white">4 unds.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* VERIFICAR CANTIDADES */}
        <h3 className="text-xl font-bold font-sans text-[#40202D] dark:text-white mb-5">Verificar cantidades</h3>
        
        <div className="space-y-5 mb-12">
          {variants.map((variant) => (
            <div key={variant.id} className="bg-white dark:bg-black/50 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-white/5 transition-colors duration-300">
              
              {/* Variant Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3.5 h-3.5 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: variant.colorCode }} />
                <span className="text-[17px] font-bold text-[#40202D] dark:text-white tracking-tight">{variant.size} · {variant.color}</span>
              </div>
              <p className="text-[12px] uppercase tracking-widest text-[#844C60] dark:text-[#C9B3BC] mb-6 font-bold">{variant.sku}</p>
              
              {/* Inputs */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-2">Cantidad ordenada</label>
                  <input 
                    type="number" 
                    value={variant.qtyOrdered}
                    readOnly
                    className="w-full bg-[#FCF8F9] dark:bg-white/5 border border-[#EEDCE1] dark:border-white/5 rounded-xl px-4 py-3 text-[15px] text-[#40202D] dark:text-white font-medium outline-none opacity-80"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#5B283A] dark:text-[#F2b6c1] mb-2">Cantidad real recibida</label>
                  <input 
                    type="number" 
                    value={variant.qtyReceived}
                    onChange={(e) => handleVariantChange(variant.id, "qtyReceived", parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-white/5 border border-[#EEDCE1] dark:border-white/10 rounded-xl px-4 py-3 text-[15px] text-[#D6405F] dark:text-[#F2778D] font-medium outline-none focus:border-[#D6405F] dark:focus:border-[#F2778D] transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Checkbox Incidencia */}
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${variant.hasIncidence ? 'bg-[#D6405F] dark:bg-[#F2778D] border-[#D6405F] dark:border-[#F2778D]' : 'bg-[#FCF8F9] dark:bg-white/5 border-[#EEDCE1] dark:border-white/10 group-hover:border-[#D6405F]'}`}>
                  {variant.hasIncidence && <Check className="w-3.5 h-3.5 text-white dark:text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={variant.hasIncidence}
                  onChange={(e) => handleVariantChange(variant.id, "hasIncidence", e.target.checked)}
                />
                <span className="text-[14px] font-bold text-[#40202D] dark:text-white">¿Hubo incidencia con esta variante?</span>
              </label>

              {/* Incidencia Detalles (Expandible) */}
              {variant.hasIncidence && (
                <div className="mt-6 pl-5 md:pl-6 border-l-2 border-[#D6405F]/30 dark:border-[#F2778D]/30">
                  <p className="text-[13px] font-bold text-[#5B283A] dark:text-[#F2b6c1] mb-3 uppercase tracking-wider">Detalle del problema</p>
                  
                  <div className="flex flex-wrap gap-2.5 mb-6">
                    {incidenceOptions.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => handleVariantChange(variant.id, "incidenceReason", opt)}
                        className={`px-4 py-2 rounded-lg text-[13px] font-bold border transition-all ${
                          variant.incidenceReason === opt 
                            ? 'bg-[#D6405F] dark:bg-[#F2778D] border-[#D6405F] dark:border-[#F2778D] text-white shadow-md' 
                            : 'bg-white dark:bg-white/5 border-[#EEDCE1] dark:border-white/10 text-[#844C60] dark:text-[#C9B3BC] hover:border-[#D6405F] dark:hover:border-[#F2778D] hover:text-[#D6405F] dark:hover:text-[#F2778D]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {variant.incidenceReason === "Otro motivo" && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-2">Especifique el motivo</label>
                      <input 
                        type="text" 
                        value={variant.incidenceCustomReason}
                        onChange={(e) => handleVariantChange(variant.id, "incidenceCustomReason", e.target.value)}
                        placeholder="Ej. La caja llegó rota y con olor a humedad"
                        className="w-full bg-white dark:bg-white/5 border border-[#EEDCE1] dark:border-white/10 rounded-xl px-4 py-3 text-[14px] text-[#40202D] dark:text-white outline-none focus:border-[#D6405F] transition-colors placeholder:text-[#EEDCE1] dark:placeholder:text-white/20"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-2">Unidades afectadas</label>
                      <input 
                        type="number" 
                        value={variant.incidenceQty}
                        onChange={(e) => handleVariantChange(variant.id, "incidenceQty", parseInt(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-white/5 border border-[#EEDCE1] dark:border-white/10 rounded-xl px-4 py-3 text-[15px] text-[#D6405F] dark:text-[#F2778D] font-medium outline-none focus:border-[#D6405F]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-2">Fotografía (Obligatorio)</label>
                      <button className="w-full flex items-center justify-center gap-2 bg-[#FCF8F9] dark:bg-white/5 border border-dashed border-[#D6405F] dark:border-[#F2778D] hover:bg-[#FDF1F3] dark:hover:bg-white/10 rounded-xl px-4 py-3 text-[#D6405F] dark:text-[#F2778D] text-[14px] font-medium transition-colors">
                        <Camera className="w-4 h-4" />
                        Subir foto evidencia
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* EVIDENCIAS GLOBALES */}
        <h3 className="text-xl font-bold font-sans text-[#40202D] dark:text-white mb-5">Evidencias documentales</h3>
        
        <div className="bg-white dark:bg-black/50 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-white/5 mb-10 transition-colors duration-300">
          <p className="text-[14px] leading-relaxed text-[#844C60] dark:text-[#C9B3BC] mb-6 font-medium">
            Para finalizar la recepción, es obligatorio adjuntar la siguiente documentación. La <strong className="text-[#40202D] dark:text-white">Orden de Compra</strong> ya se encuentra registrada en el sistema.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Foto General */}
            <div className="flex flex-col items-center justify-center p-8 bg-[#FCF8F9] dark:bg-white/5 border border-dashed border-[#EEDCE1] dark:border-white/10 hover:border-[#D6405F] dark:hover:border-[#F2778D] rounded-xl cursor-pointer transition-colors group">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-[#F2778D]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Camera className="w-6 h-6 text-[#844C60] dark:text-[#C9B3BC] group-hover:text-[#D6405F] dark:group-hover:text-[#F2778D]" />
              </div>
              <span className="text-[15px] font-bold text-[#40202D] dark:text-white text-center mb-1.5">Foto de Recepción</span>
              <span className="text-[12px] text-[#844C60] dark:text-[#C9B3BC] text-center font-medium">Evidencia visual general de la carga</span>
            </div>

            {/* Boleta */}
            <div className="flex flex-col items-center justify-center p-8 bg-[#FCF8F9] dark:bg-white/5 border border-dashed border-[#EEDCE1] dark:border-white/10 hover:border-[#D6405F] dark:hover:border-[#F2778D] rounded-xl cursor-pointer transition-colors group">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-[#F2778D]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <UploadCloud className="w-6 h-6 text-[#844C60] dark:text-[#C9B3BC] group-hover:text-[#D6405F] dark:group-hover:text-[#F2778D]" />
              </div>
              <span className="text-[15px] font-bold text-[#40202D] dark:text-white text-center mb-1.5">Boleta / Guía de Remisión</span>
              <span className="text-[12px] text-[#844C60] dark:text-[#C9B3BC] text-center font-medium">Sube en formato PDF o Imagen JPG/PNG</span>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pb-12">
          <button 
            onClick={() => setIsConfirmed(true)}
            className="bg-[#5B283A] hover:bg-[#40202D] dark:bg-[#F2778D] dark:hover:bg-[#D6405F] text-white rounded-xl px-10 py-4 text-[15px] font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:ring-4 focus:ring-[#D6405F]/20"
          >
            Confirmar Recepción Definitiva
          </button>
        </div>

      </div>
    </div>
  );
}
