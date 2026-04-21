"use client";

import { useEffect, useState, useMemo } from "react";
import { Check, LayoutDashboard, ShoppingBag, Box, Ticket, ShieldPlus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CTA, Modal, TextInput } from "@/components/atoms";
import { DataTable } from "@/components/organisms/data-table/data-table";
import { useManagementStore } from "@/hooks";
import { toast } from "react-hot-toast";

const MODULE_GROUPS: Record<string, { label: string, desc: string, icon: any }> = {
    dashboard: { label: "Control", desc: "Métricas", icon: LayoutDashboard },
    production_group: { label: "Catálogo", desc: "Productos", icon: ShoppingBag },
    inventory_group: { label: "Almacén", desc: "Stock", icon: Box },
    logistics_group: { label: "Ventas", desc: "Pedidos", icon: Ticket },
};

const CONSOLIDATED_ITEMS = [
    { groupId: 'dashboard', id: 'dash_metrics', title: 'Ver métricas y estado del negocio', matches: (p: string) => p.startsWith('dashboard:') },
    { groupId: 'production_group', id: 'cat_view', title: 'Consultar productos y precios', matches: (p: string) => p.includes(':view') && (p.startsWith('products') || p.startsWith('categories') || p.startsWith('production')) },
    { groupId: 'production_group', id: 'cat_manage', title: 'Administrar catálogo completo', matches: (p: string) => (p.includes(':add') || p.includes(':edit') || p.includes(':manage')) && (p.startsWith('products') || p.startsWith('categories')) },
    { groupId: 'inventory_group', id: 'inv_view', title: 'Consultar stock y movimientos', matches: (p: string) => p.includes(':view') && p.includes('inventory') },
    { groupId: 'inventory_group', id: 'inv_manage', title: 'Gestionar entradas de almacén', matches: (p: string) => (p.includes(':create') || p.includes(':update')) && p.includes('inventory') },
    { groupId: 'logistics_group', id: 'log_view', title: 'Visualizar pedidos y estados', matches: (p: string) => p.includes(':view') && (p.startsWith('orders') || p.startsWith('procurement')) },
    { groupId: 'logistics_group', id: 'log_manage', title: 'Gestionar ventas y logística', matches: (p: string) => (p.includes(':manage') || p.includes(':update') || p.includes(':verify')) && (p.startsWith('orders') || p.startsWith('procurement')) }
];

export default function UsuariosRolesPage() {
    const {
        users, roles, loading, total, currentPage, rowsPerPage, searchTerm,
        setSearchTerm, setPageGlobal, setRowsPerPageGlobal, startLoadingUsers, startLoadingRoles, togglePermission, createNewRole
    } = useManagementStore();

    const [activeTab, setActiveTab] = useState<"usuarios" | "roles">("usuarios");
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [selectedPermsForNewRole, setSelectedPermsForNewRole] = useState<string[]>([]);
    const [isPermsModalOpen, setIsPermsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        startLoadingUsers(); startLoadingRoles();
    }, [startLoadingUsers, startLoadingRoles]);

    // EFECTO CRÍTICO: Asegurar que SIEMPRE haya un rol seleccionado si la lista no está vacía
    useEffect(() => {
        if (roles.length > 0) {
            const currentExists = roles.some(r => r.id === selectedRoleId);
            if (!selectedRoleId || !currentExists) {
                setSelectedRoleId(roles[0].id);
            }
        }
    }, [roles, selectedRoleId, activeTab]); // Escuchamos también el cambio de pestaña

    const selectedRole = useMemo(() => roles.find(r => r.id === selectedRoleId), [roles, selectedRoleId]);
    const activeConsolidatedItems = useMemo(() =>
        CONSOLIDATED_ITEMS.filter(item => selectedRole?.permissions?.some(p => item.matches(p))),
        [selectedRole]);

    const handleEditPermissions = (roleName: string | null) => {
        if (!roleName) return;
        const found = roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
        if (found) {
            setSelectedRoleId(found.id);
            setActiveTab("roles");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const resetModals = () => {
        setIsAddingRole(false);
        setIsPermsModalOpen(false);
        setNewRoleName("");
        setSelectedPermsForNewRole([]);
    };

    const handleCreateRoleFinal = async () => {
        if (!newRoleName.trim() || selectedPermsForNewRole.length === 0) return;
        setIsSaving(true);
        try {
            const technicalPerms: string[] = [];
            const permMap: Record<string, string[]> = {
                'dash_metrics': ['dashboard:view'],
                'cat_view': ['products:view', 'categories:view', 'production:view'],
                'cat_manage': ['products:add', 'products:edit', 'categories:edit'],
                'inv_view': ['products_inventory:view', 'supplies_inventory:view'],
                'inv_manage': ['products_inventory:update', 'supplies_inventory:create', 'supplies_inventory:update'],
                'log_view': ['orders:view', 'payments:view'],
                'log_manage': ['orders:manage', 'procurement:update']
            };
            selectedPermsForNewRole.forEach(id => {
                const perms = permMap[id] || [];
                perms.forEach(p => { if (!technicalPerms.includes(p)) technicalPerms.push(p); });
            });
            const newId = await createNewRole(newRoleName, technicalPerms);
            if (newId) setSelectedRoleId(newId);
            resetModals();
        } finally { setIsSaving(false); }
    };

    const togglePermInModal = (id: string) => {
        setSelectedPermsForNewRole(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    return (
        <div className="bg-white border rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[700px]">
            {/* Header Principal */}
            <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/10">
                <div>
                    <h1 className="text-2xl font-bold text-[#5B283A]">Usuarios y Roles</h1>
                    <p className="text-[12px] text-gray-400 font-medium font-outfit">Control de accesos y perfiles del sistema.</p>
                </div>
                <div className="flex bg-neutral-100 p-1 rounded-xl border shadow-inner">
                    {["usuarios", "roles"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-8 py-2 rounded-lg text-[12px] font-bold transition-all ${activeTab === tab ? "bg-white text-[#5B283A] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                            {tab === "usuarios" ? "Usuarios" : "Roles"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === "usuarios" ? (
                        <motion.div key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-auto">
                            <DataTable rows={users} loading={loading} total={total} page={currentPage} rowsPerPage={rowsPerPage} onPageChange={(_, p) => setPageGlobal(p)} onRowsPerPageChange={(e) => setRowsPerPageGlobal(parseInt(e.target.value))} globalFilter={searchTerm} onGlobalFilterChange={setSearchTerm} columns={[{ id: "name", label: "Nombre", sortable: true }, { id: "email", label: "Correo", sortable: true }, { id: "role", label: "Rol", sortable: true }]} hasActions actions={[{ label: "Configurar", onClick: (row: any) => handleEditPermissions(row.role) }]} />
                        </motion.div>
                    ) : (
                        <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Listado de Perfiles */}
                            <div className="w-full md:w-64 bg-gray-50/20 border-r border-gray-100 p-6 space-y-4 overflow-y-auto">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 font-outfit font-bold">Listado de Roles</p>
                                <div className="space-y-1.5 font-outfit">
                                    {roles.map(role => (
                                        <button key={role.id} onClick={() => setSelectedRoleId(role.id)} className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all ${selectedRoleId === role.id ? "bg-[#5B283A] text-white shadow-md shadow-[#5B283A]/10" : "text-gray-500 hover:bg-white"}`}>{role.name}</button>
                                    ))}
                                    <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-200 text-[11px] font-bold text-gray-400 hover:border-[#5B283A] transition-colors font-bold" onClick={() => setIsAddingRole(true)}>Añadir Rol +</button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                                <div className="px-7 py-5 border-b border-gray-50 bg-gray-50/5">
                                    <h3 className="text-md font-bold text-[#5B283A]">Configurando: <span className="text-gray-900 font-bold">{selectedRole?.name || "Cargando..."}</span></h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {Object.keys(MODULE_GROUPS).map(groupId => {
                                            const group = MODULE_GROUPS[groupId];
                                            const items = CONSOLIDATED_ITEMS.filter(i => i.groupId === groupId);
                                            return (
                                                <div key={groupId} className="p-5 bg-gray-50/30 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:border-gray-200 hover:shadow-sm">
                                                    <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-3">
                                                        <div className="p-1.5 bg-white rounded-lg shadow-sm text-[#5B283A]"><group.icon size={14} /></div>
                                                        <h4 className="text-[13px] font-bold text-gray-700">{group.label}</h4>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {items.map(item => {
                                                            const active = selectedRole?.permissions?.some(p => item.matches(p));
                                                            return (
                                                                <div key={item.id} onClick={() => togglePermission(selectedRoleId, item, !!active)} className="flex items-start gap-3 cursor-pointer group/item">
                                                                    <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center border transition-all ${active ? "bg-[#5B283A] border-[#5B283A] text-white shadow-xs" : "bg-white border-gray-200"}`}><Check size={10} strokeWidth={5} /></div>
                                                                    <p className={`text-[12px] font-bold ${active ? "text-gray-900" : "text-gray-400 group-hover/item:text-gray-700"}`}>{item.title}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-end pt-8 pb-4"><CTA className="px-12 py-3 text-[11px] shadow-lg shadow-[#5B283A]/10" onClick={() => toast.success("Guardado satisfactoriamente")}>Guardar Permisos del Rol</CTA></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal Principal de Creación */}
            <Modal open={isAddingRole} onClose={resetModals} title="Crear Rol">
                <div className="my-6 space-y-8">
                    <div className="px-2">
                        <TextInput label="Nombre del Rol" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} autoFocus />
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-outfit">Accesos Seleccionados</h3>
                            <button onClick={() => setIsPermsModalOpen(true)} className="flex items-center gap-1 text-[11px] font-bold text-pink-500 hover:text-pink-600 transition-all font-outfit bg-pink-50/50 px-3 py-1.5 rounded-full border border-pink-100">
                                <ShieldPlus size={14} /> Configurar
                            </button>
                        </div>
                        <div className="min-h-[100px] border-2 border-dashed border-gray-100 rounded-3xl p-6 flex flex-wrap gap-2 items-center justify-center">
                            {selectedPermsForNewRole.length > 0 ? (
                                selectedPermsForNewRole.map(id => {
                                    const item = CONSOLIDATED_ITEMS.find(i => i.id === id);
                                    return (
                                        <div key={id} className="px-4 py-2 bg-gray-50/10 rounded-xl border border-gray-100 flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-[#5B283A]" />
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{item?.title}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sin accesos configurados</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="pt-2"><CTA className="w-full py-4 text-[12px] shadow-lg rounded-full" onClick={handleCreateRoleFinal} disabled={!newRoleName.trim() || selectedPermsForNewRole.length === 0 || isSaving}>{isSaving ? "Guardando..." : "Crear Rol"}</CTA></div>
            </Modal>

            {/* Modal de Configuración - Doble Columna / Sin Scroll */}
            <Modal
                open={isPermsModalOpen}
                onClose={() => setIsPermsModalOpen(false)}
                title="Configurar Accesos"
                panelClassName="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-10 space-y-6"
            >
                <div className="grid grid-cols-2 gap-6">
                    {Object.keys(MODULE_GROUPS).map(groupId => {
                        const group = MODULE_GROUPS[groupId];
                        const items = CONSOLIDATED_ITEMS.filter(i => i.groupId === groupId);
                        return (
                            <div key={groupId} className="p-5 bg-gray-50/30 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-2">
                                    <div className="bg-white p-1.5 rounded shadow-xs text-[#5B283A]"><group.icon size={13} /></div>
                                    <span className="text-[11px] font-bold text-gray-700 uppercase">{group.label}</span>
                                </div>
                                <div className="space-y-3.5">
                                    {items.map(item => {
                                        const active = selectedPermsForNewRole.includes(item.id);
                                        return (
                                            <div key={item.id} onClick={() => togglePermInModal(item.id)} className="flex items-start gap-3 cursor-pointer group">
                                                <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center border transition-all ${active ? "bg-[#5B283A] border-[#5B283A] text-white shadow-xs" : "bg-white border-gray-200"}`}><Check size={10} strokeWidth={5} /></div>
                                                <p className={`text-[11px] font-bold leading-tight ${active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"}`}>{item.title}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="pt-4"><CTA className="w-full py-4 text-[12px] shadow-lg rounded-full" onClick={() => setIsPermsModalOpen(false)}>Guardar Selección</CTA></div>
            </Modal>
        </div>
    );
}
