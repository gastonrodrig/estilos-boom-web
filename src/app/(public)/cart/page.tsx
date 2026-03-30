"use client";

import { useEffect, useRef } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { OrderSummary } from "@components";
import { useCartStore } from "@hooks";
import { useAppSelector } from "@store";
import { CheckoutStepper } from "@components";


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
    <div className="w-full h-full  ">
    <div className="mx-auto w-full max-w-[1280px] px-4 py-7 text-[#594246] md:px-6 ">
        <CheckoutStepper currentStep={0} />

      <div className="mb-4 flex items-center justify-end">
        <p className="text-sm font-medium text-[#000000]/70">Mi carrito ({items.length})</p>
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
            <div className="bg-[#ffffff]  rounded-sm  px-4 py-2  md:px-5">
              <div className="hidden grid-cols-[1fr_150px_140px_24px] gap-4 border-b border-[#F2B6C1] px-2 py-3 text-[15px] font-normal text-[#594246]/80 md:grid ">
                <span>Producto</span>
                <span className="text-center truncate text-[15px]">Cantidad</span>
                <span className="text-right truncate text-[15px]">Precio</span>
                <span />
              </div>

              <div className="divide-y divide-[#F5E3E6]">
                {items.map((item) => {
                  const maxStock =
                      typeof item.stock === "number" && item.stock >= 0
                        ? item.stock
                        : Number.MAX_SAFE_INTEGER;
                  const canDecrease = item.quantity > 1;
                   const canIncrease = item.quantity < maxStock;

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
                          <h2 className="truncate text-[18px] font-medium text-[#594246]">
                            {item.name}
                          </h2>
                           <p className="text-[12px] text-[#000000]/70">
                              Color : {item.color} 
                            </p>
                            <p className="text-[12px] text-[#000000]/70">
                              Talla : {item.size}
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
                          className={`h-7 w-7 rounded border text-sm text-[#000000] transition ${
                            canDecrease
                              ? "border-[#F2D0D3] bg-[#F2D0D3] text-[#594246] hover:cursor-pointer hover:bg-[#F291A3]/70"
                                      : "cursor-not-allowed border-[#F3F4F6] text-gray-300"
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
                          className={`h-7 w-7 rounded border text-sm text-[#000000] transition ${
                                    canIncrease
                                      ? "border-[#F2D0D3] bg-[#F2D0D3] text-[#000000] hover:cursor-pointer hover:bg-[#F291A3]/70"
                                      : "cursor-not-allowed border-[#F3F4F6] text-gray-300"
                                  }`}
                          aria-label="Sumar cantidad"
                        >
                          <Plus size={14} className="mx-auto" />
                        </motion.button>
                      </div>

                      <p className="text-left text-[16px] leading-none font-semimedium text-[#594246] md:text-right">
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
    </div>
  );
}