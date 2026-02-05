import { ClientType, DocumentType } from "@enums";

export interface ClientCompany {
  email: string;
  company_name: string;
  contact_person: string;
  phone: string;
  client_type: ClientType.Company;
  document_type: DocumentType.RUC;
  document_number: string;
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
