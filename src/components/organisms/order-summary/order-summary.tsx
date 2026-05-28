"use client";

import { useRouter } from "next/navigation";
import { CartItem } from "@models";
import { useAppSelector } from "@store";

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

      <div className="mt-4 pb-4 border-b border-[#E5B3B8]">
        <p className="text-[12px] font-medium text-[#C5A059]">Boom Rewards</p>
        <p className="mt-1 text-[13px] text-[#594246]/80">
          Podrías ganar <span className="font-bold text-[#C5A059]">242 puntos</span> en esta compra.
        </p>
      </div>

      {!showButton && items.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-[13px] font-semibold text-[#594246] border-b border-[#F2B6C1] pb-2">Productos ({items.length})</p>
          <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {items.map((item) => (
              <li key={`${item.productId}-${item.color}-${item.size}`} className="flex justify-between items-start text-[12px] text-[#594246]">
                <div className="flex flex-col">
                  <span className="font-medium line-clamp-1">{item.name}</span>
                  <span className="text-[#827D7D] text-[11px]">Cant: {item.quantity} | Talla: {item.size}</span>
                </div>
                <span className="font-semibold whitespace-nowrap ml-2">{currency(item.price * item.quantity)}</span>
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
          <span>IGV (18%)</span>
          <span className="font-semibold">{currency(igv)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Op. gravada</span>
          <span className="font-semibold">{currency(taxedOperation)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Precio de entrega {deliveryName ? `(${deliveryName})` : ''}</span>
          <span className="font-semibold">{deliveryCost > 0 ? currency(deliveryCost) : 'Ver al finalizar'}</span>
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
    </aside>
  );
};