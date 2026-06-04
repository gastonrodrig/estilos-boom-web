import Image from "next/image";
import { motion } from "framer-motion";
import { CTA } from "@/components/atoms";

export const SummerSale = () => {
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden bg-gradient-to-br from-[#f5eaed] via-background to-[#f0e8eb] dark:bg-transparent dark:from-transparent dark:via-transparent dark:to-transparent transition-colors duration-500 ease-in-out">
      {/* Decorative dreamy glow for dark mode glassmorphism */}
      <div className="absolute inset-0 hidden dark:block pointer-events-none -z-10">
        <div className="absolute top-1/4 right-0 w-[45rem] h-[45rem] bg-[#f2b6c1]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/3 w-[30rem] h-[30rem] bg-[#632034]/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* IMAGEN */}
          <motion.div
            className="relative w-full"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Watermark vertical decorativo */}
            <div className="absolute left-0 bottom-12 origin-bottom-left -rotate-90 text-6xl md:text-8xl font-serif tracking-[0.2em] font-bold text-[#6b1f35] opacity-[0.04] dark:text-white dark:opacity-[0.06] pointer-events-none whitespace-nowrap z-0 select-none">
              ESTILOS BOOM
            </div>

            {/* Contenedor de imagen con espejo */}
            <div className="relative w-full z-10 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
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
            className="space-y-6 text-center p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-[#f5eaed] to-[#f0e8eb] border border-[#b43c64]/15 shadow-[0_20px_60px_rgba(180,60,100,0.1)] dark:bg-gradient-to-br dark:from-[#2a1520] dark:to-[#1e1018] dark:border dark:border-[#e8829a]/25 dark:shadow-[0_0_60px_rgba(180,60,100,0.12),inset_0_0_40px_rgba(180,60,100,0.05)] transition-colors duration-500 ease-in-out"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#e8829a] to-transparent" />
                <motion.p 
                  className="text-[#b43c64] dark:text-[#e8a0b0] font-bold tracking-[0.3em] text-xs sm:text-sm uppercase"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  REBAJAS DE VERANO
                </motion.p>
              </div>

              <motion.h2 
                className="text-[#6b1f35] font-serif font-medium leading-[0.9] uppercase"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.12em] dark:text-white">
                  HASTA
                </div>
                <div className="text-7xl sm:text-8xl md:text-9xl lg:text-[9rem] my-2 tracking-tight text-[#6b1f35] dark:bg-gradient-to-br dark:from-[#f2b6c1] dark:to-[#d4af37] dark:text-transparent dark:bg-clip-text py-2">
                  50<span className="text-4xl sm:text-5xl md:text-6xl align-top">%</span>
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.12em] dark:text-white">
                  OFF
                </div>
              </motion.h2>

              <motion.p 
                className="text-gray-700 dark:text-[#f2b6c1]/80 font-light md:text-lg max-w-md mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                Aprovecha los mejores descuentos de temporada en prendas
                seleccionadas.
              </motion.p>

              <motion.div
                className="pt-6"
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
