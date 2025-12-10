"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { CheckoutHeader } from "./_components/checkout-header";
import { CheckoutForm } from "./_components/checkout-form";
import { OrderSummaryCard } from "./_components/order-summary-card";
import { ShippingMethodStep } from "./_components/shipping-method-step";
import { PaymentStep } from "./_components/payment-step";
import { getCartItems } from "./_lib/get-cart-item";

type Step = "form" | "shipping" | "payment";

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>("form");
  const [address, setAddress] = useState<any>(null);
  const items = getCartItems();

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-rose-50/70 to-white py-10">
      <section className="mx-auto max-w-6xl px-4 flex flex-col gap-8">
        <CheckoutHeader />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                <CheckoutForm
                  onSubmit={(data) => {
                    setAddress(data);
                    setStep("shipping");
                  }}
                />
              </motion.div>
            )}

            {step === "shipping" && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                <ShippingMethodStep
                  address={address}
                  onBack={() => setStep("form")}
                  onNext={() => setStep("payment")}   // ← AQUÍ ESTÁ LA REDIRECCIÓN
                />
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                <PaymentStep
                  address={address}
                  onBack={() => setStep("form")}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resumen del pedido */}
          <OrderSummaryCard items={items} />
        </div>
      </section>
    </main>
  );
}
