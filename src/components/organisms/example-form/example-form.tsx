"use client";

import { useForm } from "react-hook-form";
import { CTA, TextInput, SelectInput } from "@/components/atoms";

// ------------------------------------------------------------
// Tipos
// ------------------------------------------------------------
type ExampleFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  document_type: "DNI" | "RUC";
  document_number: string;
  age: number;
  website?: string;
};

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export const ExampleForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ExampleFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      document_type: "DNI",
      document_number: "",
      age: undefined,
      website: "",
    },
  });

  const onSubmit = async (data: ExampleFormValues) => {
    // Aquí iría la llamada a la API
    console.log("Formulario enviado:", data);
    reset();
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-xl font-semibold mb-6">Ejemplo react-hook-form</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              id="first_name"
              label="Nombre"
              {...register("first_name", {
                required: "El nombre es obligatorio",
                minLength: {
                  value: 2,
                  message: "Mínimo 2 caracteres",
                },
              })}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
            />
            <TextInput
              id="last_name"
              label="Apellido"
              {...register("last_name", {
                required: "El apellido es obligatorio",
                minLength: {
                  value: 2,
                  message: "Mínimo 2 caracteres",
                },
              })}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
          </div>

          {/* Correo */}
          <TextInput
            id="email"
            label="Correo Electrónico"
            type="email"
            {...register("email", {
              required: "El correo es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo inválido",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          {/* Teléfono */}
          <TextInput
            id="phone"
            label="Teléfono"
            {...register("phone", {
              required: "El teléfono es obligatorio",
              pattern: {
                value: /^\d{9}$/,
                message: "Debe tener exactamente 9 dígitos",
              },
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />

          {/* Tipo y Número de documento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput
              id="document_type"
              label="Tipo de documento"
              options={[
                { label: "DNI", value: "DNI" },
                { label: "RUC", value: "RUC" },
              ]}
              {...register("document_type", {
                required: "Selecciona un tipo",
              })}
              error={!!errors.document_type}
              helperText={errors.document_type?.message}
            />
            <TextInput
              id="document_number"
              label="Nro. de documento"
              {...register("document_number", {
                required: "El número es obligatorio",
                validate: {
                  // Ejemplo de validación personalizada con `validate`
                  onlyDigits: (v) =>
                    /^\d+$/.test(v) || "Solo se permiten números",
                },
              })}
              error={!!errors.document_number}
              helperText={errors.document_number?.message}
            />
          </div>

          {/* Edad */}
          <TextInput
            id="age"
            label="Edad"
            type="number"
            {...register("age", {
              required: "La edad es obligatoria",
              min: { value: 18, message: "Debes ser mayor de 18 años" },
              max: { value: 99, message: "Edad inválida" },
              valueAsNumber: true,
            })}
            error={!!errors.age}
            helperText={errors.age?.message}
          />

          {/* Sitio web (opcional) */}
          <TextInput
            id="website"
            label="Sitio web (opcional)"
            {...register("website", {
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Debe iniciar con http:// o https://",
              },
            })}
            error={!!errors.website}
            helperText={errors.website?.message}
          />

        </div>

        {/* Submit */}
        <div className="mt-6">
          <CTA type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar"}
          </CTA>
        </div>
      </form>
    </div>
  );
};
