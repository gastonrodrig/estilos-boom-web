// Modelos Category (SLICE)

export interface Category {
  id_category: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
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
  description?: string;
}