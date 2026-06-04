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
    <div className="rounded-[2rem] border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="mb-2 flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full shadow-sm ${dotColor}`} />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 group-hover:text-[#40202D] dark:group-hover:text-white transition-colors">{label}</span>
      </div>
      <p className="text-3xl font-black text-[#40202D] dark:text-white tracking-wide">{value}</p>
    </div>
  );
}

// ─── Format badge ─────────────────────────────────────────────────────────────

function FormatBadge({ status }: { status: YapeFormatStatus }) {
  if (status === "format_ok") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Formato OK
      </span>
    );
  }
  if (status === "duplicate") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <AlertTriangle className="h-3.5 w-3.5" />
        Nº repetido
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 border border-rose-500/20">
      <XCircle className="h-3.5 w-3.5" />
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
      <span className="inline-flex rounded-full bg-rose-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 border border-rose-500/20 shadow-sm">
        Formato inválido
      </span>
    );
  }
  if (formatStatus === "duplicate") {
    return (
      <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 border border-amber-500/20 shadow-sm">
        Número duplicado
      </span>
    );
  }
  if (status === PaymentStatus.PENDIENTE) {
    return (
      <span className="inline-flex rounded-full bg-sky-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-sky-600 border border-sky-500/20 shadow-sm">
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

  return (
    <tr className={`transition-colors group/row ${index % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
      <td className="px-6 py-5 font-black text-[#40202D] dark:text-white">
        {payment.orderNumber}
      </td>
      <td className="px-6 py-5">
        <p className="font-bold text-[#40202D] dark:text-white">{payment.clientName}</p>
      </td>
      <td className="px-6 py-5 font-black text-[#D6405F] dark:text-[#F8BBD0]">
        S/ {payment.amountRequested.toFixed(2)}
      </td>
      <td className="px-6 py-5">
        <p className="mb-2 font-mono text-[13px] font-bold text-[#40202D] dark:text-white">
          {payment.yapeOperationNumber}
        </p>
        <FormatBadge status={formatStatus} />
      </td>
      <td className="px-6 py-5">
        <StatusBadge status={payment.status} formatStatus={formatStatus} />
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => void onConfirm(payment.id)}
            disabled={!canConfirm || isActioning}
            className="rounded-xl bg-emerald-500/90 px-4 py-2.5 text-[10px] font-black tracking-widest uppercase text-white shadow-lg hover:scale-[1.02] hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isActioning ? "..." : <><CheckCircle2 className="w-3.5 h-3.5"/> Confirmar</>}
          </button>
          <button
            onClick={() => void onReject(payment.id)}
            disabled={isActioning}
            className="rounded-xl bg-rose-500/90 px-4 py-2.5 text-[10px] font-black tracking-widest uppercase text-white shadow-lg hover:scale-[1.02] hover:bg-rose-500 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isActioning ? "..." : <><XCircle className="w-3.5 h-3.5"/> Rechazar</>}
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
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#D6405F] dark:text-[#F8BBD0]">
            <CreditCard className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Finanzas</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#40202D] dark:text-white tracking-wide mt-2">
            Verificación de Pagos Yape
          </h1>
          <p className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-300 mt-1">
            Revisa y confirma los pagos enviados por las clientas.
          </p>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pendientes"
          value={metrics?.pending ?? 0}
          dotColor="bg-amber-400"
        />
        <StatCard
          label="Verificados hoy"
          value={metrics?.verifiedToday ?? 0}
          dotColor="bg-emerald-500"
        />
        <StatCard
          label="Rechazados"
          value={metrics?.rejected ?? 0}
          dotColor="bg-rose-500"
        />
        <StatCard
          label="Monto verificado"
          value={`S/ ${(metrics?.totalVerifiedAmount ?? 0).toLocaleString("es-PE", {
            minimumFractionDigits: 2,
          })}`}
          dotColor="bg-gradient-to-r from-[#D6405F] to-[#F23B69]"
        />
      </div>

      {/* Table */}
      <main className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-[#faf5f0] dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-[2rem] overflow-hidden transition-[background-color,border-color] duration-[600ms]">
        <div className="flex items-center justify-between border-b border-[rgba(139,58,82,0.06)] dark:border-[rgba(212,175,55,0.15)] px-6 py-5">
          <h2 className="text-[14px] font-black text-[#40202D] dark:text-white tracking-wide">
            Pagos pendientes de verificación
          </h2>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="relative transition-[background-color,border-color] duration-[600ms]">
              <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Pedido</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Clienta</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Monto pedido</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">N° Operación</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Estado</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE0E2]/50 dark:divide-white/5 text-[13px]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className={`transition-colors group/row ${i % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-6 py-5">
                        <div className="h-6 w-full animate-pulse rounded-xl bg-[#EAE0E2]/50 dark:bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paymentRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-24 text-center text-[14px] font-bold text-[#8C6B79] dark:text-gray-400"
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
        <div className="flex items-start gap-3 bg-[#40202D]/5 dark:bg-white/5 px-6 py-5 rounded-b-[2rem]">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#D6405F] dark:text-[#F8BBD0]" />
          <p className="text-[13px] font-medium text-[#40202D] dark:text-gray-300">
            Recuerda verificar manualmente en tu app Yape que el número de
            operación existe antes de confirmar.
          </p>
        </div>
      </main>
    </div>
  );
}
