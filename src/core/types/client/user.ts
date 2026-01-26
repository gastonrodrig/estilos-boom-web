import { ClientType, DocumentType } from "@enums";

export interface CreateUserGoogleModelInput {
  uid: string;
  providerData: Array<{
    email: string;
  }>;
  photoURL: string | null;
}

export interface CreateUserEmailPasswordModelInput {
  uid: string;
  providerData: Array<{
    email: string;
  }>;
}

export interface UpdateClientDataModelInput {
  client_type: ClientType;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  contact_person?: string | null;
  phone: string;
  document_type: DocumentType;
  document_number: string;
}