"use client";

import Link from "next/link";

export default function CheckoutSuccessPage() {
  const order = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("last-order") || "{}")
    : {};

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-rose-50">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center">
        
        <h1 className="text-xl font-bold text-gray-900">
          🎉 ¡Compra realizada con éxito!
        </h1>

        <p className="text-gray-600 mt-2">
          Gracias por tu compra. Hemos recibido tu pedido.
        </p>

        {order?.id && (
          <p className="mt-4 text-sm text-gray-700">
            Número de pedido: <span className="font-semibold">{order.id}</span>
          </p>
        )}

        <Link
          href="/"
          className="mt-6 inline-block bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
