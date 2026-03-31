"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useClientPersonStore, useAuthStore } from "@hooks";
import { CTA, Modal, SelectInput, TextInput, Tooltip, PasswordInput } from "@/components/atoms";
import { DocumentType, ClientType } from "@enums";
import { ClientPerson } from "@models";
import { AlertCircle, Plus, Trash2, Mail, Wand2 } from "lucide-react";
import { generateRandomPassword as generatePwd, formatAddressesForPayload } from "@helpers";

type ClientPersonModalProps = {
  open: boolean;
  onClose: () => void;
};

export const ClientPersonModal = ({
  open,
  onClose,
}: ClientPersonModalProps) => {
  const {
    selected,
    loading,
    startCreateClientPerson,
    startUpdateClientPerson,
    setSelectedClientPerson,
  } = useClientPersonStore();

  const { startPasswordReset } = useAuthStore();

  const isEdit = !!selected;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
    watch,
    setValue,
  } = useForm<ClientPerson & { password?: string }>({
    defaultValues: {
      addresses: []
    }
  });

  const emailValue = watch("email");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses"
  });

  useEffect(() => {
    if (open) {
      if (selected) {
        reset({
          ...selected,
          addresses: selected.addresses || []
        });
      } else {
        reset({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          phone: "",
          client_type: ClientType.PERSON,
          document_type: DocumentType.DNI,
          document_number: "",
          addresses: []
        });
      }
    }
  }, [open, selected, reset]);

  const handleClose = () => {
    setSelectedClientPerson(null);
    onClose();
  };

  const handleResetPassword = async () => {
    if (!emailValue) return;
    await startPasswordReset({ email: emailValue });
  };

  const onGeneratePassword = () => {
    const password = generatePwd();
    setValue("password", password, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: ClientPerson & { password?: string }) => {
    try {
      const {
        email,
        first_name,
        last_name,
        phone,
        client_type,
        document_type,
        document_number,
        addresses,
        password
      } = data;

      const formattedData = {
        email,
        first_name,
        last_name,
        phone,
        client_type: client_type || 'Persona',
        document_type,
        document_number,
        password: password || undefined,
        addresses: formatAddressesForPayload(addresses || [])
      };

      if (isEdit && (selected?._id || selected?.id_user)) {
        const idToUpdate = (selected?._id || selected?.id_user) as string;
        const success = await startUpdateClientPerson(idToUpdate, formattedData);
        if (success) handleClose();
      } else {
        const success = await startCreateClientPerson(formattedData);
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
          ? `Editando perfil de ${selected?.first_name} ${selected?.last_name}`
          : "Completa los datos para registrar un nuevo cliente persona natural."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-7 space-y-4 max-h-[60vh] overflow-y-auto pt-4 pr-4 custom-scrollbar">
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
                  position="top"
                  text="Si cambias el correo, el usuario deberá usar la nueva dirección para iniciar sesión en el sistema."
                >
                  <AlertCircle className="h-4 w-4 text-amber-500 cursor-help" />
                </Tooltip>
              </div>
            )}
          </div>

          {!isEdit ? (
            <div className="flex gap-2 items-start bg-gray-50 p-2 rounded-2xl border border-gray-100">
              <PasswordInput
                id="password"
                label="Contraseña Temporal"
                containerClassName="flex-1"
                {...register("password")}
              />
              <button
                type="button"
                onClick={onGeneratePassword}
                className="mt-1 p-2.5 bg-white border border-gray-200 text-pink-500 hover:bg-pink-50 rounded-xl transition-all shadow-sm flex items-center gap-2 group"
              >
                <Wand2 size={16} className="group-hover:animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wide pr-1">Generar</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Seguridad de cuenta</p>
                  <p className="text-[10px] text-gray-500">Envía un enlace para cambiar contraseña</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetPassword}
                className="px-4 py-1.5 bg-[#f2b6c1] text-white text-[10px] font-bold rounded-full hover:bg-[#e59ead] transition-colors shadow-sm"
              >
                Restablecer
              </button>
            </div>
          )}

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

          {/* SECCIÓN DE DIRECCIONES */}
          <div className="pt-4 border-t border-gray-100 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Direcciones registradas</h3>
              <button
                type="button"
                onClick={() => append({ address_line: "", is_default: false })}
                className="flex items-center gap-1 text-xs font-medium text-pink-500 hover:text-pink-600 transition-colors"
              >
                <Plus size={14} />
                Agregar dirección
              </button>
            </div>

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
                        required: "La dirección es obligatoria"
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
          </div>
        </div>

        <div className="pt-4 mt-2">
          <CTA
            type="submit"
            className="w-full"
            disabled={isButtonDisabled || isSubmitting}
          >
            {isEdit ? "Guardar Cambios" : "Crear Cliente"}
          </CTA>
        </div>
      </form>
    </Modal>
  );
};
