"use client";

import { WorkerOption } from "./types";

type WorkerSelectorProps = {
	workerId: string;
	onWorkerChange: (id: string) => void;
	workers: WorkerOption[];
	loadingWorkers: boolean;
	authRole: string;
	selectedWorkerLabel: string;
};

export const WorkerSelector = ({
	workerId,
	onWorkerChange,
	workers,
	loadingWorkers,
	authRole,
	selectedWorkerLabel,
}: WorkerSelectorProps) => {
	const isAdmin = authRole === "Administrador";

	return (
		<article className="rounded-2xl border border-[#f2b6c1]/70 bg-white p-4">
			<div className="flex items-end justify-between gap-3">
				<div>
					<p className="text-sm font-semibold text-[#594246]">Trabajador responsable</p>
					<p className="text-[11px] text-[#9e8a91]">
						{isAdmin ? "Selecciona el trabajador que registrará la orden." : "Se usará tu usuario actual para la orden."}
					</p>
				</div>
			</div>

			<div className="mt-3 space-y-2">
				{isAdmin ? (
					<select
						value={workerId}
						onChange={(e) => onWorkerChange(e.target.value)}
						disabled={loadingWorkers}
						className="h-10 w-full rounded-lg border border-[#f2b6c1] bg-white px-3 text-sm text-[#594246] outline-none disabled:opacity-60"
					>
						<option value="">{loadingWorkers ? "Cargando trabajadores..." : "Selecciona un trabajador"}</option>
						{workers.map((worker) => {
							const user = worker.id_user;
							const name =
								user && typeof user === "object"
									? [user.first_name, user.last_name].filter(Boolean).join(" ")
									: "";
							const label = name || (typeof user === "object" ? user?.email ?? worker._id : worker._id);
							return (
								<option key={worker._id} value={worker._id}>
									{label} {worker.role ? `(${worker.role})` : ""}
								</option>
							);
						})}
					</select>
				) : (
					<div className="rounded-lg border border-[#f2b6c1] bg-[#fff7f9] px-3 py-2 text-sm text-[#594246]">
						{selectedWorkerLabel}
					</div>
				)}
				{isAdmin && <p className="text-[11px] text-[#9e8a91]">El id enviado al backend será el `_id` del trabajador seleccionado.</p>}
			</div>
		</article>
	);
};
