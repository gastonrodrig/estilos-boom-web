"use client";

import { useForm } from "react-hook-form";
import { Modal, TextInput } from "@/components/atoms";
import { ModalFooter } from "@/components/molecules";
import { PurchaseOrder } from "@/core/models";

export type ReceptionPayload = {
  delivery_date_actual: string;
  quality_rating: number;
  shipping_cost: number;
};

type ReceptionModalProps = {
  open: boolean;
  loading?: boolean;
  order: PurchaseOrder | null;
  onClose: () => void;
  onSubmit: (payload: ReceptionPayload) => Promise<void> | void;
};

export const ReceptionModal = ({
  open,
  loading = false,
  order,
  onClose,
  onSubmit,
}: ReceptionModalProps) => {
  const { register, handleSubmit, reset } = useForm<ReceptionPayload>({
    defaultValues: {
      delivery_date_actual: new Date().toISOString().slice(0, 10),
      quality_rating: 5,
      shipping_cost: 0,
    },
  });

  const closeAndReset = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={closeAndReset}
      title="Recepción Final"
      description={`Finalizar orden ${order?.order_number ?? ""}`}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <TextInput label="Fecha Real" type="date" {...register("delivery_date_actual")} />
        <TextInput label="Calidad (1-5)" type="number" {...register("quality_rating")} />
        <TextInput label="Costo Envío" type="number" {...register("shipping_cost")} />
        
        <ModalFooter
          isSubmitType
          onCancel={closeAndReset}
          submitText="Registrar entrada"
          loading={loading}
        />
      </form>
    </Modal>
  );
};