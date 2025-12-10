"use client";

import { useState } from "react";
import { Card, CardContent } from "@components"; 

export function PaymentCard() {
  const [selected, setSelected] = useState(true);

  return (
    <Card
      onClick={() => setSelected(true)}
      className={
        "cursor-pointer transition border-2 rounded-xl " +
        (selected
          ? "border-pink-600 bg-pink-50/50"
          : "border-gray-300 hover:bg-gray-50")
      }
    >
      <CardContent className="flex items-center gap-3 py-4">

        {/* Radio */}
        <div
          className={
            "h-5 w-5 rounded-full border-2 flex items-center justify-center transition " +
            (selected ? "border-pink-600" : "border-gray-400")
          }
        >
          {selected && (
            <div className="h-3.5 w-3.5 rounded-full bg-pink-600" />
          )}
        </div>

        {/* Texto */}
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-900">Tarjeta de Crédito</p>
          <p className="text-xs text-gray-600">
            Visa, Mastercard, American Express, Discover, JCB, Diners Club
          </p>
        </div>

      </CardContent>
    </Card>
  );
}
