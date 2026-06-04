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
  id: raw.id,
  orderNumber: raw.orderNumber,
  idClient: "no_client_id", // Ya no viene en el summary unificado
  clientName: raw.clientName,
  method: raw.method,
  amount: raw.amount,
  operationNumber: raw.operationNumber,
  status: raw.status,
  transactionType: raw.transactionType,
  observationMessage: raw.observationMessage,
  createdAt: raw.createdAt,
  updatedAt: raw.createdAt, // fallback if needed
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

const YAPE_OPERATION_REGEX = /^\d{6,}$/;
const TRANSFER_OPERATION_REGEX = /^[0-9A-Za-z]{4,}$/;

export const getFormatStatus = (
  paymentMethod: string,
  operationNumber: string,
  allOperationNumbers: string[]
): YapeFormatStatus => {
  let isValid = false;
  
  if (paymentMethod.toLowerCase().includes("transferencia")) {
    isValid = TRANSFER_OPERATION_REGEX.test(operationNumber);
  } else {
    // Para Yape / Plin
    isValid = YAPE_OPERATION_REGEX.test(operationNumber);
  }

  if (!isValid) return "invalid_format";
  
  const count = allOperationNumbers.filter((n) => n === operationNumber).length;
  if (count > 1) return "duplicate";
  return "format_ok";
};

export const buildPaymentRows = (payments: Payment[]): PaymentRowState[] => {
  const operationNumbers = payments.map((p) => p.operationNumber);
  return payments.map((payment) => {
    // Solo validamos formato Yape/Transferencia para los métodos MANUAL
    const formatStatus = payment.transactionType === "MANUAL" ? getFormatStatus(
      payment.method,
      payment.operationNumber,
      operationNumbers
    ) : "format_ok"; // Para MP siempre asumimos ok

    return {
      payment,
      formatStatus,
      canConfirm:
        payment.status === PaymentStatus.PENDIENTE &&
        formatStatus !== "invalid_format" &&
        formatStatus !== "duplicate" &&
        payment.transactionType === "MANUAL",
    };
  });
};
