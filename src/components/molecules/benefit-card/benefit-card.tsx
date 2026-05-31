import { motion } from "framer-motion";

export interface Benefit {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

export const BenefitCard = ({ benefit }: { benefit: Benefit }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center text-center space-y-4 py-4 px-2 group"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.4 }}
        className="mb-2"
      >
        <benefit.icon className="w-10 h-10 text-[#632034]" strokeWidth={1} />
      </motion.div>

      <h3 className="text-[#632034] font-bold text-xs sm:text-sm uppercase tracking-[0.15em]">
        {benefit.title}
      </h3>

      <p className="text-[#594246]/70 text-xs sm:text-sm font-medium">
        {benefit.subtitle}
      </p>
    </motion.div>
  );
};
