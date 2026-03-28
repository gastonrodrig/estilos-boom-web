"use client";

import { CartItem } from "@models";

interface OrderSummaryProps {
	items: CartItem[];
}

const currency = (value: number) =>
	new Intl.NumberFormat("es-PE", {
		style: "currency",
		currency: "PEN",
		minimumFractionDigits: 2,
	}).format(value);

export const OrderSummary = ({ items }: OrderSummaryProps) => {
	const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
	const subtotal = total;
	const igv = subtotal * 0.18;
	const taxedOperation = subtotal * 0.82;

	return (
		<aside className="sticky top-28 rounded-2xl border border-[#F2D0D3] bg-white p-6 shadow-[0_2px_16px_rgba(89,66,70,0.08)]">
			<h3 className="text-3xl font-normal text-[#594246]">Resumen del Pedido</h3>

			<div className="mt-4 rounded-xl border border-[#F2D0D3] bg-[#FAF9F6] p-4">
				<p className="text-sm font-semibold text-[#594246]">Estilos Boom Rewards</p>
				<p className="mt-1 text-sm text-[#594246]/80">
					Podrias ganar <span className="font-semibold text-[#F2778D]">242 puntos</span> en esta compra.
				</p>
			</div>

			<div className="mt-6 space-y-3.5 text-sm font-medium text-[#594246]">
				<div className="flex items-center justify-between">
					<span>Subtotal (incluye IGV)</span>
					<span className="font-medium">{currency(subtotal)}</span>
				</div>
				<div className="flex items-center justify-between">
					<span>Envío</span>
					<span className="font-medium">Ver al finalizar</span>
				</div>
				<div className="flex items-center justify-between">
					<span>IGV (18%)</span>
					<span className="font-medium">{currency(igv)}</span>
				</div>
				<div className="flex items-center justify-between">
					<span>Op. gravada</span>
					<span className="font-medium">{currency(taxedOperation)}</span>
				</div>
			</div>

			<div className="my-6 h-px bg-[#EBEAE8]" />

			<div className="flex items-center justify-between text-[#594246]">
				<span className="text-lg font-semibold">Total</span>
				<span className="text-3xl font-bold text-[#F2778D]">{currency(subtotal)}</span>
			</div>

			<button className="mt-6 w-full rounded-xl bg-[#F2778D] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#FAF9F6] shadow-sm transition hover:bg-[#F291A3]">
				Proceder al pago
			</button>
			<p className="mt-2 text-center text-xs font-medium text-[#594246]/55">Pago 100% seguro y protegido</p>
		</aside>
	);
};
