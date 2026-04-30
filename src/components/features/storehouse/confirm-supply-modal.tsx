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
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#f2b6c1]/50 bg-[#fff7f9] p-4 text-sm text-[#594246]">
          <p className="font-semibold">Orden: {order?.order_number ?? "-"}</p>
          <p className="mt-1">Proveedor: {resolveSupplierName(order)}</p>
          <p className="mt-1">Items: {order?.items.length ?? 0}</p>
          <p className="mt-1">Total: S/ {order?.total_amount?.toFixed(2) ?? "0.00"}</p>
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