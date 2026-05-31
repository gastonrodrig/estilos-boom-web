"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Modal, CTA } from "@/components/atoms";

interface ExtendDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, reason: string) => void;
}

export const ExtendDeadlineModal = ({ isOpen, onClose, onConfirm }: ExtendDeadlineModalProps) => {
  const [newDate, setNewDate] = useState("");
  const [extendReason, setExtendReason] = useState("");

  const handleConfirm = () => {
    if (newDate) {
      onConfirm(new Date(newDate).toISOString(), extendReason);
      toast.success("Fecha prolongada");
      onClose();
    } else {
      toast.error("Seleccione una fecha.");
    }
  };

  return (
    <Modal 
      open={isOpen} 
      onClose={onClose}
      panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-8"
      title="Prolongar Fecha de Entrega"
      titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
    >
      <div className="space-y-6 pt-2">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b79ca5] uppercase tracking-wider">Nueva Fecha de Producción</label>
          <input 
            type="date" 
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full h-12 rounded-xl border border-rose-100 px-4 outline-none focus:ring-1 focus:ring-[#F2778D] text-[#594246]" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b79ca5] uppercase tracking-wider">Razón de la prórroga</label>
          <select 
            value={extendReason}
            onChange={(e) => setExtendReason(e.target.value)}
            className="w-full h-12 rounded-xl border border-rose-100 px-4 outline-none focus:ring-1 focus:ring-[#F2778D] text-[#594246] appearance-none bg-white"
          >
            <option value="">Selecciona una razón...</option>
            <option value="retraso-taller">Retraso en el taller</option>
            <option value="falta-insumos">Falta de insumos / avíos</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div className="flex gap-4 pt-4">
          <CTA onClick={onClose} className="flex-1 !bg-white border border-rose-100 !text-[#9b8088]">Cancelar</CTA>
          <CTA onClick={handleConfirm} className="flex-1 shadow-lg shadow-rose-100">Confirmar</CTA>
        </div>
      </div>
    </Modal>
  );
};