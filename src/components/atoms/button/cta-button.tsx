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
  inline-flex items-center justify-center gap-2 rounded-sm 
  px-8 py-[14px] text-sm font-semibold tracking-widest uppercase transition-all duration-300
  bg-[#632034] text-white shadow-sm hover:bg-[#4a1827] hover:shadow-lg active:scale-[0.98]
  hover:cursor-pointer
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
