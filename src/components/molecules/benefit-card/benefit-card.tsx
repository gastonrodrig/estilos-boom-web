import { motion } from "framer-motion";

export interface Benefit {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

export const BenefitCard = ({ benefit }: { benefit: Benefit }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center space-y-3 py-2 group w-full transition-colors duration-500 ease-in-out"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.4 }}
        className="mb-1"
      >
        <benefit.icon className="w-7 h-7 text-[#f2b6c1] dark:text-[#e8829a] transition-colors duration-500" strokeWidth={1.5} />
      </motion.div>

      <h3 className="text-[#632034] dark:text-white font-bold text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.1em] whitespace-nowrap transition-colors duration-500">
        {benefit.title}
      </h3>

      <p className="text-[#594246]/70 dark:text-gray-400 text-xs sm:text-[0.75rem] font-medium">
        {benefit.subtitle}
      </p>
    </motion.div>
  );
};
