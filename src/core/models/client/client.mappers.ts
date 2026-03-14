import { ClientType, DocumentType } from "@enums";
import {
  UpdateClientDataModelInput,
  ExtraInformationValues,
  ClientPerson,
  ClientCompany
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

// Agregar nuevo cliente persona
export const createClientPersonModel = (clientPerson: ClientPerson) => ({
  email: clientPerson.email,
  first_name: clientPerson.firstName,
  last_name: clientPerson.lastName,
  phone: clientPerson.phone,
  document_type: clientPerson.documentType as DocumentType,
  document_number: clientPerson.documentNumber,
});

// Actualizar nuevo cliente persona
export const updateClientPersonModel = (clientPerson: ClientPerson) => ({
  email: clientPerson.email,
  first_name: clientPerson.firstName,
  last_name: clientPerson.lastName,
  phone: clientPerson.phone,
  document_type: clientPerson.documentType as DocumentType,
  document_number: clientPerson.documentNumber,
  status: clientPerson.status,
});

// Agregar nuevo cliente empresa
export const createClientCompanyModel = (clientCompany: ClientCompany) => ({
  email: clientCompany.email,
  company_name: clientCompany.companyName,
  contact_name: clientCompany.contactName,
  phone: clientCompany.phone,
  document_number: clientCompany.documentNumber,
});

// Actualizar nuevo cliente empresa
export const updateClientCompanyModel = (clientCompany: ClientCompany) => ({
  email: clientCompany.email,
  company_name: clientCompany.companyName,
  contact_name: clientCompany.contactName,
  phone: clientCompany.phone,
  document_number: clientCompany.documentNumber,
  status: clientCompany.status,
});