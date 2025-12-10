"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X as Icon, X } from "lucide-react";

type CartItem = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  color?: string;
  size?: string;
  qty: number;
};

/* Normalizador para el carrito */
const normalize = (raw: any): CartItem[] => {
  if (!raw) return [];
  try {
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr.map((p: any) => ({
      id: p.id,
      title: p.title ?? p.name ?? "",
      price: Number(p.price) || 0,
      oldPrice: p.oldPrice,
      image: p.image ?? p.images?.[0] ?? "",
      color: p.color ?? p.selectedVariant ?? "",
      size: p.size ?? p.selectedSize ?? "",
      qty: Number(p.qty ?? p.quantity ?? 1),
    }));
  } catch {
    return [];
  }
};

export default function CartPage() {
  // Initialize from localStorage synchronously during initial render
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const stored = localStorage.getItem("cart");
      return stored ? normalize(JSON.parse(stored)) : [];
    } catch (e) {
      console.error("Error parsing cart from localStorage (init)", e);
      return [];
    }
  });

  // Subscribe to external updates — do not call setState synchronously in effect body
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== "cart") return;
      try {
        const newVal = e.newValue;
        if (!newVal) {
          setItems([]);
          return;
        }
        const parsed = JSON.parse(newVal);
        setItems(normalize(parsed));
      } catch (err) {
        console.error("Error parsing storage event cart value", err);
      }
    }

    function onCartUpdated(e: Event) {
      try {
        const ce = e as CustomEvent;
        const detail = ce.detail as any;
        if (!detail) return;
        setItems(normalize(detail));
      } catch (err) {
        console.error("Error handling cartUpdated event", err);
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("cartUpdated", onCartUpdated as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cartUpdated", onCartUpdated as EventListener);
    };
  }, []);

  function persist(newItems: CartItem[]) {
    setItems(newItems);
    try {
      // Persist with normalized shape (quantity instead of qty for consistency)
      const toPersist = newItems.map((it) => ({
        id: it.id,
        title: it.title,
        price: it.price,
        oldPrice: it.oldPrice,
        image: it.image,
        selectedSize: it.size,
        selectedVariant: it.color,
        quantity: it.qty,
      }));

      localStorage.setItem("cart", JSON.stringify(toPersist));
      // notify other listeners (CartSidebar) with the page's shape
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: newItems }));
    } catch (e) {
      console.error("Error persisting cart", e);
    }
  }

  function handleIncrement(id: string) {
    const updated = items.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it));
    persist(updated);
  }

  function handleDecrement(id: string) {
    const updated = items
      .map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it))
      .filter((it) => it.qty > 0);
    persist(updated);
  }

  function handleRemove(id: string) {
    const updated = items.filter((it) => it.id !== id);
    persist(updated);
  }

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const discount = 57.98; // demo
  const shipping: number = 0;

  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Carrito de Compras</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Lista de items */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-amber-200/50 bg-white shadow-sm ring-1 ring-black/5 p-8 text-center">
              <p className="text-lg font-semibold text-gray-800">Tu carrito está vacío</p>
              <p className="mt-2 text-sm text-gray-600">No tienes artículos en tu carrito todavía.</p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
              >
                Seguir comprando
              </Link>
            </div>
          ) : (
            items.map((it) => (
              <article
                key={it.id}
                className="rounded-2xl border border-amber-200/50 bg-white shadow-sm ring-1 ring-black/5 p-4 sm:p-5"
              >
                <div className="flex gap-4">
                  <img src={it.image} alt={it.title} className="h-28 w-28 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{it.title}</h3>
                        <p className="text-sm text-gray-600">
                          Color: {it.color ?? "-"} {it.size ? `| Talla: ${it.size}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(it.id)}
                        className="text-gray-600 hover:text-gray-800"
                        aria-label="Eliminar"
                      >
                        <Icon className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {it.oldPrice && (
                        <span className="text-sm text-gray-500 line-through">S/ {it.oldPrice.toFixed(2)}</span>
                      )}
                      <span className="text-pink-700 font-semibold">S/ {it.price.toFixed(2)}</span>
                      {it.oldPrice && (
                        <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700">
                          -20% OFF
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleDecrement(it.id)}
                        className="h-8 w-8 rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                        aria-label="Restar cantidad"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm text-gray-700">{it.qty}</span>
                      <button
                        onClick={() => handleIncrement(it.id)}
                        className="h-8 w-8 rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                        aria-label="Sumar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Resumen */}
        <aside className="rounded-2xl border border-amber-200/50 bg-white p-4 sm:p-5 shadow-sm ring-1 ring-black/5 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Resumen del Pedido</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-700">Subtotal</span><span className="text-gray-700">S/ {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-emerald-600"><span className="text-gray-700">Descuentos</span><span className="text-emerald-600">-S/ {discount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-700">Envío</span><span className="text-emerald-600">{shipping === 0 ? "GRATIS" : `S/ ${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between text-gray-600"><span>Impuestos</span><span>Calculado al finalizar</span></div>
          </div>

          <hr className="my-4" />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Total Estimado</span>
            <span className="text-xl font-semibold text-pink-700">S/ {(subtotal - discount + shipping).toFixed(2)}</span>
          </div>

          <a
            href="/checkout"
            className="mt-4 block w-full rounded-lg bg-gradient-to-r from-pink-500 to-amber-400 px-4 py-3 text-center font-semibold text-white shadow hover:opacity-90"
          >
            Proceder al Pago
          </a>

          <p className="mt-2 text-center text-xs text-gray-500">Pago 100% seguro y protegido</p>
        </aside>
      </div>
    </section>
  );
}
