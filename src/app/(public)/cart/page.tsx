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
    if (items.length === 0) {
      void loadCart();
    }
  }, [isAuthChecking, loadCart, items.length]);

  useEffect(() => {
    if (!isAuth || isAuthChecking) return;
    void mergeLocalCartToRemote();
  }, [isAuth, isAuthChecking, mergeLocalCartToRemote]);

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes lunaPulse {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(232,184,109,0.25));
            opacity: var(--luna-opacity);
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(232,184,109,0.5)) drop-shadow(0 0 24px rgba(232,184,109,0.2));
            opacity: calc(var(--luna-opacity) * 1.7);
        }

        }
      `}</style>

      {/* LUNAR BACKGROUND (DARK MODE ONLY) */}
      <div className="absolute inset-0 z-[-1] hidden dark:block pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 35% 35% at 20% 18%, rgba(255,180,210,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 10% 80%, rgba(180,60,100,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 85% 75%, rgba(140,40,80,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 100% 80% at 50% 100%, rgba(100,20,50,0.15) 0%, transparent 60%),
            #1a0618
          `
        }}
      >
        <svg width="0" height="0" className="absolute">
          <defs>
            <filter id="lunaGlowCart">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
        </svg>

        <div className="fixed pointer-events-none z-0" style={{ top: '6%', right: '5%', width: '45px', height: '45px', opacity: 0.15, transform: 'rotate(-20deg)', animation: 'lunaPulse 6s ease-in-out infinite', '--luna-opacity': 0.15 } as React.CSSProperties}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="28" fill="#e8b86d" filter="url(#lunaGlowCart)" opacity="0.9"/>
            <circle cx="62" cy="50" r="24" fill="#0d0408"/>
          </svg>
        </div>

        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() > 0.5 ? '1px' : '2px',
              height: Math.random() > 0.5 ? '1px' : '2px',
              top: Math.random() * 80 + 2 + '%',
              left: Math.random() * 100 + '%',
              backgroundColor: Math.random() < 0.7 ? '#e8b86d' : '#fdeef5',
              opacity: Math.random() * 0.3 + 0.2,
              animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
            }}
          />
        ))}

        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[300px] blur-[50px] rounded-[100%]" style={{ background: 'rgba(180,60,100,0.1)' }} />
        <div className="absolute bottom-0 right-[-10%] w-[450px] h-[280px] blur-[50px] rounded-[100%]" style={{ background: 'rgba(180,60,100,0.1)' }} />
      </div>

    <div className="mx-auto w-full max-w-[1280px] px-4 py-7 text-[#594246] md:px-6 relative z-10">
        <CheckoutStepper currentStep={0} />

      <div className="mb-4 flex items-center justify-end">
        <p className="cart-count-title text-sm font-medium text-[#000000]/70 dark:text-[#C5A059] uppercase tracking-[0.2em]">Mi carrito ({items.length})</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_370px]">
        <section className="order-2 lg:order-1">
          {isAuthChecking ? (
            <div className="rounded-2xl border border-[#F2D0D3] dark:border-[#e8688a]/30 bg-white dark:bg-transparent p-10 text-center text-[#594246] dark:text-[#f0d8e8]/80 shadow-sm">
              Cargando carrito...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-[#F2D0D3] dark:border-[#e8688a]/30 bg-white dark:bg-transparent p-10 text-center text-[#594246] dark:text-[#f0d8e8]/80 shadow-sm">
              Tu carrito esta vacio.
            </div>
          ) : (
            <div className="bg-[#ffffff] dark:bg-[#1a0618]/60 dark:backdrop-blur-md dark:border dark:border-[#C5A059]/20 rounded-xl px-4 py-2 md:px-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="cart-table-header hidden grid-cols-[1fr_150px_140px_24px] gap-4 border-b border-[#F5E3E6] dark:border-[#C5A059]/20 px-2 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#D9A2A8] dark:text-[#C5A059] md:grid ">
                <span>Producto</span>
                <span className="text-center truncate text-[15px]">Cantidad</span>
                <span className="text-right truncate text-[15px]">Precio</span>
                <span />
              </div>

              <div className="divide-y divide-[#F5E3E6] dark:divide-[#C5A059]/20">
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
                      className="cart-item-card grid grid-cols-1 gap-3 px-2 py-4 md:grid-cols-[1fr_150px_140px_24px] md:items-center md:gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="cart-item-image h-24 w-18 shrink-0 rounded-md object-cover md:h-26 md:w-20"
                        />

                        <div className="min-w-0">
                          <h2 className="cart-item-name truncate text-[18px] font-serif text-[#632034] dark:text-white">
                            {item.name}
                          </h2>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="cart-item-pill text-[10px] px-2 py-0.5 rounded-full border border-[#EBEAE8] dark:border-[#C5A059]/30 text-[#000000]/70 dark:text-[#f0d8e8]/70">
                                Talla: {item.size}
                              </span>
                              <span className="cart-item-pill text-[10px] px-2 py-0.5 rounded-full border border-[#EBEAE8] dark:border-[#C5A059]/30 text-[#000000]/70 dark:text-[#f0d8e8]/70">
                                Color: {item.color} 
                              </span>
                           </div>
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
                          className={`qty-btn h-7 w-7 rounded-full border text-sm text-[#000000] dark:text-[#e8b86d] transition-all ${
                            canDecrease
                              ? "border-[#EBEAE8] dark:border-[#e8b86d]/40 bg-white dark:bg-[#e8b86d]/10 text-[#594246] hover:cursor-pointer hover:border-[#D9A2A8] dark:hover:border-[#e8b86d] hover:text-[#632034] dark:hover:text-white"
                                      : "cursor-not-allowed border-[#EBEAE8] dark:border-transparent bg-[#FAF9F6] dark:bg-white/5 text-gray-300 dark:text-white/20"
                          }`}
                          aria-label="Restar cantidad"
                        >
                          <Minus size={14} className="mx-auto" />
                        </motion.button>

                        <span className="qty-value w-7 text-center text-sm font-semibold text-[#594246] dark:text-white">
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
                          className={`qty-btn h-7 w-7 rounded-full border text-sm text-[#000000] dark:text-[#e8b86d] transition-all ${
                                    canIncrease
                                      ? "border-[#EBEAE8] dark:border-[#e8b86d]/40 bg-white dark:bg-[#e8b86d]/10 text-[#594246] hover:cursor-pointer hover:border-[#D9A2A8] dark:hover:border-[#e8b86d] hover:text-[#632034] dark:hover:text-white"
                                      : "cursor-not-allowed border-[#EBEAE8] dark:border-transparent bg-[#FAF9F6] dark:bg-white/5 text-gray-300 dark:text-white/20"
                                  }`}
                          aria-label="Sumar cantidad"
                        >
                          <Plus size={14} className="mx-auto" />
                        </motion.button>
                      </div>

                      <p className="cart-item-price text-left text-[16px] leading-none font-bold tracking-wider text-[#632034] dark:text-white md:text-right">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </p>

                      <button
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="btn-delete justify-self-start text-gray-400 dark:text-white/40 transition hover:text-[#C5A059] dark:hover:text-[#e8b86d] hover:cursor-pointer md:justify-self-end"
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