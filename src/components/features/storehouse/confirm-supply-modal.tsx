"use client";

import { Modal } from "@/components/atoms";
import { ModalFooter } from "@/components/molecules"; 
import { PurchaseOrder } from "@/core/models";

type ConfirmSupplyModalProps = {
  open: boolean;
  loading?: boolean;
  order: PurchaseOrder | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

const resolveSupplierName = (order: PurchaseOrder | null) => {
  if (!order) return "-";
  if (typeof order.id_supplier === "object") {
    return order.id_supplier.name_company ?? order.id_supplier._id;
  }
  return order.id_supplier;
};

export const ConfirmSupplyModal = ({
  open,
  loading = false,
  order,
  onClose,
  onConfirm,
}: ConfirmSupplyModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmar orden de compra"
      description="Se validará que la orden esté lista para proceso de recepción."
    >
      <div className="space-y-6">
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-inner backdrop-blur-md text-[13px] text-[#40202D] dark:text-white">
          <p className="font-black text-[14px]">Orden: {order?.order_number ?? "-"}</p>
          <div className="mt-4 space-y-2 font-medium text-[#8C6B79] dark:text-gray-300">
            <p><span className="font-bold text-[#40202D] dark:text-white">Proveedor:</span> {resolveSupplierName(order)}</p>
            <p><span className="font-bold text-[#40202D] dark:text-white">Items:</span> {order?.items.length ?? 0}</p>
            <p><span className="font-black text-[#D6405F] dark:text-[#F8BBD0]">Total:</span> S/ {order?.total_amount?.toFixed(2) ?? "0.00"}</p>
          </div>
        </div>

        <ModalFooter
          onCancel={onClose}
          onSubmit={onConfirm}
          loading={loading}
          disabled={!order}
          submitText="Confirmar orden"
          loadingText="Confirmando..."
        />
      </div>
    </Modal>
  );
};