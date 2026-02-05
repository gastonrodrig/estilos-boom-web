import { motion } from "framer-motion";
import { benefits } from "@data";
import { BenefitCard } from "@/components/molecules";
import { Carousel } from "@/components/molecules";

export const Benefits = () => {
  return (
    <section className="pb-28 pt-12 px-4 bg-gradient-to-b from-white to-pink-50/30">
      {/* Desktop - Grid */}
      <motion.div
        className="max-w-7xl mx-auto hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 },
          },
        }}
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            <BenefitCard benefit={benefit} />
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile - Carousel */}
      <motion.div
        className="md:hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        }}
      >
        <Carousel
          items={benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} />
          ))}
          visibleCount={1}
        />
      </motion.div>
    </section>
  );
}
