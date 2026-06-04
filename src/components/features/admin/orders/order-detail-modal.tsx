import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { OrderData } from "@/components/organisms/orders-table";
import { Eye } from "lucide-react";

interface OrderDetailModalProps {
  open: boolean;
  order: OrderData | null;
  onClose: () => void;
}

export function OrderDetailModal({ open, order, onClose }: OrderDetailModalProps) {
  const [displayData, setDisplayData] = useState<OrderData | null>(null);

  useEffect(() => {
    if (order) {
      setDisplayData(order);
    }
  }, [order]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Pendiente': return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-1 text-[13px] font-medium text-yellow-700 border border-yellow-200">Pendiente</span>;
      case 'En Progreso': return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[13px] font-medium text-blue-700 border border-blue-200">En Progreso</span>;
      case 'Finalizado': return <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-[13px] font-medium text-green-700 border border-green-200">Finalizado</span>;
      case 'Cancelado': return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[13px] font-medium text-gray-700 border border-gray-300">Cancelado</span>;
      default: return <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-[13px] font-medium text-neutral-600">{status}</span>;
    }
  };

  const getMethodBadge = (method?: string) => {
    switch (method) {
      case 'store': return <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-[13px] font-medium text-purple-700">Recojo en Tienda</span>;
      case 'motorized': return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[13px] font-medium text-blue-700">Motorizado</span>;
      case 'point': return <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-[13px] font-medium text-orange-700">Punto de Encuentro</span>;
      case 'province': return <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-[13px] font-medium text-teal-700">Provincia (Shalom)</span>;
      default: return null;
    }
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
            <Dialog.Panel className="relative bg-[#fffcfd] rounded-[24px] border border-pink-100 shadow-2xl w-full max-w-[440px] overflow-hidden flex flex-col">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-pink-100 bg-[#dfa6b6]/10">
                <div className="flex items-center gap-3">
                  <div className="text-[#D6405F]">
                    <Eye size={22} />
                  </div>
                  <Dialog.Title as="h2" className="text-[17px] font-bold text-gray-800">
                    Detalle de Orden
                  </Dialog.Title>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col gap-3">
                {/* Block 1 */}
                <div className="flex flex-col gap-4 p-4 border border-pink-50 rounded-[16px] bg-white shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Orden</span>
                      <span className="text-[15px] font-bold text-gray-800">{displayData?.id}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Monto Total</span>
                      <span className="text-[17px] font-bold text-[#D6405F]">
                        S/ {displayData?.amount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Cliente</span>
                    <span className="text-[15px] font-medium text-gray-700">{displayData?.client}</span>
                  </div>
                </div>

                {/* Block 2 */}
                <div className="grid grid-cols-2 gap-4 p-4 border border-pink-50 rounded-[16px] bg-white shadow-sm">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Método Entrega</span>
                    <div>{getMethodBadge(displayData?.deliveryMethod)}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Estado Actual</span>
                    <div>{getStatusBadge(displayData?.status)}</div>
                  </div>
                </div>

                {/* Block 3 */}
                <div className="flex items-center justify-between p-4 border border-pink-50 rounded-[16px] bg-white shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Fecha de registro</span>
                  <span className="text-[13px] font-medium text-gray-700">
                    {displayData?.date}
                  </span>
                </div>

                {/* Button */}
                <div className="flex justify-end mt-2">
                  <button onClick={onClose} className="px-7 py-2.5 bg-[#dfa6b6] hover:bg-[#D6405F] text-white text-[14px] font-medium rounded-full transition-colors shadow-sm">
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
