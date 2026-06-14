"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableAction, DataTableColumn } from "@/components/organisms";
import { SupplySidebar } from "@/components/organisms";
import { useSupplyStore } from "@/hooks";
import { Pencil, Power, PowerOff, Eye } from "lucide-react";
import { Supply } from "@/store";

export default function AdminSuppliesPage() {
  const { supplies, loading, startLoadingSupplies, startToggleSupplyStatus } = useSupplyStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 👈 Controla el Sidebar

  useEffect(() => {
    void startLoadingSupplies();
  }, [startLoadingSupplies]);

  const handleEdit = (supply: Supply) => {
    setSelectedSupply(supply);
    setIsSidebarOpen(true); // 👈 Abre el Sidebar al darle Editar
  };

  const handleToggleStatus = async (supply: Supply) => {
    const targetId = (supply._id || supply.id) as string;
    await startToggleSupplyStatus(targetId, !supply.is_active);
  };

  const StatusIcon = ({ isActive }: { isActive: boolean }) => {
  return isActive ? (
    <PowerOff className="h-4 w-4 text-orange-400" />
  ) : (
    <Power className="h-4 w-4 text-green-400" />
  );
};

  const actions: DataTableAction<Supply>[] = [
  {
    label: "Editar",
    icon: <Pencil className="h-4 w-4" />,
    onClick: handleEdit,
  },
  {
    label: "Estado",
    // ✅ SOLUCIÓN: Le pasamos un elemento que ejecute la lógica internamente o usamos una función si el DataTable lo permite mapeándolo en su renderizado.
    // Si tu DataTable renderiza el ícono pasándole la fila internamente, el tipo debe aceptar funciones. 
    // Como tu interfaz DataTable genérica exige un ReactNode estático, cambiamos la acción para que sea genérica:
    icon: <Power className="h-4 w-4 text-rose-400" />, 
    onClick: handleToggleStatus,
  },
  {
    label: "Ficha detallada",
    icon: <Eye className="h-4 w-4" />,
    url: (row) => `/admin/supplies/${row._id || row.id}`,
  },
];

  const columns: DataTableColumn<Supply>[] = [
    { id: "name", label: "Nombre del Insumo", sortable: true, width: "240px" },
    { 
      id: "unit", 
      label: "Unidad", 
      width: "140px",
      accessor: (row) => {
        const colors: Record<string, string> = {
          metros: "bg-blue-50 text-blue-500 border border-blue-100",
          rollos: "bg-amber-50 text-amber-500 border border-amber-100",
          unidades: "bg-emerald-50 text-emerald-500 border border-emerald-100",
          conos: "bg-purple-50 text-purple-500 border border-purple-100"
        };
        const currentStyle = colors[row.unit] || "bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400";
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${currentStyle}`}>
            {row.unit}
          </span>
        );
      }
    },
    { id: "used_in", label: "Usado en", width: "160px", sortable: true },
    { 
      id: "is_active", 
      label: "Estado", 
      width: "140px",
      accessor: (row) => (
        <span className={`text-xs font-bold ${row.is_active ? "text-green-500" : "text-gray-400"}`}>
          {row.is_active ? "● Activo" : "● Suspendido"}
        </span>
      )
    },
  ];

  const filteredSupplies = useMemo(() => {
    if (!searchTerm.trim()) return supplies;
    const lower = searchTerm.trim().toLowerCase();
    return supplies.filter((supply) =>
      [supply.name, supply.unit, supply.used_in]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(lower))
    );
  }, [searchTerm, supplies]);

  return (
    <>
      <DataTable
        rows={filteredSupplies}
        loading={loading}
        title="Catálogo de Insumos"
        description="Gestiona las materias primas para tus órdenes de producción propia, filtra por presentación y suspende insumos de forma ágil."
        onAddClick={() => {
          setSelectedSupply(null); // Limpio para indicar Creación Nueva
          setIsSidebarOpen(true);   // Abre el Sidebar vacío
        }}
        globalFilter={searchTerm}
        onGlobalFilterChange={setSearchTerm}
        columns={columns}
        actions={actions}
        hasActions
      />

      {/* 🚀 EL NUEVO SIDEBAR REMPLAZA AL MODAL ANTERIOR */}
      <SupplySidebar
        open={isSidebarOpen}
        selectedSupply={selectedSupply}
        onClose={() => setIsSidebarOpen(false)}
        onSaved={startLoadingSupplies}
      />
    </>
  );
}