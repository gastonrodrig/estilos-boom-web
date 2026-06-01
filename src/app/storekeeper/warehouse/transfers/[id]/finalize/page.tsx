"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStorehouseStore } from "@/hooks";
import toast from "react-hot-toast";

export default function FinalizeMovementPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params.id as string;

  const { startLoadingWarehouseDocuments, startProcessWarehouseDocument, loading } = useStorehouseStore();

  const [doc, setDoc] = useState<any>(null);
  const [reviewedItems, setReviewedItems] = useState<any[]>([]);
  const [done, setDone] = useState(false);

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
      try { setReviewedItems(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, [id, startLoadingWarehouseDocuments]);

  const handleFinish = async () => {
    if (!doc) return;

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 border-4 border-emerald-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#40202D] dark:text-white mb-3 tracking-wide">
            ¡Transferencia ejecutada!
          </h2>
          <p className="text-[#8C6B79] font-medium mb-8">
            El stock fue transferido y el kárdex actualizado automáticamente.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/storekeeper/warehouse/transfers"
              className="py-3 px-8 bg-[#40202D] hover:bg-[#5B283A] text-white rounded-2xl font-medium tracking-wide transition-colors">
              Ver transferencias
            </Link>
            <Link href="/storekeeper/warehouse/dashboard"
              className="py-3 px-8 bg-white/50 border border-[#EAE0E2] text-[#40202D] dark:text-white rounded-2xl font-medium tracking-wide transition-colors">
              Ir al Dashboard
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
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-[700px] mx-auto relative z-10">

      <Link href={`/storekeeper/warehouse/transfers/${id}/confirm`}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#8C6B79] hover:text-[#40202D] dark:text-[#F8BBD0]/80 dark:hover:text-white mb-6 transition-colors tracking-wide">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>
      <h1 className="text-3xl font-medium text-[#40202D] dark:text-white mb-10 tracking-wide">
        Finalizar orden de movimiento
      </h1>

      {/* Documento de sustento */}
      <div className="mb-10">
        <h3 className="text-xl font-medium text-[#40202D] dark:text-white mb-4 tracking-wide">
          Documento que avala este movimiento
        </h3>
        <div className="flex items-center gap-2 mb-6">
          <span className="px-4 py-1.5 bg-white/50 dark:bg-white/10 text-[#40202D] dark:text-white text-[11px] font-medium rounded-full flex items-center gap-2 border border-[#F2DEE4] dark:border-white/10 shadow-sm tracking-wide">
            📄 {doc.document_number}
          </span>
        </div>
        <button
          onClick={() => toast("Guía disponible en el panel de Movimientos (Admin).", { icon: "🖨️" })}
          className="flex items-center gap-3 py-4 px-6 bg-white/70 dark:bg-black/50 border border-[#EAE0E2] dark:border-white/5 rounded-2xl hover:border-[#F23B69] transition-colors shadow-sm">
          <Printer className="w-5 h-5 text-[#8C6B79]" />
          <span className="text-sm font-medium text-[#40202D] dark:text-white tracking-wide">Imprimir guía</span>
        </button>
      </div>

      {/* Resumen */}
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-sm border border-[#EAE0E2] dark:border-white/5 mb-10">
        <h3 className="text-xl font-medium text-[#40202D] dark:text-white mb-6 tracking-wide">Resumen de la orden</h3>
        <div className="space-y-3 mb-6">
          <p className="text-sm text-[#40202D] dark:text-gray-300 tracking-wide">
            Tipo: <span className="text-[#8C6B79] ml-1">Transferencia Interna</span>
          </p>
          <p className="text-sm text-[#40202D] dark:text-gray-300 tracking-wide">
            Origen: <span className="text-[#8C6B79] ml-1">{srcName}</span>
          </p>
          <p className="text-sm text-[#40202D] dark:text-gray-300 tracking-wide">
            Destino: <span className="text-[#8C6B79] ml-1">{tgtName}</span>
          </p>
          <p className="text-sm text-[#40202D] dark:text-gray-300 tracking-wide">
            Total de unidades: <span className="text-[#8C6B79] ml-1">{totalUnits}</span>
          </p>
          <p className="text-sm text-[#40202D] dark:text-gray-300 tracking-wide">
            Variantes: <span className="text-[#8C6B79] ml-1">{doc.items?.length ?? 0}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#EAE0E2] dark:border-white/5 pt-6">
          {(doc.items ?? []).map((item: any, idx: number) => {
            const variant = item.id_variant;
            const product = typeof variant === "object" ? variant.id_product?.name : "Prenda";
            const size    = typeof variant === "object" ? variant.size : "—";
            const color   = typeof variant === "object" ? variant.color?.name : "—";
            const reviewed = reviewedItems.find((r) => r.id_variant === (typeof variant === "object" ? variant._id : variant));
            return (
              <div key={idx} className="flex justify-between items-center bg-white/60 dark:bg-white/5 border border-[#F2DEE4] dark:border-white/10 rounded-xl px-4 py-2.5">
                <span className="text-[13px] text-[#40202D] dark:text-white font-medium">
                  {product} — {size} / {color}
                </span>
                <span className="text-[11px] bg-[#FDF1F3] text-[#D6405F] px-2 py-0.5 rounded-lg border border-[#F2DEE4] font-medium">
                  {reviewed?.quantity_received ?? item.quantity_expected} uds
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pb-12">
        <button onClick={handleFinish} disabled={loading || doc.status === "COMPLETADO"}
          className="w-full py-4 bg-[#40202D] hover:bg-[#5B283A] disabled:opacity-40 text-white text-sm font-medium tracking-wide rounded-2xl shadow-sm transition-all">
          {loading ? "Ejecutando transferencia…"
           : doc.status === "COMPLETADO" ? "Transferencia ya ejecutada"
           : "Confirmar y ejecutar transferencia"}
        </button>
      </div>
    </motion.div>
  );
}
