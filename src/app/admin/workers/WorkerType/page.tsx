"use client";

import { useState } from 'react';
import { DataTable, DataTableColumn, DataTableAction } from '@/components/organisms';
import { Pencil } from 'lucide-react';

// 1. Tu modelo basado en tu diagrama para WorkerType
interface WorkerTypeData {
  id_worker_type: string;
  name: string;
  description: string;
  created_at: string;
}

export default function WorkerTypePage() {
  const [isOpenModal, setIsModalOpen] = useState(false);

  // 2. Columnas adaptadas a los Roles
  const columns: DataTableColumn<WorkerTypeData>[] = [
    { id: 'name', label: 'Nombre del Rol', sortable: true, width: '250px', truncate: true },
    { id: 'description', label: 'Descripción', sortable: true, truncate: true },
    { id: 'created_at', label: 'Fecha de Creación', sortable: true, width: '180px' },
  ];

  // 3. Acciones (Editar)
  const actions: DataTableAction<WorkerTypeData>[] = [
    {
      label: "Editar",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (row: WorkerTypeData) => {
        setIsModalOpen(true);
        alert(`Abriendo edición para el rol: ${row.name}`);
      },
    },
  ];

  // 4. Datos de prueba (mocks) de roles
  const [datosDePrueba] = useState<WorkerTypeData[]>([
    { 
      id_worker_type: 'ROL-001',
      name: 'Administrador',
      description: 'Acceso total al sistema, gestión de usuarios, finanzas y reportes.',
      created_at: '2025-10-01',
    },
    { 
      id_worker_type: 'ROL-002',
      name: 'Vendedor',
      description: 'Puede gestionar cotizaciones, clientes y ver productos en almacén.',
      created_at: '2025-10-05',
    },
    { 
      id_worker_type: 'ROL-003',
      name: 'Almacenero',
      description: 'Control de inventario, ingreso y salida de productos.',
      created_at: '2026-01-10',
    },
  ]);

  // Estados temporales para que funcionen los controles de la tabla
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
        title="Roles y Tipos de Trabajador"
        description="Gestiona los diferentes roles que pueden tener los trabajadores y sus descripciones."
        onAddClick={() => setIsModalOpen(true)}
        
        // Buscador
        globalFilter={searchTerm}
        onGlobalFilterChange={setSearchTerm}
        
        // Columnas y ordenamiento
        columns={columns}
        order={order}
        orderBy={orderBy}
        onRequestSort={(prop) => {
          const isAsc = orderBy === prop && order === 'asc';
          setOrder(isAsc ? 'desc' : 'asc');
          setOrderBy(prop);
        }}
        
        // Paginación
        page={currentPage}
        rowsPerPage={rowsPerPage}
        total={datosDePrueba.length}
        onPageChange={(_, newPage) => setCurrentPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setCurrentPage(0);
        }}
        
        // Acciones
        actions={actions}
        hasActions
      />
    </div>
  );
}