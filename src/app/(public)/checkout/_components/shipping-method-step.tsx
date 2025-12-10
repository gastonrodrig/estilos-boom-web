"use client";

import { useState } from "react";
import { Truck, Store, MapPin, Bike, Package } from "lucide-react";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@components";

type Props = {
  address: any;
  onBack: () => void;
  onNext?: () => void;
};

export function ShippingMethodStep({ address, onBack, onNext }: Props) {
  const [selected, setSelected] = useState<string>("store");

  const methods = [
    {
      id: "store",
      title: "Recojo en Tienda",
      description: "Recoge tu pedido en nuestra tienda física",
      address: "Av. Principal 456, Miraflores, Lima",
      schedule: "Lun – Sáb 10:00 AM – 8:00 PM",
      price: 0,
      icon: <Store className="w-5 h-5 text-pink-600" />,
      dotColor: "bg-green-600",
    },

    {
      id: "meeting",
      title: "Punto de Encuentro",
      description: "Encuentra tu pedido en estaciones del tren",
      address:
        "Estaciones: Villa El Salvador, Villa María del Triunfo, San Juan",
      schedule: "Tiempo de entrega: 2-3 días hábiles",
      price: 3,
      icon: <MapPin className="w-5 h-5 text-yellow-600" />,
      dotColor: "bg-yellow-500",
    },

    {
      id: "motorized",
      title: "Total Motorizado",
      description: "Entrega directa a tu domicilio",
      address: "Servicio de delivery contratado",
      schedule: "Tiempo de entrega: 1-2 días hábiles",
      price: 10,
      icon: <Bike className="w-5 h-5 text-purple-600" />,
      dotColor: "bg-purple-500",
    },

    {
      id: "province",
      title: "Entrega a Provincia - Shalom",
      description: "Envío a todo el Perú",
      address: "Servicio de courier Shalom",
      schedule: "Tiempo de entrega: 3–7 días hábiles según destino",
      price: 10,
      icon: <Package className="w-5 h-5 text-blue-600" />,
      dotColor: "bg-blue-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* TITULO */}
      <h2 className="text-xl font-semibold text-gray-900">Método de Entrega</h2>

      {/* CARD CON INFORMACIÓN DEL CLIENTE */}
      {/* CARD DE INFORMACIÓN DEL CLIENTE */}
<Card className="shadow-sm">

  <CardHeader>
    <CardTitle className="text-gray-900 text-base">Enviar a</CardTitle>

    <CardAction>
      <button
        onClick={onBack}
        className="text-pink-600 hover:text-pink-700 text-sm font-medium"
      >
        Editar
      </button>
    </CardAction>

    <CardDescription className="text-gray-700 text-sm leading-snug space-y-0.5">
      <p>{address.firstName} {address.lastName}</p>
      <p>{address.address}</p>
      <p>
        {address.city}, {address.department} {address.postalCode}
      </p>

      {address.email && <p>{address.email}</p>}
      {address.phone && <p>{address.phone}</p>}
    </CardDescription>
  </CardHeader>

</Card>



      {/* MÉTODOS DE ENVÍO */}
      <div className="space-y-4">
        {methods.map((m) => {
          const isActive = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`w-full text-left rounded-2xl border p-5 transition shadow-sm bg-white 
              ${
                isActive
                  ? "border-pink-400 ring-2 ring-pink-200"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* punto de color */}
                <div
                  className={`w-3 h-3 rounded-full mt-1 ${m.dotColor}`}
                ></div>

                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    {m.icon}
                    <p className="font-semibold text-gray-900">{m.title}</p>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">{m.description}</p>
                  <p className="text-sm text-gray-600">{m.address}</p>
                  <p className="text-sm text-gray-600">{m.schedule}</p>
                </div>

                {/* PRECIO */}
                <p
                  className={`font-semibold ${
                    m.price === 0 ? "text-green-600" : "text-gray-800"
                  }`}
                >
                  {m.price === 0 ? "GRATIS" : `S/ ${m.price.toFixed(2)}`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* NOTA INFORMATIVA */}
      <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-xs text-gray-700">
        Los pedidos realizados antes de la 1:00 PM de lunes a viernes generalmente se procesan el mismo día.
        El precio de envío puede actualizarse una vez que se ingrese la dirección.
      </div>

      {/* BOTÓN CONTINUAR */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={() => {
            const selectedMethod = methods.find((m) => m.id === selected);
            if (selectedMethod) {
              // Leer el objeto order existente
              const existingOrder = JSON.parse(localStorage.getItem("order") || "{}");
              // Agregar shippingMethod al objeto
              existingOrder.shippingMethod = {
                id: selectedMethod.id,
                title: selectedMethod.title,
                price: selectedMethod.price,
              };
              // Guardar de vuelta
              localStorage.setItem("order", JSON.stringify(existingOrder));
            }
            onNext?.();
          }}
          className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition"
        >
          Continuar al Pago
        </button>
      </div>
    </div>
  );
}
