import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"

type GoogleButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

const baseGoogleClasses = `
  mt-3 sm:mt-4 flex w-full items-center justify-center gap-3 rounded-sm 
  border border-gray-200 bg-white px-8 py-[14px]
  text-sm sm:text-[15px] font-semibold tracking-wide text-gray-700 shadow-sm
  transition-all duration-300 hover:bg-gray-50 hover:shadow-md hover:border-gray-300
  hover:cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
`

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  children,
  onClick,
  className,
  disabled
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseGoogleClasses} ${
        disabled ? "opacity-50 hover:scale-102 cursor-not-allowed" : ""
      } ${className ?? ""}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Image
        src="/assets/google-icon.png"
        alt="Google"
        width={20}
        height={20}
        priority
      />

      {children}
    </motion.button>
  )
}
