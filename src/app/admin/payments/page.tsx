"use client";

import { useEffect } from "react";
import { CreditCard, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import { usePaymentStore } from "@hooks";
import { PaymentRowState, YapeFormatStatus, PaymentStatus } from "@models";

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
  return null;
}

// ─── Table row ────────────────────────────────────────────────────────────────

interface PaymentRowProps {
  row: PaymentRowState;
  isOdd: boolean;
  onConfirm: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<boolean>;
  isActioning: boolean;
}

function PaymentTableRow({
  row,
  isOdd,
  onConfirm,
  onReject,
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
      <td className="px-6 py-4 text-sm text-gray-700">
        S/ {payment.amountRequested.toFixed(2)}
      </td>
      <td className="px-6 py-4">
        <p className="mb-1 font-mono text-sm text-gray-800">
          {payment.yapeOperationNumber}
        </p>
        <FormatBadge status={formatStatus} />
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={payment.status} formatStatus={formatStatus} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => void onConfirm(payment.id)}
            disabled={!canConfirm || isActioning}
            className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isActioning ? "..." : "Confirmar"}
          </button>
          <button
            onClick={() => void onReject(payment.id)}
            disabled={isActioning}
            className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isActioning ? "..." : "Rechazar"}
          </button>
        </div>
      </td>
    </tr>
  );
}

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

  useEffect(() => {
    void startLoadingPayments();
  }, [startLoadingPayments]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">
            Verificación de Pagos Yape
          </h1>
          <CreditCard className="h-5 w-5 text-[#d6687d]" />
        </div>
        <p className="text-sm text-gray-500">
          Revisa y confirma los pagos enviados por las clientas.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pendientes"
          value={metrics?.pending ?? 0}
          dotColor="bg-yellow-400"
        />
        <StatCard
          label="Verificados hoy"
          value={metrics?.verifiedToday ?? 0}
          dotColor="bg-green-500"
        />
        <StatCard
          label="Rechazados"
          value={metrics?.rejected ?? 0}
          dotColor="bg-red-400"
        />
        <StatCard
          label="Monto total verificado"
          value={`S/ ${(metrics?.totalVerifiedAmount ?? 0).toLocaleString("es-PE", {
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
                <th className="px-6 py-3">Monto pedido</th>
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
              ) : paymentRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-400"
                  >
                    Sin pagos pendientes de verificación.
                  </td>
                </tr>
              ) : (
                paymentRows.map((row, idx) => (
                  <PaymentTableRow
                    key={row.payment.id}
                    row={row}
                    isOdd={idx % 2 !== 0}
                    onConfirm={startConfirmPayment}
                    onReject={startRejectPayment}
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
    </div>
  );
}
