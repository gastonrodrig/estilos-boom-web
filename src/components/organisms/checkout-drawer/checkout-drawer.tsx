"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { CartItem } from "@models";

interface CheckoutDrawerProps {
	open: boolean;
	onClose: () => void;
	item?: CartItem;
}

export const CheckoutDrawer = ({ open, onClose, item }: CheckoutDrawerProps) => {
	useEffect(() => {
		if (open) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "";

		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						className="fixed inset-0 z-60 bg-black/35"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>

					<motion.aside
						className="fixed right-0 top-0 z-70 h-full w-full max-w-md bg-[#FAF9F6] shadow-2xl"
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", stiffness: 300, damping: 35 }}
					>
						<div className="flex h-full flex-col p-7">
							<div className="flex items-center justify-between border-b border-[#EBEAE8] pb-4">
								<p className="text-sm font-semibold uppercase tracking-wide text-[#594246]">1 item added</p>
								<button
									onClick={onClose}
									className="rounded-full p-2 text-[#594246] transition hover:bg-[#F2D0D3]/45"
									aria-label="Cerrar drawer"
								>
									<X size={18} />
								</button>
							</div>

							<div className="mt-6 rounded-2xl border border-[#F2D0D3] bg-white p-4 shadow-sm">
								{item ? (
									<div className="flex gap-4">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={item.image}
											alt={item.name}
											className="h-24 w-18 rounded-lg border border-[#EBEAE8] object-cover"
										/>
										<div className="space-y-1.5">
											<h4 className="text-base font-medium text-[#594246]">{item.name}</h4>
											<p className="text-xs font-medium uppercase tracking-wide text-[#594246]/75">
												{item.color} | {item.size}
											</p>
											<p className="text-lg font-bold text-[#F2778D]">
												S/ {item.price.toFixed(2)}
											</p>
										</div>
									</div>
								) : (
									<p className="text-sm text-[#594246]/70">No hay producto seleccionado.</p>
								)}
							</div>

							<div className="mt-auto space-y-3 border-t border-[#EBEAE8] pt-5">
								<Link
									href="/catalogue/new-in"
									onClick={onClose}
									className="block rounded-xl border border-[#594246] px-4 py-3 text-center text-sm font-semibold text-[#594246] transition hover:bg-[#594246] hover:text-[#FAF9F6]"
								>
									Continuar comprando
								</Link>

								<Link
									href="/cart"
									onClick={onClose}
									className="block rounded-xl bg-[#F2778D] px-4 py-3 text-center text-sm font-semibold text-[#FAF9F6] shadow-sm transition hover:bg-[#F291A3]"
								>
									Continuar con la compra
								</Link>
							</div>
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
};
