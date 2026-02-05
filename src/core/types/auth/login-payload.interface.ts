export interface LoginPayload {
  _id: string;
  uid: string;
  email: string;

  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;

  documentType?: string | null;
  documentNumber?: string | null;

  role: string;
  needsPasswordChange?: boolean | null;

  userStatus: "Activo" | "Inactivo";

  photoURL?: string | null;

  isExtraDataCompleted: boolean;
}
