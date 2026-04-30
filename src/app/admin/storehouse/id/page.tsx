"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CTA, Modal } from "@components";
import { useStorehouseStore } from "@hooks";

const supplierLabel = (supplier: unknown) => {
	if (typeof supplier === "string") {
		return supplier;
	}

	if (supplier && typeof supplier === "object" && "name_company" in supplier) {
		return String((supplier as { name_company?: string }).name_company ?? "-");
	}

	return "-";
};

export default function AdminStorehouseDetailPage() {
	const searchParams = useSearchParams();
	const orderId = searchParams.get("orderId") ?? "";
	const router = useRouter();
	const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
	const [openCreateConfirm, setOpenCreateConfirm] = useState(false);

	const {
		selectedOrder,
		loading,
		startLoadingPurchaseOrderById,
		startLoadingInventoryMovements,
	} = useStorehouseStore();

	useEffect(() => {
		if (!orderId) {
			return;
		}

		void Promise.all([
			startLoadingPurchaseOrderById(orderId),
			startLoadingInventoryMovements(),
		]);
	}, [orderId, startLoadingInventoryMovements, startLoadingPurchaseOrderById]);

	const totalUnits = useMemo(() => {
		return selectedOrder?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
	}, [selectedOrder]);

	const selectedTotal = useMemo(() => {
		return Object.values(selectedVariants).reduce((a, b) => a + b, 0);
	}, [selectedVariants]);

	if (!orderId) {
		return (
			<section className="rounded-3xl border border-[#f3e4e7] bg-white p-6 shadow-sm">
				<h1 className="font-(--font-vidaloka) text-2xl text-[#594246]">Detalle de orden</h1>
				<p className="mt-2 text-sm text-[#7e666e]">No se recibio el identificador de la orden.</p>
			</section>
		);
	}

	return (
		<section className="space-y-6">
			<header className="rounded-3xl border border-[#f2b6c1]/40 bg-linear-to-r from-[#fff7f9] to-[#ffffff] p-6 shadow-sm">
				<h1 className="font-(--font-vidaloka) text-3xl text-[#594246]">Detalle de orden</h1>
				<p className="mt-2 text-sm text-[#6e5a61]">Seguimiento operativo y trazabilidad de la recepcion.</p>
			</header>

			<article className="rounded-3xl border border-[#f3e4e7] bg-white p-6 shadow-sm">
				{loading && <p className="text-sm text-[#7e666e]">Cargando detalle...</p>}

				{!loading && !selectedOrder && (
					<p className="text-sm text-[#7e666e]">No se encontro informacion para esta orden.</p>
				)}

				{!loading && selectedOrder && (
					<div className="space-y-4">
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<div className="rounded-2xl bg-[#fff7f9] p-4">
								<p className="text-xs uppercase tracking-[0.08em] text-[#a66a79]">Orden</p>
								<p className="mt-2 text-lg font-semibold text-[#594246]">{selectedOrder.order_number}</p>
							</div>

							<div className="rounded-2xl bg-[#fff7f9] p-4">
								<p className="text-xs uppercase tracking-[0.08em] text-[#a66a79]">Proveedor</p>
								<p className="mt-2 text-lg font-semibold text-[#594246]">{supplierLabel(selectedOrder.id_supplier)}</p>
							</div>

							<div className="rounded-2xl bg-[#fff7f9] p-4">
								<p className="text-xs uppercase tracking-[0.08em] text-[#a66a79]">Estado</p>
								<p className="mt-2 text-lg font-semibold text-[#594246]">{selectedOrder.status}</p>
							</div>

							<div className="rounded-2xl bg-[#fff7f9] p-4">
								<p className="text-xs uppercase tracking-[0.08em] text-[#a66a79]">Unidades</p>
								<p className="mt-2 text-lg font-semibold text-[#594246]">{totalUnits}</p>
							</div>
						</div>

						<div className="rounded-2xl border border-[#f5ecee] p-4">
							<p className="font-semibold text-[#594246]">Items de la orden</p>

							<div className="mt-3 overflow-auto">
								<table className="w-full min-w-140 text-left text-sm">
									<thead>
										<tr className="text-[#8a6f77]">
											<th className="py-2">Variante</th>
											<th className="py-2">Cantidad</th>
											<th className="py-2">Costo unitario</th>
											<th className="py-2">Disponible</th>
											<th className="py-2">Seleccionar</th>
											<th className="py-2">Subtotal</th>
										</tr>
									</thead>
									<tbody>
											{selectedOrder.items.map((item, idx) => {
												const key = `${item.id_variant}-${idx}`;
												const isChecked = Boolean(selectedVariants[key]);
												return (
													<tr key={key} className="border-t border-[#f5ecee] text-[#594246]">
														<td className="py-2">{item.variant_label ?? item.id_variant}</td>
														<td className="py-2">{item.quantity}</td>
														<td className="py-2">S/ {item.unit_cost.toFixed(2)}</td>
														<td className="py-2">{typeof item.available_stock === 'number' ? item.available_stock : '-'}</td>
														<td className="py-2">
															<input
																type="checkbox"
																checked={isChecked}
																onChange={(e) => {
																if (e.target.checked) {
																	setSelectedVariants((s) => ({ ...s, [key]: item.quantity }));
																} else {
																	setSelectedVariants((s) => {
																		const copy = { ...s };
																		delete copy[key];
																		return copy;
																	});
																}
															}}
															/>
														</td>
														<td className="py-2">S/ {(item.quantity * item.unit_cost).toFixed(2)}</td>
													</tr>
												);
											})}
									</tbody>
								</table>
							</div>
						</div>

							{Object.keys(selectedVariants).length > 0 && (
								<div className="mt-4 rounded-2xl border border-[#f2b6c1]/40 bg-[#fff7f9] p-4">
									<p className="font-semibold text-[#594246]">Variantes Seleccionadas:</p>
									<ul className="mt-2 text-sm text-[#7e666e]">
										{Object.keys(selectedVariants).map((k) => {
											const parts = k.split("-");
											const id_variant = parts.slice(0, parts.length - 1).join("-");
											return (
												<li key={k} className="py-1">- {id_variant}: {selectedVariants[k]} uds</li>
											);
										})}
									</ul>
									<div className="mt-3 flex items-center justify-between">
										<p className="font-semibold">Total: {selectedTotal} unidades</p>
										<CTA onClick={() => {
											// save selection and navigate to create page
											if (!selectedOrder) return;
											const payload = {
												orderId: selectedOrder._id,
												items: Object.keys(selectedVariants).map((k) => {
													const id_variant = k.split("-").slice(0, -1).join("-");
													const found = selectedOrder.items.find((it: any) => String(it.id_variant) === String(id_variant));
													return { id_variant, quantity: selectedVariants[k], unit_cost: found?.unit_cost ?? 0 };
												}),
											};
											localStorage.setItem("abastecimiento_prefill", JSON.stringify(payload));
											router.push('/admin/storehouse/create');
										}}>
										Realizar Abastecimiento
										</CTA>
									</div>
								</div>
							)}

						<div className="flex justify-end">
							<CTA href="/admin/storehouse">Volver a planificacion</CTA>
						</div>
					</div>
				)}
			</article>
		</section>
	);
}
