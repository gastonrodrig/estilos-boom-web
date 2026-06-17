"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "placeholder"
> & {
  label: string;
  containerClassName?: string;
  error?: boolean;
  helperText?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      label,
      required,
      containerClassName = "",
      className = "",
      error = false,
      helperText,
      id,
      type = "text",
      ...inputProps
    },
    ref
  ) {
    const helperId = helperText ? `${id}-helper` : undefined;

    return (
      <div className={containerClassName}>
        <div className="relative">
          <input
            {...inputProps}
            id={id}
            ref={ref}
            type={type} // Added type here
            required={required}
            placeholder=" "
            aria-invalid={error || undefined}
            aria-describedby={helperId}
            className={`
              peer w-full rounded-full
              border ${error ? "border-red-400" : "border-neutral-300 dark:border-white/20"}
              bg-white dark:bg-[#1a0f18]
              px-4 sm:px-6 
              py-2.5 sm:py-3
              text-sm sm:text-[15px] text-neutral-700 dark:text-white
              outline-none transition-all duration-200

              ${error
                ? "focus:border-red-400 focus:ring-2 focus:ring-red-200"
                : "focus:border-[#f2b6c1] dark:focus:border-[#e8688a] focus:ring-2 focus:ring-[#f2b6c1]/30 dark:focus:ring-[#e8688a]/30"
              }

              ${className}
            `}
          />

          <label
            htmlFor={id}
            className={`
              pointer-events-none absolute left-4
              top-1/2 -translate-y-1/2
              bg-white dark:bg-[#1a0f18] px-1 whitespace-nowrap max-w-[calc(100%-2rem)] truncate
              text-sm sm:text-[15px] ${error ? "text-red-500" : "text-neutral-500 dark:text-neutral-400"}
              transition-all duration-200

              peer-focus:top-0
              peer-focus:text-xs

              peer-not-placeholder-shown:top-0
              peer-not-placeholder-shown:text-xs

              ${error ? "peer-focus:text-red-500 peer-not-placeholder-shown:text-red-500" : "peer-focus:text-neutral-600 dark:peer-focus:text-neutral-300 peer-not-placeholder-shown:text-neutral-600 dark:peer-not-placeholder-shown:text-neutral-300"}
            `}
          >
            {label}
            {required && " *"}
          </label>
        </div>

        {helperText && (
          <p id={helperId} role="alert" className="mt-2 text-xs text-red-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
