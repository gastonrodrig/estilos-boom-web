import { Product, ProductVariant } from "./product.model";

type ApiVariant = {
  id_variant?: string;
  _id?: string;
  size?: string;
  color?: string;
  stock?: number;
  sku_variant?: string;
};

type ApiCategory = {
  _id?: string;
  id_category?: string;
  name?: string;
};

type ApiProduct = {
  _id?: string;
  id_product?: string;
  name?: string;
  description?: string;
  sku?: string;
  base_price?: number;
  is_active?: boolean;
  is_best_seller?: boolean;
  is_new_in?: boolean;
  images?: string[];
  id_category?: string;
  category?: ApiCategory;
  variants?: ApiVariant[];
  created_at?: string;
  updated_at?: string;
};

const mapVariant = (variant: ApiVariant): ProductVariant => ({
  id_variant: variant.id_variant ?? variant._id ?? "",
  size: variant.size ?? "",
  color: variant.color ?? "",
  stock: Number(variant.stock ?? 0),
  sku_variant: variant.sku_variant ?? "",
});

export const mapApiProductToModel = (apiProduct: ApiProduct): Product => ({
  id_product: apiProduct.id_product ?? apiProduct._id ?? "",
  name: apiProduct.name ?? "",
  description: apiProduct.description ?? "",
  sku: apiProduct.sku ?? "",
  base_price: Number(apiProduct.base_price ?? 0),
  is_active: Boolean(apiProduct.is_active),
  is_best_seller: Boolean(apiProduct.is_best_seller),
  is_new_in: Boolean(apiProduct.is_new_in),
  images: Array.isArray(apiProduct.images) ? apiProduct.images : [],
  id_category: apiProduct.id_category ?? apiProduct.category?._id ?? "",
  category: apiProduct.category?.name ? { name: apiProduct.category.name } : undefined,
  variants: Array.isArray(apiProduct.variants) ? apiProduct.variants.map(mapVariant) : [],
  created_at: apiProduct.created_at,
  updated_at: apiProduct.updated_at,
});

export const mapApiProductsToModel = (apiProducts: ApiProduct[]): Product[] =>
  Array.isArray(apiProducts) ? apiProducts.map(mapApiProductToModel) : [];