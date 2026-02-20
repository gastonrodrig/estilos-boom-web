"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  TextInput,
  PasswordInput,
  CTA,
  GoogleButton,
} from "@/components/atoms";
import { AuthSplitCard } from "@/components/organisms";
import { useAuthStore } from "@/hooks/auth";
import {
  getPasswordRequirementErrors,
  hasMinimumPasswordRequirements,
} from "@helpers";
import Link from "next/link";

type RegisterFormValues = {
  email: string;
  password: string;
};

export default function RegisterPage() {
  const { 
    status,
    startRegisterUser, 
    onGoogleSignIn
  } = useAuthStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const passwordRequirementErrors = useMemo(
    () => getPasswordRequirementErrors(passwordValue),
    [passwordValue],
  );

  const onSubmit = (data: RegisterFormValues) => {
    startRegisterUser(data);
  };

  const handleGoogleSignIn = () => {
    onGoogleSignIn();
  }

  const isAuthenticated = useMemo(() => status === "checking", [status]);

  return (
    <AuthSplitCard title="Crea tu cuenta" subtitle="Crea tus credenciales para gestionar tu cuenta">
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          id="email"
          label="Correo electrónico"
          type="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register("email", {
            required: "El correo es obligatorio",
          })}
          containerClassName="mb-8"
        />

        <PasswordInput
          id="password"
          label="Contraseña"
          error={Boolean(errors.password)}
          helperText={
            errors.password?.type === "required" ? (
              "La contraseña es obligatoria"
            ) : errors.password ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-red-700">
                <p className="mb-2 text-xs font-medium">Te falta:</p>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {passwordRequirementErrors.map((requirement) => (
                    <span
                      key={requirement}
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-2 py-1 leading-none"
                    >
                      <span className="text-red-500">✕</span>
                      {requirement}
                    </span>
                  ))}
                </div>
              </div>
            ) : undefined
          }
          {...register("password", {
            required: "La contraseña es obligatoria",
            validate: (value) => {
              return (
                hasMinimumPasswordRequirements(value)
              );
            },
          })}
          containerClassName="mb-8"
        />

        <CTA 
          type="submit" 
          className="w-full" 
          disabled={isAuthenticated || isSubmitting}
        >
          Registrarse
        </CTA>

        <p className="mt-6 mb-3 text-center text-xs sm:text-sm text-neutral-500">
          O crea una cuenta con
        </p>

        <GoogleButton 
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isAuthenticated || isSubmitting}
        >
          Continuar con Google
        </GoogleButton>

        <p className="mt-6 text-center text-xs sm:text-sm text-neutral-500">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-neutral-700 hover:text-[#f2b6c1] transition"
          >
            Inicia Sesión
          </Link>
        </p>
      </form>
    </AuthSplitCard>
  );
}
