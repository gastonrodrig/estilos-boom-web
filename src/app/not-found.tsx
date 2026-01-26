"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      
      <AlertTriangle size={64} className="text-pink-500 mb-6" />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Página no encontrada
      </h1>

      <p className="text-gray-600 max-w-md mb-6">
        La página que estás buscando no existe, fue movida o no tienes permisos
        para acceder a ella.
      </p>

      <div className="flex gap-4">
        <Link
          href="/"
          className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300"
        >
          Ir al inicio
        </Link>

        <Link
          href="/auth/login"
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-orange-400 text-white font-medium shadow hover:opacity-90"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
