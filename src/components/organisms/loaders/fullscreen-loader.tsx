"use client";

import { motion } from "framer-motion";

export const FullScreenLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#faf8f7] to-[#f5f1f0]">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
      >
        {/* Spinner */}
        <motion.div
          className="relative w-20 h-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#f2b6c1] border-r-[#f2b6c1]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-3 border-transparent border-b-[#f2b6c1]"
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-2 h-2 rounded-full bg-[#f2b6c1]" />
          </motion.div>
        </motion.div>

        {/* Texto y dots */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
          <p className="text-[#333333] text-base font-medium">Cargando</p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#f2b6c1]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  delay: i * 0.15,
                  duration: 0.6,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
