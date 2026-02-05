import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

type CTAProps =
  | {
      children: React.ReactNode;
      href: string;
      icon?: LucideIcon;
    }
  | {
      children: React.ReactNode;
      type?: "button" | "submit" | "reset";
      onClick?: () => void;
      icon?: LucideIcon;
    };

export const CTA: React.FC<CTAProps> = (props) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-medium tracking-wide transition hover:opacity-90 bg-[#f2b6c1] text-black hover:scale-105 active:scale-95";

  const Icon = props.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
    >
      {("href" in props) ? (
      // Navegación
      <Link href={props.href} className={baseClasses}>
        {Icon && <Icon className="w-5 h-5" />}
        {props.children}
      </Link>
    ) : (
      // Acción / formulario
      <button
        type={props.type ?? "button"}
        onClick={props.onClick}
        className={baseClasses}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {props.children}
      </button>
    )}
    </motion.div>)
}
