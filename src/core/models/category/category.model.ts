// Modelos Category (SLICE)

export interface Category {
  _id: string;
  id_category: string;
  name: string;
  abbr?: string;
  description?: string;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
  __v?: number;
}

export interface RefreshCategoriesPayload {
  items: Category[];
  total: number;
}

export interface CategoryState {
  categories: Category[];
  selected: Category | null;
  total: number;
  loading: boolean;
}

// Modelos Mappers de Category (HOOK)

export interface CreateCategoryModelInput {
  name: string;
  abbr?: string;
  description?: string;
}