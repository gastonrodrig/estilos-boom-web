"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Modal, CTA } from "@/components/atoms";

// Tu componente de rating. Puedes importarlo en lugar de definirlo aquí si ya lo tienes aislado.
const StarRating = ({ rating, setRating, size = 6 }: { rating: number; setRating?: (r: number) => void; size?: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} onClick={() => setRating && setRating(star)} type="button" className={`focus:outline-none ${star <= rating ? "text-amber-400" : "text-gray-300"}`}>
        ★
      </button>
    ))}
  </div>
);

interface UpdatePhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  onConfirmAdvance: () => void;
}

export const UpdatePhaseModal = ({ isOpen, onClose, order, onUpdateStatus, onConfirmAdvance }: UpdatePhaseModalProps) => {
  const [qualityRating, setQualityRating] = useState(0);

  if (!order) return null;
  const now = new Date();

  return (
    <Modal 
      open={isOpen} 
      onClose={onClose}
      panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8"
      title="Gestión de Fase de Producción"
      titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
    >
      <div className="space-y-8 pt-6">
        {(() => {
          let current = "Contacto Inicial";
          let next = "Corte / Habilitado";
          if (order.status === "COMPARANDO") { current = "Corte / Habilitado"; next = "Confección / Costura"; } 
          else if (order.status === "EN_PRODUCCION") { current = "Confección / Costura"; next = "Avance Parcial"; } 
          else if (order.status === "CONTROL_CALIDAD") { current = "Control de Calidad"; next = "Finalizado / Completada"; }

          const isFinalizing = order.status === "CONTROL_CALIDAD";

          return (
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-4 bg-rose-50/30 p-4 rounded-2xl border border-rose-50">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#b79ca5] uppercase">Fase Actual</span>
                  <p className="text-sm font-bold text-[#594246]">{current}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#F2778D]" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#F2778D] uppercase">Siguiente Fase</span>
                  <p className="text-sm font-bold text-[#594246]">{next}</p>
                </div>
              </div>

              {isFinalizing && (
                <div className="bg-rose-50/20 p-6 rounded-2xl border border-rose-100 flex flex-col items-center gap-4">
                  <p className="text-sm font-bold text-[#594246] text-center">¿Cómo calificarías el trabajo de este taller?</p>
                  <StarRating rating={qualityRating} setRating={setQualityRating} size={8} />
                  <p className="text-[10px] text-[#9b8088] font-medium uppercase tracking-widest mt-2">Calidad de Confección</p>
                </div>
              )}
            </div>
          );
        })()}

        <div className="flex flex-col gap-4">
          <div className="p-6 rounded-2xl border-2 border-[#F2778D] bg-rose-50/20 ring-4 ring-rose-50/30 text-left flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F2778D] text-white">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-bold text-[#594246]">Avanzar Fase de Producción</p>
              <p className="text-xs text-[#9b8088] leading-tight">Esta acción registrará el avance a la siguiente etapa.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 py-2 border-t border-rose-50 pt-6">
          <Clock className="w-3.5 h-3.5 text-[#b79ca5]" />
          <p className="text-[11px] text-[#9b8088] font-medium">
            Se registrará el: <span className="text-[#594246] font-bold">{now.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })} · {now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
          </p>
        </div>

        <div className="flex gap-4">
          <CTA onClick={onClose} className="flex-1 !bg-white border border-rose-100 !text-[#9b8088]">Volver</CTA>
          <CTA 
            className="flex-1 shadow-lg shadow-rose-100"
            onClick={async () => {
              if (order.status === "CONTROL_CALIDAD") {
                await onUpdateStatus(order._id, "COMPLETADA"); // Quizás también quieras enviar el qualityRating al backend aquí
                toast.success("Orden Completada.");
                onClose();
              } else {
                onConfirmAdvance();
              }
            }}
          >
            Confirmar Avance
          </CTA>
        </div>
      </div>
    </Modal>
  );
};