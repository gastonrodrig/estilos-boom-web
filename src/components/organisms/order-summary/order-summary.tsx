"use client";

import { useRouter } from "next/navigation";
import { CartItem } from "@models";
import { useAppSelector } from "@store";

interface OrderSummaryProps {
  items: CartItem[];
  showButton?: boolean;
  deliveryPrice?: number;
}

const currency = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);

export const OrderSummary = ({ items, showButton = true, deliveryPrice }: OrderSummaryProps) => {
  const router = useRouter();
  const authUid = useAppSelector((state) => state.auth.uid);
  const authStatus = useAppSelector((state) => state.auth.status);

  const isAuthenticated = Boolean(authUid) || authStatus === "authenticated";

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = total;
  const finalTotal = subtotal + (deliveryPrice || 0);
  const igv = subtotal * 0.18;
  const taxedOperation = subtotal * 0.82;

  const handlePrimaryAction = () => {
    if (!isAuthenticated) {
      router.push("/auth/login?returnTo=/cart");
      return;
    }

    router.push("/checkout");
  };

  return (
    <aside className="cart-summary sticky top-28 bg-[#FCF5F5] dark:bg-[#1a0618]/60 dark:backdrop-blur-md border border-[#E5B3B8] dark:border-[#C5A059]/20 rounded-xl p-6 text-[#594246] dark:text-[#f0d8e8] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <h3 className="summary-title text-[16px] font-medium text-[#632034] dark:text-[#C5A059] uppercase tracking-[0.2em] mb-6">Resumen del pedido</h3>

      <div className="mt-4 pb-4 border-b border-[#E5B3B8] dark:border-[#e8688a]/30">
        <p className="rewards-label text-[12px] font-medium text-[#C5A059] dark:text-[#e8b86d]">Boom Rewards</p>
        <p className="rewards-text mt-1 text-[13px] text-[#594246]/80 dark:text-[#f0d8e8]/70">
          Podrías ganar <span className="rewards-points font-bold text-[#C5A059] dark:text-[#e8b86d]">242 puntos</span> en esta compra.
        </p>
      </div>

      <div className="mt-5 space-y-3 text-[13px] font-medium text-[#594246] dark:text-[#f0d8e8]">
        <div className="summary-row flex items-center justify-between">
          <span className="summary-row-label">Subtotal (incluye IGV)</span>
          <span className="summary-row-value font-semibold">{currency(subtotal)}</span>
        </div>
        <div className="summary-row flex items-center justify-between">
          <span className="summary-row-label">Envío</span>
          <span className={deliveryPrice === undefined ? "summary-row-pending font-semibold" : "summary-row-value font-semibold"}>
            {deliveryPrice === undefined ? "Ver al finalizar" : deliveryPrice === 0 ? "GRATIS" : currency(deliveryPrice)}
          </span>
        </div>
        <div className="summary-row flex items-center justify-between">
          <span className="summary-row-label">IGV (18%)</span>
          <span className="summary-row-value font-semibold">{currency(igv)}</span>
        </div>
        <div className="summary-row flex items-center justify-between">
          <span className="summary-row-label">Op. gravada</span>
          <span className="summary-row-value font-semibold">{currency(taxedOperation)}</span>
        </div>
      </div>

      <div className="my-5 h-px bg-[#E5B3B8] dark:bg-[#e8688a]/30" />

      <div className="summary-total flex items-center justify-between text-[#632034] dark:text-white">
        <span className="summary-total-label text-[14px] font-medium">Total</span>
        <span className="summary-total-value text-[24px] leading-none text-[#632034] dark:text-[#f0a0c0]">{currency(finalTotal)}</span>
      </div>

      {showButton && (
        <>
          <button
            onClick={handlePrimaryAction}
            className="btn-checkout mt-6 w-full rounded-sm bg-black dark:bg-[#e8688a]/10 dark:border dark:border-[#e8688a]/30 px-4 py-3.5 text-[12px] font-semibold tracking-wider uppercase text-white dark:text-[#f0a0c0] shadow-sm transition-all hover:bg-[#632034] dark:hover:bg-[#e8688a]/20 dark:hover:text-white hover:shadow-lg active:scale-[0.98] hover:cursor-pointer"
          >
            {isAuthenticated ? "Proceder al pago" : "Inicie sesión para continuar"}
          </button>

          <p className="checkout-security mt-2 text-center text-[11px] font-medium text-[#594246]/55 dark:text-[#f0d8e8]/50">
            Pago 100% seguro y protegido
          </p>
        </>
      )}
    </aside>
  );
};