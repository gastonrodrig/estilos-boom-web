"use client";

import { useEffect, useRef } from "react";
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

  const loadInitialCartRef = useRef(false);

  useEffect(() => {
    if (isAuthChecking || loadInitialCartRef.current) return;
    loadInitialCartRef.current = true;
    void loadCart();
  }, [isAuthChecking, loadCart]);

  useEffect(() => {
    if (!isAuth || isAuthChecking) return;
    void mergeLocalCartToRemote();
  }, [isAuth, isAuthChecking, mergeLocalCartToRemote]);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-7 text-[#594246] md:px-6">
      <section className="mb-5 py-1">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {checkoutSteps.map((step, index) => {
            const active = index === 0;

            return (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    active ? "bg-black" : "bg-gray-300"
                  }`}
                />
                <div className="flex flex-col items-start">
                  <span
                    className={`text-[11px] font-semibold tracking-wide ${
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
                  <span className="mx-1 h-px w-4 bg-gray-300 md:w-6" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mb-4 flex items-center justify-end">
        <p className="text-sm font-medium text-[#594246]/70">Mi carrito ({items.length})</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_370px]">
        <section className="order-2 lg:order-1">
          {isAuthChecking ? (
            <div className="rounded-2xl border border-[#F2D0D3] bg-white p-10 text-center text-[#594246] shadow-sm">
              Cargando carrito...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-[#F2D0D3] bg-white p-10 text-center text-[#594246] shadow-sm">
              Tu carrito esta vacio.
            </div>
          ) : (
            <div className="rounded-2xl border border-[#F2D0D3] bg-white px-4 py-2 shadow-[0_2px_14px_rgba(89,66,70,0.08)] md:px-5">
              <div className="hidden grid-cols-[1fr_150px_140px_24px] gap-4 border-b border-[#F2D0D3] px-2 py-3 text-[12px] font-semibold text-[#594246]/70 md:grid">
                <span>Producto</span>
                <span className="text-center">Cantidad</span>
                <span className="text-right">Precio</span>
                <span />
              </div>

              <div className="divide-y divide-[#F5E3E6]">
                {items.map((item) => {
                  const canDecrease = item.quantity > 1;

                  return (
                    <article
                      key={`${item.productId}-${item.size}-${item.color}`}
                      className="grid grid-cols-1 gap-3 px-2 py-4 md:grid-cols-[1fr_150px_140px_24px] md:items-center md:gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-24 w-18 shrink-0 rounded-md object-cover md:h-26 md:w-20"
                        />

                        <div className="min-w-0">
                          <h2 className="truncate text-[15px] font-semibold text-[#594246]">
                            {item.name}
                          </h2>
                          <p className="text-xs font-medium text-[#594246]/70">
                            Color: {item.color} | Talla: {item.size}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-start gap-2 md:justify-center">
                        <motion.button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity - 1,
                            )
                          }
                          disabled={!canDecrease}
                          whileTap={canDecrease ? { scale: 1.08 } : undefined}
                          transition={{ type: "spring", stiffness: 380, damping: 24 }}
                          className={`h-7 w-7 rounded border text-sm text-[#594246] transition ${
                            canDecrease
                              ? "border-[#F2D0D3] bg-[#FAF9F6] hover:bg-[#F2D0D3]/35 hover:cursor-pointer"
                              : "border-[#F3F4F6] bg-[#FAF9F6] text-gray-300 cursor-not-allowed"
                          }`}
                          aria-label="Restar cantidad"
                        >
                          <Minus size={14} className="mx-auto" />
                        </motion.button>

                        <span className="w-7 text-center text-sm font-semibold text-[#594246]">
                          {item.quantity}
                        </span>

                        <motion.button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity + 1,
                            )
                          }
                          whileTap={{ scale: 1.08 }}
                          transition={{ type: "spring", stiffness: 380, damping: 24 }}
                          className="h-7 w-7 rounded border border-[#F2D0D3] bg-[#FAF9F6] text-sm text-[#594246] transition hover:bg-[#F2D0D3]/35 hover:cursor-pointer"
                          aria-label="Sumar cantidad"
                        >
                          <Plus size={14} className="mx-auto" />
                        </motion.button>
                      </div>

                      <p className="text-left text-[18px] leading-none font-bold text-[#F2778D] md:text-right">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </p>

                      <button
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="justify-self-start text-[#594246]/70 transition hover:text-[#594246] hover:cursor-pointer md:justify-self-end"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={15} />
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="order-1 lg:order-2">
          {isAuthChecking ? null : <OrderSummary items={items} />}
        </section>
      </div>
    </div>
  );
}