"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PasswordInput, CTA } from "@/components/atoms";
import { AuthSplitCard } from "@/components/organisms";
import { useAuthStore } from "@/hooks/auth";
import { useSearchParams, useRouter } from "next/navigation";
import {
    getPasswordRequirementErrors,
    hasMinimumPasswordRequirements,
} from "@helpers";
import Link from "next/link";
import { Suspense } from "react";

type ResetPasswordFormValues = {
    password: string;
    confirmPassword: string;
};

function ResetPasswordForm() {
    const { startChangePasswordForgot } = useAuthStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const oobCode = searchParams.get("oobCode");

    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormValues>({
        mode: "onChange", // Para que valide mientras escribe
    });

    const passwordValue = useWatch({
        control,
        name: "password",
        defaultValue: "",
    });

    const passwordRequirementErrors = useMemo(
        () => getPasswordRequirementErrors(passwordValue),
        [passwordValue],
    );

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isSuccess && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (isSuccess && countdown === 0) {
            router.replace("/auth/login");
        }
        return () => clearTimeout(timer);
    }, [isSuccess, countdown, router]);

    const onSubmit = async (data: ResetPasswordFormValues) => {
        if (!oobCode) return;
        const ok = await startChangePasswordForgot({
            password: data.password,
            confirmPassword: data.confirmPassword,
        });
        if (ok) setIsSuccess(true);
    };

    if (!oobCode) {
        return (
            <div className="text-center py-6">
                <p className="text-sm text-neutral-500 mb-6">
                    El enlace de restablecimiento ya no es válido o está vencido.
                </p>
                <Link
                    href="/auth/login"
                    className="text-sm font-medium text-neutral-700 hover:text-[#d6687d] transition"
                >
                    Ir al inicio de sesión
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-4">
                    <div className="bg-green-50 p-4 rounded-full">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                <p className="text-neutral-700 font-bold text-lg">¡Contraseña restablecida!</p>
                <p className="text-sm text-neutral-500 max-w-[280px] mx-auto">
                    Hemos guardado tu nueva clave. Serás redirigido al login en <strong>{countdown} segundos</strong>...
                </p>
                <CTA onClick={() => router.replace("/auth/login")} className="w-full mt-6">
                    Entrar ahora
                </CTA>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
            <PasswordInput
                id="password"
                label="Nueva contraseña"
                error={Boolean(errors.password)}
                helperText={
                    errors.password?.type === "required" ? (
                        "La contraseña es obligatoria"
                    ) : errors.password ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-red-700 mt-2">
                            <p className="mb-2 text-xs font-medium">Te falta:</p>
                            <div className="flex flex-wrap gap-1.5 text-[11px]">
                                {passwordRequirementErrors.map((requirement) => (
                                    <span
                                        key={requirement}
                                        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-2 py-1 leading-none transition-all duration-200"
                                    >
                                        <span className="text-red-500 font-bold">✕</span>
                                        {requirement}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : undefined
                }
                {...register("password", {
                    required: "La contraseña es obligatoria",
                    validate: (value) => hasMinimumPasswordRequirements(value),
                })}
            />

            <PasswordInput
                id="confirmPassword"
                label="Confirma tu contraseña"
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                    required: "Debes confirmar tu contraseña",
                    validate: (value) =>
                        value === watch("password") || "Las contraseñas no coinciden",
                })}
                containerClassName="mb-10"
            />

            <CTA type="submit" className="w-full" disabled={isSubmitting}>
                Guardar cambios
            </CTA>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <AuthSplitCard
            title="Restablecer contraseña"
            subtitle="Escribe tu nueva contraseña para recuperar el acceso a tu cuenta."
        >
            <Suspense fallback={null}>
                <ResetPasswordForm />
            </Suspense>
        </AuthSplitCard>
    );
}
