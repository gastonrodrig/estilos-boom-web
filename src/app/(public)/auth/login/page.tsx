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
          containerClassName="mb-8"
        />

        <PasswordInput
          id="password"
          label="Contraseña"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register("password", {
            required: "La contraseña es obligatoria",
          })}
          containerClassName="mb-2"
        />

        <div className="text-right mb-8">
          <a
            href="/forgot-password"
            className="text-sm text-neutral-500 hover:text-[#f2b6c1] transition"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <CTA 
          type="submit" 
          className="w-full" 
          disabled={isAuthenticated || isSubmitting}
        >
          Ingresar
        </CTA>

        <GoogleButton 
          className="w-full mt-4" 
          onClick={handleGoogleSignIn} 
          disabled={isAuthenticated || isSubmitting}
        >
          Continuar con Google
        </GoogleButton>

        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Aún no tienes una cuenta?{" "}
          <a
            href="/auth/register"
            className="font-medium text-neutral-700 hover:text-[#f2b6c1] transition"
          >
            Crear Cuenta
          </a>
        </p>
      </form>
    </AuthSplitCard>
  );
}
