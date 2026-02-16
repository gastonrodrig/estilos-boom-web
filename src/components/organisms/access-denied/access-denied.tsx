"use client";

import { motion } from "framer-motion";
import { ShieldX, Home } from "lucide-react";
import { CTA } from "@/components";
import { useRouter } from "next/navigation";

export const AccessDenied = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        {/* 403 Number */}
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[120px] md:text-[180px] font-bold text-[#f2b6c1] leading-none mb-4"
        >
          403
        </motion.h1>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.3,
            type: "spring",
            stiffness: 200,
          }}
          className="mb-8"
        >
          <ShieldX className="w-20 h-20 text-[#f2b6c1] mx-auto" />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-md mx-auto">
            No tienes permiso para acceder a esta página. Por favor, inicia sesión con las credenciales adecuadas.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <CTA onClick={() => router.push("/auth/login")}>
            Iniciar Sesión
          </CTA>
          <button
            onClick={() => router.push("/home")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <Home size={20} />
            Ir al Inicio
          </button>
        </motion.div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#f2b6c1] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#f2b6c1] rounded-full blur-3xl" />
      </div>
    </div>
  );
};
