import { Logo } from "@/components/atoms"
import Image from "next/image"

type AuthSplitCardProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export const AuthSplitCard = ({
  title,
  subtitle,
  children,
}: AuthSplitCardProps) => {
  return (
    <div className="min-h-[calc(100vh-96px)] pt-24 bg-[#f5f5f5]">
      <div className="grid min-h-[calc(100vh-96px)] grid-cols-1 md:grid-cols-2 bg-white">

        {/* Columna Izquierda */}
        <div className="relative hidden md:block">
          <Image
            src="/assets/auth-split-card-img.png"
            alt="Auth visual"
            fill
            priority
            className="object-cover object-top"
          />
        </div>

        {/* Columna Derecha */}
        <div className="flex flex-col items-center justify-center px-6 text-center md:px-16">
          <div className="flex items-center justify-center gap-3">
            <Image src="/assets/auth-icon.png" alt="Logo" width={50} height={35} />
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>

          {subtitle && (
            <p className="mt-2 text-base font-light text-neutral-500">
              {subtitle}
            </p>
          )}

          <div className="mt-12 w-full max-w-md mx-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  )
}
