"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import {
  TextInput,
  PasswordInput,
  CTA,
  GoogleButton,
} from "@/components/atoms";
import { AuthSplitCard } from "@/components/organisms";
import { useAuthStore } from "@/hooks/auth";
import Link from "next/link";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { 
    status,
    startLogin, 
    onGoogleSignIn
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = (data: LoginFormValues) => {
    startLogin(data);
  };

  const handleGoogleSignIn = () => {
    onGoogleSignIn();
  }

  const isAuthenticated = useMemo(() => status === "checking", [status]);

  return (
    <AuthSplitCard title="¡Bienvenido!" subtitle="Inicia sesión en tu cuenta">
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
          containerClassName="mb-5"
        />

        <PasswordInput
          id="password"
          label="Contraseña"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register("password", {
            required: "La contraseña es obligatoria",
          })}
          containerClassName="mb-1"
        />

        <div className="text-right mb-5 sm:mb-6">
          <Link
            href="/forgot-password"
            className="text-xs sm:text-sm font-medium text-[#594246]/70 hover:text-[#632034] transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <CTA 
          type="submit" 
          className="w-full"
          disabled={isAuthenticated || isSubmitting}
        >
          Ingresar
        </CTA>

        <GoogleButton 
          className="w-full"
          onClick={handleGoogleSignIn} 
          disabled={isAuthenticated || isSubmitting}
        >
          Continuar con Google
        </GoogleButton>

        <p className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-[#594246]/80 font-medium tracking-wide">
          ¿Aún no tienes una cuenta?{" "}
          <Link
            href="/auth/register"
            className="font-bold text-[#632034] hover:text-[#D9A2A8] transition-colors"
          >
            Crear Cuenta
          </Link>
        </p>
      </form>
    </AuthSplitCard>
  );
}
