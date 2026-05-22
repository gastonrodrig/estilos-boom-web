"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableAction, DataTableColumn } from "@/components/organisms";
import { useStorehouseStore } from "@/hooks"; // Ajusta a tu ruta real
import { Truck, CheckCircle, ArrowRightLeft, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminTransfersPage() {
  const { startLoadingTransfers, startCompleteTransfer, loading } = useStorehouseStore();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableLoading, setTableLoading] = useState(false);

  const loadData = async () => {
    setTableLoading(true);
    const data = await startLoadingTransfers();
    if (data) setTransfers(data);
    setTableLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleProcessReception = async (transfer: any) => {
    // ID simulado o extraído de tu sesión activa de Firebase / Trabajador logueado
    const currentWorkerId = "65f1c2b3e4b0123456789abc"; 
    
    if (window.confirm(`¿Confirmas la recepción física del traslado ${transfer.code} en Tienda Principal?`)) {
      const success = await startCompleteTransfer(transfer._id, currentWorkerId);
      if (success) {
        await loadData(); // Recarga reactiva de la grilla
      }
    }
  };

  // Configuración de acciones atómicas de la fila
  const actions: DataTableAction<any>[] = [
    {
      label: "Recibir en Tienda",
      icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
      onClick: handleProcessReception,
      // Solo mostramos el botón si la guía está PENDIENTE de transporte
      show: (row) => row.status === "PENDIENTE",
    }
  ];

  // Columnas mapeadas directamente de tu nuevo esquema InventoryTransfer
  const columns: DataTableColumn<any>[] = [
    { id: "code", label: "Código de Guía", sortable: true, width: "150px" },
    { 
      id: "id_source_warehouse", 
      label: "Origen", 
      width: "180px",
      accessor: (row) => (
        <span className="text-xs font-semibold text-gray-700">
          🏢 {row.id_source_warehouse?.name?.replace("_", " ")}
        </span>
      )
    },
    { 
      id: "arrow", 
      label: "Flujo", 
      width: "80px",
      accessor: () => <ArrowRightLeft size={14} className="text-gray-300 mx-auto" /> 
    },
    { 
      id: "id_target_warehouse", 
      label: "Destino (Piso)", 
      width: "180px",
      accessor: (row) => (
        <span className="text-xs font-semibold text-[#F2778D]">
          🛍️ {row.id_target_warehouse?.name?.replace("_", " ")}
        </span>
      )
    },
    {
      id: "items",
      label: "Variantes / Total",
      width: "140px",
      accessor: (row) => {
        const totalUds = row.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
        return <span className="font-mono text-xs font-bold">{row.items?.length} sku ({totalUds} uds)</span>;
      }
    },
    { 
      id: "status", 
      label: "Estado de Carga", 
      width: "150px",
      accessor: (row) => {
        const isCompleted = row.status === "COMPLETADO";
        return (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isCompleted 
              ? "bg-emerald-50 text-emerald-500 border border-emerald-100" 
              : "bg-amber-50 text-amber-500 border border-amber-100 animate-pulse"
          }`}>
            {isCompleted ? "✓ Recibido" : "🚚 En Tránsito"}
          </span>
        );
      }
    }
  ];

  // Filtro de búsqueda en memoria
  const filteredTransfers = useMemo(() => {
    if (!searchTerm.trim()) return transfers;
    const lower = searchTerm.toLowerCase().trim();
    return transfers.filter((t) => 
      [t.code, t.status, t.id_source_warehouse?.name, t.id_target_warehouse?.name]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(lower))
    );
  }, [searchTerm, transfers]);

  return (
    <div className="p-4">
      <DataTable
        rows={filteredTransfers}
        loading={loading || tableLoading}
        title="Movimientos entre Almacenes"
        description="Emisión, seguimiento y control de guías de remisión internas. Autoriza el traslado de prendas desde el Almacén Central hacia la Tienda Principal de Estilos Boom."
        onAddClick={() => {
            toast("Abre el formulario para emitir una nueva Guía de Traslado.", {
                icon: "ℹ️",
                style: {
                borderRadius: '12px',
                background: '#333',
                color: '#fff',
                },
            });
            // Aquí puedes redirigir a un formulario de creación o abrir otro Sidebar
            }}
        globalFilter={searchTerm}
        onGlobalFilterChange={setSearchTerm}
        columns={columns}
        actions={actions}
        hasActions
      />
    </div>
  );
}