"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Paperclip, Printer, CheckCircle2, Home, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStorehouseStore } from "@/hooks";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function FinalizeMovementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { 
    startLoadingWarehouseDocuments, 
    startProcessWarehouseDocument, 
    startUploadWarehouseDocAttachments,
    loading 
  } = useStorehouseStore();

  const [doc, setDoc] = useState<any>(null);
  const [reviewedItems, setReviewedItems] = useState<any[]>([]);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState("");

  // Estados locales para los archivos cargados de verdad
  const [photoFileName, setPhotoFileName] = useState("");
  const [attachmentFileName, setAttachmentFileName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [generatedGuideFile, setGeneratedGuideFile] = useState<File | null>(null);

  useEffect(() => {
    // Cargar el documento real
    const load = async () => {
      const data = await startLoadingWarehouseDocuments();
      if (Array.isArray(data)) {
        const found = data.find((d) => d._id === id);
        if (found) setDoc(found);
      }
    };
    void load();

    // Leer las cantidades revisadas desde la página anterior
    const raw = localStorage.getItem("warehouse_transfer_review");
    if (raw) {
      try {
        setReviewedItems(JSON.parse(raw));
      } catch { /* ignore */ }
    }
  }, [id, startLoadingWarehouseDocuments]);

  // Generación dinámica del PDF de traslado
  const handleGenerateGuide = () => {
    if (!doc) return;
    try {
      const pdf = new jsPDF();
      const primaryColor: [number, number, number] = [242, 119, 141];

      // Cabecera superior decorativa
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 25, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("ESTILOS BOOM S.A.C.", 15, 16);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("SISTEMA DE GESTIÓN DE INVENTARIOS (SGI)", 105, 16);

      pdf.setTextColor(51, 51, 51);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text("GUÍA DE TRASLADO DE PRENDAS", 15, 40);

      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.rect(130, 32, 65, 15);
      pdf.setFontSize(10);
      pdf.text(doc.document_number ?? "DOC-000000", 135, 44);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Fecha: ${new Date(doc.created_at ?? Date.now()).toLocaleDateString()}`, 15, 55);
      pdf.text(`Tipo: Transferencia Interna`, 15, 62);
      pdf.text(`Estado de Guía: ${doc.status === "PENDIENTE" ? "DESPACHADO - EN TRÁNSITO" : "RECIBIDO - COMPLETADO"}`, 15, 69);

      const sourceName = doc.id_source_warehouse?.name?.replace(/_/g, " ") ?? "Origen";
      const targetName = doc.id_target_warehouse?.name?.replace(/_/g, " ") ?? "Destino";
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Origen:", 15, 82);
      pdf.setFont("helvetica", "normal");
      pdf.text(sourceName, 45, 82);
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Destino:", 110, 82);
      pdf.setFont("helvetica", "normal");
      pdf.text(targetName, 140, 82);

      const rows = (doc.items ?? []).map((item: any, i: number) => {
        const v = item.id_variant;
        const product = typeof v === "object" ? v.id_product?.name : "Prenda";
        const size = typeof v === "object" ? v.size : "—";
        const color = typeof v === "object" ? v.color?.name : "—";
        const sku = typeof v === "object" ? v.sku_variant : `SKU-${i}`;
        
        const reviewed = reviewedItems.find((r) => r.id_variant === (typeof v === "object" ? v._id : v));
        const finalQty = reviewed?.quantity_received ?? item.quantity_expected ?? 0;

        return [
          i + 1,
          sku,
          product,
          `${size} / ${color}`,
          item.quantity_expected,
          finalQty,
          "Unidades",
        ];
      });

      autoTable(pdf, {
        startY: 90,
        head: [["#", "SKU", "Producto", "Talla / Color", "Esperado", "Transferido", "U.M."]],
        body: rows,
        headStyles: { fillColor: [89, 66, 70] },
        styles: { fontSize: 9 },
      });

      const fileName = `Guia_Traslado_${doc.document_number ?? "DOC"}.pdf`;
      pdf.save(fileName);

      const blob = pdf.output("blob");
      const file = new File([blob], fileName, { type: "application/pdf" });
      setGeneratedGuideFile(file);
      toast.success("¡Guía de traslado generada e impresa localmente!");
    } catch (err) {
      console.error("Error al generar la guía:", err);
      toast.error("Hubo un error al generar el PDF de la guía.");
    }
  };

  const handleFinish = async () => {
    if (!doc) return;

    // 1. Subir archivos si existen
    const filesToUpload: File[] = [];
    if (photoFile) filesToUpload.push(photoFile);
    if (attachmentFile) filesToUpload.push(attachmentFile);
    if (generatedGuideFile) filesToUpload.push(generatedGuideFile);

    if (filesToUpload.length > 0) {
      const uploadToast = toast.loading("Subiendo documentos y evidencias al servidor...");
      try {
        await startUploadWarehouseDocAttachments(doc._id, filesToUpload);
        toast.dismiss(uploadToast);
      } catch (err) {
        toast.dismiss(uploadToast);
        toast.error("Error al subir documentos. Inténtalo nuevamente.");
        return;
      }
    }

    // 2. Procesar el documento de almacén
    const workerId =
      (typeof window !== "undefined" ? localStorage.getItem("worker_id") ?? "" : "") ||
      "000000000000000000000001";

    const items = reviewedItems.length > 0
      ? reviewedItems
      : (doc.items ?? []).map((item: any) => ({
          id_variant: typeof item.id_variant === "object" ? item.id_variant._id : item.id_variant,
          quantity_received: item.quantity_expected ?? 0,
          incidence_note: "",
        }));

    const success = await startProcessWarehouseDocument(doc._id, workerId, items);
    if (success) {
      localStorage.removeItem("warehouse_transfer_review");
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="w-full min-h-screen bg-[#F7EEF1] dark:bg-transparent flex items-center justify-center p-4 font-sans transition-colors duration-300">
        <div className="bg-white dark:bg-black/50 backdrop-blur-2xl rounded-2xl p-8 md:p-12 shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-white/5 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-[#FDF1F3] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#D6405F] dark:text-[#F2778D]" />
          </div>
          
          <h1 className="text-2xl font-bold font-serif text-[#5B283A] dark:text-[#Fdfcfc] mb-2 transition-colors duration-300">
            {doc?.status === "PENDIENTE" ? "¡Despacho Realizado!" : "¡Mercadería Recibida!"}
          </h1>
          <p className="text-[#844C60] dark:text-[#C9B3BC] text-sm mb-8 transition-colors duration-300 leading-relaxed">
            {doc?.status === "PENDIENTE"
              ? `El envío de la transferencia #${doc?.document_number} ha sido despachado y se encuentra en camino (En Tránsito).`
              : `La recepción de la transferencia #${doc?.document_number} ha sido registrada y completada con éxito.`}
          </p>

          <div className="bg-[#FCF8F9] dark:bg-white/5 border border-[#EEDCE1] dark:border-white/5 rounded-xl p-5 text-left mb-8">
            <h3 className="font-bold text-[#40202D] dark:text-white mb-4 text-[13px] uppercase tracking-wider">Resumen de operación</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-[#844C60] dark:text-[#C9B3BC] font-medium text-[13px]">Origen:</span>
                <span className="text-[#40202D] dark:text-white font-bold truncate max-w-[200px]">
                  {doc?.id_source_warehouse?.name?.replace(/_/g, " ") ?? "Origen"}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-[#844C60] dark:text-[#C9B3BC] font-medium text-[13px]">Destino:</span>
                <span className="text-[#40202D] dark:text-white font-bold truncate max-w-[200px]">
                  {doc?.id_target_warehouse?.name?.replace(/_/g, " ") ?? "Destino"}
                </span>
              </li>
              <li className="flex justify-between items-center pt-3 border-t border-[#EEDCE1] dark:border-white/10">
                <span className="text-[#844C60] dark:text-[#C9B3BC] font-medium text-[13px]">Total unidades:</span>
                <span className="text-[#D6405F] dark:text-[#F2778D] font-bold text-lg">
                  {reviewedItems.reduce((s, i) => s + (i.quantity_received ?? 0), 0)}
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/storekeeper/warehouse/dashboard" className="w-full flex items-center justify-center gap-2 bg-[#FCF8F9] dark:bg-white/5 border border-[#EEDCE1] dark:border-white/5 hover:border-[#F2778D] hover:bg-white dark:hover:bg-white/10 rounded-xl px-6 py-3.5 text-[#40202D] dark:text-white font-medium transition-all duration-300 transform hover:-translate-y-1">
              <Home className="w-4 h-4" />
              Volver al panel
            </Link>
            <Link href="/storekeeper/warehouse/transfers" className="w-full flex items-center justify-center gap-2 bg-[#5B283A] text-white hover:bg-[#40202D] rounded-xl px-6 py-3.5 font-medium transition-all duration-300 transform hover:-translate-y-1">
              <FileText className="w-4 h-4" />
              Ver transferencias
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8C6B79] text-sm italic">Cargando documento…</p>
      </div>
    );
  }

  const srcName    = doc.id_source_warehouse?.name?.replace(/_/g, " ") ?? "Origen";
  const tgtName    = doc.id_target_warehouse?.name?.replace(/_/g, " ") ?? "Destino";
  const totalUnits = reviewedItems.reduce((s, i) => s + (i.quantity_received ?? 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[700px] mx-auto relative z-10"
    >
        
      {/* HEADER */}
      <Link 
        href={`/storekeeper/warehouse/transfers/${id}/confirm`} 
        className="inline-flex items-center gap-2 text-sm font-medium text-[#8C6B79] hover:text-[#40202D] dark:text-[#F8BBD0]/80 dark:hover:text-white mb-6 transition-colors tracking-wide"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>
      <h1 className="text-3xl md:text-4xl font-medium text-[#40202D] dark:text-white mb-10 tracking-wide drop-shadow-md">
        Finalizar orden de movimiento
      </h1>

      {/* DOCUMENTS SECTION */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-medium text-[#40202D] dark:text-white tracking-wide">Documento que avala este movimiento</h3>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          <span className="px-4 py-1.5 bg-white/50 dark:bg-white/10 text-[#40202D] dark:text-white text-[11px] font-medium rounded-full flex items-center gap-2 border border-[#F2DEE4] dark:border-white/10 shadow-sm tracking-wide">
             📄 Guía de traslado: #{doc.document_number}
          </span>
        </div>

        {/* Inputs de archivos reales para simulación */}
        <input 
          type="file" 
          id="transfer-photo" 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => { 
            const file = e.target.files?.[0]; 
            if (file) { 
              setPhotoFileName(file.name);
              setPhotoFile(file);
              toast.success(`Foto "${file.name}" cargada.`); 
            } 
          }} 
        />
        <input 
          type="file" 
          id="transfer-attachment" 
          accept="image/*,application/pdf" 
          className="hidden" 
          onChange={(e) => { 
            const file = e.target.files?.[0]; 
            if (file) { 
              setAttachmentFileName(file.name); 
              setAttachmentFile(file);
              toast.success(`Archivo "${file.name}" cargado.`); 
            } 
          }} 
        />

        <div className="flex flex-wrap gap-4 mb-5">
          <button 
            type="button"
            onClick={() => document.getElementById("transfer-photo")?.click()} 
            className="flex-1 min-w-[150px] py-4 px-6 bg-white/70 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/5 rounded-2xl flex items-center justify-center gap-3 hover:border-[#F23B69] dark:hover:border-[#F8BBD0] transition-colors shadow-sm"
          >
            <ImageIcon className="w-5 h-5 text-[#8C6B79] dark:text-[#F8BBD0]" />
            <span className="text-sm font-medium text-[#40202D] dark:text-white tracking-wide truncate max-w-[180px]">
              {photoFileName ? `Foto: ${photoFileName.slice(0, 15)}` : "Subir foto evidencia"}
            </span>
          </button>
          
          <button 
            type="button"
            onClick={() => document.getElementById("transfer-attachment")?.click()} 
            className="flex-1 min-w-[150px] py-4 px-6 bg-white/70 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/5 rounded-2xl flex items-center justify-center gap-3 hover:border-[#F23B69] dark:hover:border-[#F8BBD0] transition-colors shadow-sm"
          >
            <Paperclip className="w-5 h-5 text-[#8C6B79] dark:text-[#F8BBD0]" />
            <span className="text-sm font-medium text-[#40202D] dark:text-white tracking-wide truncate max-w-[180px]">
              {attachmentFileName ? `Doc: ${attachmentFileName.slice(0, 15)}` : "Adjuntar archivo"}
            </span>
          </button>
        </div>

        <input 
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="O ingresa la referencia (Ej: Guía de remisión #0042)"
          className="w-full p-4 bg-white/70 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/5 rounded-2xl text-sm font-medium text-[#40202D] dark:text-white focus:outline-none focus:border-[#F23B69] dark:focus:border-[#F8BBD0] placeholder:font-medium placeholder:text-[#8C6B79] dark:placeholder:text-[#F8BBD0]/40 transition-colors shadow-sm"
        />
        <p className="text-[12px] text-[#8C6B79] dark:text-gray-400 font-medium mt-3 tracking-wide">
          Si no tienes el documento ahora, puedes agregar la referencia y adjuntarlo después.
        </p>

        <div className="mt-8 p-6 bg-white/50 dark:bg-black/50 backdrop-blur-2xl rounded-3xl border border-[#F2DEE4] dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-[#D6405F] dark:text-[#F8BBD0] tracking-wide">Acciones de Impresión</h4>
            {generatedGuideFile && (
              <span className="text-xs bg-[#4CAF50]/15 text-[#4CAF50] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                ✓ Guía PDF Generada
              </span>
            )}
          </div>
          <button 
            type="button" 
            onClick={handleGenerateGuide}
            className={`w-full py-3.5 px-4 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm tracking-wide border ${
              generatedGuideFile 
                ? "bg-[#E8F5E9] dark:bg-[#4CAF50]/10 border-[#81C784] text-[#2E7D32] dark:text-[#81C784]" 
                : "bg-white dark:bg-black/50 border-[#EAE0E2] dark:border-white/5 text-[#40202D] dark:text-white hover:border-[#F23B69] dark:hover:border-[#F8BBD0]"
            }`}
          >
            <Printer className="w-4 h-4" /> 
            {generatedGuideFile ? "Volver a Generar Guía de Traslado" : "Imprimir y Generar Guía de Traslado"}
          </button>
        </div>
      </div>

      {/* ORDER SUMMARY CARD */}
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-sm border border-[#EAE0E2] dark:border-white/5 mb-10 transition-colors duration-300">
        <h3 className="text-xl font-medium text-[#40202D] dark:text-white mb-6 tracking-wide drop-shadow-sm">Resumen de la orden</h3>
        
        <div className="space-y-3 mb-8">
          <p className="text-sm font-medium text-[#40202D] dark:text-gray-300 tracking-wide">Tipo de movimiento: <span className="font-medium text-[#8C6B79] dark:text-gray-400 ml-1">Transferencia Interna</span></p>
          <p className="text-sm font-medium text-[#40202D] dark:text-gray-300 tracking-wide">Origen: <span className="font-medium text-[#8C6B79] dark:text-gray-400 ml-1">{srcName}</span></p>
          <p className="text-sm font-medium text-[#40202D] dark:text-gray-300 tracking-wide">Destino: <span className="font-medium text-[#8C6B79] dark:text-gray-400 ml-1">{tgtName}</span></p>
          <p className="text-sm font-medium text-[#40202D] dark:text-gray-300 tracking-wide">Total de unidades a mover: <span className="font-medium text-[#8C6B79] dark:text-gray-400 ml-1">{totalUnits}</span></p>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#EAE0E2] dark:border-white/5 pt-6">
          {(doc.items ?? []).map((item: any, idx: number) => {
            const variant = item.id_variant;
            const product = typeof variant === "object" ? variant.id_product?.name : "Prenda";
            const size    = typeof variant === "object" ? variant.size : "—";
            const color   = typeof variant === "object" ? variant.color?.name : "—";
            const reviewed = reviewedItems.find((r) => r.id_variant === (typeof variant === "object" ? variant._id : variant));
            const finalQty = reviewed?.quantity_received ?? item.quantity_expected ?? 0;

            return (
              <div key={idx} className="flex justify-between items-center bg-white/60 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/10 rounded-xl px-4 py-2.5 backdrop-blur-md">
                <span className="text-[13px] text-[#40202D] dark:text-white/95 font-medium tracking-wide">
                  {product} — {size} / {color}
                </span>
                <span className="text-[11px] bg-[#FDF1F3] dark:bg-[#F2778D]/10 text-[#D6405F] dark:text-[#F8BBD0] px-2.5 py-1 rounded-lg border border-[#F2DEE4] dark:border-white/5 font-medium">
                  {finalQty} uds
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="pb-12">
        <button 
          onClick={handleFinish}
          disabled={loading || doc.status === "COMPLETADO"}
          className="w-full py-4 bg-[#40202D] hover:bg-[#5B283A] dark:bg-white/5 dark:hover:bg-white/10 dark:border dark:border-white/10 text-white dark:text-white disabled:opacity-40 text-sm font-medium tracking-wide rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:shadow-none transition-all"
        >
          {loading ? (doc.status === "PENDIENTE" ? "Despachando envío..." : "Registrando recepción...")
           : doc.status === "COMPLETADO" ? "Transferencia ya ejecutada"
           : doc.status === "PENDIENTE" ? "Confirmar y despachar envío"
           : "Confirmar y registrar recepción"}
        </button>
      </div>

    </motion.div>
  );
}

