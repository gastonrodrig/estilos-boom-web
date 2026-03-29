"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CartItem } from "@models";
import { useCartStore } from "@hooks";
import { useAppSelector } from "@store";

interface CheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  item?: CartItem;
}

type CartItemWithStock = CartItem & { stock?: number };

export const CheckoutDrawer = ({ open, onClose }: CheckoutDrawerProps) => {
  const router = useRouter();
  const { items, total, updateQuantity, removeItem } = useCartStore();
  const authUid = useAppSelector((state) => state.auth.uid);
  const authStatus = useAppSelector((state) => state.auth.status);

  const isAuthenticated = Boolean(authUid) || authStatus === "authenticated";
  const cartItems = items as CartItemWithStock[];

  const itemCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems],
  );

  const handleGoToCatalog = () => {
    onClose();

    const firstItem = cartItems[0];
    if (firstItem?.categoryName) {
      const categorySlug = firstItem.categoryName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      router.push(`/catalogue/${categorySlug}`);
    } else {
      router.push("/catalogue/new-in");
    }
  };

  const handleMainAction = () => {
    onClose();

    if (!isAuthenticated) {
      router.push("/auth/login?returnTo=/cart");
      return;
    }

    router.push("/cart");
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <motion.button
            type="button"
            aria-label="Cerrar carrito"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            className="relative h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-[#F2D0D3] px-5 py-4 flex-shrink-0">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#594246]">
                {itemCount} producto{itemCount !== 1 ? "s" : ""} agregado
              </h2>
              <button onClick={onClose} aria-label="Cerrar">
                <X className="h-5 w-5 text-[#594246]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cartItems.length === 0 ? (
                <div className="rounded-xl border border-[#F2D0D3] bg-[#FAF9F6] p-6 text-center text-sm text-[#594246]/80">
                  Tu carrito esta vacio.
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-[#F5E3E6]">
                  {cartItems.map((item) => {
                    const maxStock =
                      typeof item.stock === "number" && item.stock >= 0
                        ? item.stock
                        : Number.MAX_SAFE_INTEGER;

                    const canIncrease = item.quantity < maxStock;
                    const canDecrease = item.quantity > 1;

                    return (
                      <article
                        key={`${item.productId}-${item.size}-${item.color}`}
                        className="py-3"
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-24 w-18 shrink-0 rounded-md object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold uppercase text-[#594246]">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-[#594246]/70">
                              {item.color} | {item.size}
                            </p>

                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <motion.button
                                  type="button"
                                  className={`h-7 w-7 rounded border text-sm ${
                                    canDecrease
                                      ? "border-[#F2D0D3] bg-[#FAF9F6] text-[#594246] hover:bg-[#F2D0D3]/35 hover:cursor-pointer"
                                      : "border-[#F3F4F6] text-gray-300 cursor-not-allowed"
                                  }`}
                                  disabled={!canDecrease}
                                  whileTap={canDecrease ? { scale: 1.08 } : undefined}
                                  transition={{ type: "spring", stiffness: 380, damping: 24 }}
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.size,
                                      item.color,
                                      item.quantity - 1,
                                    )
                                  }
                                >
                                  -
                                </motion.button>

                                <span className="w-6 text-center text-sm font-semibold text-[#594246]">
                                  {item.quantity}
                                </span>

                                <motion.button
                                  type="button"
                                  className={`h-7 w-7 rounded border text-sm ${
                                    canIncrease
                                      ? "border-[#F2D0D3] bg-[#FAF9F6] text-[#594246] hover:bg-[#F2D0D3]/35 hover:cursor-pointer"
                                      : "border-[#F3F4F6] text-gray-300 cursor-not-allowed"
                                  }`}
                                  disabled={!canIncrease}
                                  whileTap={canIncrease ? { scale: 1.08 } : undefined}
                                  transition={{ type: "spring", stiffness: 380, damping: 24 }}
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.size,
                                      item.color,
                                      item.quantity + 1,
                                    )
                                  }
                                >
                                  +
                                </motion.button>
                              </div>

                              <button
                                className="text-[#594246]/65 transition hover:text-[#594246] hover:cursor-pointer"
                                onClick={() =>
                                  removeItem(item.productId, item.size, item.color)
                                }
                                aria-label="Eliminar producto"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <p className="mt-2 text-[26px] leading-none font-bold text-[#F25C8D]">
                              S/ {(item.price * item.quantity).toFixed(2)}
                            </p>

                            {typeof item.stock === "number" && item.stock >= 0 && (
                              <p className="mt-1 text-[11px] text-[#594246]/60">
                                Stock disponible: {item.stock}
                              </p>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 rounded-xl border border-[#F2D0D3] bg-white p-4">
                <h3 className="text-[13px] font-semibold text-[#594246]">Resumen del Pedido</h3>
                <div className="mt-2 space-y-1.5 text-[12px] text-[#594246]/75">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>S/ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>Ver al finalizar</span>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-[28px] leading-none font-bold text-[#F25C8D]">
                  <span>Total</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#F2D0D3] bg-white px-5 py-4 flex-shrink-0 space-y-2">
              <button
                onClick={handleGoToCatalog}
                className="w-full border border-[#594246] text-[#594246] py-3 rounded-md text-[11px] font-bold uppercase tracking-wide hover:bg-[#594246] hover:text-white transition"
              >
                Seguir viendo catálogo
              </button>

              <button
                onClick={handleMainAction}
                className="w-full bg-black text-white py-3 rounded-md text-[11px] font-bold uppercase tracking-wide hover:bg-gray-900 transition"
              >
                {isAuthenticated ? "Continuar compra" : "Inicie sesión para continuar"}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
