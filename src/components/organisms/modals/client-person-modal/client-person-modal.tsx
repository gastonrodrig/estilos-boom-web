"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useClientPersonStore } from "@hooks";
import { CTA, Modal, SelectInput, TextInput, Tooltip } from "@/components/atoms";
import { DocumentType, ClientType } from "@enums";
import { ClientPerson } from "@models";
import { AlertCircle } from "lucide-react";

type ClientPersonModalProps = {
    open: boolean;
    onClose: () => void;
};

export const ClientPersonModal = ({ open, onClose }: ClientPersonModalProps) => {
    const {
        selected,
        loading,
        startCreateClientPerson,
        startUpdateClientPerson,
        setSelectedClientPerson,
    } = useClientPersonStore();

    const isEdit = !!selected;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ClientPerson>();

    useEffect(() => {
        if (open) {
            if (selected) {
                reset(selected);
            } else {
                reset({
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    client_type: ClientType.PERSON,
                    document_type: DocumentType.DNI,
                    document_number: "",
                });
            }
        }
    }, [open, selected, reset]);

    const handleClose = () => {
        setSelectedClientPerson(null);
        onClose();
    };

    const onSubmit = async (data: ClientPerson) => {
        try {
            if (isEdit && selected?.id_user) {
                const success = await startUpdateClientPerson(selected.id_user, data);
                if (success) handleClose();
            } else {
                const success = await startCreateClientPerson(data);
                if (success) handleClose();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const isButtonDisabled = useMemo(() => loading, [loading]);

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? "Editar Cliente" : "Nuevo Cliente"}
            description={
                isEdit
                    ? `Editando perfil de ${selected.first_name} ${selected.last_name}`
                    : "Completa los datos para registrar un nuevo cliente persona natural."
            }
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="my-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TextInput
                            id="first_name"
                            label="Nombre"
                            {...register("first_name", { required: "El nombre es obligatorio" })}
                            error={!!errors.first_name}
                            helperText={errors.first_name?.message}
                        />
                        <TextInput
                            id="last_name"
                            label="Apellido"
                            {...register("last_name", { required: "El apellido es obligatorio" })}
                            error={!!errors.last_name}
                            helperText={errors.last_name?.message}
                        />
                    </div>

                    <div className="relative group">
                        <TextInput
                            id="email"
                            label="Correo Electrónico"
                            {...register("email", {
                                required: "El correo es obligatorio",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Correo inválido"
                                }
                            })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />
                        {isEdit && (
                            <div className="absolute top-1/2 -translate-y-1/2 right-4">
                                <Tooltip
                                    text="Si cambias el correo, el usuario deberá usar la nueva dirección para iniciar sesión en el sistema."
                                >
                                    <AlertCircle className="h-4 w-4 text-amber-500 cursor-help" />
                                </Tooltip>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectInput
                            id="document_type"
                            label="Tipo documento"
                            options={[
                                { label: "DNI", value: DocumentType.DNI },
                                { label: "RUC", value: DocumentType.RUC },
                            ]}
                            {...register("document_type", { required: "Selecciona tipo" })}
                            error={!!errors.document_type}
                            helperText={errors.document_type?.message}
                        />
                        <TextInput
                            id="document_number"
                            label="Nro documento"
                            {...register("document_number", { required: "El número es obligatorio" })}
                            error={!!errors.document_number}
                            helperText={errors.document_number?.message}
                        />
                    </div>

                    <TextInput
                        id="phone"
                        label="Teléfono"
                        {...register("phone", {
                            required: "El teléfono es obligatorio",
                            pattern: {
                                value: /^\d{9}$/,
                                message: "Debe tener 9 dígitos"
                            }
                        })}
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                    />
                </div>

                <CTA
                    type="submit"
                    className="w-full"
                    disabled={isButtonDisabled || isSubmitting}
                >
                    {isEdit ? "Guardar Cambios" : "Crear Cliente"}
                </CTA>
            </form>
        </Modal>
    );
};
