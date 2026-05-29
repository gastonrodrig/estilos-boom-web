export enum PaymentStatus {
  PENDIENTE = "PENDIENTE",
  VERIFICADO = "VERIFICADO",
  RECHAZADO = "RECHAZADO",
}

// Shape del recurso para uso interno del frontend (camelCase)
export interface Payment {
  id: string;
  orderNumber: string;
  idClient: string;
  clientName: string;
  amountRequested: number;
  yapeOperationNumber: string;
  status: PaymentStatus;
  verifiedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Shape raw que devuelve el backend (snake_case)
export interface PaymentApi {
  _id: string;
  order_number: string;
  id_client: string;
  client_name: string;
  amount_requested: number;
  yape_operation_number: string;
  status: PaymentStatus;
  verified_at?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
}

// Summary para las tarjetas del header
export interface PaymentMetrics {
  pending: number;
  verifiedToday: number;
  rejected: number;
  totalVerifiedAmount: number;
}

export interface PaymentMetricsApi {
  pending: number;
  verified_today: number;
  rejected: number;
  total_verified_amount: number;
}

// Payload para crear un pago (checkout → backend)
export interface CreatePaymentPayload {
  order_number: string;
  id_client: string;
  client_name: string;
  amount_requested: number;
  yape_operation_number: string;
}

// Estado de validación del número de operación Yape (calculado en frontend)
export type YapeFormatStatus = "format_ok" | "invalid_format" | "duplicate";

// Estado compuesto para una fila de la tabla
export interface PaymentRowState {
  payment: Payment;
  formatStatus: YapeFormatStatus;
  canConfirm: boolean;
}

// Axios error shape mínimo para extraer mensajes del backend
export interface HttpError {
  response?: {
    data?: {
      message?: string;
    };
  };
}
