import React, { useState } from 'react';
import { CalendarClock, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, reason: string) => void;
  isLoading: boolean;
}

export const ExtendDateModal = ({ isOpen, onClose, onConfirm, isLoading }: Props) => {
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[30px] w-full max-w-lg p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#594246]">Prolongar Fecha</h2>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-[#9b8088]" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#b46a7c] uppercase mb-2">Nueva Fecha de Entrega</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full p-4 rounded-2xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-[#F2778D] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#b46a7c] uppercase mb-2">Motivo de la Extensión</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Retraso por huelga de transporte, acuerdo con proveedor..."
              rows={4}
              className="w-full p-4 rounded-2xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-[#F2778D] transition-all resize-none"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => onConfirm(newDate, reason)}
            disabled={isLoading || !newDate || !reason}
            className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
          >
            {isLoading ? "Guardando..." : <><CalendarClock className="w-6 h-6" /> Confirmar Extensión</>}
          </button>
        </div>
      </div>
    </div>
  );
};