"use client";

import { useEffect, useState } from "react";
import type { OrderItem } from "../_types";

type Props = {
  items: OrderItem[];
};

export function OrderSummaryCard({ items }: Props) {
  // SSR-safe: hydrate shipping from localStorage only on client
  const [shipping, setShipping] = useState<{ title: string; price: number } | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("order") : null;
      if (raw) {
        const orderData = JSON.parse(raw);
        if (orderData.shippingMethod) {
          setShipping(orderData.shippingMethod);
        }
      }
    } catch (err) {
      console.error("Error reading order", err);
    }
  }, []);
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const shippingCost = shipping?.price ?? 0;
  const total = subtotal + shippingCost;

  return (
    <aside className="rounded-2xl bg-white shadow-md border p-6 h-fit">
      <h3 className="text-lg font-semibold text-gray-900">Resumen del Pedido</h3>

      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-4">
            <img src={it.imageUrl} className="w-16 h-16 rounded-md object-cover" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{it.name}</p>
              <p className="text-xs text-gray-600">
                {it.color} | {it.size}
              </p>
              <p className="text-xs mt-1">Cant: {it.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              S/ {(it.price * it.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <hr className="my-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>S/ {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Envío</span>
          <span>{shipping ? `S/ ${shipping.price.toFixed(2)}` : "Seleccionar"}</span>
        </div>

        <div className="flex justify-between font-semibold text-gray-900 mt-2">
          <span>Total Estimado</span>
          <span>S/ {total.toFixed(2)}</span>
        </div>
      </div>
    </aside>
  );
}
