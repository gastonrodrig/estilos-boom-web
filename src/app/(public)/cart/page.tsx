"use client";

import { useEffect } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { OrderSummary } from "@components";
import { useCartStore } from "@hooks";
import { useAppSelector } from "@store";

const checkoutSteps = [
  "Carrito",
  "Identificacion",
  "Entrega",
  "Pago",
  "Confirmacion",
];

export default function CartPage() {
  const { items, loadCart, updateQuantity, removeItem, mergeLocalCartToRemote } = useCartStore();
  const authUid = useAppSelector((state) => state.auth.uid);
  const authStatus = useAppSelector((state) => state.auth.status);

  const isAuthChecking = authStatus === "checking";
  const isAuth = Boolean(authUid) || authStatus === "authenticated";

  console.log("[CartUI] render", {
    authUid,
    authStatus,
    isAuthChecking,
    isAuth,
    itemsCount: items.length,
    items,
  });

  useEffect(() => {
    console.log("[CartUI] mounted");
  }, []);

  useEffect(() => {
    console.log("[CartUI] auth changed", {
      authUid,
      authStatus,
      isAuthChecking,
      isAuth,
    });
  }, [authUid, authStatus, isAuthChecking, isAuth]);

  useEffect(() => {
    if (isAuthChecking) {
      console.log("[CartUI] loadCart skipped (auth checking)");
      return;
    }

    console.log("[CartUI] calling loadCart");
    void loadCart();
  }, [authUid, authStatus, isAuthChecking, loadCart]);

  useEffect(() => {
    if (!isAuth || isAuthChecking) {
      console.log("[CartUI] merge skipped", { isAuth, isAuthChecking });
      return;
    }

    console.log("[CartUI] calling mergeLocalCartToRemote");
    void mergeLocalCartToRemote();
  }, [isAuth, isAuthChecking, mergeLocalCartToRemote]);

  useEffect(() => {
    console.log("[CartUI] items changed", { count: items.length, items });
  }, [items]);

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
                  <span
                    className={`mt-0.5 h-px w-full ${
                      active ? "bg-black" : "bg-transparent"
                    }`}
                  />
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
          {isAuthChecking ? (
            <div className="rounded-2xl border border-[#F2D0D3] bg-white p-10 text-center text-[#594246] shadow-sm">
              Cargando carrito...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-[#F2D0D3] bg-white p-10 text-center text-[#594246] shadow-sm">
              Tu carrito esta vacio.
            </div>
          ) : (
            items.map((item) => {
              const canDecrease = item.quantity > 1;

              return (
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
                      <motion.button
                        type="button"
                        onClick={() => {
                          console.log("[CartUI] click decrease", {
                            productId: item.productId,
                            size: item.size,
                            color: item.color,
                            fromQty: item.quantity,
                            toQty: item.quantity - 1,
                          });
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            item.quantity - 1,
                          );
                        }}
                        disabled={!canDecrease}
                        whileHover={canDecrease ? { scale: 1.08 } : undefined}
                        whileTap={canDecrease ? { scale: 0.94 } : undefined}
                        transition={{ type: "spring", stiffness: 380, damping: 24 }}
                        className={`rounded-lg border p-2 text-[#594246] transition ${
                          canDecrease
                            ? "border-[#F2D0D3] bg-[#FAF9F6] hover:bg-[#F2D0D3]/35 hover:cursor-pointer"
                            : "border-[#F3F4F6] bg-[#FAF9F6] text-gray-300 cursor-not-allowed"
                        }`}
                        aria-label="Restar cantidad"
                      >
                        <Minus size={16} />
                      </motion.button>

                      <span className="w-8 text-center text-base font-semibold text-[#594246]">
                        {item.quantity}
                      </span>

                      <motion.button
                        type="button"
                        onClick={() => {
                          console.log("[CartUI] click increase", {
                            productId: item.productId,
                            size: item.size,
                            color: item.color,
                            fromQty: item.quantity,
                            toQty: item.quantity + 1,
                          });
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            item.quantity + 1,
                          );
                        }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: "spring", stiffness: 380, damping: 24 }}
                        className="rounded-lg border border-[#F2D0D3] bg-[#FAF9F6] p-2 text-[#594246] transition hover:bg-[#F2D0D3]/35 hover:cursor-pointer"
                        aria-label="Sumar cantidad"
                      >
                        <Plus size={16} />
                      </motion.button>

                      <button
                        onClick={() => {
                          console.log("[CartUI] click remove", {
                            productId: item.productId,
                            size: item.size,
                            color: item.color,
                          });
                          removeItem(item.productId, item.size, item.color);
                        }}
                        className="ml-2 rounded-lg p-2 text-[#594246] transition hover:bg-[#F2D0D3]/45 hover:text-[#594246] hover:cursor-pointer"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section className="order-1 lg:order-2">
          {isAuthChecking ? null : <OrderSummary items={items} />}
        </section>
      </div>
    </div>
  );
}