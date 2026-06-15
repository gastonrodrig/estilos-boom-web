"use client";

import { Modal } from "@/components/atoms";
import { ModalFooter } from "@/components/molecules";
import { SupplyDraftItem, ConfirmationState } from "./types";

type ConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  items: SupplyDraftItem[];
  confirmation: ConfirmationState;
  onConfirmationChange: (state: ConfirmationState) => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  totalUnits: number;
  onChangeItem: (index: number, field: string, value: string | number) => void;
  getToday: () => string;
};

export const ConfirmationModal = ({
  open,
  onClose,
  title,
  items,
  confirmation,
  onConfirmationChange,
  onConfirm,
  loading,
  totalUnits,
  onChangeItem,
  getToday,
}: ConfirmationModalProps) => {
  
  // En OPC no validamos precios porque nacen en 0
  const canSubmit = items.length > 0 && items.every(it => Number(it.quantity) > 0);

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={title} 
      description="Revisa los detalles de las variantes y cantidades antes de solicitar cotizaciones."
    >
      <div className="space-y-6">
        
        {/* Tabla Única de Detalles */}
        <div className="rounded-[2rem] border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md p-6 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 mb-4">
            Detalles de la Pre-compra
          </p>
          <div className="overflow-hidden rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/20 shadow-inner">
            <div className="grid grid-cols-3 border-b border-[#EAE0E2] dark:border-white/10 bg-white/30 dark:bg-white/5 px-4 py-3 text-[10px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">
              <span>Talla</span>
              <span>Color</span>
              <span>Cantidad a Solicitar</span>
            </div>
            
            <div className="divide-y divide-[#EAE0E2]/50 dark:divide-white/5">
              {items.map((item, index) => (
                <div 
                  key={`opc-${item.id_variant}`} 
                  className="grid grid-cols-3 items-center gap-3 px-4 py-3 hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="text-[13px] font-bold text-[#40202D] dark:text-white">{item.size || "-"}</span>
                  <span className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-300">{item.color || "-"}</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => onChangeItem(index, "quantity", Number(e.target.value))}
                    className="h-10 w-full max-w-[100px] rounded-xl border border-[#EAE0E2] dark:border-white/10 bg-white/70 dark:bg-black/30 px-3 text-center text-[13px] font-medium text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 border-t border-[#EAE0E2] dark:border-white/10 bg-gradient-to-r from-[#D6405F]/5 to-[#F23B69]/5 dark:from-[#D6405F]/10 dark:to-[#F23B69]/10 px-4 py-3 text-[13px] font-medium text-[#D6405F] dark:text-[#F8BBD0]">
              <span className="col-span-2 text-[10px] uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 mt-0.5">Total Unidades Solicitadas</span>
              <span className="text-[15px]">{totalUnits}</span>
            </div>
          </div>
        </div>

        {/* Observaciones (Opcional en esta etapa) */}
        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">
              Observaciones para los proveedores
            </span>
            <textarea
              value={confirmation.notes}
              onChange={(e) => onConfirmationChange({ ...confirmation, notes: e.target.value })}
              rows={3}
              placeholder="Ej: Requerimos entrega en empaque individual, telas de alta calidad..."
              className="w-full rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-5 py-4 text-[13px] font-medium text-[#40202D] dark:text-white placeholder:text-[#8C6B79] outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all custom-scrollbar resize-none"
            />
          </label>
        </div>

        <ModalFooter
          onCancel={onClose}
          onSubmit={onConfirm}
          loading={loading}
          disabled={!canSubmit}
          cancelText="Regresar"
          submitText="Enviar Solicitud"
          loadingText="Enviando..."
        />
        
      </div>
    </Modal>
  );
};
