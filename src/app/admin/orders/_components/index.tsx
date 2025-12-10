"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components";
import Image from "next/image";

interface OrderDetailsModalProps {
  order: {
    address: {
      fullName: string;
      address: string;
      city: string;
      department: string;
      postalCode: string;
      phone: string;
      email: string;
    };
    items: Array<{
      id: string | number;
      image: string;
      title: string;
      selectedSize: string;
      selectedVariant: string;
      quantity: number;
      price: number;
    }>;
    total: number;
  };
  open: boolean;
  onClose: (open: boolean) => void;
}

export function OrderDetailsModal({ order, open, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Resumen de Orden</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">

          {/* Datos del cliente */}
          <div className="border rounded-xl p-4 bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-900">Cliente</h3>
            <p className="text-sm">{order.address.fullName}</p>
            <p className="text-sm">{order.address.address}</p>
            <p className="text-sm">{order.address.city}, {order.address.department} {order.address.postalCode}</p>
            <p className="text-sm">Tel: {order.address.phone}</p>
            <p className="text-sm">Email: {order.address.email}</p>
          </div>

          {/* Productos */}
          <div className="border rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 text-gray-900">Productos</h3>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b pb-3">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={60}
                    height={60}
                    className="rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      Talla: {item.selectedSize} — Color: {item.selectedVariant}
                    </p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">S/ {item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border rounded-xl p-4 bg-gray-50 flex justify-between">
            <p className="font-semibold">Total</p>
            <p className="font-bold text-pink-600">S/ {order.total?.toFixed(2)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
