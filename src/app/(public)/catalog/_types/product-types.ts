// Tipos compartidos para productos y variantes
export type Variant = {
  id: string;
  label: string;
  colorHex: string;
  image: string;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  promo?: string;
  badge?: "Best Seller" | "New Arrival";
  rating?: number;
  reviews?: number;
  variants: Variant[];
};
