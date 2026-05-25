"use client";

import { useEffect, useState } from 'react';
import { DataTable, DataTableAction, DataTableColumn, ClientPersonModal } from '@/components/organisms';
import { ClientPerson } from '@models';
import { useClientPersonStore } from '@hooks';
import { Pencil } from 'lucide-react';


interface WorkerData {
  id_worker: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  document_type: string;
  document_number: string;
  status: string; 
}

export default function TrabajadoresPage() {
  const [isOpenModal, setIsModalOpen] = useState(false);

 
  const columns: DataTableColumn<WorkerData>[] = [
    { id: 'first_name', label: 'Nombre', sortable: true, width: '140px', truncate: true },
    { id: 'last_name', label: 'Apellido', sortable: true, width: '140px', truncate: true },
    { id: 'email', label: 'Correo', sortable: true, width: '140px', truncate: true },
    { id: 'phone', label: '# Telefono', sortable: true, width: '140px', truncate: true },
    { id: 'document_type', label: 'Tipo Doc', sortable: true, width: '120px', truncate: true },
    { id: 'document_number', label: '# Documento', sortable: true, width: '140px', truncate: true },
    { id: 'status', label: 'Estado', sortable: true, width: '140px', truncate: true }, // 👈 Usa 'status'
  ];


  const actions: DataTableAction<WorkerData>[] = [
    {
      label: "Editar",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (row: WorkerData) => {

        setIsModalOpen(true);
        alert(`Abriendo edición para: ${row.first_name}`);
      },
    },
  ];

 
  const [datosDePrueba] = useState<WorkerData[]>([
    { 
      id_worker: 'WRK-001',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan.perez@gmail.com',
      phone: '987654321',
      document_type: 'DNI',
      document_number: '76543210',
      status: 'Activo',
    },
    { 
      id_worker: 'WRK-002',
      first_name: 'María',
      last_name: 'Gómez',
      email: 'maria.gomez@gmail.com',
      phone: '912345678',
      document_type: 'CE',
      document_number: '001122334',
      status: 'Inactivo', 
    },
  ]);


  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  return (
    <>
      <DataTable
        rows={refreshClientsPerson}
        loading={loading}
        title="Clientes - Persona"
        description="Gestiona clientes persona, filtra por cualquier campo y aplica acciones rápidas."
        onAddClick={() => setIsModalOpen(true)}
        globalFilter={searchTerm}
        onGlobalFilterChange={setSearchTerm}
        columns={columns}
        order={order as "asc" | "desc"}
        orderBy={orderBy}
        onRequestSort={(prop) => {
          const isAsc = orderBy === prop && order === 'asc';
          setOrder(isAsc ? 'desc' : 'asc');
          setOrderBy(prop);
        }}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        total={total}
        onPageChange={(_, newPage) => setPageGlobal(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPageGlobal(parseInt(e.target.value, 10));
          setPageGlobal(0);
        }}
        actions={actions}
        hasActions
      />
      <ClientPersonModal
        open={isOpenModal}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}