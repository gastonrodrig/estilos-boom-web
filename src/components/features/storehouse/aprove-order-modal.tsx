import React, { useState } from 'react';
import { Star, CheckCircle2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rating: number) => void;
  isLoading: boolean;
  agentName?: string;
}

export const ApproveInventoryModal = ({ isOpen, onClose, onConfirm, isLoading, agentName }: Props) => {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-[#40202D] dark:text-white tracking-wide">Control de Calidad</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/80 dark:hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-[#EAE0E2] dark:hover:border-white/10">
            <X className="w-6 h-6 text-[#8C6B79] dark:text-gray-400" />
          </button>
        </div>

        <p className="text-[14px] font-medium text-[#8C6B79] dark:text-gray-300 mb-8 text-center leading-relaxed">
          ¿Cómo calificarías la calidad del trabajo de <span className="text-[#D6405F] dark:text-[#F8BBD0] font-black">{agentName || 'este agente'}</span>?
        </p>

        {/* Estrellas Interactivas */}
        <div className="flex justify-center gap-3 mb-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-12 h-12 ${
                  star <= (hover || rating) ? 'fill-amber-400 text-amber-400 drop-shadow-md' : 'text-[#EAE0E2] dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => onConfirm(rating)}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? "Procesando..." : <><CheckCircle2 className="w-5 h-5" /> Aprobar a Inventario</>}
          </button>
          <button onClick={onClose} className="w-full py-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-400 font-black text-[11px] uppercase tracking-widest hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#40202D] dark:hover:text-white transition-colors shadow-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};