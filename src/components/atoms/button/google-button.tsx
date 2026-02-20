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
  inline-flex items-center justify-center gap-3 rounded-full
  px-8 py-[14px] text-sm font-medium tracking-wide transition
  bg-gray-200 text-black hover:bg-gray-300 active:scale-95 
  hover:cursor-pointer mt-3 sm:mt-4 py-2.5 sm:py-3 text-sm 
  sm:text-base
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
