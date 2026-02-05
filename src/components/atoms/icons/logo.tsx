import Image from "next/image";
import { motion } from "framer-motion";

interface LogoProps {
  width?: number;
  height?: number;
  onClick?: () => void;
  priority?: boolean;
  isHome?: boolean;
}

export const Logo = ({
  width = 100,
  height,
  onClick,
  priority = true,
  isHome,
}: LogoProps) => {
  const finalHeight = height ?? Math.round(width * 0.4);

  return (
    <motion.div
      onClick={onClick}
      className={`${onClick ? "cursor-pointer" : ""} max-w-[120px]`}
      style={{ height: finalHeight }}
      initial={isHome ? { opacity: 0, scale: 0.8 } : undefined}
      animate={isHome ? { opacity: 1, scale: 1 } : undefined}
      transition={isHome ? { duration: 0.6 } : undefined}
    >
      <Image
        src="/assets/logo-eb.png"
        alt="Estilos Boom"
        width={width}
        height={finalHeight}
        priority={priority}
        className="w-auto h-auto"
      />
    </motion.div>
  );
};
