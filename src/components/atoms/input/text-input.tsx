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

export const TextInput = ({
  label,
  required,
  containerClassName = "",
  className = "",
  error = false,
  helperText,
  id,
  ...inputProps
}: TextInputProps) => {
  const helperId = helperText ? `${id}-helper` : undefined;

  return (
    <div className={containerClassName}>
      <div className="relative">
        <input
          id={id}
          required={required}
          placeholder=" "
          aria-invalid={error || undefined}
          aria-describedby={helperId}
          className={`
            peer w-full rounded-full
            border ${error ? "border-red-400" : "border-neutral-300"}
           bg-white 
            px-4 sm:px-6 
            py-2.5 sm:py-3
            text-sm sm:text-[15px] text-neutral-700
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
            pointer-events-none absolute left-4 sm:left-6
            top-1/2 -translate-y-1/2
           bg-white px-2
            text-sm sm:text-[15px] ${error ? "text-red-500" : "text-neutral-500"}
            transition-all duration-200

            peer-focus:top-0
            peer-focus:text-xs

            peer-not-placeholder-shown:top-0
            peer-not-placeholder-shown:text-xs

         ${error ? "peer-focus:text-red-500 peer-not-placeholder-shown:text-red-500" : "peer-focus:text-neutral-600 peer-not-placeholder-shown:text-neutral-600"}
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
};
