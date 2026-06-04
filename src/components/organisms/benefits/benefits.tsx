import { motion } from "framer-motion";
import { benefits } from "@data";
import { BenefitCard } from "@/components/molecules";
import { Carousel } from "@/components/molecules";

export const Benefits = () => {
  return (
    <section className="w-full py-10 px-4 dark:bg-[#231a1e] transition-colors duration-500 ease-in-out">
      {/* Desktop - Flex Row */}
      <motion.div
        className="max-w-7xl mx-auto hidden md:flex flex-row items-center justify-between w-full"
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
          <div key={index} className="flex flex-row items-center flex-1">
            <motion.div
              className="flex-1 flex justify-center"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
            >
              <BenefitCard benefit={benefit} />
            </motion.div>
            {/* Minimalist Divider */}
            {index < benefits.length - 1 && (
              <div className="hidden lg:block h-[40px] w-[1px] bg-[rgba(180,60,100,0.15)] dark:bg-[rgba(255,255,255,0.1)] shrink-0" />
            )}
          </div>
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
