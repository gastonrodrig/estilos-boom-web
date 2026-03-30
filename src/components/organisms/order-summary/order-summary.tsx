"use client";

import { useRouter } from "next/navigation";
import { CartItem } from "@models";
import { useAppSelector } from "@store";

interface OrderSummaryProps {
  items: CartItem[];
  showButton?: boolean;
}

const currency = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);

export const OrderSummary = ({ items, showButton = true }: OrderSummaryProps) => {
  const router = useRouter();
  const authUid = useAppSelector((state) => state.auth.uid);
  const authStatus = useAppSelector((state) => state.auth.status);

  const isAuthenticated = Boolean(authUid) || authStatus === "authenticated";

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = total;
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
    <aside className="sticky top-28 rounded-2xl border border-[#F2D0D3] bg-white p-5 text-[#594246] shadow-[0_2px_16px_rgba(89,66,70,0.08)] md:p-6">
      <h3 className="text-[28px] leading-none font-semibold text-[#594246]">Resumen del Pedido</h3>

      <div className="mt-4 rounded-xl border border-[#F2D0D3] bg-[#FAF9F6] p-4">
        <p className="text-[13px] font-semibold text-[#594246]">Estilos Boom Rewards</p>
        <p className="mt-1 text-[13px] text-[#594246]/80">
          Podrías ganar <span className="font-semibold text-[#F2778D]">242 puntos</span> en esta compra.
        </p>
      </div>

      <div className="mt-5 space-y-3 text-[13px] font-medium text-[#594246]">
        <div className="flex items-center justify-between">
          <span>Subtotal (incluye IGV)</span>
          <span className="font-semibold">{currency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Envío</span>
          <span className="font-semibold">Ver al finalizar</span>
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

      <div className="my-5 h-px bg-[#EBEAE8]" />

      <div className="flex items-center justify-between text-[#594246]">
        <span className="text-[20px] font-semibold">Total</span>
        <span className="text-[30px] leading-none font-bold text-[#F2778D]">{currency(subtotal)}</span>
      </div>

      {showButton && (
        <>
          <button
            onClick={handlePrimaryAction}
            className="mt-5 w-full rounded-xl bg-[#F2778D] px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-[#FAF9F6] shadow-sm transition hover:bg-[#F291A3] hover:cursor-pointer"
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