"use client";

import { SelectHTMLAttributes, forwardRef } from "react"
import { ChevronDown } from "lucide-react"

type Option = {
  label: string
  value: string
}

type SelectInputProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "placeholder"> & {
  label: string
  options: Option[]
  containerClassName?: string
  error?: boolean
  helperText?: string
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  function SelectInput(
    {
      label,
      options,
      required,
      containerClassName = "",
      className = "",
      error = false,
      helperText,
      id,
      ...selectProps
    },
    ref
  ) {
    const helperId = helperText ? `${id}-helper` : undefined

    return (
      <div className={containerClassName}>
        <div className="relative">
          <select
            id={id}
            ref={ref}
            required={required}
            aria-invalid={error || undefined}
            aria-describedby={helperId}
            className={`
              peer w-full rounded-full
              border ${error ? "border-red-400" : "border-neutral-300 dark:border-white/20"}
              bg-white dark:bg-[#1a0f18] px-4 py-3
              text-[15px] text-neutral-700 dark:text-white
              outline-none transition-all duration-200
              appearance-none

              ${error
                ? "focus:border-red-400 focus:ring-2 focus:ring-red-200"
                : "focus:border-[#f2b6c1] dark:focus:border-[#e8688a] focus:ring-2 focus:ring-[#f2b6c1]/30 dark:focus:ring-[#e8688a]/30"
              }

              ${className}
            `}
            {...selectProps}
          >
            <option value="" disabled hidden></option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Flechita */}
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </div>

          <label
            htmlFor={id}
            className={`
              pointer-events-none absolute left-4
              top-1/2 -translate-y-1/2
              bg-white dark:bg-[#1a0f18] px-1 whitespace-nowrap max-w-[calc(100%-2.5rem)] truncate
              text-[15px] ${error ? "text-red-500" : "text-neutral-500 dark:text-neutral-400"}
              transition-all duration-200

              peer-focus:top-0
              peer-focus:text-xs
              ${error ? "peer-focus:text-red-500" : "peer-focus:text-neutral-600 dark:peer-focus:text-neutral-300"}

              peer-valid:top-0
              peer-valid:text-xs
              ${error ? "peer-valid:text-red-500" : "peer-valid:text-neutral-600 dark:peer-valid:text-neutral-300"}
            `}
          >
            {label}
            {required && " *"}
          </label>
        </div>

        {helperText && (
          <p
            id={helperId}
            role="alert"
            className="mt-2 text-xs text-red-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

SelectInput.displayName = "SelectInput"
