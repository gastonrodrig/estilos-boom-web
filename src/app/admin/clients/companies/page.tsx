"use client";

import { useEffect } from 'react';
import { DataTable, DataTableAction, DataTableColumn } from '@/components/organisms';
import { ClientCompany } from '@models';
import { useClientCompanyStore } from '@hooks';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminClientCompaniesPage() {

  const {
    clientsCompany,
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
    setSelectedClientCompany,
    startLoadingClientsCompanyPaginated,
  } = useClientCompanyStore();

  useEffect(() => {
    void startLoadingClientsCompanyPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: DataTableColumn<ClientCompany>[] = [
    { id: 'name_company', label: 'Razón Social', sortable: true, width: '200px', truncate: true },
    { id: 'document_type', label: 'Tipo Doc', sortable: true, width: '120px', truncate: true },
    { id: 'document_number', label: 'RUC', sortable: true, width: '140px', truncate: true },
    { id: 'email', label: 'Correo', sortable: true, width: '180px', truncate: true },
    { id: 'phone', label: '# Teléfono', sortable: true, width: '140px', truncate: true },
    { id: 'status', label: 'Estado', sortable: true, width: '140px', truncate: true },
  ];

  const actions: DataTableAction<ClientCompany>[] = [
    {
      label: 'Editar',
      icon: <Pencil className="h-4 w-4" />,
      onClick: (row: ClientCompany) => {
        setSelectedClientCompany(row);
        toast.success("El modal de edición para empresas está en construcción. (UI)");
      },
    },
  ];

  const handleAddClient = () => {
    setSelectedClientCompany(null);
    toast.success("El modal de creación para empresas está en construcción. (UI)");
  };

  return (
    <>
      <DataTable
        rows={clientsCompany}
        loading={loading}
        title="Clientes - Empresa"
        description="Gestiona clientes corporativos (empresas), filtra por cualquier campo y aplica acciones rápidas."
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
    </>
  );
}
