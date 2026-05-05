export type Workshop = {
  _id?: string;
  name_company: string;
  ruc: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  specialty: string;
  weekly_capacity?: number;
  operating_status?: 'AVAILABLE' | 'LIMITED' | 'SATURATED' | 'INACTIVE';
  status?: boolean;
};
