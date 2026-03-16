"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useUsersStore } from "@hooks";
import { CTA, Modal, SelectInput, TextInput } from "@/components/atoms";
import { ClientType } from "@enums";
import { ExtraInformationValues } from "@models";

type ExtraInformationModalProps = {
  open: boolean;
  onClose: () => void;
};

export const ExtraInformationModal = ({ open, onClose }: ExtraInformationModalProps) => {
  const {
    uid,
    loadingClientProfile,
    startUpdateExtraData
  } = useUsersStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    reset,
  } = useForm<ExtraInformationValues>();

  const clientType = useWatch({
    control,
    name: "clientType",
  });

  const documentType = useWatch({
    control,
    name: "documentType",
  });

  const documentTypeOptions =
    clientType === "Empresa"
      ? [{ label: "RUC", value: "RUC" }]
      : [
          { label: "DNI", value: "DNI" },
          { label: "RUC", value: "RUC" },
        ];

  useEffect(() => {
    if (open) {
      reset({
        firstName: "",
        lastName: "",
        companyName: "",
        contactName: "",
        phone: "",
        documentType: "",
        documentNumber: "",
        clientType: ClientType.PERSON,
      });
    }
  }, [open, reset]);

  useEffect(() => {
    if (clientType === "Empresa") {
      setValue("documentType", "RUC", { shouldValidate: false, shouldDirty: true });
      setValue("documentNumber", "", { shouldValidate: false, shouldDirty: true });
    }
  }, [clientType, setValue]);

  const onSubmit = async (data: ExtraInformationValues) => {
    try {
      if (!uid) return;
      const success = await startUpdateExtraData(uid, data);
      if (success) onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const isButtonDisabled = useMemo(() => loadingClientProfile, [loadingClientProfile]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Complete la información adicional"
      description="Por favor, proporciona la siguiente información adicional para completar tu perfil."
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-7 space-y-4">
          {/* Tipo de cliente */}
          <SelectInput
            label="Tipo de cliente"
            id="clientType"
            required
            options={[
              { label: "Persona Natural", value: "Persona" },
              { label: "Empresa", value: "Empresa" },
            ]}
            error={!!errors.clientType}
            helperText={errors.clientType?.message}
            {...register("clientType", {
              required: "Selecciona tipo de cliente",
              onChange: (e) => {
                const v = e.target.value;
                setValue("clientType", v);
                if (v === "Empresa") {
                  setValue("documentType", "RUC");
                  setValue("firstName", "");
                  setValue("lastName", "");
                } else if (v === "Persona") {
                  setValue("documentType", "DNI");
                  setValue("companyName", "");
                  setValue("contactName", "");
                } else {
                  setValue("documentType", "");
                }
                setValue("documentNumber", "");
              },
            })}
          />

          {/* Campos dinámicos Persona vs Empresa */}
          {clientType === "Empresa" ? (
            <>
              <TextInput
                label="Nombre de la Empresa"
                id="companyName"
                {...register("companyName", {
                  required: "El nombre de la empresa es obligatorio",
                })}
                error={Boolean(errors.companyName)}
                helperText={errors.companyName?.message}
              />
              <TextInput
                label="Persona de Contacto"
                id="contactName"
                {...register("contactName", {
                  required: "La persona de contacto es obligatoria",
                })}
                error={!!errors.contactName}
                helperText={errors.contactName?.message}
              />
            </>
          ) : clientType === "Persona" ? (
            <>
              <TextInput
                label="Nombre"
                id="firstName"
                {...register("firstName", {
                  required: "El nombre es obligatorio",
                })}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
              <TextInput
                label="Apellido"
                id="lastName"
                {...register("lastName", {
                  required: "El apellido es obligatorio",
                })}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </>
          ) : null}

          {/* Teléfono */}
          <TextInput
            label="Teléfono"
            id="phone"
            {...register("phone", {
              required: "El número es obligatorio",
              pattern: {
                value: /^[0-9]{9}$/,
                message: "El número debe tener 9 dígitos",
              },
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />

          {/* Tipo de documento */}
          {clientType !== "Empresa" && (
            <SelectInput
              label="Tipo de documento"
              id="documentType"
              required
              options={documentTypeOptions}
              error={!!errors.documentType}
              helperText={errors.documentType?.message}
              value={documentType || ""}
              {...register("documentType", {
                required: "Selecciona un tipo de documento",
                onChange: (e) => {
                  setValue("documentType", e.target.value);
                  setValue("documentNumber", "");
                },
              })}
            />
          )}

          {/* Número de documento */}
          <TextInput
            label={clientType === "Empresa" ? "Número de RUC" : "Número de documento"}
            id="documentNumber"
            {...register("documentNumber", {
              required:
                documentType === "RUC"
                  ? "El número de RUC es obligatorio"
                  : documentType === "DNI"
                  ? "El número de DNI es obligatorio"
                  : "El número de documento es obligatorio",
              pattern:
                documentType === "RUC"
                  ? {
                      value: clientType === "Empresa" ? /^20\d{9}$/ : /^10\d{9}$/,
                      message:
                        clientType === "Empresa"
                          ? "El RUC debe iniciar con 20 y tener 11 dígitos"
                          : "El RUC debe iniciar con 10 y tener 11 dígitos",
                    }
                  : documentType === "DNI"
                  ? {
                      value: /^\d{8}$/,
                      message: "El DNI debe tener 8 dígitos",
                    }
                  : undefined,
            })}
            error={!!errors.documentNumber}
            helperText={errors.documentNumber?.message}
          />
        </div>

        {/* Submit */}
        <CTA
          type="submit"
          className="w-full"
          disabled={isButtonDisabled || isSubmitting}
        >
          Guardar Información
        </CTA>
      </form>
    </Modal>
  );
};
