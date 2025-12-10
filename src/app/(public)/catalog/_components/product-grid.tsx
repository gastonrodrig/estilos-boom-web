import type { FC } from "react";
import { ProductCard } from "./";

/** Types locales (reutilizados) */
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

export type ProductGridProps = {
  products: ReadonlyArray<Product>;
  className?: string;
  onOpenDetailHref?: (id: string, variantId: string) => string;
};

export const ProductGrid: FC<ProductGridProps> = ({
  products,
  className = "",
  onOpenDetailHref,
}) => (
  <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
    {products.map((p) => (
      <ProductCard
        key={p.id}
        {...p}
        onOpenDetailHref={
          onOpenDetailHref ? (variantId) => onOpenDetailHref(p.id, variantId) : undefined
        }
      />
    ))}
  </div>
);
