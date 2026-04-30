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
  onChangeItemUnitCost: (index: number, value: number) => void;
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
  onChangeItemUnitCost,
  getToday,
}: ConfirmationModalProps) => {
  const hasAllPrices = !items.some((it) => !it.unit_cost || Number(it.unit_cost) <= 0);
  const totalAmount = items.reduce(
    (acc, it) => acc + Number(it.quantity || 0) * Number(it.unit_cost || 0),
    0
  );

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={title} 
      description="Revisa la solicitud original y confirma el abastecimiento."
    >
      <div className="space-y-5">
        
        {/* Original Request */}
        <div className="rounded-2xl border border-[#f2b6c1]/50 bg-[#fff7f9] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b46a7c]">
            Lo que se pidió originalmente
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-[#f2b6c1]/60 bg-white text-sm text-[#594246]">
            <div className="grid grid-cols-3 border-b border-[#f2b6c1]/60 bg-[#fff7f9] px-3 py-2 text-xs font-semibold">
              <span>Talla</span>
              <span>Color</span>
              <span>Cantidad Solicitada</span>
            </div>
            {items.map((item) => (
              <div key={`requested-${item.id_variant}`} className="grid grid-cols-3 px-3 py-2 text-sm">
                <span>{item.size || "-"}</span>
                <span>{item.color || "-"}</span>
                <span>{item.quantity}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 border-t border-[#f2b6c1]/60 px-3 py-2 text-sm font-semibold">
              <span>TOTAL</span>
              <span />
              <span>{totalUnits} unidades</span>
            </div>
          </div>
        </div>

        {/* Agreed Request */}
        <div className="rounded-2xl border border-[#f2b6c1]/50 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b46a7c]">
            Lo que acordaron
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-[#f2b6c1]/60 text-sm text-[#594246]">
            <div className="grid grid-cols-4 border-b border-[#f2b6c1]/60 bg-[#fff7f9] px-3 py-2 text-xs font-semibold">
              <span>Talla</span>
              <span>Color</span>
              <span>Cantidad Real</span>
              <span>Costo Unitario</span>
            </div>
            {items.map((item, index) => {
              const hasMissingPrice = !item.unit_cost || Number(item.unit_cost) <= 0;
              return (
                <div key={`agreed-${item.id_variant}`} className={`grid grid-cols-4 items-center gap-2 px-3 py-2 ${hasMissingPrice ? "bg-rose-50" : ""}`}>
                  <span>{item.size || "-"}</span>
                  <span>{item.color || "-"}</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => onChangeItem(index, "quantity", Number(e.target.value))}
                    className="h-9 rounded-lg border border-[#f2b6c1] px-2 outline-none"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unit_cost || ""}
                    onChange={(e) => onChangeItemUnitCost(index, e.target.value ? Number(e.target.value) : 0)}
                    placeholder="Ej: 20.50"
                    className={`h-9 rounded-lg border px-2 outline-none ${hasMissingPrice ? "border-rose-300 bg-rose-50" : "border-[#f2b6c1]"}`}
                  />
                </div>
              );
            })}
            <div className="col-span-4 border-t border-[#f2b6c1]/60 px-3 py-2 font-semibold text-[#594246]">
              TOTAL: S/ {totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Date & Notes */}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-[#594246]">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9e8a91]">
              Fecha de confirmación *
            </span>
            <input
              type="date"
              min={getToday()}
              value={confirmation.deliveryDate}
              onChange={(e) => onConfirmationChange({ ...confirmation, deliveryDate: e.target.value })}
              className="h-11 w-full rounded-xl border border-[#f2b6c1] px-3 outline-none"
            />
          </label>
          <label className="block text-sm text-[#594246] sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9e8a91]">
              Observaciones
            </span>
            <textarea
              value={confirmation.notes}
              onChange={(e) => onConfirmationChange({ ...confirmation, notes: e.target.value })}
              rows={3}
              placeholder="Notas sobre la confirmación..."
              className="w-full rounded-xl border border-[#f2b6c1] px-3 py-2 outline-none"
            />
          </label>
        </div>

        {/* 🔥 Magia aplicada: ModalFooter simplificando las acciones */}
        <ModalFooter
          onCancel={onClose}
          onSubmit={onConfirm}
          loading={loading}
          disabled={!hasAllPrices}
          cancelText="Rechazar Abastecimiento"
          submitText="Confirmar Abastecimiento"
          loadingText="Confirmando..."
        />
        
      </div>
    </Modal>
  );
};