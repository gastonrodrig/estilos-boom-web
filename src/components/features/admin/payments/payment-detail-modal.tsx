import React, { useEffect, useState } from "react";
import { Payment, PaymentStatus } from "@models";
import { Modal, CTA } from "@/components/atoms";

interface PaymentDetailModalProps {
  open: boolean;
  payment: Payment | null;
  onClose: () => void;
}

export function PaymentDetailModal({ open, payment, onClose }: PaymentDetailModalProps) {
  // Mantener la data para que no desaparezca durante la animación de salida
  const [displayData, setDisplayData] = useState<Payment | null>(null);

  useEffect(() => {
    if (payment) {
      setDisplayData(payment);
    }
  }, [payment]);

  const validationType = displayData?.transactionType === "MERCADO_PAGO" ? "Automática" : "Manual";

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case PaymentStatus.VERIFICADO:
        return <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-600">Verificado</span>;
      case PaymentStatus.PENDIENTE:
        return <span className="inline-flex rounded-full bg-amber-50 border border-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-600">Pendiente</span>;
      case PaymentStatus.RECHAZADO:
        return <span className="inline-flex rounded-full bg-red-50 border border-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">Rechazado</span>;
      default:
        return <span className="inline-flex rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600">{status}</span>;
    }
  };

  const getValidationBadge = (type?: string) => {
    if (type === "Automática") {
      return <span className="inline-flex rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-600">Automática</span>;
    }
    return <span className="inline-flex rounded-full bg-purple-50 border border-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-600">Manual</span>;
  };

  const getMethodBadge = (method?: string) => {
    if (!method) return null;
    if (method.toLowerCase().includes("mercado pago") || method === "card") {
      return <span className="inline-flex rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-600">Mercado Pago</span>;
    }
    if (method.toLowerCase().includes("yape")) {
      return <span className="inline-flex rounded-full bg-[#F4E3F7] border border-[#EAC2EF] px-2.5 py-1 text-xs font-semibold text-[#8A259C]">Yape</span>;
    }
    return <span className="inline-flex rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600">{method}</span>;
  };

  const FieldDisplay = ({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="text-sm font-medium text-neutral-500 pl-4">{label}</span>
      <div className="flex w-full items-center min-h-[44px] rounded-full border border-neutral-300 bg-neutral-50/50 px-5 py-2.5 text-[15px] text-neutral-800">
        {value || children}
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalles del Pago"
    >
      <div className="mt-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FieldDisplay label="Nº Pedido" value={<span className="font-medium">{displayData?.orderNumber}</span>} />
          <FieldDisplay label="Monto" value={<span className="font-semibold text-lg">S/ {displayData?.amount?.toFixed(2)}</span>} />
        </div>

        <FieldDisplay label="Cliente" value={displayData?.clientName} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FieldDisplay label="Método">
            {getMethodBadge(displayData?.method)}
          </FieldDisplay>
          <FieldDisplay label="Nº Operación">
            <span className="font-mono text-sm">{displayData?.operationNumber}</span>
          </FieldDisplay>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FieldDisplay label="Estado">
            {getStatusBadge(displayData?.status)}
          </FieldDisplay>
          <FieldDisplay label="Validación">
            {getValidationBadge(validationType)}
          </FieldDisplay>
        </div>

        {displayData?.createdAt && (
          <FieldDisplay label="Fecha de Registro" value={new Date(displayData.createdAt).toLocaleString()} />
        )}
      </div>

      <div className="pt-8">
        <CTA onClick={onClose} className="w-full text-[15px]">
          Cerrar
        </CTA>
      </div>
    </Modal>
  );
}
