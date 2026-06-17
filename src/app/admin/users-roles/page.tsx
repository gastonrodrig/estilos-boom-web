"use client";

import { useEffect, useState, useMemo } from "react";
import { Check, LayoutDashboard, ShoppingBag, Box, Ticket, ShieldPlus, ArrowRight, Trash2, ShieldCheck, Plus } from "lucide-react";
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
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
            {/* Header Principal */}
            <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 w-full transition-colors duration-500">
                <div className="flex-1">
                    <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }} className="mb-2 text-[#8B3A52] opacity-60 dark:text-white dark:opacity-35 font-medium uppercase tracking-widest flex items-center gap-2">
                        <span>ACCESOS</span>
                    </div>
                    <h1 className="text-[#40202D] dark:text-white leading-none mb-2" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2.5rem', fontWeight: 300 }}>
                        Usuarios y Roles
                    </h1>
                    <p className="text-[#8C6B79] dark:text-white tracking-[0.03em] mt-3" style={{ fontSize: '0.78rem', opacity: 0.45 }}>
                        Control de accesos y perfiles del sistema.
                    </p>
                </div>
                <div className="flex bg-white/50 dark:bg-black/50 p-1 rounded-xl border border-[#EAE0E2] dark:border-white/10 shadow-inner backdrop-blur-md">
                    {["usuarios", "roles"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-8 py-2 rounded-lg text-[12px] font-bold transition-all tracking-wider uppercase ${activeTab === tab ? "bg-white/80 dark:bg-white/10 text-[#40202D] dark:text-white shadow-sm" : "text-[#8C6B79] dark:text-gray-500 hover:text-[#40202D] dark:hover:text-white"}`}>
                            {tab === "usuarios" ? "Usuarios" : "Roles"}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === "usuarios" ? (
                        <motion.div key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-auto">
                            <DataTable containerClassName="w-full h-full flex flex-col bg-transparent" rows={users} loading={loading} total={total} page={currentPage} rowsPerPage={rowsPerPage} onPageChange={(_, p) => setPageGlobal(p)} onRowsPerPageChange={(e) => setRowsPerPageGlobal(parseInt(e.target.value))} globalFilter={searchTerm} onGlobalFilterChange={setSearchTerm} columns={[{ id: "name", label: "Nombre", sortable: true }, { id: "email", label: "Correo", sortable: true }, { id: "role", label: "Rol", sortable: true }]} hasActions actions={[{ label: "Configurar", onClick: (row: any) => handleEditPermissions(row.role) }]} />
                        </motion.div>
                    ) : (
                        <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Listado de Perfiles */}
                            <div className="w-full md:w-64 bg-white/30 dark:bg-white/5 border-r border-[#EAE0E2] dark:border-white/10 p-6 space-y-4 overflow-y-auto backdrop-blur-md">
                                <p className="text-[10px] font-bold text-[#8C6B79] dark:text-gray-500 uppercase tracking-widest px-2">Listado de Roles</p>
                                <div className="space-y-1.5">
                                    {roles.map(role => (
                                        <button key={role.id} onClick={() => setSelectedRoleId(role.id)} className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all ${selectedRoleId === role.id ? "bg-white/80 dark:bg-white/10 text-[#40202D] dark:text-white shadow-sm border border-[#EAE0E2] dark:border-white/20" : "text-[#8C6B79] dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 border border-transparent"}`}>{role.name}</button>
                                    ))}
                                    <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#EAE0E2] dark:border-white/20 text-[11px] font-bold text-[#8C6B79] dark:text-gray-400 hover:border-[#D6405F] dark:hover:border-[#F8BBD0] hover:text-[#D6405F] dark:hover:text-[#F8BBD0] transition-colors uppercase tracking-widest" onClick={() => setIsAddingRole(true)}>Añadir Rol +</button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
                                <div className="px-7 py-5 border-b border-[#EAE0E2] dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-md">
                                    <h3 className="text-md font-bold text-[#8C6B79] dark:text-gray-400 tracking-wide">Configurando: <span className="text-[#40202D] dark:text-white font-medium">{selectedRole?.name || "Cargando..."}</span></h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {Object.keys(MODULE_GROUPS).map(groupId => {
                                            const group = MODULE_GROUPS[groupId];
                                            const items = CONSOLIDATED_ITEMS.filter(i => i.groupId === groupId);
                                            return (
                                                <div key={groupId} className="p-5 bg-white/50 dark:bg-white/5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:border-[#D6405F] dark:hover:border-[#F8BBD0] hover:shadow-sm backdrop-blur-md group/card">
                                                    <div className="flex items-center gap-3 mb-5 border-b border-[#EAE0E2] dark:border-white/10 pb-3">
                                                        <div className="p-1.5 bg-white dark:bg-zinc-800 rounded-lg shadow-sm text-[#D6405F] dark:text-[#F8BBD0] border border-[#EAE0E2] dark:border-white/5"><group.icon size={14} /></div>
                                                        <h4 className="text-[13px] font-medium text-[#40202D] dark:text-white tracking-wide">{group.label}</h4>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {items.map(item => {
                                                            const active = selectedRole?.permissions?.some(p => item.matches(p));
                                                            return (
                                                                <div key={item.id} onClick={() => togglePermission(selectedRoleId, item, !!active)} className="flex items-start gap-3 cursor-pointer group/item">
                                                                    <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center border transition-all ${active ? "bg-emerald-500 border-emerald-500 text-white shadow-xs" : "bg-white/50 dark:bg-black/50 border-[#EAE0E2] dark:border-white/20"}`}><Check size={10} strokeWidth={5} /></div>
                                                                    <p className={`text-[12px] font-bold tracking-wide ${active ? "text-[#40202D] dark:text-white" : "text-[#8C6B79] dark:text-gray-400 group-hover/item:text-[#40202D] dark:group-hover/item:text-white"}`}>{item.title}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-end pt-8 pb-4"><CTA className="px-12 py-3 text-[11px] shadow-lg shadow-[#D6405F]/10 dark:shadow-none" onClick={() => toast.success("Guardado satisfactoriamente")}>Guardar Permisos del Rol</CTA></div>
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
                            <h3 className="text-sm font-semibold text-[#594246]">Accesos configurados</h3>
                            <button
                                type="button"
                                onClick={() => setIsPermsModalOpen(true)}
                                className="flex items-center gap-1 text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors font-outfit"
                            >
                                <Plus size={14} />
                                Configurar accesos
                            </button>
                        </div>

                        <div className="space-y-3">
                            {selectedPermsForNewRole.length > 0 ? (
                                selectedPermsForNewRole.map(id => {
                                    const item = CONSOLIDATED_ITEMS.find(i => i.id === id);
                                    const group = item ? MODULE_GROUPS[item.groupId] : null;
                                    const Icon = group?.icon || ShieldCheck;

                                    return (
                                        <div key={id} className="p-4 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-[#EAE0E2] dark:border-white/10 flex items-center gap-4 group animate-in slide-in-from-right-2">
                                            <div className="bg-white dark:bg-zinc-800 border border-[#EAE0E2] dark:border-white/5 p-2 rounded-xl shadow-sm text-[#D6405F] dark:text-[#F8BBD0]">
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-[#40202D] dark:text-white truncate tracking-wide">
                                                    {item?.title}
                                                </p>
                                                <p className="text-[10px] text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest font-bold">
                                                    Módulo: {group?.label}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => togglePermInModal(id)}
                                                className="p-2 text-[#8C6B79] dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed border-[#EAE0E2] dark:border-white/20 rounded-3xl">
                                    <p className="text-xs text-[#8C6B79] dark:text-gray-500 uppercase tracking-widest font-bold">Sin accesos configurados</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="pt-2"><CTA className="w-full" onClick={handleCreateRoleFinal} disabled={!newRoleName.trim() || selectedPermsForNewRole.length === 0 || isSaving}>{isSaving ? "Guardando..." : "Crear Rol"}</CTA></div>
            </Modal>

            {/* Modal de Configuración - Doble Columna / Sin Scroll */}
            <Modal
                open={isPermsModalOpen}
                onClose={() => setIsPermsModalOpen(false)}
                title="Configurar Accesos"
                panelClassName="relative bg-white/90 dark:bg-black/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-10 space-y-6 border border-[#EAE0E2] dark:border-white/10"
            >
                <div className="grid grid-cols-2 gap-6">
                    {Object.keys(MODULE_GROUPS).map(groupId => {
                        const group = MODULE_GROUPS[groupId];
                        const items = CONSOLIDATED_ITEMS.filter(i => i.groupId === groupId);
                        return (
                            <div key={groupId} className="p-5 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-[#EAE0E2] dark:border-white/10 hover:border-[#D6405F] dark:hover:border-[#F8BBD0] transition-colors">
                                <div className="flex items-center gap-3 mb-4 border-b border-[#EAE0E2] dark:border-white/10 pb-2">
                                    <div className="bg-white dark:bg-zinc-800 p-1.5 rounded-lg shadow-sm text-[#D6405F] dark:text-[#F8BBD0] border border-[#EAE0E2] dark:border-white/5"><group.icon size={13} /></div>
                                    <span className="text-[11px] font-medium text-[#40202D] dark:text-white uppercase tracking-wider">{group.label}</span>
                                </div>
                                <div className="space-y-3.5">
                                    {items.map(item => {
                                        const active = selectedPermsForNewRole.includes(item.id);
                                        return (
                                            <div key={item.id} onClick={() => togglePermInModal(item.id)} className="flex items-start gap-3 cursor-pointer group">
                                                <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center border transition-all ${active ? "bg-emerald-500 border-emerald-500 text-white shadow-xs" : "bg-white/50 dark:bg-black/50 border-[#EAE0E2] dark:border-white/20"}`}><Check size={10} strokeWidth={5} /></div>
                                                <p className={`text-[11px] font-bold leading-tight tracking-wide ${active ? "text-[#40202D] dark:text-white" : "text-[#8C6B79] dark:text-gray-400 group-hover:text-[#40202D] dark:group-hover:text-white"}`}>{item.title}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="pt-4"><CTA className="w-full py-4 text-[12px] shadow-lg rounded-2xl" onClick={() => setIsPermsModalOpen(false)}>Guardar Selección</CTA></div>
            </Modal>
        </div>
    );
}
