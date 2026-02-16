// Models Auth (SLICE)

import { UserStatus, ClientType } from "@enums";

export type AuthStatus =
  | "not-authenticated"
  | "authenticated"
  | "checking"
  | "first-login-password"
  | "sending-reset-email"
  | "reset-email-sent"
  | "changing-password";

export interface AuthState {
  status: AuthStatus;
  id: string | null;
  uid: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  documentType: string | null;
  documentNumber: string | null;
  role: string | null;
  clientType?: ClientType.PERSON | ClientType.COMPANY | null;
  needsPasswordChange: boolean | null;
  userStatus: UserStatus.ACTIVO | UserStatus.INACTIVO | null;
  photoURL: string | null;
  isExtraDataCompleted: boolean;
  companyData?: CompanyData | null;
}

export interface CompanyData {
  companyName: string;
  contactName: string;
}

export interface LoginPayload {
  id: string;
  uid: string;
  email: string;
  role: string;
  userStatus: UserStatus.ACTIVO | UserStatus.INACTIVO;
  isExtraDataCompleted: boolean;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  clientType?: ClientType.PERSON | ClientType.COMPANY | null;
  needsPasswordChange?: boolean | null;
  photoURL?: string | null;
  companyData?: CompanyData | null;
}

export type ClientDataPayload =
  | {
      clientType: ClientType.PERSON;
      firstName: string;
      lastName: string;
      phone: string;
      documentType: string;
      documentNumber: string;
    }
  | {
      clientType: ClientType.COMPANY;
      companyName: string;
      contactName: string;
      phone: string;
      documentType: string;
      documentNumber: string;
    };
