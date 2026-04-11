"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useClientPersonStore, useStorekeeperStore } from "@hooks";
import {
  CTA,
  Modal,
  SelectInput,
  TextInput,
  Tooltip,
} from "@/components/atoms";
import { DocumentType, ClientType } from "@enums";
import { ClientPerson } from "@models";
import { AlertCircle } from "lucide-react";
import { Workshop } from "@/core/models/storekeeper/storekeeper.models";

type WorkShopModalProps = {
  open: boolean;
  onClose: () => void;
};

export const WorkShopModal = ({
  open,
  onClose,
}: WorkShopModalProps) => {
  const {
    selected,
    loading,
    startCreateWorkshop,
    startUpdateWorkshop,
    setSelectedWorkshop,
  } = useStorekeeperStore();

  const isEdit = !!selected;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Workshop>();

  useEffect(() => {
    if (open) {
      if (selected) {
        reset(selected);
      } else {
        reset({
          name: "",
          description: "",
          contact_person: "",
          phone: "",
          address: "",
        });
      }
    }
  }, [open, selected, reset]);

  const handleClose = () => {
    setSelectedWorkshop(null);
    onClose();
  };

  const onSubmit = async (data: Workshop) => {
    try {
      if (isEdit && selected?._id) {
        const success = await startUpdateWorkshop(selected._id, data);
        if (success) handleClose();
      } else {
        const success = await startCreateWorkshop(data);
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
      title={isEdit ? "Editar Workshop" : "Nuevo Workshop"}
      description={
        isEdit
          ? `Editando perfil de ${selected.name}`
          : "Completa los datos para registrar un nuevo taller."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              id="name"
              label="Nombre"
              {...register("name", {
                required: "El nombre es obligatorio",
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextInput
              id="contact_person"
              label="Persona de contacto"
              {...register("contact_person", {
                required: "La persona de contacto es obligatoria",
              })}
              error={!!errors.contact_person}
              helperText={errors.contact_person?.message}
            />
          </div>

          <div className="relative group">
            <TextInput
              id="description"
              label="Descripción"
              {...register("description", {
                required: "La descripción es obligatoria",
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            {isEdit && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                {/* <Tooltip text="Si cambias el correo, el usuario deberá usar la nueva dirección para iniciar sesión en el sistema.">
                  <AlertCircle className="h-4 w-4 text-amber-500 cursor-help" />
                </Tooltip> */}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              id="address"
              label="Dirección"
              {...register("address", { required: "La dirección es obligatoria" })}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
            <TextInput
            id="phone"
            label="Teléfono"
            {...register("phone", {
              required: "El teléfono es obligatorio",
              pattern: {
                value: /^\d{9}$/,
                message: "Debe tener 9 dígitos",
              },
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
          </div>


        </div>

        <CTA
          type="submit"
          className="w-full"
          disabled={isButtonDisabled || isSubmitting}
        >
          {isEdit ? "Guardar Cambios" : "Crear Workshop"}
        </CTA>
      </form>
    </Modal>
  );
};
