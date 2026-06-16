"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, TextInput } from "@/components/atoms";
import { CTA } from "@/components/atoms";
import { workerApi } from "@api";
import toast from "react-hot-toast";
import { UserPlus, Mail, Phone, User, CreditCard } from "lucide-react";
import type { WorkerFormValues } from "./worker-modal.types";

type WorkerModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => Promise<void>;
};

const DOC_TYPES = ["DNI", "CE", "Pasaporte", "RUC"];

export const WorkerModal = ({ open, onClose, onSaved }: WorkerModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkerFormValues>({
    defaultValues: {
      email: "", first_name: "", last_name: "",
      phone: "", document_type: "DNI", document_number: "",
      role: "Almacenero Boom",
    },
  });

  useEffect(() => {
    if (open) reset({
      email: "", first_name: "", last_name: "",
      phone: "", document_type: "DNI", document_number: "",
      role: "Almacenero Boom",
    });
  }, [open, reset]);

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (values: WorkerFormValues) => {
    try {
      await workerApi.post("/", {
        email:           values.email.trim().toLowerCase(),
        first_name:      values.first_name.trim(),
        last_name:       values.last_name.trim(),
        phone:           values.phone?.trim() || undefined,
        document_type:   values.document_type || undefined,
        document_number: values.document_number?.trim() || undefined,
        role:            values.role || undefined,
      });
      toast.success("Trabajador registrado correctamente.");
      if (onSaved) await onSaved();
      handleClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      toast.error(
        msg === "USER_ALREADY_EXISTS"
          ? "Ya existe un usuario con ese correo."
          : msg ?? "No se pudo registrar el trabajador."
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      panelClassName="relative bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-[32px] w-full max-w-lg p-8 shadow-2xl space-y-5"
      title={
        <span className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-[#D6405F]" />
          </span>
          Nuevo Trabajador
        </span>
      }
      description="Completa los datos para registrar un nuevo trabajador. El sistema le asignará el rol de Almacenero automáticamente."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A9B5] pointer-events-none z-10" />
            <TextInput
              id="worker-email"
              label="Correo electrónico *"
              type="email"
              className="pl-10"
              {...register("email", {
                required: "El correo es obligatorio.",
                pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Correo no válido." },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </div>

          {/* Nombres — 2 columnas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A9B5] pointer-events-none z-10" />
              <TextInput
                id="worker-first-name"
                label="Nombre(s) *"
                className="pl-10"
                {...register("first_name", {
                  required: "Campo obligatorio.",
                  minLength: { value: 2, message: "Mínimo 2 caracteres." },
                })}
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
              />
            </div>
            <TextInput
              id="worker-last-name"
              label="Apellidos *"
              {...register("last_name", {
                required: "Campo obligatorio.",
                minLength: { value: 2, message: "Mínimo 2 caracteres." },
              })}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
          </div>

          {/* Teléfono */}
          <div className="relative">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A9B5] pointer-events-none z-10" />
            <TextInput
              id="worker-phone"
              label="Teléfono"
              type="tel"
              className="pl-10"
              {...register("phone", {
                pattern: { value: /^[0-9+\s\-]{7,15}$/, message: "Número no válido." },
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </div>

          {/* Documento — tipo + número */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#8C6B79] mb-1.5 pl-2">Tipo Doc.</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A9B5] pointer-events-none z-10" />
                <select
                  {...register("document_type")}
                  className="w-full rounded-full border border-neutral-300 bg-white pl-10 pr-4 py-[11px] text-sm text-neutral-700 outline-none transition-all focus:border-[#f2b6c1] focus:ring-2 focus:ring-[#f2b6c1]/30 appearance-none"
                >
                  {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="col-span-3">
              <TextInput
                id="worker-doc-number"
                label="N° Documento"
                {...register("document_number", {
                  pattern: { value: /^[0-9a-zA-Z\-]{6,15}$/, message: "Formato no válido." },
                })}
                error={!!errors.document_number}
                helperText={errors.document_number?.message}
              />
            </div>
          </div>

          {/* Seleccionar Rol de Almacenero */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#8C6B79] uppercase tracking-wider pl-2">Rol / Almacén asignado *</label>
            <select
              {...register("role")}
              className="w-full rounded-full border border-neutral-300 bg-white px-5 py-[11px] text-sm text-neutral-700 outline-none transition-all focus:border-[#f2b6c1] focus:ring-2 focus:ring-[#f2b6c1]/30"
            >
              <option value="Almacenero Boom">Almacenero BOOM (Almacén Central)</option>
              <option value="Almacenero Tienda">Almacenero Tienda (Tienda Principal)</option>
            </select>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-[#8C6B79] hover:text-[#40202D] border border-[#EAE0E2] rounded-full transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <CTA type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Registrar trabajador"}
          </CTA>
        </div>
      </form>
    </Modal>
  );
};
