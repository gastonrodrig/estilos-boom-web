"use client";

import { X, Check, Scissors, Factory, Activity, ClipboardCheck, Clock, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { Modal, CTA } from "@/components/atoms";

interface ProductionSubStateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  prodSubState: string;
  onUpdateSubState: (orderId: string, state: string) => Promise<void>;
}

export const ProductionSubStateModal = ({ isOpen, onClose, order, prodSubState, onUpdateSubState }: ProductionSubStateModalProps) => {
  if (!order) return null;

  const steps = [
    { id: "CORTE", label: "Corte / Habilitado", desc: "Telas cortadas y habilitadas para costura.", icon: Scissors },
    { id: "CONFECCION", label: "Confección", desc: "En proceso de costura y armado de prendas.", icon: Factory },
    { id: "AVANCE", label: "Avance Parcial", desc: "Lotes de producción finalizados.", icon: Activity },
    { id: "ENTREGA", label: "Control de Calidad", desc: "Entregado a almacén para revisión.", icon: ClipboardCheck },
  ];

  return (
    <Modal 
      open={isOpen} 
      onClose={onClose}
      panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8"
      title="Avance en Taller"
      titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-[#b79ca5] hover:text-[#594246] hover:bg-rose-50 p-2 rounded-full transition-colors z-50">
        <X className="w-5 h-5" />
      </button>
      <div className="pt-6 relative">
        <p className="text-sm text-[#9b8088] mb-8">Registra el avance consecutivo de la producción en el taller.</p>

        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-[3] flex flex-col justify-between">
            <div className="relative pl-6 ml-2 space-y-8">
              <div className="absolute left-[15px] top-[16px] bottom-[16px] w-[2px] bg-rose-100/50 z-0" />
              
              {steps.map((step) => {
                const orderMap: Record<string, number> = { "CORTE": 0, "CONFECCION": 1, "AVANCE": 2, "ENTREGA": 3 };
                const currentStateIdx = orderMap[prodSubState];
                const stepIdx = orderMap[step.id];
                const isCompleted = stepIdx < currentStateIdx;
                const isActive = stepIdx === currentStateIdx;

                return (
                  <div key={step.id} className="relative z-10 flex gap-6 items-start">
                    <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 ${isActive ? "bg-[#F2778D] text-white ring-4 ring-rose-50" : isCompleted ? "bg-emerald-500 text-white" : "bg-[#ede8e9] text-[#b79ca5]"}`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                    </div>
                    <div className="pt-1 flex-1">
                      <p className={`text-sm font-bold ${isActive || isCompleted ? "text-[#594246]" : "text-[#b79ca5]"}`}>{step.label}</p>
                      <p className="text-[11px] text-[#9b8088] leading-tight mt-0.5">{step.desc}</p>
                      {(() => {
                        const subItem = order.sub_states?.find((s: any) => s.step === step.id);
                        if (subItem) {
                          const d = new Date(subItem.date);
                          return (
                            <div className="flex items-center gap-1 mt-1.5 text-[10px] font-bold text-emerald-600">
                              <Clock className="w-3 h-3" />
                              {d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} · {d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-[2]">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col gap-4 sticky top-0">
              <div className="bg-amber-100 p-2.5 rounded-lg w-fit">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-base font-bold text-amber-900 flex flex-wrap items-center gap-2">
                  Registro Manual <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Temporal</span>
                </p>
                <p className="text-sm text-amber-700 leading-relaxed mt-2">
                  La automatización de avance está <span className="font-bold">en construcción</span>. Realiza el seguimiento manualmente.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-rose-50 flex gap-4">
          {prodSubState !== "ENTREGA" && (
            <CTA 
              className={`flex-1 shadow-lg ${prodSubState === "AVANCE" ? "!bg-[#10b981] hover:!bg-[#059669] shadow-emerald-100/50" : "shadow-rose-100"}`}
              icon={prodSubState === "AVANCE" ? ClipboardCheck : ArrowRight}
              onClick={async () => {
                try {
                  if (prodSubState === "CORTE") {
                    await onUpdateSubState(order._id, "CORTE");
                    toast.success("Corte registrado. Pasando a Confección.");
                  } else if (prodSubState === "CONFECCION") {
                    await onUpdateSubState(order._id, "CONFECCION");
                    toast.success("Confección registrada. Pasando a Avance Parcial.");
                  } else if (prodSubState === "AVANCE") {
                    await onUpdateSubState(order._id, "AVANCE");
                    await onUpdateSubState(order._id, "ENTREGA");
                    toast.success("¡Producción entregada! Pasando a Control de Calidad.");
                    onClose();
                  }
                } catch (error) {
                  toast.error("Error al actualizar el estado.");
                }
              }}
            >
              {prodSubState === "CORTE" ? "Registrar Corte" : prodSubState === "CONFECCION" ? "Registrar Confección" : "Entregar a Control Calidad"}
            </CTA>
          )}
        </div>
      </div>
    </Modal>
  );
};