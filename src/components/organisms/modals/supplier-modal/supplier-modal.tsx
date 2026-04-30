"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CTA, Modal, TextInput } from "@/components/atoms";
import { supplierApi } from "@api";
import { Supplier } from "@/components/organisms/modals/supplier-modal/supplier-modal.types";

type SupplierModalProps = {
  open: boolean;
  selectedSupplier: Supplier | null;
  onClose: () => void;
  onSaved?: () => Promise<void>;
};

export const SupplierModal = ({
  open,
  selectedSupplier,
  onClose,
  onSaved,
}: SupplierModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Supplier>({
    defaultValues: {
      name_company: "",
      contact_person: "",
      email: "",
      phone: "",
      ruc: "",
      status: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (selectedSupplier) {
        reset({
          ...selectedSupplier,
          status: selectedSupplier.status ?? true,
        });
      } else {
        reset({
          name_company: "",
          contact_person: "",
          email: "",
          phone: "",
          ruc: "",
          status: true,
        });
      }
    }
  }, [open, selectedSupplier, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: Supplier) => {
    try {
      if (selectedSupplier?._id) {
        await supplierApi.patch(`/${selectedSupplier._id}`, values);
        toast.success("Proveedor actualizado correctamente.");
      } else {
        await supplierApi.post("/", values);
        toast.success("Proveedor creado correctamente.");
      }

      if (onSaved) await onSaved();
      handleClose();
    } catch (error) {
      toast.error(
        selectedSupplier ? "No se pudo actualizar el proveedor." : "No se pudo crear el proveedor."
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={selectedSupplier ? "Editar proveedor" : "Nuevo proveedor"}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <TextInput
            label="Razón social"
            {...register("name_company", { required: true })}
            error={!!errors.name_company}
          />
          <TextInput
            label="Contacto"
            {...register("contact_person", { required: true })}
            error={!!errors.contact_person}
          />
          <TextInput
            label="Correo electrónico"
            type="email"
            {...register("email", {
              required: true,
              pattern: {
                value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                message: "Correo no válido",
              },
            })}
            error={!!errors.email}
          />
          <TextInput
            label="Teléfono"
            {...register("phone", { required: true })}
            error={!!errors.phone}
          />
          <TextInput
            label="RUC"
            {...register("ruc", {
              required: true,
              minLength: { value: 8, message: "Ingrese un RUC válido" },
            })}
            error={!!errors.ruc}
          />
        </div>

        <div className="pt-6">
          <CTA type="submit" className="w-full" disabled={isSubmitting}>
            {selectedSupplier ? "Guardar cambios" : "Registrar proveedor"}
          </CTA>
        </div>
      </form>
    </Modal>
  );
};
