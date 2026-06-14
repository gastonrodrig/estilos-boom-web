"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableColumn, DataTableAction, WorkerModal } from "@/components/organisms";
import { Trash2, UserCheck } from "lucide-react";
import { useManagementStore } from "@/hooks";
import type { WorkerRow } from "@store";

const STATUS_BADGE: Record<string, string> = {
  Activo:   "bg-emerald-50 text-emerald-700 border-emerald-100",
  Inactivo: "bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-100 dark:border-zinc-700",
};

export default function TrabajadoresPage() {
  const {
    workers,
    loadingWorkers,
    startLoadingWorkers,
    startUpdateWorker,
    startDeleteWorker,
  } = useManagementStore();

  const [modalOpen, setModalOpen]       = useState(false);
  const [searchTerm, setSearchTerm]     = useState("");
  const [currentPage, setCurrentPage]   = useState(0);
  const [rowsPerPage, setRowsPerPage]   = useState(10);
  const [orderBy, setOrderBy]           = useState("first_name");
  const [order, setOrder]               = useState<"asc" | "desc">("asc");

  useEffect(() => { void startLoadingWorkers(); }, [startLoadingWorkers]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return workers;
    const q = searchTerm.toLowerCase();
    return workers.filter((w) =>
      [w.first_name, w.last_name, w.email, w.document_number, w.worker_role, w.system_role, w.employment_status]
        .some((v) => v?.toLowerCase().includes(q))
    );
  }, [workers, searchTerm]);

  const columns: DataTableColumn<WorkerRow>[] = [
    { id: "first_name",        label: "Nombre",       sortable: true, width: "130px", truncate: true },
    { id: "last_name",         label: "Apellido",      sortable: true, width: "130px", truncate: true },
    { id: "email",             label: "Correo",        sortable: true, width: "200px", truncate: true },
    { id: "phone",             label: "Teléfono",                       width: "120px", truncate: true },
    { id: "document_type",     label: "Tipo Doc.",                      width: "90px",  truncate: true },
    { id: "document_number",   label: "N° Documento",                   width: "130px", truncate: true },
    
    {
      id: "system_role",
      label: "Rol Sistema",
      sortable: true,
      width: "130px",
      accessor: (row) => (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-100">
          {row.system_role}
        </span>
      ),
    },
    {
      id: "employment_status",
      label: "Estado",
      sortable: true,
      width: "100px",
      accessor: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_BADGE[row.employment_status] ?? "bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-400 border-gray-100 dark:border-zinc-700"}`}>
          {row.employment_status}
        </span>
      ),
    },
    { id: "hired_at", label: "Contratado", sortable: true, width: "110px", truncate: true },
  ];

  const actions: DataTableAction<WorkerRow>[] = [
    {
      label: "Cambiar estado",
      icon: <UserCheck className="h-4 w-4 text-blue-500" />,
      onClick: async (row) => {
        const makeActive = row.employment_status !== "Activo";
        await startUpdateWorker(row._id, { is_active: makeActive });
      },
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
      onClick: async (row) => {
        if (window.confirm(`¿Eliminar a ${row.first_name} ${row.last_name}?`)) {
          await startDeleteWorker(row._id);
        }
      },
    },
  ];

  return (
    <>
      <DataTable
        rows={filtered}
        loading={loadingWorkers}
        title="Gestión de Trabajadores"
        description="Administra el personal registrado. Filtra por nombre, correo, cargo o estado."
        onAddClick={() => setModalOpen(true)}
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
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setCurrentPage(0); }}
        actions={actions}
        hasActions
      />

      <WorkerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={startLoadingWorkers}
      />
    </>
  );
}
