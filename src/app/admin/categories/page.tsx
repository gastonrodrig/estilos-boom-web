"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableAction, DataTableColumn } from "@/components/organisms";
import { CategoryModal } from "@/components/organisms";
import { useCategoryStore } from "@/hooks";
import { Pencil } from "lucide-react";

export default function AdminCategoriesPage() {
  const { categories, loading, startLoadingCategories } = useCategoryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    void startLoadingCategories();
  }, [startLoadingCategories]);

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  // Acciones enlazadas a tu componente DataTable
  const actions: DataTableAction<any>[] = [
    {
      label: "Editar Categoría",
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEdit,
    }
  ];

  // Estructura de columnas para el listado mapeando Mongoose timestamps
  const columns: DataTableColumn<any>[] = [
    { id: "name", label: "Nombre de Categoría", sortable: true, width: "250px" },
    { id: "description", label: "Descripción", sortable: false, width: "450px", truncate: true },
    { 
      id: "createdAt", 
      label: "Fecha de Registro", 
      sortable: true, 
      width: "180px",
      accessor: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "---"
    }
  ];

  // Filtro de búsqueda local predictivo sobre la tabla
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    const lower = searchTerm.trim().toLowerCase();
    return categories.filter((cat) =>
      [cat.name, cat.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(lower))
    );
  }, [searchTerm, categories]);

  return (
    <>
      <DataTable
        rows={filteredCategories}
        loading={loading}
        breadcrumb="Inicio / Gestionar Productos / Categorías"
        title="Categorías de Prendas"
        description="Gestiona las categorías del catálogo textil de Estilos Boom. Asigna nombres y descripciones precisas para los filtros de la tienda."
        onAddClick={() => {
          setSelectedCategory(null); // Resetea a null para que el modal sepa que es una creación limpia
          setIsModalOpen(true);
        }}
        globalFilter={searchTerm}
        onGlobalFilterChange={setSearchTerm}
        columns={columns}
        actions={actions}
        hasActions
      />

      <CategoryModal
        open={isModalOpen}
        selectedCategory={selectedCategory}
        onClose={() => setIsModalOpen(false)}
        onSaved={startLoadingCategories} // Refresca automáticamente la tabla disparando el dispatch del store
      />
    </>
  );
}