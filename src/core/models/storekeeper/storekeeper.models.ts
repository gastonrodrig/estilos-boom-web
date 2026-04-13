export interface Workshop {
  _id?: string;
  name?: string;
  description: string;
  contact_person: string;
  phone: string;
  address: string;
  status: string;
}

export interface WorkshopState {
  workshops: Workshop[];
  selected: Workshop | null;
  total: number;
  currentPage: number;
  rowsPerPage: number;
  loading: boolean;
}

export interface RefreshWorkshopsPayload {
  items: Workshop[];
  total: number;
  page: number;
}

export const createWorkshopModel = (workshop: Workshop) => ({
    name: workshop.name,
    description: workshop.description,
    contact_person: workshop.contact_person,
    phone: workshop.phone,
    address: workshop.address,
    status: workshop.status,
});

export const updateWorkshopModel = (workshop: Workshop) => ({
    name: workshop.name,
    description: workshop.description,
    contact_person: workshop.contact_person,
    phone: workshop.phone,
    address: workshop.address,
    status: workshop.status,
});