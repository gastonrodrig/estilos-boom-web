"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableColumn, DataTableAction } from "@/components/organisms";
import { ShieldCheck, Users } from "lucide-react";
import { useManagementStore } from "@/hooks";
import toast from "react-hot-toast";
import type { RoleRow } from "@store";

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Administrador: "Acceso total al sistema: gestión de usuarios, inventario, finanzas y reportes.",
  Almacenero:    "Control de inventario, recepción y despacho de productos en almacén.",
  Cliente:       "Acceso al catálogo, historial de pedidos y configuración de cuenta.",
};

export default function WorkerTypePage() {
  const { roles, loadingRoles, startLoadingRoles } = useManagementStore();

  const [searchTerm, setSearchTerm]   = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy]         = useState("name");
  const [order, setOrder]             = useState<"asc" | "desc">("asc");

  useEffect(() => { void startLoadingRoles(); }, [startLoadingRoles]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return roles;
    const q = searchTerm.toLowerCase();
    return roles.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      (r.is_active ? "activo" : "inactivo").includes(q)
    );
  }, [roles, searchTerm]);

  const columns: DataTableColumn<RoleRow>[] = [
    {
      id: "name",
      label: "Nombre del Rol",
      sortable: true,
      width: "180px",
      accessor: (row) => (
        <span className="flex items-center gap-2 font-semibold text-sm text-[#40202D]">
          <ShieldCheck className="w-4 h-4 text-[#F2778D] shrink-0" />
          {row.name}
        </span>
      ),
    },
    {
      id: "permissions",
      label: "Descripción",
      accessor: (row) => (
        <span className="text-xs text-[#8C6B79] font-medium leading-snug">
          {ROLE_DESCRIPTIONS[row.name] ?? "Sin descripción definida."}
        </span>
      ),
    },
    {
      id: "user_count",
      label: "Usuarios",
      sortable: true,
      width: "100px",
      accessor: (row) => (
        <span className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#40202D]">
          <Users className="w-3.5 h-3.5 text-[#C4A9B5]" />
          {row.user_count}
        </span>
      ),
    },
    {
      id: "is_active",
      label: "Estado",
      sortable: true,
      width: "90px",
      accessor: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
          row.is_active
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-100 dark:border-zinc-700"
        }`}>
          {row.is_active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  const actions: DataTableAction<RoleRow>[] = [
    {
      label: "Ver usuarios con este rol",
      icon: <Users className="h-4 w-4 text-blue-400" />,
      onClick: (row) => {
        toast(`El rol "${row.name}" tiene ${row.user_count} usuario(s) asignado(s).`, {
          icon: "👥",
          style: { background: "#40202D", color: "#fff" },
        });
      },
      show: () => true,
    },
  ];

  return (
    <DataTable
      rows={filtered}
      loading={loadingRoles}
      title="Roles del Sistema"
      description="Roles disponibles con el conteo real de usuarios asignados. Los roles se asignan desde el perfil de cada usuario."
      onAddClick={() =>
        toast("Los roles del sistema están definidos por el enum Roles del backend.", { icon: "ℹ️" })
      }
      globalFilter={searchTerm}
      onGlobalFilterChange={(v) => { setSearchTerm(v); setCurrentPage(0); }}
      columns={columns}
      order={order}
      orderBy={orderBy}
      onRequestSort={(prop) => {
        const isAsc = orderBy === prop && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(prop);
      }}
      page={currentPage}
      rowsPerPage={rowsPerPage}
      total={filtered.length}
      onPageChange={(_, p) => setCurrentPage(p)}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(0);
      }}
      actions={actions}
      hasActions
    />
  );
}
