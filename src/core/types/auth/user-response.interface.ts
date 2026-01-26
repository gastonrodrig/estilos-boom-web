export interface UserResponse {
  _id: string;
  auth_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  document_type: string | null;
  document_number: string | null;
  role: string;
  status: "Activo" | "Inactivo";
  needs_password_change?: boolean;
  profile_picture: string | null;
  is_extra_data_completed: boolean;
}
