import { ClientType, DocumentType } from "@/core/enums";

export interface ClientPerson {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  client_type: ClientType.Person;
  document_type: DocumentType;
  document_number: string;
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
