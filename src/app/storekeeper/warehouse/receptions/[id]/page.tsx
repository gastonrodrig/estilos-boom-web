"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Home, AlertTriangle } from "lucide-react";
import { useStorehouseStore } from "@/hooks";
import toast from "react-hot-toast";

const INCIDENCE_OPTIONS = [
  "Prenda dañada",
  "Faltó unidad",
  "Talla incorrecta",
  "Color incorrecto",
  "Prenda con mancha",
  "Costura defectuosa",
  "Otro motivo",
];

export default function ReceptionConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { startLoadingWarehouseDocuments, startProcessWarehouseDocument, loading } = useStorehouseStore();

  const [doc, setDoc] = useState<any>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [incidents, setIncidents] = useState<Record<string, boolean>>({});
  const [incidentReasons, setIncidentReasons] = useState<Record<string, string>>({});
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await startLoadingWarehouseDocuments();
      if (Array.isArray(data)) {
        const found = data.find((d) => d._id === id);
        if (found) {
          setDoc(found);
          // Inicializar cantidades recibidas con los esperados
          const initial: Record<string, number> = {};
          (found.items ?? []).forEach((item: any) => {
            const vId = typeof item.id_variant === "object" ? item.id_variant._id : item.id_variant;
            initial[vId] = item.quantity_expected ?? 0;
          });
          setQuantities(initial);
        }
      }
    };
    void load();
  }, [id, startLoadingWarehouseDocuments]);

  const handleConfirm = async () => {
    if (!doc) return;

    const workerId =
      (typeof window !== "undefined" ? localStorage.getItem("worker_id") ?? "" : "") ||
      "000000000000000000000001";

    const items = (doc.items ?? []).map((item: any) => {
      const vId = typeof item.id_variant === "object" ? item.id_variant._id : item.id_variant;
      return {
        id_variant: vId,
        quantity_received: quantities[vId] ?? item.quantity_expected ?? 0,
        incidence_note: incidents[vId] ? (incidentReasons[vId] || "Sin detalle") : "",
      };
    });

    const success = await startProcessWarehouseDocument(doc._id, workerId, items);
    if (success) setIsConfirmed(true);
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-[#F7EEF1] dark:bg-transparent flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 border-4 border-emerald-200">
            <Check className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#40202D] dark:text-white mb-3 tracking-wide">
            ¡Recepción confirmada!
          </h2>
          <p className="text-[#8C6B79] dark:text-gray-400 font-medium mb-8 tracking-wide">
            El stock fue actualizado y el kárdex registrado automáticamente.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/storekeeper/warehouse/receptions"
              className="py-3 px-8 bg-[#40202D] hover:bg-[#5B283A] text-white rounded-2xl font-medium tracking-wide transition-colors">
              Ver recepciones
            </Link>
            <Link href="/storekeeper/warehouse/dashboard"
              className="py-3 px-8 bg-white/50 dark:bg-white/10 border border-[#EAE0E2] dark:border-white/10 text-[#40202D] dark:text-white rounded-2xl font-medium tracking-wide transition-colors">
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

  const srcName = doc.id_source_warehouse?.name?.replace(/_/g, " ") ?? "Proveedor externo";
  const tgtName = doc.id_target_warehouse?.name?.replace(/_/g, " ") ?? "—";

  return (
    <div className="max-w-[700px] mx-auto relative z-10 pb-16">
      <Link href="/storekeeper/warehouse/receptions"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#8C6B79] hover:text-[#40202D] dark:text-[#F8BBD0]/80 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a recepciones
      </Link>
      <h1 className="text-3xl font-medium text-[#40202D] dark:text-white mb-10 tracking-wide">
        Confirmar recepción
      </h1>

      {/* Resumen del documento */}
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/5 rounded-3xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-[#8C6B79] mb-1">{doc.document_number}</p>
            <h2 className="text-xl font-medium text-[#40202D] dark:text-white">
              {srcName} → {tgtName}
            </h2>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[11px] font-medium rounded-full border border-amber-100">
            {doc.status}
          </span>
        </div>
        {doc.notes && (
          <p className="text-sm text-[#8C6B79] mt-4 pt-4 border-t border-[#EAE0E2]">{doc.notes}</p>
        )}
      </div>

      {/* Items */}
      <h3 className="text-xl font-medium text-[#40202D] dark:text-white mb-6 tracking-wide">
        Verificar cantidades
      </h3>

      <div className="space-y-4 mb-10">
        {(doc.items ?? []).map((item: any, idx: number) => {
          const variant = item.id_variant;
          const vId = typeof variant === "object" ? variant._id : variant;
          const sku = typeof variant === "object" ? variant.sku_variant : vId;
          const size = typeof variant === "object" ? variant.size : "—";
          const colorName = typeof variant === "object" ? variant.color?.name : "—";
          const colorHex = typeof variant === "object" ? variant.color?.hex : "#ccc";
          const productName = typeof variant === "object" ? variant.id_product?.name : "Prenda";

          return (
            <div key={vId ?? idx} className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border border-[#EAE0E2] dark:border-white/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-3 h-3 rounded-full border border-black/10 shadow-sm shrink-0" style={{ backgroundColor: colorHex }} />
                <div>
                  <p className="font-medium text-[#40202D] dark:text-white text-[15px] tracking-wide">
                    {productName} — {size} / {colorName}
                  </p>
                  <p className="text-xs font-mono text-[#8C6B79] dark:text-gray-400 mt-0.5">{sku}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-medium text-[#8C6B79] mb-2 tracking-wide">Esperado</label>
                  <div className="w-full p-4 bg-white/50 dark:bg-white/5 border border-[#F2DEE4] rounded-xl text-sm font-medium text-[#8C6B79] cursor-not-allowed">
                    {item.quantity_expected}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8C6B79] mb-2 tracking-wide">Recibido realmente</label>
                  <input
                    type="number"
                    min={0}
                    value={quantities[vId] ?? item.quantity_expected}
                    onChange={(e) => setQuantities((prev) => ({ ...prev, [vId]: Number(e.target.value) }))}
                    className="w-full p-4 bg-white dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-xl text-sm font-medium text-[#40202D] dark:text-white focus:outline-none focus:border-[#F23B69] transition-colors"
                  />
                </div>
              </div>

              {/* Incidencia */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#EAE0E2] dark:border-white/5">
                <input type="checkbox" id={`inc-${vId}`}
                  checked={incidents[vId] || false}
                  onChange={(e) => setIncidents((prev) => ({ ...prev, [vId]: e.target.checked }))}
                  className="w-4 h-4 rounded border-[#EAE0E2] text-[#F23B69] focus:ring-[#F23B69]"
                />
                <label htmlFor={`inc-${vId}`} className="text-[13px] text-[#8C6B79] font-medium cursor-pointer">
                  ¿Hubo incidencia en esta variante?
                </label>
              </div>

              {incidents[vId] && (
                <div className="mt-3">
                  <select
                    value={incidentReasons[vId] || ""}
                    onChange={(e) => setIncidentReasons((prev) => ({ ...prev, [vId]: e.target.value }))}
                    className="w-full p-3 bg-white dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-xl text-sm text-[#40202D] dark:text-white focus:outline-none focus:border-[#F23B69] transition-colors"
                  >
                    <option value="">Selecciona el motivo…</option>
                    {INCIDENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {incidents[vId] && (quantities[vId] ?? item.quantity_expected) < item.quantity_expected && (
                    <p className="text-xs text-amber-500 flex items-center gap-1 mt-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Diferencia de {item.quantity_expected - (quantities[vId] ?? item.quantity_expected)} unidad(es).
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <Link href="/storekeeper/warehouse/receptions"
          className="flex items-center gap-2 text-sm text-[#8C6B79] hover:text-[#40202D] transition-colors">
          <Home className="w-4 h-4" /> Cancelar
        </Link>
        <button
          onClick={handleConfirm}
          disabled={loading || doc.status === "COMPLETADO"}
          className="py-4 px-10 bg-[#40202D] hover:bg-[#5B283A] disabled:opacity-40 text-white text-sm font-medium rounded-2xl shadow-sm transition-all tracking-wide"
        >
          {loading ? "Procesando…" : doc.status === "COMPLETADO" ? "Ya procesado" : "Confirmar recepción"}
        </button>
      </div>
    </div>
  );
}
