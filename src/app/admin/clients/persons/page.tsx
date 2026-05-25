"use client";

import { useEffect, useState } from 'react';
import { DataTable, DataTableAction, DataTableColumn, ClientPersonModal } from '@/components/organisms';
import { ClientPerson } from '@models';
import { useClientPersonStore } from '@hooks';
import { Pencil } from 'lucide-react';

export default function TrabajadoresPage() {
  const [isOpenModal, setIsModalOpen] = useState(false);

  const {
    clientsPerson,
    loading,
    total,
    currentPage,
    rowsPerPage,
    orderBy,
    order,
    searchTerm,
    setSearchTerm,
    setOrderBy,
    setOrder,
    setPageGlobal,
    setRowsPerPageGlobal,
    setSelectedClientPerson,
    startLoadingClientsPersonPaginated,
  } = useClientPersonStore();

  useEffect(() => {
    void startLoadingClientsPersonPaginated();
  }, [startLoadingClientsPersonPaginated]);

  const columns: DataTableColumn<ClientPerson>[] = [
    { id: 'first_name', label: 'Nombre', sortable: true, width: '140px', truncate: true },
    { id: 'last_name', label: 'Apellido', sortable: true, width: '140px', truncate: true },
    { id: 'email', label: 'Correo', sortable: true, width: '140px', truncate: true },
    { id: 'phone', label: '# Teléfono', sortable: true, width: '140px', truncate: true },
    { id: 'document_type', label: 'Tipo Doc', sortable: true, width: '120px', truncate: true },
    { id: 'document_number', label: '# Documento', sortable: true, width: '140px', truncate: true },
    { id: 'status', label: 'Estado', sortable: true, width: '140px', truncate: true },
  ];

  const actions: DataTableAction<ClientPerson>[] = [
    {
      label: 'Editar',
      icon: <Pencil className="h-4 w-4" />,
      onClick: (row: ClientPerson) => {
        setSelectedClientPerson(row);
        setIsModalOpen(true);
      },
    },
  ];

  const handleAddClient = () => {
    setSelectedClientPerson(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <DataTable
        rows={clientsPerson}
        loading={loading}
        title="Clientes - Persona"
        description="Gestiona clientes persona, filtra por cualquier campo y aplica acciones rápidas."
        onAddClick={handleAddClient}
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
