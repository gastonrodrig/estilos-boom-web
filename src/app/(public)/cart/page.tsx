"use client";

import { useEffect } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { OrderSummary } from "@components";
import { useCartStore } from "@hooks";

const checkoutSteps = [
  "Carrito",
  "Identificacion",
  "Entrega",
  "Pago",
  "Confirmacion",
];

export default function CartPage() {
  const { items, loadCart, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return (
    <div className="mx-auto w-full max-w-295 px-4 py-8 md:px-6">
      <section className="mb-6 py-1">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {checkoutSteps.map((step, index) => {
            const active = index === 0;

            return (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    active ? "bg-black" : "bg-gray-400"
                  }`}
                />
                <div className="flex flex-col items-start">
                  <span
                    className={`text-xs font-semibold tracking-wide ${
                      active ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                  <span className={`mt-0.5 h-px w-full ${active ? "bg-black" : "bg-transparent"}`} />
                </div>
                {index < checkoutSteps.length - 1 && (
                  <span className="mx-1 h-px w-4 bg-gray-400 md:w-6" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-4xl font-normal text-[#594246]">Carrito de Compras</h1>
        <p className="text-sm font-medium text-[#594246]/70">Mi carrito ({items.length})</p>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_380px]">
        <section className="order-2 space-y-4 lg:order-1">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-[#F2D0D3] bg-white p-10 text-center text-[#594246] shadow-sm">
              Tu carrito esta vacio.
            </div>
          ) : (
            items.map((item) => (
              <article
                key={`${item.productId}-${item.size}-${item.color}`}
                className="rounded-2xl border border-[#F2D0D3] bg-white p-5 shadow-[0_2px_14px_rgba(89,66,70,0.08)]"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-28 w-24 rounded-lg border border-[#EBEAE8] object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-normal text-[#594246]">{item.name}</h2>
                    <p className="text-sm font-medium text-[#594246]/72">
                      Color: {item.color} | Talla: {item.size}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[#F2778D]">
                      S/ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="rounded-lg border border-[#F2D0D3] bg-[#FAF9F6] p-2 text-[#594246] transition hover:bg-[#F2D0D3]/35"
                      aria-label="Restar cantidad"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center text-base font-semibold text-[#594246]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="rounded-lg border border-[#F2D0D3] bg-[#FAF9F6] p-2 text-[#594246] transition hover:bg-[#F2D0D3]/35"
                      aria-label="Sumar cantidad"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-2 rounded-lg p-2 text-[#594246] transition hover:bg-[#F2D0D3]/45 hover:text-[#594246]"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}

          {items.length > 0 && (
            <article className="rounded-2xl border border-[#EBEAE8] bg-white p-6 shadow-[0_2px_14px_rgba(89,66,70,0.06)]">
              <h3 className="text-3xl font-normal text-[#594246]">Entrega</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#594246]/80">
                Ve todas las opciones de envio para tus productos, incluyendo
                 plazos y precios.
              </p>
              <button className="mt-5 rounded-lg border border-[#594246] px-5 py-2 text-xs font-bold uppercase tracking-wide text-[#594246] transition hover:bg-[#594246] hover:text-[#FAF9F6]">
                Calcular
              </button>
            </article>
          )}
        </section>

        <section className="order-1 lg:order-2">
          <OrderSummary items={items} />
        </section>
      </div>
    </div>
  );
}
