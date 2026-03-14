import { ClientType, DocumentType, UserStatus } from "@enums";

// Modelos Client Company (SLICE)

export interface ClientCompany {
  email: string;
  companyName: string;
  contactName: string;
  phone: string;
  clientType: ClientType.COMPANY;
  documentType: DocumentType.RUC;
  documentNumber: string;
  status?: UserStatus;
}

export interface RefreshClientsCompanyPayload {
  items: ClientCompany[];
  total: number;
  page: number;
}

export interface ClientCompanyState {
  clientsCompany: ClientCompany[];
  selected: ClientCompany | null;
  total: number;
  currentPage: number;
  rowsPerPage: number;
  loading: boolean;
}

// Modelos Client Person (SLICE)

export interface ClientPerson {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  clientType: ClientType.PERSON;
  documentType: DocumentType;
  documentNumber: string;
  status?: UserStatus;
}

export interface RefreshClientsPersonPayload {
  items: ClientPerson[];
  total: number;
  page: number;
}

export interface ClientPersonState {
  clientsPerson: ClientPerson[];
  selected: ClientPerson | null;
  total: number;
  currentPage: number;
  rowsPerPage: number;
  loading: boolean;
}

// Modelo Client Profile (SLICE)

export interface ClientProfileState {
  loadingClientProfile: boolean;
}

// Values Client (HOOK & COMPONENT)

export type ExtraInformationValues = {
  firstName: string;
  lastName: string;
  companyName: string;
  contactName: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  clientType: ClientType;
}

// Modelos Mappers de Client (HOOK)

export interface UpdateClientDataModelInput {
  client_type: ClientType;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  contact_name?: string | null;
  phone: string;
  document_type: DocumentType;
  document_number: string;
}