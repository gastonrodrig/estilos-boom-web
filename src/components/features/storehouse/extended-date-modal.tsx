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
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-[32px] w-full max-w-lg p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium text-[#40202D] dark:text-white tracking-wide">Prolongar Fecha</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/80 dark:hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-[#EAE0E2] dark:hover:border-white/10">
            <X className="w-6 h-6 text-[#8C6B79] dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest mb-2">Nueva Fecha de Entrega</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full h-14 px-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest mb-2">Motivo de la Extensión</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Retraso por huelga de transporte, acuerdo con proveedor..."
              rows={4}
              className="w-full p-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md text-[13px] font-medium text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all resize-none placeholder:text-[#8C6B79]/50"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <button
            onClick={() => onConfirm(newDate, reason)}
            disabled={isLoading || !newDate || !reason}
            className="w-full py-4 rounded-2xl bg-amber-500/90 text-white font-medium text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? "Guardando..." : <><CalendarClock className="w-5 h-5" /> Confirmar Extensión</>}
          </button>
          <button onClick={onClose} className="w-full py-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-400 font-medium text-[11px] uppercase tracking-widest hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#40202D] dark:hover:text-white transition-colors shadow-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
