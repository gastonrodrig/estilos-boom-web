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
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-[10px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest mb-2">Porcentaje recibido (%)</label>
          <input
            type="number"
            {...register("received_percentage", { required: true, min: 1, max: 99 })}
            className={`w-full h-14 px-4 rounded-2xl border ${errors.received_percentage ? 'border-red-500' : 'border-[#EAE0E2] dark:border-white/10'} bg-white/50 dark:bg-black/30 backdrop-blur-md text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all`}
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest mb-2">Observaciones</label>
          <textarea
            {...register("notes", { required: true })}
            rows={3}
            className={`w-full p-4 rounded-2xl border ${errors.notes ? 'border-red-500' : 'border-[#EAE0E2] dark:border-white/10'} bg-white/50 dark:bg-black/30 backdrop-blur-md text-[13px] font-medium text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all resize-none`}
          />
        </div>
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
