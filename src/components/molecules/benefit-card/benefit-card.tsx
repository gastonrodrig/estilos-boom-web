import { motion } from "framer-motion";

export interface Benefit {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

export const BenefitCard = ({ benefit }: { benefit: Benefit }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative bg-gradient-to-br from-[#f2b6c1] to-[#e8a0ad] rounded-3xl p-8 flex flex-col items-center text-center space-y-4 shadow-lg hover:shadow-2xl border border-white/20 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />

      <motion.div
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <benefit.icon className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={1.5} />
      </motion.div>

      <h3 className="relative z-10 text-white font-bold text-sm uppercase tracking-wide">
        {benefit.title}
      </h3>

      <p className="relative z-10 text-white/95 text-sm font-light">
        {benefit.subtitle}
      </p>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </motion.div>
  );
};
