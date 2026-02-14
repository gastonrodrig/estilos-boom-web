/* ================= AUTH STATUS ================= */

export type AuthStatus =
  | "not-authenticated"
  | "authenticated"
  | "checking"
  | "first-login-password"
  | "sending-reset-email"
  | "reset-email-sent"
  | "changing-password";

/* ================= AUTH STATE ================= */

export interface AuthState {
  status: AuthStatus;

  _id: string | null;
  uid: string | null;
  email: string | null;

  firstName: string | null;
  lastName: string | null;
  phone: string | null;

  documentType: string | null;
  documentNumber: string | null;

  role: string | null;

  needsPasswordChange: boolean | null;
  userStatus: "Activo" | "Inactivo" | null;

  photoURL: string | null;

  isExtraDataCompleted: boolean;
}

/* ================= PAYLOADS ================= */

export interface LoginPayload {
  _id: string;
  uid: string;
  email: string;
  role: string;
  userStatus: "Activo" | "Inactivo";
  isExtraDataCompleted: boolean;

  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  needsPasswordChange?: boolean | null;
  photoURL?: string | null;
}

export interface ClientDataPayload {
  firstName: string;
  lastName: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}