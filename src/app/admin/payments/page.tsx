"use client";

import { useEffect, useState } from "react";
import { CreditCard, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import { usePaymentStore } from "@hooks";
import { PaymentRowState, YapeFormatStatus, PaymentStatus, Payment } from "@models";
import { PaymentDetailModal } from "@/components/features/admin/payments/payment-detail-modal";
import { PaymentActionModal, PaymentActionType } from "@/components/features/admin/payments/payment-action-modal";

// ─── Stat card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  dotColor: string;
}

function StatCard({ label, value, dotColor }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-[#fffcfd] px-6 py-5 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

// ─── Format badge ─────────────────────────────────────────────────────────────

function FormatBadge({ status }: { status: YapeFormatStatus }) {
  if (status === "format_ok") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Formato OK
      </span>
    );
  }
  if (status === "duplicate") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
        <AlertTriangle className="h-3 w-3" />
        Nº repetido
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
      <XCircle className="h-3 w-3" />
      Formato inválido
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({
  status,
  formatStatus,
}: {
  status: PaymentStatus;
  formatStatus: YapeFormatStatus;
}) {
  if (formatStatus === "invalid_format") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        Formato inválido
      </span>
    );
  }
  if (formatStatus === "duplicate") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        Número duplicado
      </span>
    );
  }
  if (status === PaymentStatus.PENDIENTE) {
    return (
      <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
        Pendiente
      </span>
    );
  }
  if (status === PaymentStatus.OBSERVADO) {
    return (
      <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
        Observado
      </span>
    );
  }
  return null;
}

// ─── Table row ────────────────────────────────────────────────────────────────

interface PaymentRowProps {
  row: PaymentRowState;
  isOdd: boolean;
  onConfirmClick: (id: string) => void;
  onObserveClick: (id: string) => void;
  onViewDetail: (payment: Payment) => void;
  isActioning: boolean;
}

function PaymentTableRow({
  row,
  isOdd,
  onConfirmClick,
  onObserveClick,
  onViewDetail,
  isActioning,
}: PaymentRowProps) {
  const { payment, formatStatus, canConfirm } = row;
  const bgClass = isOdd ? "bg-[#fff1f3]" : "bg-white";

  return (
    <tr className={`${bgClass} transition-colors hover:bg-[#f7f1f4]`}>
      <td className="px-6 py-4 text-sm font-medium text-gray-800">
        {payment.orderNumber}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">{payment.clientName}</td>
      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
        {payment.method}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">
        S/ {payment.amount.toFixed(2)}
      </td>
      <td className="px-6 py-4">
        <p className="mb-1 font-mono text-sm text-gray-800">
          {payment.operationNumber}
        </p>
        {payment.transactionType === "MANUAL" && <FormatBadge status={formatStatus} />}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={payment.status} formatStatus={formatStatus} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {payment.transactionType === "MANUAL" && payment.status === PaymentStatus.PENDIENTE ? (
            <>
              <button
                onClick={() => onConfirmClick(payment.id)}
                disabled={!canConfirm || isActioning}
                className="rounded-full bg-[#594246] border border-[#594246] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#D6405F] hover:border-[#D6405F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aceptar
              </button>
              <button
                onClick={() => onObserveClick(payment.id)}
                disabled={isActioning}
                className="rounded-full bg-white border border-[#EBEAE8] px-4 py-1.5 text-xs font-semibold text-[#594246] transition hover:bg-[#FAF9F6] hover:border-[#F2D0D3] hover:text-[#D6405F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Observar
              </button>
            </>
          ) : (
            <button
              onClick={() => onViewDetail(payment)}
              className="rounded-full border border-gray-200 bg-neutral-50 px-4 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100"
            >
              Ver detalle
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Mocks temporales ───────────────────────────────────────────────────────────
// TODO: eliminar mocks cuando admin-payments devuelva datos reales desde MongoDB.
const mockPaymentRows: PaymentRowState[] = [
  {
    payment: {
      id: "mock-1",
      orderNumber: "EB-0038",
      idClient: "cli-1",
      clientName: "Ana Flores",
      method: "Yape",
      amount: 55.00,
      operationNumber: "20250523001234",
      status: PaymentStatus.PENDIENTE,
      transactionType: "MANUAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    formatStatus: "format_ok",
    canConfirm: true,
  },
  {
    payment: {
      id: "mock-2",
      orderNumber: "EB-0039",
      idClient: "cli-2",
      clientName: "Rosa Huanca",
      method: "Transferencia Bancaria",
      amount: 120.00,
      operationNumber: "20250522009871",
      status: PaymentStatus.PENDIENTE,
      transactionType: "MANUAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    formatStatus: "format_ok",
    canConfirm: true,
  }
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPaymentsPage() {
  const {
    metrics,
    loading,
    paymentRows,
    startLoadingPayments,
    startConfirmPayment,
    startRejectPayment,
  } = usePaymentStore();

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<PaymentActionType | null>(null);

  useEffect(() => {
    void startLoadingPayments();
  }, [startLoadingPayments]);

  const handleOpenDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPayment(null);
  };

  const handleOpenAction = (id: string, type: PaymentActionType) => {
    const p = paymentRows.find(r => r.payment.id === id) || mockPaymentRows.find(r => r.payment.id === id);
    if (p) {
      setSelectedPayment(p.payment);
      setActionType(type);
      setIsActionOpen(true);
    }
  };

  const handleActionConfirm = async (message?: string) => {
    if (!selectedPayment || !actionType) return;

    if (actionType === "confirm") {
      await startConfirmPayment(selectedPayment.id);
    } else if (actionType === "observe") {
      await startRejectPayment(selectedPayment.id, message);
    }

    setIsActionOpen(false);
    // Don't clear selectedPayment or actionType here, let them persist during fade out.
  };

  const displayRows = [...paymentRows, ...mockPaymentRows];

  // Derivar métricas si estamos usando mocks o si metrics vienen en 0 desde el backend
  const displayMetrics = {
    pending: displayRows.filter(r => r.payment.status === PaymentStatus.PENDIENTE).length,
    verifiedToday: displayRows.filter(r => r.payment.status === PaymentStatus.VERIFICADO).length,
    rejected: displayRows.filter(r => r.payment.status === PaymentStatus.RECHAZADO).length,
    totalVerifiedAmount: displayRows.filter(r => r.payment.status === PaymentStatus.VERIFICADO).reduce((acc, r) => acc + r.payment.amount, 0)
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Pagos
          </h1>
          <CreditCard className="h-5 w-5 text-[#d6687d]" />
        </div>
        <p className="text-sm text-gray-500">
          Revisa y confirma pagos enviados por los clientes.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pendientes"
          value={displayMetrics.pending}
          dotColor="bg-yellow-400"
        />
        <StatCard
          label="Verificados hoy"
          value={displayMetrics.verifiedToday}
          dotColor="bg-green-500"
        />
        <StatCard
          label="Observados"
          value={displayMetrics.rejected}
          dotColor="bg-orange-400"
        />
        <StatCard
          label="Monto total verificado"
          value={`S/ ${displayMetrics.totalVerifiedAmount.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
          })}`}
          dotColor="bg-rose-700"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-pink-100 bg-[#fffcfd] shadow-sm">
        <div className="flex items-center justify-between border-b border-pink-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Pagos pendientes de verificación
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#dfa6b6] text-xs font-semibold uppercase text-white">
                <th className="px-6 py-3">Pedido</th>
                <th className="px-6 py-3">Clienta</th>
                <th className="px-6 py-3">Método</th>
                <th className="px-6 py-3">Monto</th>
                <th className="px-6 py-3">Número de operación</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#fff1f3]"}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 animate-pulse rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-gray-400"
                  >
                    Sin pagos pendientes de verificación.
                  </td>
                </tr>
              ) : (
                displayRows.map((row, idx) => (
                  <PaymentTableRow
                    key={row.payment.id}
                    row={row}
                    isOdd={idx % 2 !== 0}
                    onConfirmClick={(id) => handleOpenAction(id, "confirm")}
                    onObserveClick={(id) => handleOpenAction(id, "observe")}
                    onViewDetail={handleOpenDetail}
                    isActioning={loading}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="flex items-start gap-2 border-t border-pink-100 bg-blue-50 px-6 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <p className="text-xs text-blue-700">
            Recuerda verificar manualmente en tu app Yape que el número de
            operación existe antes de confirmar.
          </p>
        </div>
      </div>

      <PaymentDetailModal
        open={isDetailOpen}
        payment={selectedPayment}
        onClose={handleCloseDetail}
      />

      <PaymentActionModal
        open={isActionOpen}
        action={actionType}
        paymentId={selectedPayment?.id}
        onClose={() => setIsActionOpen(false)}
        onConfirm={handleActionConfirm}
      />
    </div>
  );
}

