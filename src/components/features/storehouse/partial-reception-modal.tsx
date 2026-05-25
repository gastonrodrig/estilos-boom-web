"use client";

import { useForm } from "react-hook-form";
import { Modal, TextInput } from "@/components/atoms";
import { ModalFooter } from "@/components/molecules";
import { PurchaseOrder } from "@/core/models";

export type PartialReceptionPayload = {
  notes: string;
  received_percentage: number;
};

type PartialReceptionModalProps = {
  open: boolean;
  loading?: boolean;
  order: PurchaseOrder | null;
  onClose: () => void;
  onSubmit: (payload: PartialReceptionPayload) => Promise<void> | void;
};

export const PartialReceptionModal = ({
  open,
  loading = false,
  order,
  onClose,
  onSubmit,
}: PartialReceptionModalProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PartialReceptionPayload>({
    defaultValues: { notes: "", received_percentage: 50 },
  });

  const closeAndReset = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={closeAndReset}
      title="Recepción parcial"
      description={`Orden ${order?.order_number ?? ""}`}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          label="Porcentaje recibido (%)"
          type="number"
          {...register("received_percentage", { required: true, min: 1, max: 99 })}
          error={!!errors.received_percentage}
        />
        <TextInput
          label="Observaciones"
          {...register("notes", { required: true })}
          error={!!errors.notes}
        />
        <ModalFooter
          isSubmitType
          onCancel={closeAndReset}
          submitText="Guardar parcial"
          loading={loading}
        />
      </form>
    </Modal>
  );
};