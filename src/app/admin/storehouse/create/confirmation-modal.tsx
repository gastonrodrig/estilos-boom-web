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
      <div className="space-y-5">
        
        {/* Tabla Única de Detalles */}
        <div className="rounded-2xl border border-[#f2b6c1]/50 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b46a7c]">
            Detalles de la Pre-compra
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-[#f2b6c1]/60 text-sm text-[#594246]">
            <div className="grid grid-cols-3 border-b border-[#f2b6c1]/60 bg-[#fff7f9] px-3 py-2 text-xs font-semibold">
              <span>Talla</span>
              <span>Color</span>
              <span>Cantidad a Solicitar</span>
            </div>
            
            {items.map((item, index) => (
              <div 
                key={`opc-${item.id_variant}`} 
                className="grid grid-cols-3 items-center gap-2 px-3 py-2 border-b border-rose-50 last:border-0"
              >
                <span>{item.size || "-"}</span>
                <span>{item.color || "-"}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => onChangeItem(index, "quantity", Number(e.target.value))}
                  className="h-9 w-24 rounded-lg border border-[#f2b6c1] px-2 outline-none focus:ring-1 focus:ring-[#F2778D]"
                />
              </div>
            ))}

            <div className="grid grid-cols-3 border-t border-[#f2b6c1]/60 bg-rose-50/30 px-3 py-2 text-sm font-bold text-[#594246]">
              <span>TOTAL UNIDADES</span>
              <span />
              <span>{totalUnits}</span>
            </div>
          </div>
        </div>

        {/* Observaciones (Opcional en esta etapa) */}
        <div className="space-y-3">
          <label className="block text-sm text-[#594246]">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9e8a91]">
              Observaciones para los proveedores
            </span>
            <textarea
              value={confirmation.notes}
              onChange={(e) => onConfirmationChange({ ...confirmation, notes: e.target.value })}
              rows={3}
              placeholder="Ej: Requerimos entrega en empaque individual, telas de alta calidad..."
              className="w-full rounded-xl border border-[#f2b6c1] px-3 py-2 outline-none focus:ring-1 focus:ring-[#F2778D] text-sm"
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