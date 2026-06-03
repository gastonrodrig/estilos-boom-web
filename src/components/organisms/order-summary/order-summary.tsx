"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CartItem } from "@models";
import { useAppSelector } from "@store";
import { Eye, X } from "lucide-react";

interface OrderSummaryProps {
  items: CartItem[];
  showButton?: boolean;
  deliveryCost?: number;
  deliveryName?: string;
}

const currency = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);

export const OrderSummary = ({ items, showButton = true, deliveryCost = 0, deliveryName }: OrderSummaryProps) => {
  const router = useRouter();
  const authUid = useAppSelector((state) => state.auth.uid);
  const authStatus = useAppSelector((state) => state.auth.status);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isAuthenticated = Boolean(authUid) || authStatus === "authenticated";

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const igv = subtotal * 0.18;
  const taxedOperation = subtotal * 0.82;
  const total = subtotal + deliveryCost;

  const handlePrimaryAction = () => {
    if (!isAuthenticated) {
      router.push("/auth/login?returnTo=/cart");
      return;
    }

    router.push("/checkout");
  };

  return (
    <aside className="sticky top-28 bg-[#FCF5F5] border border-[#E5B3B8] rounded-sm p-6 text-[#594246] shadow-sm">
      <h3 className="text-[16px] font-medium text-[#632034] mb-6">Resumen del pedido</h3>



      {!showButton && items.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-[13px] font-semibold text-[#594246] border-b border-[#F2B6C1] pb-2">Productos ({items.length})</p>
          <ul className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {items.map((item) => (
              <li key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-3 items-center text-[#594246]">
                <div 
                  className="w-16 h-20 flex-shrink-0 relative group cursor-pointer"
                  onClick={() => setPreviewImage(item.image)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[15px] font-serif text-[#632034]">{item.name}</span>
                  <span className="text-[#3C739A] text-[12px] mt-1">Color : {item.color}</span>
                  <span className="text-[#3C739A] text-[12px]">Talla : {item.size}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-semibold whitespace-nowrap text-[13px]">{currency(item.price * item.quantity)}</span>
                  <span className="text-[#827D7D] text-[11px] mt-1">Cant: {item.quantity}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 space-y-3 text-[13px] font-medium text-[#594246]">
        <div className="flex items-center justify-between">
          <span>Subtotal (incluye IGV)</span>
          <span className="font-semibold">{currency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Envío {deliveryName ? `(${deliveryName})` : ''}</span>
          <span className="font-semibold">
            {deliveryCost === 0 && !deliveryName ? "Ver al finalizar" : deliveryCost === 0 ? "GRATIS" : currency(deliveryCost)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>IGV (18%)</span>
          <span className="font-semibold">{currency(igv)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Op. gravada</span>
          <span className="font-semibold">{currency(taxedOperation)}</span>
        </div>
      </div>

      <div className="my-5 h-px bg-[#E5B3B8]" />

      <div className="flex items-center justify-between text-[#632034]">
        <span className="text-[14px] font-medium">Total</span>
        <span className="text-[24px] leading-none font-serif text-[#632034]">{currency(total)}</span>
      </div>

      {showButton && (
        <>
          <button
            onClick={handlePrimaryAction}
            className="mt-6 w-full rounded-sm bg-black px-4 py-3.5 text-[12px] font-semibold tracking-wider uppercase text-white shadow-sm transition-all hover:bg-[#632034] hover:shadow-lg active:scale-[0.98] hover:cursor-pointer"
          >
            {isAuthenticated ? "Proceder al pago" : "Inicie sesión para continuar"}
          </button>

          <p className="mt-2 text-center text-[11px] font-medium text-[#594246]/55">
            Pago 100% seguro y protegido
          </p>
        </>
      )}

      {previewImage && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/90 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative w-full max-w-2xl flex flex-col items-center">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-[10000]"
            >
              <X size={24} />
            </button>
            <img 
              src={previewImage} 
              alt="Vista previa" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
};