import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAuthStore } from "@hooks";
import { CTA, Modal, PasswordInput } from "@/components/atoms";
import { Lock } from "lucide-react";
import { getPasswordRequirementErrors, hasMinimumPasswordRequirements } from "@helpers";

type ChangePasswordModalProps = {
    open: boolean;
    onClose: () => void;
};

export const ChangePasswordModal = ({ open, onClose }: ChangePasswordModalProps) => {
    const { startChangePasswordFirstLogin, onLogout } = useAuthStore();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        control,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const passwordValue = useWatch({
        control,
        name: "password",
        defaultValue: "",
    });

    const confirmPasswordValue = useWatch({
        control,
        name: "confirmPassword",
        defaultValue: "",
    });

    const passwordRequirementErrors = useMemo(
        () => getPasswordRequirementErrors(passwordValue),
        [passwordValue],
    );

    const onSubmit = async (data: any) => {
        const success = await startChangePasswordFirstLogin({
            password: data.password,
            confirmPassword: data.confirmPassword,
        });

        if (success) {
            setTimeout(() => {
                onLogout();
            }, 1500);
        }
    };

    return (
        <Modal
            open={open}
            onClose={() => { }} // No permitir cerrar sin cambiar clave
            title="Cambia tu contraseña"
            description="Como es tu primera vez en estilos-boom con una contraseña temporal, para proteger tu cuenta te pedimos que la cambies por una nueva."
        >
            <div className="flex justify-center mb-6">
                <div className="p-4 bg-pink-50 rounded-full">
                    <Lock className="w-8 h-8 text-pink-500" />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <PasswordInput
                    label="Nueva Contraseña"
                    id="password"
                    {...register("password", {
                        required: "La contraseña es obligatoria",
                        validate: (value) => hasMinimumPasswordRequirements(value) || "No cumple los requisitos"
                    })}
                    error={!!errors.password}
                    helperText={
                        errors.password?.type === "required" ? (
                            "La contraseña es obligatoria"
                        ) : (errors.password && passwordValue.length > 0) ? (
                            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-red-700">
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider">Te falta:</p>
                                <div className="flex flex-wrap gap-1.5 text-[10px]">
                                    {passwordRequirementErrors.map((requirement) => (
                                        <span
                                            key={requirement}
                                            className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-2 py-1 leading-none font-medium"
                                        >
                                            <span className="text-red-500 font-bold">✕</span>
                                            {requirement}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : undefined
                    }
                />

                <PasswordInput
                    label="Confirmar Contraseña"
                    id="confirmPassword"
                    {...register("confirmPassword", {
                        required: "Confirma tu contraseña",
                        validate: (value) =>
                            value === passwordValue || "Las contraseñas no coinciden"
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message?.toString()}
                />

                <div className="pt-4">
                    <CTA
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting || passwordRequirementErrors.length > 0 || passwordValue !== confirmPasswordValue}
                    >
                        {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
                    </CTA>
                </div>
            </form>
        </Modal>
    );
};
