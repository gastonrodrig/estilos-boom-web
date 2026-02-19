import { ClientType, DocumentType } from "@enums";
import {
  UpdateClientDataModelInput,
  ExtraInformationValues
} from "./";

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
