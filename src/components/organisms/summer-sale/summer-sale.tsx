import Image from "next/image";
import { motion } from "framer-motion";
import { CTA } from "@/components/atoms";

export const SummerSale = () => {
  return (
    <section className="w-full bg-gradient-to-br from-[#EBEDF6] via-[#e7faff] to-[#d7f9ff]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* IMAGEN */}
          <motion.div
            className="relative w-full"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Contenedor de imagen con espejo */}
            <div className="relative w-full">
              <div className="relative w-full px-6 mt-8 sm:px-10 sm:px-0 sm:mt-0 
                              min-h-[360px] max-h-[420px]
                              sm:min-h-[420px] sm:max-h-[480px]
                              md:min-h-[600px] md:max-h-none
                              lg:min-h-[550px]">
                <Image
                  src="/assets/sale-model-reflection.png"
                  alt="Summer Sale"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="
                    object-contain
                    object-center
                    md:object-left
                  "
                />
              </div>

            </div>
          </motion.div>

          {/* TEXTO */}
          <motion.div
            className="space-y-6 text-center pb-8 md:pb-0"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-4">
              <motion.p 
                className="text-[#a52a2a] font-bold tracking-[0.2em] text-sm uppercase"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                SUMMER SALE
              </motion.p>

              <motion.h2 
                className="text-[#a52a2a] font-black leading-[0.9] uppercase"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.12em]">
                  HASTA
                </div>
                <div className="text-7xl sm:text-8xl md:text-9xl lg:text-[9rem] my-2 tracking-tight">
                  50<span className="text-4xl sm:text-5xl md:text-6xl align-top">%</span>
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.12em]">
                  OFF
                </div>
              </motion.h2>

              <motion.p 
                className="text-gray-700 font-light md:text-lg "
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                Aprovecha los mejores descuentos de temporada en prendas
                seleccionadas.
              </motion.p>

              <motion.div
                className="pt-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CTA href="/new-in">
                    VER COLECCIÓN
                  </CTA>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
