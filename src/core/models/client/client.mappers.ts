import { ClientType, DocumentType } from "@enums";
import {
  CreateUserGoogleModelInput, 
  CreateUserEmailPasswordModelInput,
  UpdateClientDataModelInput,
  ExtraInformationValues
} from "./";

// Crear usuario con Google
export const createUserGoogleToApi = (data: {
  uid: string;
  email: string;
  photoURL?: string | null;
}): CreateUserGoogleModelInput => ({
  uid: data.uid,
  providerData: [{ email: data.email }],
  photoURL: data.photoURL ?? null,
});

// Crear usuario con email/password
export const createUserEmailPasswordToApi = (data: {
  uid: string;
  email: string;
}): CreateUserEmailPasswordModelInput => ({
  uid: data.uid,
  providerData: [{ email: data.email }],
});

// Actualizar datos del cliente
export const updateClientDataToApi = (data: ExtraInformationValues): UpdateClientDataModelInput => ({
  client_type: data.clientType as ClientType,
  first_name: data.firstName ?? null,
  last_name: data.lastName ?? null,
  company_name: data.companyName ?? null,
  contact_name: data.contactName ?? null,
  phone: data.phone,
  document_type: data.documentType as DocumentType,
  document_number: data.documentNumber,
});
