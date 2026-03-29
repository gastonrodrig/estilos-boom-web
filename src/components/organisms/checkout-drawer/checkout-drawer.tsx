"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
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
            <div className="flex items-center justify-between border-b px-5 py-4 flex-shrink-0">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#594246]">
                {itemCount} producto{itemCount !== 1 ? "s" : ""} agregado
              </h2>
              <button onClick={onClose} aria-label="Cerrar">
                <X className="h-5 w-5 text-[#594246]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const maxStock =
                    typeof item.stock === "number" && item.stock >= 0
                      ? item.stock
                      : Number.MAX_SAFE_INTEGER;

                  const canIncrease = item.quantity < maxStock;
                  const canDecrease = item.quantity > 1;

                  return (
                    <div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      className="rounded-xl border border-[#F3D5DB] p-3"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-16 object-cover rounded-md"
                        />

                        <div className="flex-1">
                          <p className="text-sm font-bold uppercase text-[#594246]">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.color} | {item.size}
                          </p>
                          <p className="text-2xl font-bold text-[#F25C8D] leading-none mt-1">
                            S/ {(item.price * item.quantity).toFixed(2)}
                          </p>

                          <div className="mt-2 flex items-center gap-2">
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

                            <span className="w-6 text-center text-sm">{item.quantity}</span>

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

                            <button
                              className="ml-auto text-sm text-[#594246] underline"
                              onClick={() =>
                                removeItem(item.productId, item.size, item.color)
                              }
                            >
                              Eliminar
                            </button>
                          </div>

                          {typeof item.stock === "number" && item.stock >= 0 && (
                            <p className="mt-2 text-[11px] text-gray-500">
                              Stock disponible: {item.stock}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-xl border p-4">
                <h3 className="text-sm font-bold text-[#594246] mb-2">Resumen del Pedido</h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Envío</span>
                  <span>Delivery o recojo se elige en el carrito.</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-[#F25C8D] mt-2">
                  <span>Total estimado</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t bg-white px-5 py-4 flex-shrink-0 space-y-2">
              <button
                onClick={handleGoToCatalog}
                className="w-full border border-[#594246] text-[#594246] py-3 rounded-md text-sm font-bold uppercase tracking-wide hover:bg-[#594246] hover:text-white transition"
              >
                Seguir viendo catálogo
              </button>

              <button
                onClick={handleMainAction}
                className="w-full bg-black text-white py-3 rounded-md text-sm font-bold uppercase tracking-wide hover:bg-gray-900 transition"
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
