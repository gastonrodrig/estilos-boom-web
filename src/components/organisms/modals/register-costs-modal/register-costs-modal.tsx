"use client";

import { useState } from "react";
import { Modal, CTA } from "@/components/atoms";
import { Scissors, Package } from "lucide-react";

interface RegisterCostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onConfirmCosts: (costs: Record<string, number>) => Promise<void>;
}

export const RegisterCostsModal = ({ isOpen, onClose, order, onConfirmCosts }: RegisterCostsModalProps) => {
  const [costPerUnit, setCostPerUnit] = useState<string>("");

  if (!order) return null;

  const totalUnits = order.base_items?.reduce((acc: number, i: any) => acc + (i.quantity ?? 0), 0) ?? 0;
  const perUnit = parseFloat(costPerUnit) || 0;
  const totalCost = perUnit * totalUnits;
  const productName = order.base_items?.[0]?.id_variant?.id_product?.name || "Producto sin nombre";
  const workshopName = order.quotes?.[0]?.id_agent?.name_company || "Taller Asignado";

  const handleConfirm = () => {
    const costs: Record<string, number> = {};
    order.base_items?.forEach((item: any, idx: number) => {
      costs[item.id_variant?._id || idx.toString()] = perUnit * (item.quantity ?? 1);
    });
    onConfirmCosts(costs);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      panelClassName="relative bg-white dark:bg-[#1a0e14] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      title=""
      titleClassName="hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-[#8B3A52] to-[#D6405F] p-6 pb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-white/15 rounded-xl">
            <Scissors size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">{workshopName}</p>
            <h3 className="text-white font-semibold text-base leading-tight">{productName}</h3>
          </div>
        </div>
      </div>

      {/* Stats pill floating over header */}
      <div className="px-6 -mt-4 mb-5">
        <div className="bg-white dark:bg-[#2e1d27] rounded-xl border border-[rgba(139,58,82,0.12)] dark:border-white/10 shadow-lg p-3 flex items-center gap-3">
          <div className="p-2 bg-[#FDF0F3] dark:bg-[rgba(139,58,82,0.15)] rounded-lg">
            <Package size={16} className="text-[#D6405F]" />
          </div>
          <div>
            <p className="text-[10px] text-[#9b8088] dark:text-[#c4a0ae] uppercase tracking-widest font-semibold">Total a costear</p>
            <p className="text-sm font-bold text-[#40202D] dark:text-white">{totalUnits} prendas</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* Input */}
        <div>
          <label className="text-[10px] font-bold text-[#b79ca5] dark:text-[#c4a0ae] uppercase tracking-widest block mb-2">
            Costo de mano de obra por prenda
          </label>
          <div className="flex items-center gap-3 p-4 bg-[#fdf8f9] dark:bg-[#0f0810] border-2 border-[rgba(139,58,82,0.15)] dark:border-white/10 rounded-xl focus-within:border-[#D6405F] dark:focus-within:border-[#a05068] transition-colors">
            <span className="text-2xl font-bold text-[#D6405F]">S/</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
              className="flex-1 text-2xl font-bold text-[#40202D] dark:text-white outline-none appearance-none bg-transparent placeholder-[#cbb8bf] dark:placeholder-white/20"
              autoFocus
            />
          </div>
        </div>

        {/* Resumen */}
        <div className={`rounded-xl p-4 transition-all duration-300 ${perUnit > 0 ? 'bg-[#FDF0F3] dark:bg-[rgba(214,64,95,0.1)] border border-[rgba(214,64,95,0.2)]' : 'bg-[#fdf8f9] dark:bg-white/5 border border-[rgba(139,58,82,0.08)]'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#9b8088] dark:text-[#c4a0ae] uppercase tracking-widest font-bold">Costo total estimado</p>
              {perUnit > 0 && (
                <p className="text-[11px] text-[#9b8088] dark:text-[#c4a0ae] mt-0.5">
                  S/ {perUnit.toFixed(2)} × {totalUnits} prendas
                </p>
              )}
            </div>
            <p className={`text-2xl font-bold transition-colors ${perUnit > 0 ? 'text-[#D6405F]' : 'text-[#cbb8bf] dark:text-white/20'}`}>
              S/ {totalCost.toFixed(2)}
            </p>
          </div>
        </div>

        <CTA onClick={handleConfirm} className="w-full h-12 !text-base shadow-lg shadow-rose-100 dark:shadow-none mt-2">
          Confirmar registro de costos
        </CTA>
      </div>
    </Modal>
  );
};
