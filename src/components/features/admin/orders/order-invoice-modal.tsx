import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { OrderData } from "@/components/organisms/orders-table";
import { Printer, X } from "lucide-react";

interface OrderInvoiceModalProps {
  open: boolean;
  order: OrderData | null;
  onClose: () => void;
}

export function OrderInvoiceModal({ open, order, onClose }: OrderInvoiceModalProps) {
  const [displayData, setDisplayData] = useState<OrderData | null>(null);

  useEffect(() => {
    if (order) {
      setDisplayData(order);
    }
  }, [order]);

  const handlePrint = () => {
    window.print();
  };

  const getDeliveryText = (method?: string) => {
    switch (method) {
      case 'store': return 'Recojo en Tienda';
      case 'motorized': return 'Delivery Motorizado';
      case 'point': return 'Punto de Encuentro';
      case 'province': return 'Envío Provincia (Shalom)';
      default: return '-';
    }
  };

  const subtotal = displayData ? displayData.amount / 1.18 : 0;
  const igv = displayData ? displayData.amount - subtotal : 0;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
            <Dialog.Panel className="relative bg-white shadow-2xl w-full max-w-[800px] flex flex-col p-10 print:shadow-none print:w-full print:max-w-full">
              
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors print:hidden">
                <X size={24} />
              </button>

              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-[#D6405F] tracking-wide">ESTILOS BOOM</h1>
                  <p className="text-sm font-bold text-gray-800 tracking-widest uppercase mt-2">Boleta de Venta Electrónica</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800 tracking-wide">{displayData?.id}</p>
                  <p className="text-sm text-gray-500 mt-1">Fecha: {displayData?.date}</p>
                </div>
              </div>

              {/* Info Blocks */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <p className="text-[10px] font-bold text-[#D6405F] tracking-widest uppercase mb-2">Cliente</p>
                  <p className="text-base font-bold text-gray-800">{displayData?.client}</p>
                  <p className="text-sm text-gray-500 mt-1">Venta al por menor</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#D6405F] tracking-widest uppercase mb-2">Destino / Entrega</p>
                  <p className="text-base font-bold text-gray-800">{getDeliveryText(displayData?.deliveryMethod)}</p>
                  <p className="text-sm text-gray-500 mt-1">Estado: {displayData?.status}</p>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left mb-10">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Prenda / Producto</th>
                    <th className="py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">Cant.</th>
                    <th className="py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Costo Unitario</th>
                    <th className="py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(displayData as any)?.items?.length ? (
                    (displayData as any).items.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-5">
                          <p className="text-sm font-bold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{item.size ? `Talla: ${item.size}` : ''}</p>
                        </td>
                        <td className="py-5 text-center text-sm font-medium text-gray-600">{item.quantity}</td>
                        <td className="py-5 text-right text-sm font-medium text-gray-600">S/ {(item.price / 1.18).toFixed(2)}</td>
                        <td className="py-5 text-right text-sm font-bold text-gray-800">S/ {(item.price * item.quantity / 1.18).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-gray-100">
                      <td className="py-5">
                        <p className="text-sm font-bold text-gray-800">Múltiples Artículos</p>
                        <p className="text-xs text-gray-400 mt-1">Referencia a compra del carrito</p>
                      </td>
                      <td className="py-5 text-center text-sm font-medium text-gray-600">1</td>
                      <td className="py-5 text-right text-sm font-medium text-gray-600">S/ {subtotal.toFixed(2)}</td>
                      <td className="py-5 text-right text-sm font-bold text-gray-800">S/ {subtotal.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Summary */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal:</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 border-b border-gray-200 pb-4">
                    <span>IGV (18%):</span>
                    <span>S/ {igv.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span className="text-gray-800 uppercase tracking-wide">Total Venta:</span>
                    <span className="text-[#D6405F]">S/ {displayData?.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Floating Print Button */}
              <div className="fixed bottom-8 right-8 print:hidden">
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-6 py-3 bg-[#4a3e3e] hover:bg-black text-white text-sm font-medium rounded-full shadow-lg transition-all"
                >
                  <Printer size={18} />
                  Imprimir / Guardar PDF
                </button>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
