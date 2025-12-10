"use client";

type ShippingMethod = {
  id: string;
  title: string;
  description: string;
  price: number;
};

type Props = {
  method: ShippingMethod;
  selected: string | null;
  onSelect: (id: string) => void;
};

export function ShippingMethodCard({ method, selected, onSelect }: Props) {
  const isActive = selected === method.id;

  return (
    <button
      onClick={() => onSelect(method.id)}
      className={`w-full text-left rounded-2xl border p-4 shadow-sm mb-3 transition ${
        isActive
          ? "border-pink-600 bg-pink-50"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900 text-sm">{method.title}</p>
        <p className="font-semibold text-gray-900 text-sm">
          {method.price === 0 ? "GRATIS" : `S/ ${method.price.toFixed(2)}`}
        </p>
      </div>

      <p className="text-xs text-gray-600 mt-1">{method.description}</p>
    </button>
  );
}
