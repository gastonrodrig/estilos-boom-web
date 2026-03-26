// Modelos Product (SLICE)

export interface ProductVariant {
  id_variant: string;
  size: string;
  color: string;
  stock: number;
  sku_variant: string;
}

// 2. Actualizamos la interfaz del Producto
export interface Product {
  id_product: string;    // Antes era 'id'
  name: string;
  description?: string;
  sku: string;
  base_price: number;    // Antes era 'price'
  is_active: boolean;
  is_best_seller: boolean;
  is_new_in: boolean;
  images: string[];
  id_category: string;
  category?: {
    name: string;
  };
  variants: ProductVariant[]; // <-- Este es el que faltaba
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