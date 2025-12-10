"use client";

import { Input, Label, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@components";

export function BillingAddressForm() {
  return (
    <div className="mt-6 rounded-2xl bg-white border p-5 shadow-sm space-y-4">

      <p className="text-sm font-semibold text-gray-900">
        Dirección de Facturación
      </p>

      <div className="space-y-1.5">
        <Label className="text-xs text-gray-700">Dirección*</Label>
        <Input placeholder="Av. Principal 123" className="h-10 text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-gray-700">
          Apartamento, suite, etc. (opcional)
        </Label>
        <Input placeholder="Dpto 101" className="h-10 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-700">Ciudad*</Label>
          <Input placeholder="Lima" className="h-10 text-sm" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-700">Código Postal*</Label>
          <Input placeholder="15001" className="h-10 text-sm" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-gray-700">Departamento*</Label>
        <Select>
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Selecciona un departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lima">Lima</SelectItem>
            <SelectItem value="arequipa">Arequipa</SelectItem>
            <SelectItem value="cusco">Cusco</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
