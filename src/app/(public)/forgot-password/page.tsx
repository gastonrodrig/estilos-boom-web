"use client";

import { useForm } from "react-hook-form";
import { TextInput, CTA } from "@/components/atoms";
import { AuthSplitCard } from "@/components/organisms";
import { useAuthStore } from "@/hooks/auth";
import Link from "next/link";
import { useState } from "react";

type ForgotPasswordFormValues = {
    email: string;
};

export default function ForgotPasswordPage() {
    const { startPasswordReset } = useAuthStore();
    const [sent, setSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormValues>();

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        const ok = await startPasswordReset({ email: data.email });
        if (ok) setSent(true);
    };

    return (
        <AuthSplitCard
            title="¿Olvidaste tu contraseña?"
            subtitle="Te enviaremos un enlace para que puedas recuperarla."
        >
            {sent ? (
                <div className="text-center space-y-4">
                    <p className="text-sm text-neutral-600">
                        Revisa tu correo. Si está registrado, recibirás un enlace en breve.
                    </p>
                    <Link
                        href="/auth/login"
                        className="block text-sm font-medium text-[#d6687d] hover:text-[#c2556b] transition"
                    >
                        Volver al inicio de sesión
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <TextInput
                        id="email"
                        label="Correo electrónico"
                        type="email"
                        error={Boolean(errors.email)}
                        helperText={errors.email?.message}
                        {...register("email", {
                            required: "El correo es obligatorio",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Correo inválido",
                            },
                        })}
                        containerClassName="mb-8"
                    />

                    <CTA type="submit" className="w-full" disabled={isSubmitting}>
                        Enviar enlace
                    </CTA>

                    <p className="mt-5 text-center text-xs sm:text-sm text-neutral-500">
                        <Link
                            href="/auth/login"
                            className="font-medium text-neutral-700 hover:text-[#f2b6c1] transition"
                        >
                            Volver al inicio de sesión
                        </Link>
                    </p>
                </form>
            )}
        </AuthSplitCard>
    );
}
