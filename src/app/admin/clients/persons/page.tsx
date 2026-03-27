"use client";

import { useEffect, useState } from 'react';
import { DataTable, DataTableAction, DataTableColumn, ClientPersonModal } from '@/components/organisms';
import { ClientPerson } from '@models';
import { useClientPersonStore } from '@hooks';
import { Pencil } from 'lucide-react';

export default function AdminClientPersonsPage() {
  const {
    clientsPerson,
    total,
    loading,
    searchTerm,
    rowsPerPage,
    currentPage,
    orderBy,
    order,
    setSearchTerm,
    setRowsPerPageGlobal,
    setPageGlobal,
    setOrderBy,
    setOrder,
    startLoadingClientsPersonPaginated,
    setSelectedClientPerson,
  } = useClientPersonStore();

  const [isOpenModal, setIsModalOpen] = useState(false);

  useEffect(() => {
    startLoadingClientsPersonPaginated();
  }, [startLoadingClientsPersonPaginated]);

  const openModal = (payload: ClientPerson) => {
    setSelectedClientPerson(payload);
    setIsModalOpen(true);
  };

  const columns: DataTableColumn<ClientPerson>[] = [
    { id: 'first_name', label: 'Nombre', sortable: true, width: '140px', truncate: true },
    { id: 'last_name', label: 'Apellido', sortable: true, width: '140px', truncate: true },
    { id: 'email', label: 'Correo', sortable: true, width: '140px', truncate: true },
    { id: 'phone', label: '# Telefono', sortable: true, width: '140px', truncate: true },
    { id: 'document_type', label: 'Tipo Doc', sortable: true, width: '120px', truncate: true },
    { id: 'document_number', label: '# Documento', sortable: true, width: '140px', truncate: true },
    { id: 'status', label: 'Estado', sortable: true, width: '140px', truncate: true },
  ];

  const actions: DataTableAction<ClientPerson>[] = [
    {
      label: "Editar",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (row: ClientPerson) => openModal(row),
    },
  ];

  return (
    <>
      <DataTable
        rows={clientsPerson}
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