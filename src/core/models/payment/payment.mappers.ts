import {
  Payment,
  PaymentApi,
  PaymentMetrics,
  PaymentMetricsApi,
  PaymentRowState,
  PaymentStatus,
  YapeFormatStatus,
  CreatePaymentPayload,
} from "./payment.models";

export const paymentFromApi = (raw: PaymentApi): Payment => ({
  id: raw._id,
  orderNumber: raw.order_number,
  idClient: raw.id_client,
  clientName: raw.client_name,
  amountRequested: raw.amount_requested,
  yapeOperationNumber: raw.yape_operation_number,
  status: raw.status,
  verifiedAt: raw.verified_at,
  rejectedAt: raw.rejected_at,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
});

export const paymentMetricsFromApi = (raw: PaymentMetricsApi): PaymentMetrics => ({
  pending: raw.pending,
  verifiedToday: raw.verified_today,
  rejected: raw.rejected,
  totalVerifiedAmount: raw.total_verified_amount,
});

export const createPaymentToApi = (data: {
  orderNumber: string;
  idClient: string;
  clientName: string;
  amountRequested: number;
  yapeOperationNumber: string;
}): CreatePaymentPayload => ({
  order_number: data.orderNumber,
  id_client: data.idClient,
  client_name: data.clientName,
  amount_requested: data.amountRequested,
  yape_operation_number: data.yapeOperationNumber,
});

const YAPE_OPERATION_REGEX = /^\d{14}$/;

export const getYapeFormatStatus = (
  operationNumber: string,
  allOperationNumbers: string[]
): YapeFormatStatus => {
  if (!YAPE_OPERATION_REGEX.test(operationNumber)) return "invalid_format";
  const count = allOperationNumbers.filter((n) => n === operationNumber).length;
  if (count > 1) return "duplicate";
  return "format_ok";
};

export const buildPaymentRows = (payments: Payment[]): PaymentRowState[] => {
  const operationNumbers = payments.map((p) => p.yapeOperationNumber);
  return payments.map((payment) => {
    const formatStatus = getYapeFormatStatus(
      payment.yapeOperationNumber,
      operationNumbers
    );
    return {
      payment,
      formatStatus,
      canConfirm:
        payment.status === PaymentStatus.PENDIENTE &&
        formatStatus !== "invalid_format" &&
        formatStatus !== "duplicate",
    };
  });
};
