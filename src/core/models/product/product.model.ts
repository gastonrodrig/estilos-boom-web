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
  id_product: string;
  name: string;
  description?: string;
  sku: string;
  base_price: number;
  is_active: boolean;
  is_best_seller: boolean;
  is_new_in: boolean;
  images: string[];
  
  // --- NUEVOS CAMPOS (Coinciden con NestJS) ---
  gender: 'MUJER' | 'HOMBRE' | 'UNISEX';
  style_type?: string;        // Ej: 'CASUAL PREMIUM'
  composition?: string;       // Ej: '95% ALGODÓN...'
  season?: string;            // Ej: 'PRIMAVERA 2026'
  highlights?: string[];      // Tus puntos rosas
  custom_size_guide_url?: string;
  technical_details?: Record<string, string>; // El Map de Mongo
  // --------------------------------------------

  id_category: string;
  category?: {
    name: string;
    default_size_guide_url?: string; // Para el fallback
  };
  
  variants: ProductVariant[];
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