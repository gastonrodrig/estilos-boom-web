"use client";

import { useEffect, useState } from 'react';
import { DataTable, DataTableAction, DataTableColumn, ClientPersonModal } from '@/components/organisms';
import { ClientPerson } from '@models';
import { useStorekeeperStore } from '@hooks';
import { Pencil, Trash } from 'lucide-react';
import { Workshop } from '@/core/models/storekeeper/storekeeper.models';
import { WorkShopModal } from '@/components/organisms/modals/storekeeper-workshop-modal';
import { WorkShopConfirmationModal } from '@/components/organisms/modals/storekeeper-workshop-modal/storekeeper-workshop-confirmation-modal';

export default function AdminClientPersonsPage() {
  const {
    workshops,
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
    startLoadingWorkshopsPaginated,
    setSelectedWorkshop,
  } = useStorekeeperStore();

  const [isOpenModal, setIsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  useEffect(() => {
    startLoadingWorkshopsPaginated();
  }, [startLoadingWorkshopsPaginated]);

  const openModal = (payload: Workshop) => {
    setSelectedWorkshop(payload);
    setIsModalOpen(true);
  };

const openConfirmationModal = (payload: Workshop) => {
    setSelectedWorkshop(payload);
    setIsConfirmationModalOpen(true);
  };

  const columns: DataTableColumn<Workshop>[] = [
    { id: 'name', label: 'Nombre', sortable: true, width: '140px', truncate: true },
    { id: 'description', label: 'Descripción', sortable: true, width: '140px', truncate: true },
    { id: 'contact_person', label: 'Persona de Contacto', sortable: true, width: '140px', truncate: true },
    { id: 'phone', label: 'Telefono', sortable: true, width: '140px', truncate: true },
    { id: 'address', label: 'Direccion', sortable: true, width: '120px', truncate: true }];

  const actions: DataTableAction<Workshop>[] = [
    {
      label: "Editar",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (row: Workshop) => openModal(row),
    },
    {
      label: "Eliminar",
      icon: <Trash className="h-4 w-4" />,
      onClick: (row: Workshop) => openConfirmationModal(row),
    },
  ];

  return (
    <>
      <DataTable
        rows={workshops}
        loading={loading}
        title="Workshops"
        description="Gestiona talleres, filtra por cualquier campo y aplica acciones rápidas."
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
      <WorkShopModal
        open={isOpenModal}
        onClose={() => setIsModalOpen(false)}
      />

    <WorkShopConfirmationModal
        open={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
      />
    </>
  );
}