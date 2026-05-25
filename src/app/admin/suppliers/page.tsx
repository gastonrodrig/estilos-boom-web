"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableAction, DataTableColumn } from "@/components/organisms";
import { SupplierModal } from "@/components/organisms/modals/supplier-modal";
import { supplierApi } from "@api";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { Supplier } from "@/components/organisms/modals/supplier-modal/supplier-modal.types";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const { data } = await supplierApi.get("/", {
        params: {
          search: searchTerm || undefined,
          status: true,
        },
      });

      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading suppliers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSuppliers();
  }, [searchTerm]);

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!supplier._id) return;
    setLoading(true);
    try {
      await supplierApi.delete(`/${supplier._id}`);
      await loadSuppliers();
    } catch (error) {
      console.error("Error disabling supplier", error);
    } finally {
      setLoading(false);
    }
  };

  const actions: DataTableAction<Supplier>[] = [
    {
      label: "Editar",
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEdit,
    },
    {
      label: "Inhabilitar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      show: (row) => row.status !== false,
    },
    {
      label: "Ficha detallada",
      icon: <Eye className="h-4 w-4" />,
      url: (row) => `/admin/suppliers/${row._id}`,
    },
  ];

  const columns: DataTableColumn<Supplier>[] = [
    { id: "name_company", label: "Nombre Compania Proovedor", sortable: true, width: "180px", truncate: true },
    { id: "contact_person", label: "Nombre del Contacto", sortable: true, width: "160px", truncate: true },
    { id: "email", label: "Correo", sortable: true, width: "220px", truncate: true },
    { id: "phone", label: "# Teléfono", sortable: true, width: "140px", truncate: true },
    { id: "ruc", label: "RUC", sortable: true, width: "140px", truncate: true },
    {
      id: "status",
      label: "Estado",
      width: "120px",
      accessor: (row) => (row.status === false ? "Inactivo" : "Activo"),
    },
  ];

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return suppliers;

    const lower = searchTerm.trim().toLowerCase();
    return suppliers.filter((supplier) =>
      [supplier.name_company, supplier.contact_person, supplier.email, supplier.phone, supplier.ruc]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(lower))
    );
  }, [searchTerm, suppliers]);

  return (
    <>
      <DataTable
        rows={filteredSuppliers}
        loading={loading}
        title="Proveedores"
        description="Gestiona proveedores, busca por cualquier campo y accede rápidamente a la ficha detallada."
        onAddClick={() => {
          setSelectedSupplier(null);
          setIsModalOpen(true);
        }}
        globalFilter={searchTerm}
        onGlobalFilterChange={setSearchTerm}
        columns={columns}
        actions={actions}
        hasActions
      />

      <SupplierModal
        open={isModalOpen}
        selectedSupplier={selectedSupplier}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadSuppliers}
      />
    </>
  );
}
