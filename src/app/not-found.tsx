"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { motion } from "framer-motion";
import { CTA } from "@/components";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@store";

export default function NotFound() {
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
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center relative overflow-hidden">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          {/* 404 Number */}
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[100px] md:text-[150px] font-bold bg-gradient-to-r from-[#F2778D] to-[#F391A3] bg-clip-text text-transparent leading-none mb-4"
          >
            404
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-2xl font-bold text-[#594346] mb-4"
          >
            ¡Oops! Página no encontrada
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#594346]/80 max-w-md mx-auto mb-8 text-md"
          >
            Parece que te perdiste en nuestro catálogo. La página que buscas no existe o fue movida.
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

          {/* Links dinámicos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <p className="text-[#594346]/70 text-sm mb-3">¿Buscas algo específico?</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/catalog"
                className="text-[#F2778D] hover:text-[#F391A3] text-sm font-medium underline"
              >
                Productos
              </Link>

              <Link
                href={accountHref}
                className="text-[#F2778D] hover:text-[#F391A3] text-sm font-medium underline"
              >
                Mi cuenta
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
