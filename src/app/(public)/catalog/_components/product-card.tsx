"use client";

import { useState, type FC } from "react";
import { ColorSwatch, PriceTag, Stars } from "./";
import type { Product, Variant } from "../_types/product-types";

export type ProductCardProps = Product & {
  /** Si la pasas, la imagen/nombre navegarán al detalle */
  onOpenDetailHref?: (activeVariantId: string) => string;
};

export const ProductCard: FC<ProductCardProps> = ({
  id,
  title,
  price,
  oldPrice,
  promo,
  badge,
  rating,
  reviews,
  variants,
  onOpenDetailHref,
}) => {
  const [active, setActive] = useState<Variant>(variants[0]);
  const href = onOpenDetailHref?.(active.id); // ← si existe, habrá link

  const handleProductClick = () => {
    const productData = {
      id,
      title,
      price,
      oldPrice,
      promo,
      badge,
      rating,
      reviews,
      variants
    };
    localStorage.setItem('selectedProduct', JSON.stringify(productData));
  };

  const ImageNode = (
    <img
      key={active.id}
      src={active.image}
      alt={`${title} - ${active.label}`}
      className="h-[430px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      loading="lazy"
    />
  );

  return (
    <article className="group">
      {/* Imagen */}
      <div className="relative overflow-hidden rounded-xl bg-gray-100">
        {badge && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-gray-800/90 px-2 py-1 text-xs font-medium text-white">
            {badge}
          </span>
        )}

        {href ? (
          <a href={href} onClick={handleProductClick} className="block">{ImageNode}</a>
        ) : (
          ImageNode
        )}
      </div>

      {/* Info */}
      <div className="mt-3">
        <h3 className="text-[15px] font-medium text-gray-900">{title}</h3>

        <PriceTag price={price} oldPrice={oldPrice} promo={promo} />

        {/* Swatches */}
        <div className="mt-3 flex items-center gap-2">
          {variants.map((v) => (
            <ColorSwatch
              key={v.id}
              colorHex={v.colorHex}
              label={v.label}
              selected={v.id === active.id}
              onSelect={() => setActive(v)}
            />
          ))}
          <span className="ml-1 text-xs text-gray-500">({active.label})</span>
        </div>

        {/* Rating */}
        {(rating || reviews) && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <Stars value={rating} />
            {typeof reviews === "number" && <span>({reviews})</span>}
          </div>
        )}
      </div>
    </article>
  );
};
