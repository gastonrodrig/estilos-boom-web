import type { FC } from "react";

export type CatalogToolbarProps = {
  total?: number;
};

const FILTERS = ["Category", "Price", "Color", "Size", "Collection", "All Filters"];

export const CatalogToolbar: FC<CatalogToolbarProps> = ({ total }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex flex-wrap gap-3">
      {FILTERS.map((f) => (
        <button
          key={f}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          {f} <span className="ml-1">▾</span>
        </button>
      ))}
    </div>
    <div className="flex items-center gap-3 text-sm text-gray-600">
      {typeof total === "number" && <span>{total} Items</span>}
      <span className="hidden sm:inline">|</span>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-gray-500">Sort By</span>
        <button className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Featured ▾
        </button>
      </div>
    </div>
  </div>
);
