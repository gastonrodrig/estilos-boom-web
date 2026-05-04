"use client";

import { UserCircle } from "lucide-react";
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
        <article className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-[#F2778D]">
                  <UserCircle className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#594246]">Trabajador responsable</p>
                    <p className="text-[10px] text-[#9b8088]">
                        {isAdmin ? "Persona que registrará la orden" : "Tu usuario actual"}
                    </p>
                </div>
            </div>

            <div className="mt-4">
                {isAdmin ? (
                    <select
                        value={workerId}
                        onChange={(e) => onWorkerChange(e.target.value)}
                        disabled={loadingWorkers}
                        className="h-10 w-full rounded-xl border border-rose-100 bg-rose-50/30 px-3 text-sm text-[#594246] outline-none ring-[#F2778D] focus:ring-1 disabled:opacity-50"
                    >
                        <option value="">{loadingWorkers ? "Cargando..." : "Seleccionar trabajador"}</option>
                        {workers.map((worker) => {
                            const user = worker.id_user;
                            const name = user && typeof user === "object"
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
                    <div className="rounded-xl border border-rose-50 bg-rose-50/50 px-3 py-2.5 text-sm font-medium text-[#594246]">
                        {selectedWorkerLabel}
                    </div>
                )}
            </div>
        </article>
    );
};