"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { CartItem } from "@models";
import { useCartStore } from "@hooks";

interface CheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  item?: CartItem;
}

type CartItemWithStock = CartItem & { stock?: number };

export const CheckoutDrawer = ({ open, onClose }: CheckoutDrawerProps) => {
  const router = useRouter();
  const { items, total, updateQuantity, removeItem } = useCartStore();

  const cartItems = items as CartItemWithStock[];

  const handleGoToCatalog = () => {
    onClose();
    
    // Obtener la categoría del primer item del carrito
    const firstItem = cartItems[0];
    if (firstItem?.categoryName) {
      // Convertir el nombre de la categoría a slug (ej: "New In" -> "new-in")
      const categorySlug = firstItem.categoryName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      
      router.push(`/catalogue/${categorySlug}`);
    } else {
      router.push("/catalogue/new-in");
    }
  };

  const handleGoToCart = () => {
    onClose();
    router.push("/cart");
  };

  const itemCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <aside className="relative h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4 flex-shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#594246]">
            {itemCount} producto{itemCount !== 1 ? "s" : ""} agregado
          </h2>
          <button onClick={onClose} aria-label="Cerrar">
            <X className="h-5 w-5 text-[#594246]" />
          </button>
        </div>

        {/* Scrollable Content */}
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
                        <button
                          className={`h-7 w-7 rounded border text-sm ${
                            canDecrease
                              ? "border-[#E5E7EB] text-[#594246]"
                              : "border-[#F3F4F6] text-gray-300 cursor-not-allowed"
                          }`}
                          disabled={!canDecrease}
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
                        </button>

                        <span className="w-6 text-center text-sm">{item.quantity}</span>

                        <button
                          className={`h-7 w-7 rounded border text-sm ${
                            canIncrease
                              ? "border-[#E5E7EB] text-[#594246]"
                              : "border-[#F3F4F6] text-gray-300 cursor-not-allowed"
                          }`}
                          disabled={!canIncrease}
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
                        </button>

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

        {/* Buttons - Fixed at Bottom */}
        <div className="border-t bg-white px-5 py-4 flex-shrink-0 space-y-2">
          <button
            onClick={handleGoToCatalog}
            className="w-full border border-[#594246] text-[#594246] py-3 rounded-md text-sm font-bold uppercase tracking-wide hover:bg-[#594246] hover:text-white transition"
          >
            Seguir viendo catálogo
          </button>

          <button
            onClick={handleGoToCart}
            className="w-full bg-black text-white py-3 rounded-md text-sm font-bold uppercase tracking-wide hover:bg-gray-900 transition"
          >
            Continuar compra
          </button>
        </div>
      </aside>
    </div>
  );
};