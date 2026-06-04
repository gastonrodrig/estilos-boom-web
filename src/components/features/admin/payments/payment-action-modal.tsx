import React, { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export type PaymentActionType = "confirm" | "observe";

interface PaymentActionModalProps {
  open: boolean;
  action: PaymentActionType | null;
  paymentId?: string;
  onClose: () => void;
  onConfirm: (message?: string) => Promise<void>;
}

const PREDEFINED_REASONS = [
  "El número de operación no se encuentra registrado.",
  "El monto transferido no coincide con el total del pedido.",
  "La fecha de la operación no coincide con la fecha del pedido.",
  "El pago fue realizado a una cuenta incorrecta.",
  "Otros..."
];

export function PaymentActionModal({ open, action, paymentId, onClose, onConfirm }: PaymentActionModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedReason("");
      setCustomMessage("");
      setIsSubmitting(false);
    }
  }, [open]);

  const finalMessage = selectedReason === "Otros..." ? customMessage : selectedReason;

  const handleConfirm = async () => {
    if (action === "observe" && !finalMessage.trim()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(action === "observe" ? finalMessage : undefined);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isObserve = action === "observe";

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-[440px] overflow-hidden flex flex-col">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="text-[#F59CAE]">
                    {isObserve ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
                  </div>
                  <Dialog.Title as="h2" className="text-[17px] font-bold text-neutral-800">
                    {isObserve ? "Observar Pago" : "Confirmar Pago"}
                  </Dialog.Title>
                </div>
                <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6 space-y-5">
                <p className="text-[14px] text-neutral-600 leading-relaxed">
                  {isObserve 
                    ? "El pago pasará a estado 'Observado' y el cliente deberá corregir la información de su operación desde su panel."
                    : "¿Estás seguro de que deseas confirmar este pago? El pedido pasará a 'Pago Confirmado' automáticamente."}
                </p>

                {isObserve && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-semibold text-neutral-800">Motivo de la observación <span className="text-red-500">*</span></label>
                      <select
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#F59CAE] focus:ring-1 focus:ring-[#F59CAE] text-[13px] text-neutral-700 transition-colors"
                      >
                        <option value="" disabled>Selecciona un motivo...</option>
                        {PREDEFINED_REASONS.map((reason, idx) => (
                          <option key={idx} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>

                    {selectedReason === "Otros..." && (
                      <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[13px] font-semibold text-neutral-800">Especificar motivo <span className="text-red-500">*</span></label>
                        <textarea 
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder="Escribe el motivo detallado..."
                          className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#F59CAE] focus:ring-1 focus:ring-[#F59CAE] min-h-[100px] resize-none text-[13px] text-neutral-700 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-5 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
                <button 
                  onClick={onClose} 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-white border border-neutral-200 text-neutral-600 text-sm font-medium rounded-full hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={isSubmitting || (isObserve && !finalMessage.trim())}
                  className={`px-7 py-2.5 text-[14px] font-medium rounded-full transition-all duration-300 shadow-sm disabled:cursor-not-allowed
                    ${isObserve 
                      ? finalMessage.trim() 
                        ? "bg-[#594246] text-white hover:bg-[#4a3e3e]" 
                        : "bg-white border border-[#EBEAE8] text-[#594246]/50"
                      : "bg-[#F59CAE] hover:bg-[#eb8c9f] text-white disabled:opacity-50"}`}
                >
                  {isSubmitting ? "Guardando..." : isObserve ? "Observar" : "Confirmar"}
                </button>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
