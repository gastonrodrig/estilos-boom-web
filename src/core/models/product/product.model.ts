// Modelos Product (SLICE)

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock: number;
  is_active: boolean;    // Cambiado de isActive
  is_best_seller: boolean; // Cambiado de isBestSeller
  is_new_in: boolean;
  images: string[];
  id_category: string;
  category?: {
    id_category: string;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface RefreshProductsPayload {
  items: Product[];
  total: number;
  page: number;
}

export interface ProductState {
  products: Product[];
  selected: Product | null;
  total: number;
  currentPage: number;
  rowsPerPage: number;
  loading: boolean;
}