import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

type CTAProps =
  | {
      children: React.ReactNode
      href: string
      icon?: LucideIcon
      className?: string
    }
  | {
      children: React.ReactNode
      type?: "button" | "submit" | "reset"
      onClick?: () => void
      icon?: LucideIcon
      className?: string
      disabled?: boolean
    }

const baseClasses =`
  inline-flex items-center justify-center gap-2 rounded-full 
  px-8 py-[14px] text-sm font-medium tracking-wide transition bg-[#f2b6c1] 
  text-black hover:opacity-90 active:scale-95 hover:cursor-pointer
  py-2.5 sm:py-3 text-sm sm:text-base
`

const MotionLink = motion.create(Link)

export const CTA: React.FC<CTAProps> = (props) => {
  const Icon = props.icon

  if ("href" in props) {
    return (
      <MotionLink
        href={props.href}
        className={`${baseClasses} hover:scale-105 ${props.className ?? ""}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {Icon && <Icon className="h-5 w-5" />}
        {props.children}
      </MotionLink>
    )
  }

  return (
    <motion.button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={`${baseClasses} hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed ${props.className ?? ""}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {props.children}
    </motion.button>
  )
}
