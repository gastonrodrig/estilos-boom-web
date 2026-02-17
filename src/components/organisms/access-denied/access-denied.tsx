"use client";

import Link from "next/link";
import { ShieldX, Home } from "lucide-react";
import { motion } from "framer-motion";
import { CTA } from "@/components";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@store";

export const AccessDenied = () => {
  const router = useRouter();
  const { status, role } = useAppSelector((state) => state.auth);

  const handleRedirect = () => {
    if (status === "authenticated") {
      if (role === "Cliente") {
        router.push("/client");
        return;
      }

      if (role === "Administrador") {
        router.push("/admin");
        return;
      }
    }

    router.push("/home");
  };

  const accountHref =
    status === "authenticated"
      ? role === "Administrador"
        ? "/admin"
        : "/client"
      : "/auth/login";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center relative overflow-hidden">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        {/* 403 */}
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[100px] md:text-[150px] font-bold bg-gradient-to-r from-[#F2778D] to-[#F391A3] bg-clip-text text-transparent leading-none mb-4"
        >
          403
        </motion.h1>

        {/* Icono */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 200,
          }}
          className="mb-6"
        >
          <ShieldX className="w-16 h-16 text-[#F2778D] mx-auto" />
        </motion.div>

        {/* Texto */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-3xl font-bold text-[#594346] mb-4"
        >
          Acceso denegado
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[#594346]/80 max-w-md mx-auto mb-8 text-md"
        >
          No tienes permisos para acceder a esta página. Si crees que esto es un error, inicia sesión con una cuenta autorizada.
        </motion.p>

        {/* Botón dinámico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <div onClick={handleRedirect}>
            <CTA icon={Home}>
              Volver al inicio
            </CTA>
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <p className="text-[#594346]/70 text-sm mb-3">
            ¿Qué deseas hacer?
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={accountHref}
              className="text-[#F2778D] hover:text-[#F391A3] text-sm font-medium underline"
            >
              Mi cuenta
            </Link>

            <Link
              href="/home"
              className="text-[#F2778D] hover:text-[#F391A3] text-sm font-medium underline"
            >
              Ir al inicio
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Background decor */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#F2778D] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F391A3] rounded-full blur-3xl" />
      </div>
    </div>
  );
};
