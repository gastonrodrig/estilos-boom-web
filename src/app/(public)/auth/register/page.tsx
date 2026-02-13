"use client";

import { useForm } from "react-hook-form";

import {
  TextInput,
  PasswordInput,
  CTA,
  GoogleButton,
} from "@/components/atoms";
import { AuthSplitCard } from "@/components/organisms";

type RegisterFormValues = {
  email: string
  password: string
}

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>();

  const onSubmit = (data: RegisterFormValues) => {
    console.log(data);
  };

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
          })}
          containerClassName="mb-8"
        />

        <CTA type="submit" className="w-full">
          Registrarse
        </CTA>

        <p className="mt-6 mb-3 text-center text-sm text-neutral-500">
          O crea una cuenta con
        </p>

        <GoogleButton className="w-full mt-4">
          Continuar con Google
        </GoogleButton>

        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/auth/login"
            className="font-medium text-neutral-700 hover:text-[#f2b6c1] transition"
          >
            Inicia Sesión
          </a>
        </p>
      </form>
    </AuthSplitCard>
  );
}
