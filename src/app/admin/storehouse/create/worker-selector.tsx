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
        <article className="rounded-[32px] border border-[#EAE0E2] dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-inner text-[#D6405F] dark:text-[#F8BBD0]">
                  <UserCircle className="h-7 w-7" />
                </div>
                <div>
                    <p className="text-[15px] font-medium tracking-wide text-[#40202D] dark:text-white">Trabajador responsable</p>
                    <p className="text-[11px] font-medium text-[#8C6B79] dark:text-gray-400 mt-0.5">
                        {isAdmin ? "Persona que registrará la orden" : "Tu usuario actual"}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                {isAdmin ? (
                    <select
                        value={workerId}
                        onChange={(e) => onWorkerChange(e.target.value)}
                        disabled={loadingWorkers}
                        className="h-12 w-full rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner disabled:opacity-50 appearance-none"
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
                    <div className="rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-3.5 text-[13px] font-bold text-[#40202D] dark:text-white shadow-inner">
                        {selectedWorkerLabel}
                    </div>
                )}
            </div>
        </article>
    );
};
