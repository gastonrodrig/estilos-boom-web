export interface Supplier {
  _id?: string;
  name_company: string;
  contact_person: string;
  email: string;
  phone: string;
  ruc: string;
  status?: boolean;
  category?: {
    name: string;
  };
  last_price?: string | number;
  description?: string;
}
