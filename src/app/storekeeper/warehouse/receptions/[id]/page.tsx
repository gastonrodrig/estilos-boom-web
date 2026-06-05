"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, Camera, Check, ChevronDown, FileText, Home, AlertTriangle } from "lucide-react";
import { useStorehouseStore } from "@/hooks";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const INCIDENCE_OPTIONS = [
  "Prenda dañada",
  "Faltó unidad",
  "Talla incorrecta",
  "Color incorrecto",
  "Prenda con mancha",
  "Costura defectuosa",
  "Otro motivo"
];

export default function ReceptionConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { 
    startLoadingWarehouseDocuments, 
    startProcessWarehouseDocument, 
    startUploadWarehouseDocAttachments,
    loading 
  } = useStorehouseStore();

  const [doc, setDoc] = useState<any>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [incidents, setIncidents] = useState<Record<string, boolean>>({});
  const [incidentReasons, setIncidentReasons] = useState<Record<string, string>>({});
  const [incidentCustomReasons, setIncidentCustomReasons] = useState<Record<string, string>>({});
  const [incidentQtys, setIncidentQtys] = useState<Record<string, number>>({});
  const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Estados locales para nombres (UI)
  const [incidentPhotos, setIncidentPhotos] = useState<Record<string, string>>({});
  const [receptionPhotoName, setReceptionPhotoName] = useState<string>("");
  const [invoiceFileName, setInvoiceFileName] = useState<string>("");

  // Estados locales para los objetos File reales
  const [incidentPhotoFiles, setIncidentPhotoFiles] = useState<Record<string, File>>({});
  const [receptionPhotoFile, setReceptionPhotoFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await startLoadingWarehouseDocuments();
      if (Array.isArray(data)) {
        const found = data.find((d) => d._id === id);
        if (found) {
          setDoc(found);
          // Inicializar cantidades recibidas con los esperados
          const initialQty: Record<string, number> = {};
          const initialInc: Record<string, boolean> = {};
          const initialReason: Record<string, string> = {};
          const initialCustom: Record<string, string> = {};
          const initialQtyInc: Record<string, number> = {};

          (found.items ?? []).forEach((item: any, idx: number) => {
            const vId = (item.id_variant && typeof item.id_variant === "object") ? item.id_variant._id : (item.id_variant || item._id || idx.toString());
            initialQty[vId] = item.quantity_expected ?? 0;
            initialInc[vId] = false;
            initialReason[vId] = "";
            initialCustom[vId] = "";
            initialQtyInc[vId] = 0;
          });
          setQuantities(initialQty);
          setIncidents(initialInc);
          setIncidentReasons(initialReason);
          setIncidentCustomReasons(initialCustom);
          setIncidentQtys(initialQtyInc);
        }
      }
    };
    void load();
  }, [id, startLoadingWarehouseDocuments]);

  const handleConfirm = async () => {
    if (!doc) return;

    // 1. Subir archivos de evidencia primero si existen
    const filesToUpload: File[] = [];
    if (receptionPhotoFile) filesToUpload.push(receptionPhotoFile);
    if (invoiceFile) filesToUpload.push(invoiceFile);
    Object.values(incidentPhotoFiles).forEach((file) => {
      if (file) filesToUpload.push(file);
    });

    if (filesToUpload.length > 0) {
      const uploadToast = toast.loading("Subiendo archivos y evidencias al servidor...");
      try {
        await startUploadWarehouseDocAttachments(doc._id, filesToUpload);
        toast.dismiss(uploadToast);
      } catch (err) {
        toast.dismiss(uploadToast);
        toast.error("Error al subir evidencias. Inténtalo nuevamente.");
        return;
      }
    }

    // 2. Procesar el documento de almacén
    const workerId =
      (typeof window !== "undefined" ? localStorage.getItem("worker_id") ?? "" : "") ||
      "000000000000000000000001";

    const items = (doc.items ?? []).map((item: any, idx: number) => {
      const vId = (item.id_variant && typeof item.id_variant === "object") ? item.id_variant._id : (item.id_variant || item._id || idx.toString());
      const isIncident = incidents[vId];
      let note = "";
      if (isIncident) {
        const reason = incidentReasons[vId] || "Otro motivo";
        note = reason === "Otro motivo" 
          ? (incidentCustomReasons[vId] || "Sin detalle")
          : reason;
        const qtyInc = incidentQtys[vId] || 0;
        if (qtyInc > 0) {
          note += ` (${qtyInc} unds afectadas)`;
        }
        if (incidentPhotos[vId]) {
          note += ` [Evidencia: ${incidentPhotos[vId]}]`;
        }
      }

      return {
        id_variant: vId,
        quantity_received: quantities[vId] ?? item.quantity_expected ?? 0,
        incidence_note: note,
      };
    });

    const success = await startProcessWarehouseDocument(doc._id, workerId, items);
    if (success) {
      setIsConfirmed(true);
    }
  };

  const handleIncidentPhotoChange = (vId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIncidentPhotos((prev) => ({ ...prev, [vId]: file.name }));
      setIncidentPhotoFiles((prev) => ({ ...prev, [vId]: file }));
      toast.success(`Foto "${file.name}" cargada para esta variante.`);
    }
  };

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8C6B79] text-sm italic">Cargando documento…</p>
      </div>
    );
  }

  const srcName = doc.id_source_warehouse?.name?.replace(/_/g, " ") ?? "Proveedor externo";
  const tgtName = doc.id_target_warehouse?.name?.replace(/_/g, " ") ?? "Almacén Principal";
  const totalExpected = (doc.items ?? []).reduce((acc: number, item: any) => acc + (item.quantity_expected ?? 0), 0);
  const totalReceived = (doc.items ?? []).reduce((acc: number, item: any, idx: number) => {
    const vId = (item.id_variant && typeof item.id_variant === "object") ? item.id_variant._id : (item.id_variant || item._id || idx.toString());
    return acc + (quantities[vId] ?? item.quantity_expected ?? 0);
  }, 0);

  if (isConfirmed) {
    return (
      <div className="w-full min-h-screen bg-[#F7EEF1] dark:bg-transparent flex items-center justify-center p-4 font-sans transition-colors duration-300">
        <div className="bg-white dark:bg-black/50 backdrop-blur-2xl rounded-2xl p-8 md:p-12 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-white/5 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-[#FDF1F3] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-[#D6405F] dark:text-[#F2778D]" />
          </div>
          
          <h1 className="text-2xl font-bold font-serif text-[#5B283A] dark:text-[#Fdfcfc] mb-2 transition-colors duration-300">¡Recepción confirmada!</h1>
          <p className="text-[#844C60] dark:text-[#C9B3BC] text-sm mb-8 transition-colors duration-300 leading-relaxed">
            La recepción <span className="font-bold text-[#40202D] dark:text-white">#{doc.document_number}</span> ha sido procesada exitosamente.
          </p>

          <div className="bg-[#FCF8F9] dark:bg-white/5 border border-[#EEDCE1] dark:border-white/5 rounded-xl p-5 text-left mb-8">
            <h3 className="font-bold text-[#40202D] dark:text-white mb-4 text-[13px] uppercase tracking-wider">Resumen de operación</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-[#844C60] dark:text-[#C9B3BC] font-medium text-[13px]">Origen:</span>
                <span className="text-[#40202D] dark:text-white font-bold truncate max-w-[200px]">{srcName}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-[#844C60] dark:text-[#C9B3BC] font-medium text-[13px]">Destino:</span>
                <span className="text-[#40202D] dark:text-white font-bold truncate max-w-[200px]">{tgtName}</span>
              </li>
              <li className="flex justify-between items-center pt-3 border-t border-[#EEDCE1] dark:border-white/10">
                <span className="text-[#844C60] dark:text-[#C9B3BC] font-medium text-[13px]">Total unidades:</span>
                <span className="text-[#D6405F] dark:text-[#F2778D] font-bold text-lg">{totalReceived} / {totalExpected}</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/storekeeper/warehouse/dashboard" className="w-full flex items-center justify-center gap-2 bg-[#FCF8F9] dark:bg-white/5 border border-[#EEDCE1] dark:border-white/5 hover:border-[#F2778D] hover:bg-white dark:hover:bg-white/10 rounded-xl px-6 py-3.5 text-[#40202D] dark:text-white font-medium transition-all duration-300 transform hover:-translate-y-1">
              <Home className="w-4 h-4" />
              Volver al panel
            </Link>
            <Link href="/storekeeper/warehouse/receptions" className="w-full flex items-center justify-center gap-2 bg-[#5B283A] text-white hover:bg-[#40202D] rounded-xl px-6 py-3.5 font-medium transition-all duration-300 transform hover:-translate-y-1">
              <FileText className="w-4 h-4" />
              Ver recepciones
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F7EEF1] dark:bg-transparent p-4 pt-24 md:p-8 md:pt-28 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* TOP NAV */}
        <Link 
          href="/storekeeper/warehouse/receptions" 
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
              <h2 className="text-xl font-bold text-[#40202D] dark:text-white">Documento #{doc.document_number}</h2>
              <p className="text-[14px] text-[#844C60] dark:text-[#C9B3BC] mt-1.5 font-medium flex items-center gap-2">
                {srcName} <ArrowLeft className="w-3 h-3 rotate-180 text-[#D6405F]" /> {tgtName}
              </p>
            </div>
            <span className="px-4 py-1.5 bg-[#FDF1F3] dark:bg-[#40202D] text-[#D6405F] dark:text-[#F2b6c1] rounded-full text-[11px] uppercase tracking-wider font-bold border border-[#F2DEE4] dark:border-[#592633] self-start md:self-auto">
              {doc.status}
            </span>
          </div>
        </div>

        {/* ORIGINAL DOCUMENT (EXPANDABLE) */}
        <div className="bg-white dark:bg-black/50 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-white/5 mb-8 overflow-hidden transition-colors duration-300">
          <button 
            type="button"
            onClick={() => setShowPurchaseOrder(!showPurchaseOrder)}
            className="w-full px-6 md:px-8 py-5 flex items-center justify-between hover:bg-[#FCF8F9] dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#D6405F] dark:text-[#F2B6C1]" />
              <span className="font-bold text-[15px] text-[#40202D] dark:text-white">Ver Artículos Esperados</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-[#844C60] dark:text-[#F2B6C1] transition-transform duration-300 ${showPurchaseOrder ? 'rotate-180' : ''}`} />
          </button>
          
          {showPurchaseOrder && (
            <div className="px-6 md:px-8 pb-8 pt-4 border-t border-[#EEDCE1] dark:border-white/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-1.5">Origen</p>
                  <p className="text-[14px] font-bold text-[#40202D] dark:text-white">{srcName}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-1.5">Destino</p>
                  <p className="text-[14px] font-bold text-[#40202D] dark:text-white">{tgtName}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-1.5">Total esperado</p>
                  <p className="text-[14px] font-bold text-[#40202D] dark:text-white">{totalExpected} unds.</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-1.5">Fecha de registro</p>
                  <p className="text-[14px] font-bold text-[#40202D] dark:text-white">{new Date(doc.created_at).toLocaleDateString("es-PE")}</p>
                </div>
              </div>
              <div className="bg-[#FCF8F9] dark:bg-white/5 rounded-xl p-5 border border-[#EEDCE1] dark:border-white/5">
                <p className="text-[11px] font-bold text-[#844C60] dark:text-[#C9B3BC] mb-3 uppercase tracking-wider">Artículos solicitados</p>
                <ul className="space-y-3 text-[14px] text-[#40202D] dark:text-[#EAE0E2] font-medium">
                  {(doc.items ?? []).map((item: any, idx: number) => {
                    const variant = item.id_variant;
                    const productName = (variant && typeof variant === "object") ? variant.id_product?.name : "Prenda";
                    const size = (variant && typeof variant === "object") ? variant.size : "—";
                    const colorName = (variant && typeof variant === "object") ? variant.color?.name : "—";
                    return (
                      <li key={idx} className="flex justify-between items-center border-b border-[#EEDCE1] dark:border-white/5 pb-3 last:border-0 last:pb-0">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#D6405F] dark:bg-[#F2778D]"></div>
                          {productName} ({size} {colorName})
                        </span> 
                        <span className="font-bold text-[#40202D] dark:text-white">{item.quantity_expected} unds.</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* VERIFICAR CANTIDADES */}
        <h3 className="text-xl font-bold font-sans text-[#40202D] dark:text-white mb-5">Verificar cantidades</h3>
        
        <div className="space-y-5 mb-12">
          {(doc.items ?? []).map((item: any, idx: number) => {
            const variant = item.id_variant;
            const vId = (variant && typeof variant === "object") ? variant._id : (variant || item._id || idx.toString());
            const sku = (variant && typeof variant === "object") ? variant.sku_variant : vId;
            const size = (variant && typeof variant === "object") ? variant.size : "—";
            const colorName = (variant && typeof variant === "object") ? variant.color?.name : "—";
            const colorHex = (variant && typeof variant === "object") ? variant.color?.hex : "#ccc";
            const productName = (variant && typeof variant === "object") ? variant.id_product?.name : "Prenda";

            const hasIncidence = incidents[vId] || false;
            const currentQtyReceived = quantities[vId] ?? item.quantity_expected ?? 0;

            return (
              <div key={vId ?? idx} className="bg-white dark:bg-black/50 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-white/5 transition-colors duration-300">
                
                {/* Variant Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3.5 h-3.5 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: colorHex }} />
                  <span className="text-[17px] font-bold text-[#40202D] dark:text-white tracking-tight">{productName} — {size} · {colorName}</span>
                </div>
                <p className="text-[12px] uppercase tracking-widest text-[#844C60] dark:text-[#C9B3BC] mb-6 font-bold">{sku}</p>
                
                {/* Inputs */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-2">Cantidad ordenada</label>
                    <input 
                      type="number" 
                      value={item.quantity_expected}
                      readOnly
                      className="w-full bg-[#FCF8F9] dark:bg-white/5 border border-[#EEDCE1] dark:border-white/5 rounded-xl px-4 py-3 text-[15px] text-[#40202D] dark:text-white font-medium outline-none opacity-80 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-[#5B283A] dark:text-[#F2b6c1] mb-2">Cantidad real recibida</label>
                    <input 
                      type="number" 
                      min={0}
                      value={currentQtyReceived}
                      onChange={(e) => setQuantities((prev) => ({ ...prev, [vId]: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white dark:bg-white/5 border border-[#EEDCE1] dark:border-white/10 rounded-xl px-4 py-3 text-[15px] text-[#D6405F] dark:text-[#F2778D] font-medium outline-none focus:border-[#D6405F] dark:focus:border-[#F2778D] transition-colors shadow-sm"
                    />
                  </div>
                </div>

                {/* Checkbox Incidencia */}
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${hasIncidence ? 'bg-[#D6405F] dark:bg-[#F2778D] border-[#D6405F] dark:border-[#F2778D]' : 'bg-[#FCF8F9] dark:bg-white/5 border-[#EEDCE1] dark:border-white/10 group-hover:border-[#D6405F]'}`}>
                    {hasIncidence && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={hasIncidence}
                    onChange={(e) => setIncidents((prev) => ({ ...prev, [vId]: e.target.checked }))}
                  />
                  <span className="text-[14px] font-bold text-[#40202D] dark:text-white">¿Hubo incidencia con esta variante?</span>
                </label>

                {/* Incidencia Detalles (Expandible) */}
                <AnimatePresence>
                  {hasIncidence && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-6 pl-5 md:pl-6 border-l-2 border-[#D6405F]/30 dark:border-[#F2778D]/30"
                    >
                      <p className="text-[13px] font-bold text-[#5B283A] dark:text-[#F2b6c1] mb-3 uppercase tracking-wider">Detalle del problema</p>
                      
                      <div className="flex flex-wrap gap-2.5 mb-6">
                        {INCIDENCE_OPTIONS.map(opt => (
                          <button 
                            key={opt}
                            type="button"
                            onClick={() => setIncidentReasons((prev) => ({ ...prev, [vId]: opt }))}
                            className={`px-4 py-2 rounded-lg text-[13px] font-bold border transition-all ${
                              incidentReasons[vId] === opt 
                                ? 'bg-[#D6405F] dark:bg-[#F2778D] border-[#D6405F] dark:border-[#F2778D] text-white shadow-md' 
                                : 'bg-white dark:bg-white/5 border-[#EEDCE1] dark:border-white/10 text-[#844C60] dark:text-[#C9B3BC] hover:border-[#D6405F] dark:hover:border-[#F2778D] hover:text-[#D6405F] dark:hover:text-[#F2778D]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {incidentReasons[vId] === "Otro motivo" && (
                        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-2">Especifique el motivo</label>
                          <input 
                            type="text" 
                            value={incidentCustomReasons[vId] || ""}
                            onChange={(e) => setIncidentCustomReasons((prev) => ({ ...prev, [vId]: e.target.value }))}
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
                            min={0}
                            value={incidentQtys[vId] || 0}
                            onChange={(e) => setIncidentQtys((prev) => ({ ...prev, [vId]: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-white dark:bg-white/5 border border-[#EEDCE1] dark:border-white/10 rounded-xl px-4 py-3 text-[15px] text-[#D6405F] dark:text-[#F2778D] font-medium outline-none focus:border-[#D6405F]"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-[#844C60] dark:text-[#C9B3BC] mb-2">Fotografía (Opcional)</label>
                          {/* File input real para simulación interactiva */}
                          <input 
                            type="file" 
                            id={`photo-${vId}`} 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleIncidentPhotoChange(vId, e)} 
                          />
                          <button 
                            type="button" 
                            onClick={() => document.getElementById(`photo-${vId}`)?.click()} 
                            className="w-full flex items-center justify-center gap-2 bg-[#FCF8F9] dark:bg-white/5 border border-dashed border-[#D6405F] dark:border-[#F2778D] hover:bg-[#FDF1F3] dark:hover:bg-white/10 rounded-xl px-4 py-3 text-[#D6405F] dark:text-[#F2778D] text-[14px] font-medium transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                            {incidentPhotos[vId] ? `Cambiar: ${incidentPhotos[vId].slice(0, 15)}...` : "Subir foto evidencia"}
                          </button>
                        </div>
                      </div>

                      {currentQtyReceived < item.quantity_expected && (
                        <p className="text-xs text-amber-500 flex items-center gap-1 mt-4">
                          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                          Diferencia de {item.quantity_expected - currentQtyReceived} unidad(es).
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>

        {/* EVIDENCIAS GLOBALES */}
        <h3 className="text-xl font-bold font-sans text-[#40202D] dark:text-white mb-5">Evidencias documentales</h3>
        
        <div className="bg-white dark:bg-black/50 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-white/5 mb-10 transition-colors duration-300">
          <p className="text-[14px] leading-relaxed text-[#844C60] dark:text-[#C9B3BC] mb-6 font-medium">
            Si lo deseas, puedes adjuntar la documentación que respalde esta recepción física. La <strong className="text-[#40202D] dark:text-white">Orden de Compra</strong> se actualizará automáticamente.
          </p>

          {/* Inputs de archivos reales */}
          <input 
            type="file" 
            id="reception-photo-input" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => { 
              const file = e.target.files?.[0]; 
              if (file) { 
                setReceptionPhotoName(file.name); 
                setReceptionPhotoFile(file);
                toast.success(`Foto "${file.name}" cargada.`); 
              } 
            }} 
          />
          <input 
            type="file" 
            id="invoice-file-input" 
            accept="image/*,application/pdf" 
            className="hidden" 
            onChange={(e) => { 
              const file = e.target.files?.[0]; 
              if (file) { 
                setInvoiceFileName(file.name); 
                setInvoiceFile(file);
                toast.success(`Documento "${file.name}" cargado.`); 
              } 
            }} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Foto General */}
            <div 
              onClick={() => document.getElementById("reception-photo-input")?.click()} 
              className="flex flex-col items-center justify-center p-8 bg-[#FCF8F9] dark:bg-white/5 border border-dashed border-[#EEDCE1] dark:border-white/10 hover:border-[#D6405F] dark:hover:border-[#F2778D] rounded-xl cursor-pointer transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-[#F2778D]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Camera className="w-6 h-6 text-[#844C60] dark:text-[#C9B3BC] group-hover:text-[#D6405F] dark:group-hover:text-[#F2778D]" />
              </div>
              <span className="text-[15px] font-bold text-[#40202D] dark:text-white text-center mb-1.5">
                {receptionPhotoName ? `Foto: ${receptionPhotoName.slice(0, 20)}` : "Foto de Recepción"}
              </span>
              <span className="text-[12px] text-[#844C60] dark:text-[#C9B3BC] text-center font-medium">Evidencia visual general de la carga</span>
            </div>

            {/* Boleta */}
            <div 
              onClick={() => document.getElementById("invoice-file-input")?.click()} 
              className="flex flex-col items-center justify-center p-8 bg-[#FCF8F9] dark:bg-white/5 border border-dashed border-[#EEDCE1] dark:border-white/10 hover:border-[#D6405F] dark:hover:border-[#F2778D] rounded-xl cursor-pointer transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-[#F2778D]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <UploadCloud className="w-6 h-6 text-[#844C60] dark:text-[#C9B3BC] group-hover:text-[#D6405F] dark:group-hover:text-[#F2778D]" />
              </div>
              <span className="text-[15px] font-bold text-[#40202D] dark:text-white text-center mb-1.5">
                {invoiceFileName ? `Doc: ${invoiceFileName.slice(0, 20)}` : "Boleta / Guía de Remisión"}
              </span>
              <span className="text-[12px] text-[#844C60] dark:text-[#C9B3BC] text-center font-medium">Sube en formato PDF o Imagen JPG/PNG</span>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex justify-between items-center pb-12">
          <Link href="/storekeeper/warehouse/receptions"
            className="flex items-center gap-2 text-sm text-[#8C6B79] hover:text-[#40202D] transition-colors font-medium">
            <Home className="w-4 h-4" /> Cancelar
          </Link>
          <button 
            onClick={handleConfirm}
            disabled={loading || doc.status === "COMPLETADO"}
            className="bg-[#5B283A] hover:bg-[#40202D] dark:bg-[#F2778D] dark:hover:bg-[#D6405F] text-white disabled:opacity-40 rounded-xl px-10 py-4 text-[15px] font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:ring-4 focus:ring-[#D6405F]/20"
          >
            {loading ? "Procesando…" : doc.status === "COMPLETADO" ? "Ya procesado" : "Confirmar Recepción Definitiva"}
          </button>
        </div>

      </div>
    </div>
  );
}
