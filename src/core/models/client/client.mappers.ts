import { ClientType, DocumentType } from "@enums";
import {
  UpdateClientDataModelInput,
  ExtraInformationValues,
  ClientPerson,
  ClientCompany
} from "./";

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

export const createClientPersonModel = (clientPerson: ClientPerson) => ({
  email: clientPerson.email,
  first_name: clientPerson.first_name,
  last_name: clientPerson.last_name,
  phone: clientPerson.phone,
  document_type: clientPerson.document_type as DocumentType,
  document_number: clientPerson.document_number,
});

export const updateClientPersonModel = (clientPerson: ClientPerson) => ({
  email: clientPerson.email,
  first_name: clientPerson.first_name,
  last_name: clientPerson.last_name,
  phone: clientPerson.phone,
  document_type: clientPerson.document_type as DocumentType,
  document_number: clientPerson.document_number,
  status: clientPerson.status,
});

export const createClientCompanyModel = (clientCompany: ClientCompany) => ({
  email: clientCompany.email,
  company_name: clientCompany.company_name,
  contact_name: clientCompany.contact_name,
  phone: clientCompany.phone,
  document_number: clientCompany.document_number,
});

export const updateClientCompanyModel = (clientCompany: ClientCompany) => ({
  email: clientCompany.email,
  company_name: clientCompany.company_name,
  contact_name: clientCompany.contact_name,
  phone: clientCompany.phone,
  document_number: clientCompany.document_number,
  status: clientCompany.status,
});