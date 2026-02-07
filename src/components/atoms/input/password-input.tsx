import { useState } from "react"
import type { InputHTMLAttributes } from "react"

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "placeholder"> & {
  label: string
  containerClassName?: string
  error?: boolean
  helperText?: string
}

export const PasswordInput = ({
  label,
  required,
  containerClassName = "",
  className = "",
  error = false,
  helperText,
  id,
  ...inputProps
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const helperId = helperText ? `${id}-helper` : undefined

  return (
    <div className={containerClassName}>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          required={required}
          placeholder=" "
          aria-invalid={error || undefined}
          aria-describedby={helperId}
          className={`
            peer w-full rounded-full
            border ${error ? "border-red-400" : "border-neutral-300"}
            bg-white px-6 pr-12 py-3
            text-[15px] text-neutral-700
            outline-none transition-all duration-200

            ${
              error
                ? "focus:border-red-400 focus:ring-2 focus:ring-red-200"
                : "focus:border-[#f2b6c1] focus:ring-2 focus:ring-[#f2b6c1]/30"
            }

            ${className}
          `}
          {...inputProps}
        />

        <label
          htmlFor={id}
          className={`
            pointer-events-none absolute left-6
            top-1/2 -translate-y-1/2
            bg-white px-2
            text-[15px] ${error ? "text-red-500" : "text-neutral-500"}
            transition-all duration-200

            peer-focus:top-0
            peer-focus:text-xs
            ${error ? "peer-focus:text-red-500" : "peer-focus:text-neutral-600"}

            peer-not-placeholder-shown:top-0
            peer-not-placeholder-shown:text-xs
            ${error ? "peer-not-placeholder-shown:text-red-500" : "peer-not-placeholder-shown:text-neutral-600"}
          `}
        >
          {label}
          {required && " *"}
        </label>

        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.94 9.94 0 0112 5c5 0 9.27 3.11 11 7-0.64 1.43-1.56 2.71-2.7 3.76M6.23 6.23C4.5 7.39 3.14 9.04 2 12c1.73 3.89 6 7 10 7 1.05 0 2.07-.15 3.04-.43"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          )}
        </button>
      </div>

      <div className="mt-2">
        {helperText ? (
          <p
            id={helperId}
            role="alert"
            className={`text-xs ${error ? "text-red-500" : "text-neutral-500"}`}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    </div>
  )
}
