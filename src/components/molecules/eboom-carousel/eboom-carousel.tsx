"use client";

import { useState, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CarouselProps {
  items: ReactNode[];
  visibleCount?: number;
}

export const Carousel: React.FC<CarouselProps> = ({
  items,
  visibleCount = 3,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? items.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) =>
      prev === items.length - 1 ? 0 : prev + 1
    );
  };

  const visibleItems = Array.from({ length: visibleCount }).map(
    (_, i) => items[(currentIndex + i) % items.length]
  );

  return (
    <div className="relative group">
      {/* Nav - Sides for Desktop, Top for Mobile */}
      {/* Left Button */}
      <motion.button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:block rounded-full bg-[#f2b6c1] p-3 text-white shadow-lg hover:cursor-pointer"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        whileHover={{ scale: 1.15, boxShadow: "0 10px 20px rgba(242, 182, 193, 0.4)" }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 200, damping: 35 }}
      >
        <ChevronLeft size={24} />
      </motion.button>

      {/* Right Button */}
      <motion.button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:block rounded-full bg-[#f2b6c1] p-3 text-white shadow-lg hover:cursor-pointer"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        whileHover={{ scale: 1.15, boxShadow: "0 10px 20px rgba(242, 182, 193, 0.4)" }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 200, damping: 35 }}
      >
        <ChevronRight size={24} />
      </motion.button>

      {/* Mobile Buttons - Top */}
      <div className="flex md:hidden justify-center gap-3 mb-5 -mt-6">
        <motion.button
          onClick={handlePrev}
          className="rounded-full bg-[#f2b6c1] p-2.5 text-white shadow-lg hover:cursor-pointer"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 35 }}
        >
          <ChevronLeft size={20} />
        </motion.button>

        <motion.button
          onClick={handleNext}
          className="rounded-full bg-[#f2b6c1] p-2.5 text-white shadow-lg hover:cursor-pointer"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 35 }}
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      {/* Desktop */}
      <div className="hidden grid-cols-3 gap-8 px-16 md:grid">
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: direction * 20, scale: 0.98 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              exit={{ opacity: 0, x: -direction * 20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 150, damping: 40, mass: 1.2 }}
            >
              {item}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-8">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: direction * 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -direction * 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 150, damping: 40, mass: 1.2 }}
          >
            {items[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators - Only on Mobile */}
      <div className="md:hidden flex flex-col items-center gap-4 mt-8">
        {/* Progress Bar */}
        <div className="w-full max-w-xs h-1 bg-[#f2b6c1]/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#f2b6c1] to-[#e8a5b6] rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {items.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className="group relative"
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className={`rounded-full ${
                  index === currentIndex
                    ? "bg-[#f2b6c1]"
                    : "bg-[#f2b6c1]/40"
                }`}
                animate={{
                  width: index === currentIndex ? 16 : 10,
                  height: index === currentIndex ? 16 : 10,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#f2b6c1]"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1.3 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Counter */}
        <motion.div
          className="text-sm font-light text-[#6b4a4a]"
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentIndex + 1} / {items.length}
        </motion.div>
      </div>
    </div>
  );
};
