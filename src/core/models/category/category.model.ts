// Modelos Category (SLICE)

export interface Category {
  _id: string;
  id_category: string;
  name: string;
  description?: string;
  status?: boolean;     // ✅ En tu log salía 'status', no 'is_active'
  created_at?: string;
  updated_at?: string;  // ✅ Agregamos este que también venía en el log
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
  description?: string;
}