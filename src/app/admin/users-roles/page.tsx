"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, LayoutDashboard, ShoppingBag, Box, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CTA, SelectInput } from "@/components/atoms";
import { DataTable } from "@/components/organisms/data-table/data-table";
import { useManagementStore } from "@/hooks";

// --- Mapeo de Iconos (Para la UI de permisos) ---
const ICON_MAP: Record<string, any> = {
    dashboard: LayoutDashboard,
    catalog: ShoppingBag,
    inventory: Box,
    orders: Ticket,
};

// --- Mapeo de nombres amigables ---
const MODULE_LABELS: Record<string, string> = {
    dashboard: "Panel de Control",
    catalog: "Catálogo",
    inventory: "Inventario",
    orders: "Ventas y Órdenes",
};

export default function UsuariosRolesPage() {
    const {
        users,
        roles,
        loading,
        total,
        currentPage,
        rowsPerPage,
        searchTerm,
        setSearchTerm,
        setPageGlobal,
        setRowsPerPageGlobal,
        startLoadingUsers,
        startLoadingRoles
    } = useManagementStore();

    const [activeTab, setActiveTab] = useState<"usuarios" | "roles">("usuarios");
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    useEffect(() => {
        startLoadingUsers();
        startLoadingRoles();
    }, [startLoadingUsers, startLoadingRoles]);

    useEffect(() => {
        if (roles.length > 0 && !selectedRoleId) {
            setSelectedRoleId(roles[0].id);
        }
    }, [roles, selectedRoleId]);

    const selectedRole = roles.find(r => r.id === selectedRoleId);

    // Agrupamiento simple de permisos por el prefijo (dashboard:, catalog:, etc)
    const groupedPermissions = selectedRole?.permissions.reduce((acc: any, perm: string) => {
        const [module] = perm.split(':');
        if (!acc[module]) acc[module] = [];
        acc[module].push(perm);
        return acc;
    }, {}) || {};

    const handleEditPermissions = (roleName: string) => {
        const found = roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
        if (found) setSelectedRoleId(found.id);
        setActiveTab("roles");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="space-y-8">
            {/* Cabecera Estilo Oficial */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#5B283A]">Gestión de Usuarios</h1>
                    <p className="text-sm text-gray-500">Configuración de perfiles y niveles de acceso.</p>
                </div>

                <div className="flex bg-neutral-100 p-1 rounded-2xl border">
                    <button onClick={() => setActiveTab("usuarios")} className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "usuarios" ? "bg-white text-[#5B283A] shadow-sm" : "text-gray-400"}`}>Usuarios</button>
                    <button onClick={() => setActiveTab("roles")} className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "roles" ? "bg-white text-[#5B283A] shadow-sm" : "text-gray-400"}`}>Permisos</button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "usuarios" ? (
                    <motion.div key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <DataTable
                            title="Usuarios"
                            description="Lista de usuarios vinculados a la base de datos real."
                            rows={users}
                            loading={loading}
                            total={total}
                            page={currentPage}
                            rowsPerPage={rowsPerPage}
                            onPageChange={(_, page) => setPageGlobal(page)}
                            onRowsPerPageChange={(e) => setRowsPerPageGlobal(parseInt(e.target.value))}
                            globalFilter={searchTerm}
                            onGlobalFilterChange={setSearchTerm}
                            columns={[
                                { id: "name", label: "Nombre", sortable: true },
                                { id: "email", label: "Correo", sortable: true },
                                { id: "role", label: "Rol", sortable: true }
                            ]}
                            hasActions={true}
                            actions={[{
                                label: "Configurar Accesos",
                                onClick: (row: any) => handleEditPermissions(row.role)
                            }]}
                        />
                    </motion.div>
                ) : (
                    <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between bg-white p-8 rounded-2xl border shadow-sm">
                            <div>
                                <h2 className="text-2xl font-bold text-[#5B283A]">Control de Accesos</h2>
                                <p className="text-sm text-gray-400">Permisos definidos en el servidor para cada rol.</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right mr-4">
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Rol actual:</p>
                                    <p className="text-lg font-bold text-[#5B283A]">{selectedRole?.name}</p>
                                </div>
                                <SelectInput
                                    label="Cambiar Rol"
                                    value={selectedRoleId}
                                    onChange={(e) => setSelectedRoleId(e.target.value)}
                                    options={roles.map(r => ({ label: r.name, value: r.id }))}
                                    containerClassName="w-48"
                                />
                            </div>
                        </div>

                        <div className="bg-white border rounded-[2rem] shadow-sm overflow-hidden min-h-[500px]">
                            <div className="p-10 border-b border-gray-100 bg-gray-50/20">
                                <h3 className="text-xl font-bold">Resumen de Permisos</h3>
                                <p className="text-sm text-gray-400 mt-1">Los permisos son gestionados desde el servidor según la lógica de negocio.</p>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {Object.keys(groupedPermissions).map(module => {
                                    const Icon = ICON_MAP[module] || ShieldCheck;
                                    return (
                                        <div key={module} className="p-10 hover:bg-gray-50/30 transition-colors">
                                            <div className="flex flex-col md:flex-row gap-10">
                                                <div className="md:w-5/12 flex items-start gap-6">
                                                    <div className="p-3 bg-pink-50 text-[#5B283A] rounded-xl">
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 capitalize">{MODULE_LABELS[module] || module}</h4>
                                                        <p className="text-xs text-gray-400 mt-1">Acciones autorizadas para este módulo.</p>
                                                    </div>
                                                </div>
                                                <div className="md:w-7/12 space-y-4">
                                                    {groupedPermissions[module].map((p: string) => (
                                                        <div key={p} className="flex items-start gap-4">
                                                            <div className="mt-1 h-5 w-5 rounded-md bg-green-50 border border-green-200 flex items-center justify-center">
                                                                <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={4} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className="text-[15px] font-bold text-gray-700">{p}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
import { ShieldCheck } from "lucide-react";
