"use client";

import { useEffect, useState, useMemo } from "react";
import { Check, LayoutDashboard, ShoppingBag, Box, Ticket, ShieldPlus, ArrowRight, Trash2, ShieldCheck, Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DataTable } from "@/components/organisms/data-table/data-table";
import { useManagementStore } from "@/hooks";

export default function UsuariosRolesPage() {
    const {
        users, loading, total, currentPage, rowsPerPage, searchTerm,
        setSearchTerm, setPageGlobal, setRowsPerPageGlobal, startLoadingUsers
    } = useManagementStore();

    useEffect(() => {
        startLoadingUsers(); 
    }, [startLoadingUsers]);

    return (
        <div className="flex flex-col min-h-[700px] transition-colors duration-500">
            {/* Header Principal */}
            <div className="flex flex-col gap-4 pt-8 pb-4 md:flex-row md:items-center justify-between">
                <div>
                    <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }} className="mb-2 text-[#8B3A52] opacity-60 dark:text-white dark:opacity-35 font-medium">Inicio / Ajustes / Usuarios y Roles</div>
                    <h2 className="text-[#40202D] dark:text-white leading-none" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2rem', fontWeight: 300 }}>Usuarios y Roles</h2>
                    <p className="text-[#8C6B79] dark:text-white tracking-[0.03em] mt-3" style={{ fontSize: '0.78rem', opacity: 0.45 }}>Control de accesos y perfiles del sistema.</p>
                </div>
                <div className="flex bg-white/50 dark:bg-black/50 p-1 rounded-xl border border-[rgba(212,175,55,0.15)] shadow-inner backdrop-blur-md">
                    {["usuarios", "roles"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-8 py-2.5 rounded-lg text-[10px] font-bold transition-all tracking-wider uppercase ${activeTab === tab ? "bg-gradient-to-r from-[rgba(139,58,82,0.8)] to-[rgba(139,58,82,0.6)] dark:from-[rgba(139,58,82,0.8)] dark:to-[rgba(212,175,55,0.4)] text-white shadow-sm" : "text-[#8C6B79] dark:text-gray-400 hover:text-[#40202D] dark:hover:text-white"}`}>
                            {tab === "usuarios" ? "Usuarios" : "Roles"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === "usuarios" ? (
                        <motion.div key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="relative w-full sm:w-80 mb-6">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#a08088]" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar usuario..."
                                    className="w-full rounded-[10px] border border-[#EAE0E2] dark:border-[rgba(255,255,255,0.15)] bg-white/80 dark:bg-[rgba(255,255,255,0.08)] py-[10px] pl-[44px] pr-[16px] text-sm text-[#40202D] dark:text-[#e8d8dc] shadow-md dark:shadow-none focus:border-[#D6405F] dark:focus:border-[rgba(139,58,82,0.5)] focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-[#a08088]"
                                />
                            </div>
                            <DataTable rows={users} loading={loading} total={total} page={currentPage} rowsPerPage={rowsPerPage} onPageChange={(_, p) => setPageGlobal(p)} onRowsPerPageChange={(e) => setRowsPerPageGlobal(parseInt(e.target.value))} globalFilter={searchTerm} columns={[{ id: "name", label: "Nombre", sortable: true }, { id: "email", label: "Correo", sortable: true }, { id: "role", label: "Rol", sortable: true }]} hasActions actions={[{ label: "Configurar", onClick: (row: any) => handleEditPermissions(row.role) }]} />
                        </motion.div>
                    ) : (
                        <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-[#faf5f0] dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-[2rem] overflow-hidden transition-[background-color,border-color] duration-[600ms] flex flex-col md:flex-row mt-4 min-h-[500px]">
                            {/* Listado de Perfiles */}
                            <div className="w-full md:w-64 border-r border-[#EAE0E2] dark:border-[rgba(212,175,55,0.15)] p-6 space-y-4 overflow-y-auto">
                                <p className="text-[10px] font-bold text-[#8C6B79] dark:text-gray-500 uppercase tracking-widest px-2">Listado de Roles</p>
                                <div className="space-y-1.5">
                                    {roles.map(role => (
                                        <button key={role.id} onClick={() => setSelectedRoleId(role.id)} className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all ${selectedRoleId === role.id ? "bg-white/80 dark:bg-white/10 text-[#40202D] dark:text-white shadow-sm border border-[#EAE0E2] dark:border-white/20" : "text-[#8C6B79] dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 border border-transparent"}`}>{role.name}</button>
                                    ))}
                                    <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#EAE0E2] dark:border-white/20 text-[11px] font-bold text-[#8C6B79] dark:text-gray-400 hover:border-[#D6405F] dark:hover:border-[#F8BBD0] hover:text-[#D6405F] dark:hover:text-[#F8BBD0] transition-colors uppercase tracking-widest" onClick={() => setIsAddingRole(true)}>Añadir Rol +</button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
                                <div className="px-7 py-5 border-b border-[#EAE0E2] dark:border-[rgba(212,175,55,0.15)] bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc]">Configurando Rol: <span className="text-[#40202D] dark:text-white ml-2">{selectedRole?.name || "Cargando..."}</span></h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {Object.keys(MODULE_GROUPS).map(groupId => {
                                            const group = MODULE_GROUPS[groupId];
                                            const items = CONSOLIDATED_ITEMS.filter(i => i.groupId === groupId);
                                            return (
                                                <div key={groupId} className="p-5 bg-white/50 dark:bg-white/5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:border-[#D6405F] dark:hover:border-[#F8BBD0] hover:shadow-sm backdrop-blur-md group/card">
                                                    <div className="flex items-center gap-3 mb-5 border-b border-[#EAE0E2] dark:border-white/10 pb-3">
                                                        <div className="p-1.5 bg-white dark:bg-black/50 rounded-lg shadow-sm text-[#D6405F] dark:text-[#F8BBD0] border border-[#EAE0E2] dark:border-white/5"><group.icon size={14} /></div>
                                                        <h4 className="text-[13px] font-black text-[#40202D] dark:text-white tracking-wide">{group.label}</h4>
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
        </div>
    );
}
