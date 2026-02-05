import { Carousel, ProductCard } from "@/components/molecules";
import { products } from "@data";
import { motion } from "framer-motion";

export const NewArrivals = () => {
  return (
    <section className="overflow-hidden bg-[#f5f5f5] py-16 px-4">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.p
            className="text-sm tracking-[0.3em] uppercase text-gray-600 mb-2"
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: {
                  delay: 0.2,
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                },
              },
            }}
          >
            NEW IN
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-serif text-[#8b5a5a]"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  delay: 0.4,
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                },
              },
            }}
          >
            SUMMER DRESS
          </motion.h2>
          <motion.div
            className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500"
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 96, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.6,
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        </motion.div>

        <Carousel
          items={products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        />
      </div>
    </section>
  );
};
