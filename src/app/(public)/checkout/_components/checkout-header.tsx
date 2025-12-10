"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function CheckoutHeader() {
  return (
    <header className="mb-8 flex flex-col gap-4">
      {/* Volver al carrito */}
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al carrito</span>
      </Link>

      {/* Marca + título */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white text-sm font-semibold shadow">
            EB
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">Estilos Boom</p>
            <p className="text-xs tracking-[0.18em] text-gray-500">BOUTIQUE</p>
          </div>
        </div>

        <div className="text-right text-xs sm:text-sm text-gray-600">
          <p className="font-medium text-gray-800">Finalizar Compra como Invitado</p>
          <p className="mt-0.5">
            o{" "}
            <Link href="/auth/login" className="text-pink-600 font-semibold hover:underline">
              inicia sesión
            </Link>{" "}
            para un proceso más rápido
          </p>
        </div>
      </div>
    </header>
  );
}