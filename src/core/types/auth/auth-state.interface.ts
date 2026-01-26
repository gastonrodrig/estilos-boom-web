import { AuthStatus } from "./";

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
