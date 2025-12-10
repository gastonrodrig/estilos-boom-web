"use client";

import { useState } from "react";
import { Checkbox, Input, Label, Button } from "@components";
import { BillingAddressForm } from "./billing-address-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@components";
import { useRouter } from "next/navigation";

type Props = {
  onBack: () => void;
};

function getInitialOrder() {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem("order");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function PaymentStep({ onBack }: Props) {
  const [sameBilling, setSameBilling] = useState(true);
  const [savedOrder] = useState<any>(getInitialOrder());

  const savedAddress = savedOrder

  const router = useRouter();

  function handlePayment() {
    // Cargar valores previos del checkout
    const orderData = JSON.parse(localStorage.getItem("order") || "{}");
    const address = orderData;
    const shipping = orderData.shippingMethod || {};
    const items = JSON.parse(localStorage.getItem("cart") || "[]");

    // Calcular total final aproximado
    const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const shippingPrice = shipping?.price ?? 0;

    const total = subtotal + shippingPrice;

    // Crear registro de compra
    const order = {
      id: "ORD-" + Date.now(),
      items,
      address,
      shippingMethod: shipping,
      total,
      date: new Date().toISOString(),
    };

    // Guardar la orden (sin datos de tarjeta)
    localStorage.setItem("last-order", JSON.stringify(order));

    // Vaciar carrito si quieres
    localStorage.removeItem("cart");

    // Redirigir a página de éxito
    router.push("/checkout/success");
  }

  return (
    <div className="space-y-6">

      {/* --------------------------------------------------------
         SECCIÓN: RESUMEN DE DIRECCIÓN Y MÉTODO DE ENVÍO
      -------------------------------------------------------- */}
      <div className="rounded-2xl bg-white border p-5 shadow-sm">
        <div className="flex items-center justify-between">

          <div className="w-full">
            <p className="font-semibold text-gray-900 text-sm">Enviar a</p>

            {savedAddress ? (
              <div className="text-xs text-gray-700 leading-snug space-y-0.5 mt-1">
                <p className="font-medium text-gray-900">{savedAddress.firstName} {savedAddress.lastName}</p>

                <p>
                  {savedAddress.address}
                  {savedAddress.apartment ? `, ${savedAddress.apartment}` : ""}
                </p>

                <p>
                  {savedAddress.city}, {savedAddress.department} {savedAddress.postalCode}
                </p>

                {savedAddress.phone && <p>{savedAddress.phone}</p>}
                {savedAddress.email && (
                  <p className="text-gray-500">{savedAddress.email}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                No se encontró una dirección guardada
              </p>
            )}

            {/* Método de Envío */}
            {savedOrder?.shippingMethod && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="font-semibold text-gray-900 text-sm">Método de Envío</p>
                <div className="text-xs text-gray-700 leading-snug space-y-0.5 mt-1">
                  <p className="font-medium text-gray-900">{savedOrder.shippingMethod.title}</p>
                  <p className="text-gray-600">
                    {savedOrder.shippingMethod.price === 0 
                      ? "GRATIS" 
                      : `S/ ${savedOrder.shippingMethod.price.toFixed(2)}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onBack}
            className="text-pink-600 text-sm font-medium hover:underline"
          >
            Editar
          </button>
        </div>
      </div>

      <Card className="border-pink-300/60 shadow-sm rounded-2xl">

  <CardHeader>
    <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
      Tarjeta de Crédito
    </CardTitle>

    <CardDescription className="text-xs text-gray-600">
      Visa, Mastercard, American Express, Discover, JCB, Diners Club
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-4">

    {/* Número de Tarjeta */}
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-700">Número de Tarjeta*</Label>
      <Input
        placeholder="1234 5678 9012 3456"
        className="h-11 text-sm bg-white border-gray-300"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">

      {/* MM/AA */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-700">MM/AA*</Label>
        <Input
          placeholder="12/25"
          className="h-11 text-sm bg-white border-gray-300"
        />
      </div>

      {/* CVC */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-700">Código de Seguridad*</Label>
        <Input
          placeholder="123"
          className="h-11 text-sm bg-white border-gray-300"
        />
      </div>

    </div>

  </CardContent>

</Card>


      {/* --------------------------------------------------------
         CHECKBOX: MISMA DIRECCIÓN DE FACTURACIÓN
      -------------------------------------------------------- */}
      <div className="flex items-start gap-2 mt-3">
        <Checkbox
          checked={sameBilling}
          onCheckedChange={(checked) => setSameBilling(checked === true)}
        />

        <p className="text-xs text-gray-700 leading-snug">
          La dirección de facturación es la misma que la dirección de envío
        </p>
      </div>

      {/* --------------------------------------------------------
         FORM FACTURACIÓN SI NO ES LA MISMA
      -------------------------------------------------------- */}
      {!sameBilling && <BillingAddressForm />}

      {/* --------------------------------------------------------
         BOTÓN PRINCIPAL
      -------------------------------------------------------- */}
      <Button
        onClick={handlePayment}
        className="w-full mt-4 bg-gradient-to-r from-pink-500 to-orange-400"
      >
        Pagar Ahora
      </Button>


    </div>
  );
}
