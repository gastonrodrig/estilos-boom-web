import { motion } from "framer-motion";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onClose?: () => void;
  isDark?: boolean;
}

export const SearchInput = ({
  value,
  onChange,
  onClose,
  isDark = false,
}: SearchInputProps) => {
  return (
    <motion.input
      autoFocus
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Buscar productos..."
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 220, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
       transition={{
        type: "spring",
        stiffness: 500,
        damping: 35,
      }}
      onBlur={() => {
        setTimeout(() => {
          onClose?.();
        }, 200);
      }}
      className={`
        h-9
        rounded-full
        ${
          isDark
            ? "bg-white text-black border-gray-200"
            : "bg-transparent text-white border-white/40"
        }
        border
        px-4
        text-sm
        outline-none
        shadow-md
        placeholder:text-current
        placeholder:opacity-50
      `}
    />
  );
};
