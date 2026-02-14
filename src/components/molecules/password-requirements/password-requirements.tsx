"use client";

import { useMemo } from "react";

type PasswordRequirementsProps = {
  password: string;
};

const Item = ({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) => (
  <li className="flex items-center gap-1.5 text-[11px] text-neutral-700">
    <span
      className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white transition ${
        active ? "bg-[#f2b6c1]" : "bg-neutral-200"
      }`}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        <path
          d="M3.5 8.5L6.5 11.5L12.5 5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
    {label}
  </li>
);

export const PasswordRequirements = ({
  password,
}: PasswordRequirementsProps) => {
  const getPasswordChecks = (value: string) => {
    const hasLowercase = /[a-z]/.test(value);
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);

    return {
      hasLowercase,
      hasUppercase,
      hasNumber,
      hasSpecial,
      passedCount: [
        hasLowercase,
        hasUppercase,
        hasNumber,
        hasSpecial,
      ].filter(Boolean).length,
    };
  };

  const checks = useMemo(() => getPasswordChecks(password), [password]);

  return (
    <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <p className="text-xs font-medium text-neutral-800">
        Tu contraseña debe contener:
      </p>
      <p className="mt-0.5 text-[11px] text-neutral-500">
        Al menos 3 de los siguientes
      </p>

      <ul className="mt-2 space-y-1.5">
        <Item label="Letras minusculas (a-z)" active={checks.hasLowercase} />
        <Item label="Letras mayusculas (A-Z)" active={checks.hasUppercase} />
        <Item label="Numeros (0-9)" active={checks.hasNumber} />
        <Item
          label="Caracteres especiales (ejm.: !@#)"
          active={checks.hasSpecial}
        />
      </ul>
    </div>
  );
};
