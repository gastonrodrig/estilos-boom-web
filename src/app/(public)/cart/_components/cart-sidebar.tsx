// src/app/(public)/cart/_components/cart-sidebar.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  selectedSize?: string;
  selectedVariant?: string;
  quantity: number;
};

/* -------------------------------------------
   Normalizador (unifica qty → quantity, etc)
--------------------------------------------- */
const normalize = (raw: any): CartItem[] => {
  if (!raw) return [];
  try {
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr.map((p: any) => ({
      id: p.id,
      title: p.title ?? "",
      price: Number(p.price) || 0,
      image: p.image ?? p.images?.[0] ?? "",
      selectedSize: p.selectedSize ?? p.size ?? "",
      selectedVariant: p.selectedVariant ?? p.color ?? "",
      quantity: Number(p.quantity ?? p.qty ?? 1),
    }));
  } catch {
    return [];
  }
};

export const CartSidebar = () => {
  const pathname = usePathname();

  /* Estado inicial desde localStorage */
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("cart");
      return raw ? normalize(JSON.parse(raw)) : [];
    } catch {
      return [];
    }
  });

  const [open, setOpen] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? normalize(JSON.parse(raw)) : [];
    } catch {
      return [];
    }
  }, []);

  /* Listener global del carrito */
  useEffect(() => {
    const handleCartUpdated = (e: Event) => {
      const ce = e as CustomEvent<any>;
      if (!ce.detail) return;

      const normalized = normalize(ce.detail);
      setItems(normalized);

      // Si estoy en /cart → no abrir sidebar
      if (pathname !== "/cart" && normalized.length > 0) {
        setOpen(true);
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdated as EventListener);

    return () =>
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdated as EventListener
      );
  }, [pathname]);

  /* Actualizar contenido cuando cambia localStorage */
  useEffect(() => {
    const handleStorage = (ev: StorageEvent) => {
      if (ev.key === "cart") {
        setItems(loadFromStorage());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadFromStorage]);

  /* Bloquear scroll body cuando está abierto */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* Actualizar cantidades */
  const updateQuantity = (index: number, newQty: number) => {
    setItems((prev) => {
      let updated = [...prev];

      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index] = { ...updated[index], quantity: newQty };
      }

      localStorage.setItem("cart", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: updated }));

      // si ya no quedan items, cerrar
      if (updated.length === 0) {
        setOpen(false);
      }

      return updated;
    });
  };

  if (!open) return null;

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  /* UI DEL SIDEBAR */
  const ui = (
    <>
      {/* Fondo oscuro */}
      <div
        className="fixed inset-0 bg-black/55 z-[100] backdrop-blur-[1px]"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="shrink-0 border-b px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M3 4h2l1 3h13l-1.2 6H8.3L7 7H5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="10"
                  cy="19"
                  r="1.6"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  fill="none"
                />
                <circle
                  cx="17"
                  cy="19"
                  r="1.6"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tu Carrito
              </h2>
              <p className="text-xs text-gray-500">
                Revisa tus productos antes de pagar
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-800 transition"
            aria-label="Cerrar carrito"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50/60">
          {items.length ? (
            items.map((it, index) => (
              <div
                key={`${it.id}-${it.selectedVariant}-${it.selectedSize}`}
                className="flex gap-4 rounded-xl bg-white border border-gray-100 shadow-[0_4px_14px_rgba(15,23,42,0.06)] p-3"
              >
                {/* Imagen */}
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={it.image}
                    alt={it.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Detalle */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {it.title}
                    </h3>
                    {it.selectedSize && (
                      <p className="mt-1 text-xs text-gray-500">
                        Talla:{" "}
                        <span className="font-medium text-gray-700">
                          {it.selectedSize}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    {/* Controles cantidad */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, it.quantity - 1)}
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm font-semibold"
                        aria-label="Disminuir cantidad"
                      >
                        −
                      </button>

                      <span className="w-8 text-center text-sm font-semibold text-gray-900">
                        {it.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(index, it.quantity + 1)}
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm font-semibold"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>

                    {/* Precio */}
                    <p className="text-sm font-semibold text-pink-600">
                      S/ {(it.price * it.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-500">
              <p className="font-medium text-gray-700 mb-1">
                Tu carrito está vacío
              </p>
              <p className="text-xs text-gray-500">
                Agrega productos desde el catálogo para verlos aquí.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t bg-white px-6 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Total</span>
              <span className="text-lg font-semibold text-pink-600">
                S/ {subtotal.toFixed(2)}
              </span>
            </div>

            <a
              href="/cart"
              className="block w-full rounded-lg bg-gradient-to-r from-pink-500 to-orange-400 py-3 text-center text-sm font-semibold text-white shadow-md hover:opacity-90 transition"
            >
              Ir al Carrito
            </a>

            <button
              onClick={() => setOpen(false)}
              className="w-full rounded-lg bg-gray-100 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-200 transition"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );

  return createPortal(ui, document.body);
};
