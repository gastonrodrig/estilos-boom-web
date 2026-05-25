import { ClientType, DocumentType } from "@enums";
import {
  UpdateClientDataModelInput,
  ExtraInformationValues,
  ClientPerson,
  ClientCompany
} from "./";

const cleanPayload = (payload: any) => {
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });
  return payload;
};

// Función helper para mapear estrictamente las direcciones según el DTO
const mapAddresses = (addresses: any[]) => {
  return (addresses || []).map(addr => ({
    address_line: addr.address_line,
    department: addr.department,
    province: addr.province,
    district: addr.district,
    reference: addr.reference,
    is_default: !!addr.is_default
  }));
};

export const updateClientDataToApi = (data: ExtraInformationValues): UpdateClientDataModelInput => cleanPayload({
  client_type: data.clientType as ClientType,
  first_name: data.firstName ?? null,
  last_name: data.lastName ?? null,
  company_name: data.companyName ?? null,
  contact_name: data.contactName ?? null,
  phone: data.phone,
  document_type: data.documentType as DocumentType,
  document_number: data.documentNumber,
  addresses: mapAddresses(data.addresses),
});

export const createClientPersonModel = (clientPerson: ClientPerson & { password?: string }) => cleanPayload({
  email: clientPerson.email,
  first_name: clientPerson.first_name,
  last_name: clientPerson.last_name,
  phone: clientPerson.phone,
  client_type: ClientType.PERSON,
  document_type: clientPerson.document_type as DocumentType,
  document_number: clientPerson.document_number,
  password: clientPerson.password,
  addresses: mapAddresses(clientPerson.addresses),
});

export const updateClientPersonModel = (clientPerson: ClientPerson) => cleanPayload({
  email: clientPerson.email,
  first_name: clientPerson.first_name,
  last_name: clientPerson.last_name,
  phone: clientPerson.phone,
  client_type: ClientType.PERSON,
  document_type: clientPerson.document_type as DocumentType,
  document_number: clientPerson.document_number,
  status: clientPerson.status,
  addresses: mapAddresses(clientPerson.addresses),
});

export const createClientCompanyModel = (clientCompany: ClientCompany & { password?: string }) => cleanPayload({
  email: clientCompany.email,
  company_name: clientCompany.company_name,
  contact_name: clientCompany.contact_name,
  phone: clientCompany.phone,
  client_type: ClientType.COMPANY,
  document_type: DocumentType.RUC,
  document_number: clientCompany.document_number,
  password: clientCompany.password,
  addresses: mapAddresses(clientCompany.addresses),
});

export const updateClientCompanyModel = (clientCompany: ClientCompany) => cleanPayload({
  email: clientCompany.email,
  company_name: clientCompany.company_name,
  contact_name: clientCompany.contact_name,
  phone: clientCompany.phone,
  client_type: ClientType.COMPANY,
  document_type: DocumentType.RUC,
  document_number: clientCompany.document_number,
  status: clientCompany.status,
  addresses: mapAddresses(clientCompany.addresses),
});