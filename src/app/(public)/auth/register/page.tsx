"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  TextInput,
  PasswordInput,
  CTA,
  GoogleButton,
} from "@/components/atoms";
import { PasswordRequirements } from "@/components/molecules";
import { AuthSplitCard } from "@/components/organisms";
import { useAuthStore } from "@/hooks/auth";
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
          helperText={errors.password?.message}
          {...register("password", {
            required: "La contraseña es obligatoria",
            validate: (value) => {
              const hasLowercase = /[a-z]/.test(value);
              const hasUppercase = /[A-Z]/.test(value);
              const hasNumber = /\d/.test(value);
              const hasSpecial = /[^A-Za-z0-9]/.test(value);

              const count = [
                hasLowercase,
                hasUppercase,
                hasNumber,
                hasSpecial,
              ].filter(Boolean).length;

              return (
                count >= 3 || "Debe contener al menos 3 de los 4 requisitos"
              );
            },
          })}
          containerClassName="mb-6"
        />

        <PasswordRequirements password={passwordValue} />

        <CTA 
          type="submit" 
          className="w-full" 
          disabled={isAuthenticated || isSubmitting}
        >
          Registrarse
        </CTA>

        <p className="mt-6 mb-3 text-center text-sm text-neutral-500">
          O crea una cuenta con
        </p>

        <GoogleButton 
          className="w-full mt-4"
          onClick={handleGoogleSignIn}
          disabled={isAuthenticated || isSubmitting}
        >
          Continuar con Google
        </GoogleButton>

        <p className="mt-6 text-center text-sm text-neutral-500">
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
