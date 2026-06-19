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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    { id: "name", label: "Nombre de Categoría", sortable: true, width: "220px" },
    {
      id: "abbr",
      label: "SKU Abbr.",
      sortable: false,
      width: "100px",
      accessor: (row) => row.abbr
        ? <span className="font-mono font-bold tracking-widest text-[#8B3A52] dark:text-[#F8BBD0] text-xs">{row.abbr}</span>
        : <span className="opacity-30 text-xs">—</span>,
    },
    { id: "description", label: "Descripción", sortable: false, width: "340px", truncate: true },
    {
      id: "status",
      label: "Estado",
      sortable: false,
      width: "100px",
      accessor: (row) => row.status !== false
        ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Activa</span>
        : <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />Inactiva</span>,
    },
    {
      id: "createdAt",
      label: "Registro",
      sortable: true,
      width: "140px",
      accessor: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString("es-PE") : "—",
    },
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
          setSelectedCategory(null);
          setIsModalOpen(true);
        }}
        globalFilter={searchTerm}
        onGlobalFilterChange={(v) => { setSearchTerm(v); setPage(0); }}
        columns={columns}
        actions={actions}
        hasActions
        page={page}
        rowsPerPage={rowsPerPage}
        total={filteredCategories.length}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
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