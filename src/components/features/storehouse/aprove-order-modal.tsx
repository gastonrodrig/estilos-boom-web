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
      <div className="bg-white rounded-[30px] w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#594246]">Control de Calidad</h2>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-[#9b8088]" />
          </button>
        </div>

        <p className="text-[#9b8088] mb-8 text-center">
          ¿Cómo calificarías la calidad del trabajo de <span className="text-[#F2778D] font-bold">{agentName || 'este agente'}</span>?
        </p>

        {/* Estrellas Interactivas */}
        <div className="flex justify-center gap-2 mb-10">
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
                  star <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onConfirm(rating)}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-[#4CAF50] text-white font-bold text-lg hover:bg-[#43a047] disabled:opacity-50 flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-100"
          >
            {isLoading ? "Procesando..." : <><CheckCircle2 className="w-6 h-6" /> Aprobar e Ingresar</>}
          </button>
          <button onClick={onClose} className="w-full py-3 text-[#9b8088] font-medium hover:text-[#594246]">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};