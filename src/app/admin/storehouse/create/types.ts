export type SupplyDraftItem = {
  id_variant: string;
  quantity: number;
  unit_cost: number;
  variant_label?: string;
  product_name?: string;
  product_image?: string;
  product_id?: string;
  stock?: number;
  minimum?: number;
  size: string;
  color: string;
};

export type ConfirmationState = {
  open: boolean;
  deliveryDate: string;
  notes: string;
};

export type WorkerOption = {
  _id: string;
  role?: string;
  employment_status?: string;
  id_user?: {
    _id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
};

export type PrefillData = {
  source?: string;
  selectionTitle?: string;
  orderId?: string;
  workerId?: string;
  items?: SupplyDraftItem[];
};