"use client";

import { useState } from 'react';
import { DataTable, DataTableColumn, DataTableAction } from '@/components/organisms';
import { Pencil } from 'lucide-react';

// 1. Agregamos 'worker_type' a nuestro molde
interface WorkerData {
  id_worker: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  document_type: string;
  document_number: string;
  worker_type: string; // 👈 NUEVA COLUMNA PARA EL ROL
  status: string; 
}

export default function TrabajadoresPage() {
  const [isOpenModal, setIsModalOpen] = useState(false);

  // 2. Agregamos la columna a la tabla (la puse justo antes del Estado)
  const columns: DataTableColumn<WorkerData>[] = [
    { id: 'first_name', label: 'Nombre', sortable: true, width: '140px', truncate: true },
    { id: 'last_name', label: 'Apellido', sortable: true, width: '140px', truncate: true },
    { id: 'email', label: 'Correo', sortable: true, width: '140px', truncate: true },
    { id: 'phone', label: '# Telefono', sortable: true, width: '140px', truncate: true },
    { id: 'document_type', label: 'Tipo Doc', sortable: true, width: '120px', truncate: true },
    { id: 'document_number', label: '# Documento', sortable: true, width: '140px', truncate: true },
    { id: 'worker_type', label: 'Rol / Tipo', sortable: true, width: '140px', truncate: true }, // 👈 AQUÍ ESTÁ
    { id: 'status', label: 'Estado', sortable: true, width: '140px', truncate: true }, 
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

  // 3. Actualizamos los datos de prueba para que incluyan el rol
  const [datosDePrueba] = useState<WorkerData[]>([
    { 
      id_worker: 'WRK-001',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan.perez@gmail.com',
      phone: '987654321',
      document_type: 'DNI',
      document_number: '76543210',
      worker_type: 'Administrador', // 👈 DATO NUEVO
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
      worker_type: 'Vendedor', // 👈 DATO NUEVO
      status: 'Inactivo', 
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  return (
    <div className="p-6">
      <DataTable
        rows={datosDePrueba}
        loading={false}
        title="Gestión de Trabajadores"
        description="Administra el personal, filtra por cualquier campo y aplica acciones rápidas."
        onAddClick={() => setIsModalOpen(true)}
        
        globalFilter={searchTerm}
        onGlobalFilterChange={setSearchTerm}
        
        columns={columns}
        order={order}
        orderBy={orderBy}
        onRequestSort={(prop) => {
          const isAsc = orderBy === prop && order === 'asc';
          setOrder(isAsc ? 'desc' : 'asc');
          setOrderBy(prop);
        }}
        
        page={currentPage}
        rowsPerPage={rowsPerPage}
        total={datosDePrueba.length}
        onPageChange={(_, newPage) => setCurrentPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setCurrentPage(0);
        }}
        
        actions={actions}
        hasActions
      />
    </div>
  );
}