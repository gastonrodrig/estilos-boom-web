"use client";

import { Card } from "@components";

type Props = {
  address: any;
  onEditAddress: () => void;
};

export function AddressSummaryCard({ address, onEditAddress }: Props) {
  if (!address) return null;

  return (
    <Card className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">

        {/* Datos de dirección */}
        <div className="text-sm leading-relaxed text-gray-700">
          <p className="font-semibold text-gray-900 mb-1">Enviar a</p>

          <p>{address.firstName} {address.lastName}</p>
          <p>{address.address}</p>

          <p>
            {address.city}, {address.department} {address.postalCode}
          </p>
        </div>

        {/* Botón Editar */}
        <button
          onClick={onEditAddress}
          className="text-pink-600 text-sm font-medium hover:underline"
        >
          Editar
        </button>
      </div>
    </Card>
  );
}
