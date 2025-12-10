import type { FC } from "react";

export type PriceTagProps = {
  price: number;
  oldPrice?: number;
  promo?: string;
  currency?: string;  // "S/"
  className?: string;
};

export const PriceTag: FC<PriceTagProps> = ({
  price,
  oldPrice,
  promo,
  currency = "S/",
  className = "",
}) => (
  <div className={`mt-1 flex flex-wrap items-center gap-2 ${className}`}>
    {typeof oldPrice === "number" && (
      <span className="text-sm text-gray-400 line-through">
        {currency} {oldPrice.toFixed(2)}
      </span>
    )}
    <span className="text-[15px] font-semibold text-gray-900">
      {currency} {price.toFixed(2)}
    </span>
    {promo && <span className="text-sm font-semibold text-rose-600">{promo}</span>}
  </div>
);
