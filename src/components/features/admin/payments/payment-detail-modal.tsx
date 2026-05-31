import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Payment, PaymentStatus } from "@models";

interface PaymentDetailModalProps {
  open: boolean;
  payment: Payment | null;
  onClose: () => void;
}

export function PaymentDetailModal({ open, payment, onClose }: PaymentDetailModalProps) {
  const [displayData, setDisplayData] = useState<Payment | null>(null);

  useEffect(() => {
    if (payment) {
      setDisplayData(payment);
    }
  }, [payment]);

  const validationType = displayData?.transactionType === "MERCADO_PAGO" ? "Automática" : "Manual";

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case PaymentStatus.VERIFICADO:
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[13px] font-medium text-emerald-500">Verificado</span>;
      case PaymentStatus.PENDIENTE:
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[13px] font-medium text-amber-500">Pendiente</span>;
      case PaymentStatus.RECHAZADO:
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-[13px] font-medium text-red-500">Rechazado</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-[13px] font-medium text-neutral-600">{status}</span>;
    }
  };

  const getValidationBadge = (type?: string) => {
    if (type === "Automática") {
      return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[13px] font-medium text-blue-500">Automática</span>;
    }
    return <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-[13px] font-medium text-purple-500">Manual</span>;
  };

  const getMethodBadge = (method?: string) => {
    if (!method) return null;
    if (method.toLowerCase().includes("mercado pago") || method === "card") {
      return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[13px] font-medium text-blue-500">Mercado Pago</span>;
    }
    if (method.toLowerCase().includes("yape")) {
      return <span className="inline-flex items-center rounded-full bg-[#F4E3F7] px-2.5 py-1 text-[13px] font-medium text-[#8A259C]">Yape</span>;
    }
    return <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-[13px] font-medium text-neutral-600">{method}</span>;
  };

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
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <path d="M8 15h4.5a1.5 1.5 0 0 0 0-3H10a1.5 1.5 0 0 1 0-3h4"></path>
                    </svg>
                  </div>
                  <Dialog.Title as="h2" className="text-[17px] font-bold text-neutral-800">
                    Detalle del Pago
                  </Dialog.Title>
                </div>
                <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col gap-3">
                {/* Block 1 */}
                <div className="flex flex-col gap-4 p-4 border border-neutral-100 rounded-[16px] bg-white shadow-sm shadow-neutral-50/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Pedido</span>
                      <span className="text-[15px] font-bold text-neutral-800">{displayData?.orderNumber || "EB-0040"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Monto</span>
                      <span className="text-[17px] font-bold text-[#EE5D7A]">
                        S/ {displayData?.amount?.toFixed(2) || "89.00"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Cliente</span>
                    <span className="text-[15px] font-medium text-neutral-700">{displayData?.clientName || "María Quispe"}</span>
                  </div>
                </div>

                {/* Block 2 */}
                <div className="grid grid-cols-2 gap-4 p-4 border border-neutral-100 rounded-[16px] bg-white shadow-sm shadow-neutral-50/50">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Método</span>
                    <div>{getMethodBadge(displayData?.method)}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Nº Operación</span>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-[13px] font-medium text-neutral-600 tracking-wide">
                        {displayData?.operationNumber || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Block 3 */}
                <div className="grid grid-cols-2 gap-4 p-4 border border-neutral-100 rounded-[16px] bg-white shadow-sm shadow-neutral-50/50">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Estado</span>
                    <div>{getStatusBadge(displayData?.status)}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Validación</span>
                    <div>{getValidationBadge(validationType)}</div>
                  </div>
                </div>

                {/* Block 4 */}
                <div className="flex items-center justify-between p-4 border border-neutral-100 rounded-[16px] bg-white shadow-sm shadow-neutral-50/50">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Fecha de registro</span>
                  <span className="text-[13px] font-medium text-neutral-700">
                    {displayData?.createdAt ? new Date(displayData.createdAt).toLocaleString() : ""}
                  </span>
                </div>

                {/* Button */}
                <div className="flex justify-end mt-2">
                  <button onClick={onClose} className="px-7 py-2.5 bg-[#F59CAE] hover:bg-[#eb8c9f] text-white text-[14px] font-medium rounded-full transition-colors shadow-sm">
                    Cerrar
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
