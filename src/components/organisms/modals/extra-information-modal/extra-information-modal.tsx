"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { useUsersStore } from "@hooks";
import { formatAddressesForPayload } from "@helpers";
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
  } = useForm<ExtraInformationValues>({
    defaultValues: {
      addresses: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses"
  });

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
        addresses: []
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
      // Normalizar direcciones para el backend
      const formattedData = {
        ...data,
        addresses: formatAddressesForPayload(data.addresses || [])
      };
      const success = await startUpdateExtraData(uid, formattedData);
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
        <div className="my-6 space-y-4 max-h-[55vh] overflow-y-auto pt-4 pr-2 custom-scrollbar">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          ) : clientType === "Persona" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

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

          {/* SECCIÓN DINÁMICA DE DIRECCIONES */}
          <div className="pt-4 border-t border-gray-100 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Direcciones de entrega</h3>
              <button
                type="button"
                onClick={() => append({ address_line: "", is_default: false })}
                className="flex items-center gap-1 text-xs font-medium text-pink-500 hover:text-pink-600 transition-colors"
              >
                <Plus size={14} />
                Agregar dirección
              </button>
            </div>

            {fields.length > 0 && (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative p-4 bg-gray-50 rounded-2xl border border-gray-200 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Ubicación #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1.5 bg-white text-gray-400 hover:text-red-500 hover:border-red-200 rounded-lg border border-gray-100 transition-all shadow-sm"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <TextInput
                        label={`Dirección ${index + 1}`}
                        id={`addresses.${index}.address_line`}
                        {...register(`addresses.${index}.address_line` as const, {
                          required: index === 0 ? "Al menos una dirección es obligatoria" : false
                        })}
                        error={!!errors.addresses?.[index]?.address_line}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <TextInput
                          label="Distrito"
                          id={`addresses.${index}.district`}
                          {...register(`addresses.${index}.district` as const)}
                        />
                        <TextInput
                          label="Referencia"
                          id={`addresses.${index}.reference`}
                          {...register(`addresses.${index}.reference` as const)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 mt-2">
          <CTA
            type="submit"
            className="w-full"
            disabled={isButtonDisabled || isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar Información"}
          </CTA>
        </div>
      </form>
    </Modal>
  );
};
