"use client";

import { useEffect } from "react";
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
        <div className="bg-white border rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[700px]">
            {/* Header Principal */}
            <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/10">
                <div>
                    <h1 className="text-2xl font-bold text-[#5B283A]">Gestión de Usuarios</h1>
                    <p className="text-[12px] text-gray-400 font-medium font-outfit">Listado y estado de los usuarios del sistema.</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-auto">
                        <DataTable 
                            rows={users} 
                            loading={loading} 
                            total={total} 
                            page={currentPage} 
                            rowsPerPage={rowsPerPage} 
                            onPageChange={(_, p) => setPageGlobal(p)} 
                            onRowsPerPageChange={(e) => setRowsPerPageGlobal(parseInt(e.target.value))} 
                            globalFilter={searchTerm} 
                            onGlobalFilterChange={setSearchTerm} 
                            columns={[
                                { id: "name", label: "Nombre", sortable: true }, 
                                { id: "email", label: "Correo", sortable: true }, 
                                { id: "role", label: "Rol", sortable: true }
                            ]} 
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
