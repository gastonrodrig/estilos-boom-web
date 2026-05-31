"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Factory } from "lucide-react";
import { Modal, CTA } from "@/components/atoms";

const formatCurrency = (val: number) => val === 0 ? "Sin registrar" : `S/ ${(val || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

interface ConfirmWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  firstItemName: string;
  displayTotal: number;
  onConfirmWinner: (orderId: string, status: string, winnerId: string) => Promise<void>;
}

export const ConfirmWorkshopModal = ({ 
  isOpen, 
  onClose, 
  order, 
  firstItemName, 
  displayTotal, 
  onConfirmWinner 
}: ConfirmWorkshopModalProps) => {
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(null);

  if (!order) return null;

  const handleConfirm = async () => {
    if (!selectedWinnerId) return toast.error("Seleccione un taller primero.");
    
    try {
      await onConfirmWinner(order._id, "EN_PRODUCCION", selectedWinnerId);
      toast.success("Taller confirmado. La orden ha pasado a Producción.");
      setSelectedWinnerId(null);
      onClose();
    } catch (error) {
      toast.error("Error al confirmar el taller.");
    }
  };

  const handleClose = () => {
    setSelectedWinnerId(null);
    onClose();
  };

  return (
    <Modal 
      open={isOpen} 
      onClose={handleClose}
      panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8"
      title="Confirmar Taller"
      titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
    >
      <div className="space-y-6 pt-2">
        <p className="text-sm text-[#9b8088]">
          Confirma el taller que ejecutará esta orden para avanzar a la etapa de Producción.
        </p>
        
        <div className="space-y-3">
          {order.quotes?.filter((q: any) => q.quote_status !== 'RECHAZADO').map((q: any, idx: number) => {
            const agentId = typeof q.id_agent === 'string' ? q.id_agent : (q.id_agent?._id || q.id_agent?.name_company || `agent-${idx}`);
            const agentName = q.id_agent?.name_company || q.id_agent?.name || "Cargando...";
            const isSelected = selectedWinnerId === agentId;
            const amount = q.total_amount || displayTotal;

            return (
              <div 
                key={agentId}
                onClick={() => setSelectedWinnerId(agentId)}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                  isSelected ? "border-[#F2778D] bg-rose-50" : "border-rose-50 bg-white hover:border-[#f2b6c1]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-rose-100 text-[#F2778D] flex items-center justify-center">
                    <Factory className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#594246]">{agentName}</p>
                    <p className="text-xs text-[#9b8088] mb-1">{firstItemName}</p>
                    <p className="text-xs text-[#9b8088]">
                      Costo total registrado: <span className="font-bold text-[#F2778D]">{formatCurrency(amount)}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-rose-100">
          <CTA 
            onClick={handleConfirm}
            className="w-full py-4 shadow-lg shadow-rose-100"
          >
            Confirmar y Enviar a Producción
          </CTA>
        </div>
      </div>
    </Modal>
  );
};