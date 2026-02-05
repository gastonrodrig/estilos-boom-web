import { ClientCompany } from "@types";

export const createClientCompanyModel = (client: ClientCompany) => ({
  email: client.email,
  company_name: client.company_name,
  contact_person: client.contact_person,
  phone: client.phone,
  client_type: client.client_type,
  document_type: client.document_type,
  document_number: client.document_number,
});
