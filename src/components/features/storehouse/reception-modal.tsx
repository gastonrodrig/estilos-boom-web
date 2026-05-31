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
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-[10px] font-black text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest mb-2">Fecha Real</label>
          <input
            type="date"
            {...register("delivery_date_actual")}
            className="w-full h-14 px-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest mb-2">Calidad (1-5)</label>
          <input
            type="number"
            {...register("quality_rating")}
            className="w-full h-14 px-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest mb-2">Costo Envío</label>
          <input
            type="number"
            {...register("shipping_cost")}
            className="w-full h-14 px-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all"
          />
        </div>
        
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