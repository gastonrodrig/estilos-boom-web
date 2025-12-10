"use client";

import { useState, FormEvent, useEffect } from "react";
import {
  Input,
  Label,
  Select,
  Checkbox,
  Button,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components";

import type { CheckoutFormValues } from "../_types";

type CheckoutFormProps = {
  onSubmit?: (values: CheckoutFormValues) => void;
};

const defaultValues: CheckoutFormValues = {
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  postalCode: "",
  department: "",
  email: "",
  phone: "",
  subscribe: false,
};

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const [form, setForm] = useState<CheckoutFormValues>(() => {
    try {
      const saved = localStorage.getItem("order");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error("No se pudo cargar order desde localStorage", err);
    }
    return defaultValues;
  });


  function handleChange<K extends keyof CheckoutFormValues>(
    key: K,
    value: CheckoutFormValues[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // 1) Guardar en localStorage
    try {
      localStorage.setItem("order", JSON.stringify(form));
    } catch (err) {
      console.error("Error guardando order en localStorage:", err);
    }

    // 2) Llamar callback opcional si existe
    onSubmit?.(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white/80 shadow-[0_18px_40px_rgba(15,23,42,0.06)] ring-1 ring-rose-100/60 px-6 py-6 sm:px-8 sm:py-7"
    >
      {/* Título sección */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-900">Enviar a</h2>
        <p className="mt-1 text-xs text-gray-500">
          Lo sentimos, no podemos enviar a apartados postales en este momento.
        </p>
      </div>

      {/* Nombre / Apellido */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-700">Nombre*</Label>
          <Input
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="h-10 text-sm"
            placeholder="Ingresa tu nombre"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-700">Apellido*</Label>
          <Input
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="h-10 text-sm"
            placeholder="Ingresa tu apellido"
          />
        </div>
      </div>

      {/* Dirección */}
      <div className="mt-4 space-y-1.5">
        <Label className="text-xs text-gray-700">Dirección*</Label>
        <Input
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="h-10 text-sm"
          placeholder="Av. Principal 123"
        />
      </div>

      {/* Departamento / suite */}
      <div className="mt-4 space-y-1.5">
        <Label className="text-xs text-gray-700">
          Apartamento, suite, etc. (opcional)
        </Label>
        <Input
          value={form.apartment}
          onChange={(e) => handleChange("apartment", e.target.value)}
          className="h-10 text-sm"
          placeholder="Dpto 101"
        />
      </div>

      {/* Ciudad / Código postal */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-700">Ciudad*</Label>
          <Input
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="h-10 text-sm"
            placeholder="Lima"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-700">Código Postal*</Label>
          <Input
            value={form.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            className="h-10 text-sm"
            placeholder="15001"
          />
        </div>
      </div>

      {/* Departamento */}
      <div className="mt-4 space-y-1.5">
        <Label className="text-xs text-gray-700">Departamento*</Label>
        <Select
          value={form.department || undefined}
          onValueChange={(value) => handleChange("department", value)}
        >
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Selecciona un departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="amazonas">Amazonas</SelectItem>
            <SelectItem value="ancash">Ancash</SelectItem>
            <SelectItem value="apurímac">Apurímac</SelectItem>
            <SelectItem value="arequipa">Arequipa</SelectItem>
            <SelectItem value="ayacucho">Ayacucho</SelectItem>
            <SelectItem value="cajamarca">Cajamarca</SelectItem>
            <SelectItem value="callao">Callao</SelectItem>
            <SelectItem value="cusco">Cusco</SelectItem>
            <SelectItem value="huancavelica">Huancavelica</SelectItem>
            <SelectItem value="huánuco">Huánuco</SelectItem>
            <SelectItem value="ica">Ica</SelectItem>
            <SelectItem value="junín">Junín</SelectItem>
            <SelectItem value="la-libertad">La Libertad</SelectItem>
            <SelectItem value="lambayeque">Lambayeque</SelectItem>
            <SelectItem value="lima">Lima</SelectItem>
            <SelectItem value="loreto">Loreto</SelectItem>
            <SelectItem value="madre-de-dios">Madre de Dios</SelectItem>
            <SelectItem value="moquegua">Moquegua</SelectItem>
            <SelectItem value="pasco">Pasco</SelectItem>
            <SelectItem value="piura">Piura</SelectItem>
            <SelectItem value="puno">Puno</SelectItem>
            <SelectItem value="san-martín">San Martín</SelectItem>
            <SelectItem value="tacna">Tacna</SelectItem>
            <SelectItem value="tumbes">Tumbes</SelectItem>
            <SelectItem value="ucayali">Ucayali</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Información de contacto */}
      <div className="mt-6 border-t border-rose-100/80 pt-5">
        <h3 className="text-sm font-semibold text-gray-900">
          Información de Contacto
        </h3>

        <div className="mt-3 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-700">Email*</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-10 text-sm"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-700">Número de Teléfono*</Label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="h-10 text-sm"
              placeholder="+51 987 654 321"
            />
          </div>

          <p className="text-[11px] text-gray-500">
            El número de teléfono ayuda a asegurar la entrega del paquete.
          </p>

          <div className="mt-1 flex items-start gap-2">
            <Checkbox
              id="subscribe"
              checked={form.subscribe}
              onCheckedChange={(checked) =>
                handleChange("subscribe", checked === true)
              }
              className="mt-0.5"
            />
            <label
              htmlFor="subscribe"
              className="text-[11px] text-gray-600 leading-snug cursor-pointer"
            >
              Me gustaría recibir actualizaciones sobre los últimos productos y promociones
              por correo electrónico u otros canales.
            </label>
          </div>
        </div>
      </div>

      {/* Botón principal */}
      <div className="mt-6">
        <Button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-sm font-semibold shadow-md hover:from-pink-600 hover:to-orange-500"
        >
          Guardar y Ver Opciones de Envío
        </Button>

        <p className="mt-3 text-[11px] text-center text-gray-500">
          Al enviar mi información acepto los{" "}
          <span className="text-pink-600 font-semibold cursor-pointer">
            Términos y Condiciones
          </span>{" "}
          y la{" "}
          <span className="text-pink-600 font-semibold cursor-pointer">
            Política de Privacidad
          </span>
          .
        </p>
      </div>
    </form>
  );
}