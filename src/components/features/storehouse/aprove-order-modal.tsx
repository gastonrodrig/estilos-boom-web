"use client";

import { useState } from "react";
import { Modal } from "@/components"; // Ajusta la ruta a tu componente átomo
import { Star } from "lucide-react";

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rating: number, observations: string, qtyIncidences: number) => void;
  isLoading: boolean;
  agentName?: string;
  maxQuantity: number; // 👈 1. Añadimos la cantidad máxima permitida
}

export function ApproveInventoryModal({ isOpen, onClose, onConfirm, isLoading, agentName, maxQuantity }: ApproveModalProps) {
  const [rating, setRating] = useState(5);
  const [qtyIncidences, setQtyIncidences] = useState(0);
  const [observations, setObservations] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 💡 2. Doble validación antes de enviar por si acaso
    if (qtyIncidences > maxQuantity) {
      alert(`No puedes registrar más incidencias (${qtyIncidences}) que las prendas totales de la orden (${maxQuantity}).`);
      return;
    }
    
    onConfirm(rating, observations, qtyIncidences);
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Control de Calidad y Cierre de Orden">
      <form onSubmit={handleSubmit} className="space-y-5 p-2">
        <p className="text-sm text-[#9b8088]">
          Estás aprobando el ingreso de mercadería del proveedor <b className="text-[#594246]">{agentName || "Proveedor"}</b>. 
          Completa el informe de conformidad para el Kardex.
        </p>

        {/* 1. Calificación de Estrellas */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#594246] uppercase tracking-wider">Calificación del Proveedor</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-all hover:scale-110 ${star <= rating ? "text-amber-400" : "text-gray-200"}`}
              >
                <Star className="w-7 h-7 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* 2. Input de Incidencias / Mermas */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#594246] uppercase tracking-wider">
            Prendas con Incidencia / Dañadas (Unidades)
          </label>
          <input
            type="number"
            min={0}
            max={maxQuantity}
            value={qtyIncidences}
            onChange={(e) => setQtyIncidences(Math.max(0, Number(e.target.value)))}
            className="w-full h-12 rounded-xl border border-rose-100 px-4 outline-none focus:border-[#F2778D] font-mono font-bold"
            placeholder="0"
          />
          <p className="text-[11px] text-gray-400">Estas unidades se penalizarán y no se sumarán al stock vendible.</p>
        </div>

        {/* 3. Textarea de Observaciones */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#594246] uppercase tracking-wider">Observaciones de Auditoría</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-rose-100 p-3 text-sm outline-none focus:border-[#F2778D] resize-none"
            placeholder="Ej: 3 prendas llegaron descosidas en la costura lateral. El resto conforme."
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-[#4CAF50] hover:bg-[#43a047] text-white rounded-xl font-bold transition-all shadow-lg shadow-green-100 disabled:opacity-50 mt-4"
        >
          {isLoading ? "Procesando ingreso..." : "Finalizar y Registrar en Inventario"}
        </button>
      </form>
    </Modal>
  );
}