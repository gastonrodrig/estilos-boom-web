import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { OrderData, OrderStatus } from "@/components/organisms/orders-table";
import { Edit2 } from "lucide-react";

interface OrderEditModalProps {
  open: boolean;
  order: OrderData | null;
  onClose: () => void;
  onSave: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderEditModal({ open, order, onClose, onSave }: OrderEditModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('Pendiente');

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  const handleSave = () => {
    if (order) {
      onSave(order.id, selectedStatus);
      onClose();
    }
  };

  const statuses: OrderStatus[] = ['Pendiente', 'Preparando', 'En camino', 'Entregado', 'Cancelado'];

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
            <Dialog.Panel className="relative bg-[#fffcfd] rounded-[24px] border border-pink-100 shadow-2xl w-full max-w-[380px] overflow-hidden flex flex-col">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-pink-100 bg-[#dfa6b6]/10">
                <div className="flex items-center gap-3">
                  <div className="text-[#D6405F]">
                    <Edit2 size={20} />
                  </div>
                  <Dialog.Title as="h2" className="text-[17px] font-bold text-gray-800">
                    Editar Estado
                  </Dialog.Title>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 mb-2">
                  <span className="text-[12px] font-medium text-gray-500">Orden seleccionada: <strong className="text-gray-800">{order?.id}</strong></span>
                  <span className="text-[12px] font-medium text-gray-500">Cambia el estado de la orden actual.</span>
                </div>

                <div className="space-y-2">
                  {statuses.map((status) => (
                    <label key={status} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedStatus === status ? 'border-[#dfa6b6] bg-[#dfa6b6]/10' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <span className={`text-[14px] font-semibold ${selectedStatus === status ? 'text-[#D6405F]' : 'text-gray-700'}`}>{status}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedStatus === status ? 'border-[#D6405F]' : 'border-gray-300'}`}>
                        {selectedStatus === status && <div className="w-2.5 h-2.5 bg-[#D6405F] rounded-full" />}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 text-[14px] font-medium rounded-full transition-colors">
                    Cancelar
                  </button>
                  <button onClick={handleSave} className="px-5 py-2.5 bg-[#dfa6b6] hover:bg-[#D6405F] text-white text-[14px] font-medium rounded-full transition-colors shadow-sm">
                    Guardar Cambios
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
