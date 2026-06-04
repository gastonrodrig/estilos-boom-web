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

export const CheckoutDrawer = ({ open, onClose, item }: CheckoutDrawerProps) => {
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
        <div className="fixed inset-0 z-[70] flex justify-end text-[#594246]">
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
            className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#EBEAE8] px-5 py-4">
              <h2 className="text-[18px] font-serif uppercase tracking-widest text-[#632034]">
                {itemCount} producto{itemCount !== 1 ? "s" : ""} agregado{itemCount !== 1 ? "s" : ""}
              </h2>
              <button onClick={onClose} aria-label="Cerrar" className="transition hover:text-[#C5A059]">
                <X className="h-5 w-5 text-[#594246] hover:text-[#C5A059] transition-colors" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cartItems.length === 0 ? (
                <div className="rounded-xl border border-[#EBEAE8] bg-[#FDF9F3] p-6 text-center text-sm text-[#594246]/80">
                  Tu carrito está vacío.
                </div>
              ) : (
                <div className="divide-y divide-[#EBEAE8] space-y-0">
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
                        <div className="flex gap-3 py-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-34 w-25 shrink-0 rounded-md object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <h2 className="truncate text-xl font-serif text-[#632034]">
                              {item.name}
                            </h2>
                            <p className=" text-[12px] text-gray-500 mt-1">
                              Color : {item.color} 
                            </p>
                            <p className=" text-[12px] text-[#000000]/70">
                              Talla : {item.size}
                            </p>

                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <motion.button
                                  type="button"
                                  className={`size-6 text-[12px] border ${
                                    canDecrease
                                      ? "border-[#EBEAE8] bg-white text-[#594246] hover:cursor-pointer hover:border-[#D9A2A8] hover:text-[#632034] transition-all"
                                      : "cursor-not-allowed border-[#EBEAE8] bg-[#FAF9F6] text-gray-300"
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

                                <span className="w-6 text-center text-sm font-bold text-[#594246]">
                                  {item.quantity}
                                </span>

                                <motion.button
                                  type="button"
                                  className={`size-6 text-sm border ${
                                    canIncrease
                                      ? "border-[#EBEAE8] bg-white text-[#594246] hover:cursor-pointer hover:border-[#D9A2A8] hover:text-[#632034] transition-all"
                                      : "cursor-not-allowed border-[#EBEAE8] bg-[#FAF9F6] text-gray-300"
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
                                className="text-gray-400 transition hover:cursor-pointer hover:text-[#C5A059]"
                                onClick={() =>
                                  removeItem(item.productId, item.size, item.color)
                                }
                                aria-label="Eliminar producto"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>

                            <p className="mt-5 text-[15px] leading-none font-medium text-[#632034]">
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

              <div className="mt-5 rounded-sm border border-[#E5B3B8] bg-[#FCF5F5] p-6 shadow-sm">
                <h3 className="text-[12px] font-bold text-[#632034] tracking-[0.2em] uppercase mb-4">Resumen del Pedido</h3>
                <div className="space-y-2 text-[14px] text-gray-600 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>S/ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span className="font-light italic text-gray-400">Ver al finalizar</span>
                  </div>
                </div>
                <hr className="my-5 border-[#E5B3B8]" />
                <div className="flex justify-between text-[18px] leading-none font-bold text-[#632034]">
                  <span className="uppercase text-[14px] tracking-widest">Total</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 space-y-3 border-t border-[#EBEAE8] bg-white px-5 py-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button
                onClick={handleGoToCatalog}
                className="w-full rounded-sm border border-[#EBEAE8] bg-white py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#632034] transition-all hover:bg-[#FCF5F5] hover:border-[#D9A2A8]"
              >
                Seguir viendo catálogo
              </button>

              <button
                onClick={handleMainAction}
                className="w-full rounded-sm bg-[#632034] py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-black hover:shadow-lg active:scale-[0.98]"
              >
                {isAuthenticated ? "Continuar con la compra" : "Inicie sesión para continuar"}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
