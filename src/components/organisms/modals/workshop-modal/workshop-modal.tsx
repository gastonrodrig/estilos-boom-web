"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CTA, Modal, TextInput } from "@/components/atoms";
import { SelectInput } from "@/components/atoms/input/selector-input";
import { workshopApi } from "@api";
import { Workshop } from "./workshop-modal.types";

type WorkshopModalProps = {
  open: boolean;
  selectedWorkshop: Workshop | null;
  onClose: () => void;
  onSaved?: () => Promise<void>;
};

export const WorkshopModal = ({
  open,
  selectedWorkshop,
  onClose,
  onSaved,
}: WorkshopModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Workshop>({
    defaultValues: {
      name_company: "",
      ruc: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      specialty: "",
      weekly_capacity: undefined,
      operating_status: "AVAILABLE",
      status: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (selectedWorkshop) {
        reset({
          ...selectedWorkshop,
          status: selectedWorkshop.status ?? true,
        });
      } else {
        reset({
          name_company: "",
          ruc: "",
          contact_person: "",
          email: "",
          phone: "",
          address: "",
          specialty: "",
          weekly_capacity: undefined,
          operating_status: "AVAILABLE",
          status: true,
        });
      }
    }
  }, [open, selectedWorkshop, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: Workshop) => {
    try {
      if (selectedWorkshop?._id) {
        await workshopApi.patch(`/${selectedWorkshop._id}`, values);
        toast.success("Taller actualizado correctamente.");
      } else {
        await workshopApi.post("/", values);
        toast.success("Taller creado correctamente.");
      }

      if (onSaved) await onSaved();
      handleClose();
    } catch (error) {
      toast.error(
        selectedWorkshop ? "No se pudo actualizar el taller." : "No se pudo crear el taller."
      );
    }
  };

  const statusOptions = [
    { label: "Capacidad Disponible", value: "AVAILABLE" },
    { label: "Capacidad Limitada", value: "LIMITED" },
    { label: "Saturado / Capacidad Maxima", value: "SATURATED" },
    { label: "Inactivo Temporalmente", value: "INACTIVE" },
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={selectedWorkshop ? "Editar taller" : "Nuevo taller"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <div className="flex flex-col gap-5">
          <TextInput
            id="ws-name"
            label="Nombre del Taller / Empresa"
            {...register("name_company", { required: "El nombre es obligatorio" })}
            error={!!errors.name_company}
            helperText={errors.name_company?.message}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextInput
              id="ws-ruc"
              label="RUC"
              {...register("ruc", {
                required: "RUC obligatorio",
                minLength: { value: 11, message: "11 digitos" },
                maxLength: { value: 11, message: "11 digitos" },
              })}
              error={!!errors.ruc}
              helperText={errors.ruc?.message}
            />
            <SelectInput
              id="ws-specialty"
              label="Especialidad"
              options={[
                { label: "Vestidos", value: "Vestidos" },
                { label: "Blusas", value: "Blusas" },
                { label: "Pantalones", value: "Pantalones" },
                { label: "Polos / Camisetas", value: "Polos" },
                { label: "Casacas / Chaquetas", value: "Casacas" },
                { label: "Sacos / Blazers", value: "Sacos" },
                { label: "Faldas", value: "Faldas" },
                { label: "Ropa Interior / Lenceria", value: "Lenceria" },
                { label: "Uniformes", value: "Uniformes" },
              ]}
              {...register("specialty", { required: "Especialidad obligatoria" })}
              error={!!errors.specialty}
              helperText={errors.specialty?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextInput
              id="ws-contact"
              label="Contacto (Encargado)"
              {...register("contact_person")}
            />
            <TextInput
              id="ws-phone"
              label="Telefono / WhatsApp"
              {...register("phone")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextInput
              id="ws-email"
              label="Correo electronico"
              type="email"
              {...register("email")}
            />
            <TextInput
              id="ws-capacity"
              label="Capacidad Semanal"
              type="number"
              {...register("weekly_capacity", { valueAsNumber: true })}
            />
          </div>

          <TextInput
            id="ws-address"
            label="Direccion Fisica"
            {...register("address")}
          />

          <SelectInput
            id="ws-status"
            label="Estado Operativo"
            options={statusOptions}
            {...register("operating_status")}
          />
        </div>

        <div className="pt-8">
          <CTA type="submit" className="w-full py-4 text-base font-semibold" disabled={isSubmitting}>
            {selectedWorkshop ? "Guardar cambios" : "Registrar taller"}
          </CTA>
        </div>
      </form>
    </Modal>
  );
};
