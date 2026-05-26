"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableAction, DataTableColumn } from "@/components/organisms";
import { useStorehouseStore } from "@/hooks"; 
import { CheckCircle, ArrowRightLeft, FileText, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminTransfersPage() {
  const { startLoadingTransfers, startLoadingInventoryMovements, startCompleteTransfer, loading } = useStorehouseStore();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableLoading, setTableLoading] = useState(false);

  // 🔄 ESTADOS PARA CONTROLAR LA PAGINACIÓN Y FILAS ACTIVAS
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const loadData = async () => {
    setTableLoading(true);
    try {
      const [transfersData, movementsData] = await Promise.all([
        startLoadingTransfers(),           
        startLoadingInventoryMovements()   
      ]);

      const cleanTransfers = Array.isArray(transfersData) ? transfersData : [];
      const cleanMovements = Array.isArray(movementsData) ? movementsData : [];
      const unifiedHistory = [...cleanTransfers, ...cleanMovements];

      unifiedHistory.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; 
      });

      setTransfers(unifiedHistory);
    } catch (error) {
      console.error("Error al unificar el historial de movimientos:", error);
      toast.error("Ocurrió un inconveniente al procesar el historial unificado.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // 🎛️ MANEJADORES DE CAMBIO DE PÁGINA Y FILAS
  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0); // Reiniciamos a la primera página para evitar desfases
  };

  // Cada vez que el usuario busque algo, regresamos la tabla a la página 0 automáticamente
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleProcessReception = async (transfer: any) => {
    const currentWorkerId = "65f1c2b3e4b0123456789abc";
    if (window.confirm(`¿Confirmas la recepción física del traslado ${transfer.code} en Tienda Principal?`)) {
      const success = await startCompleteTransfer(transfer._id, currentWorkerId);
      if (success) {
        toast.success("Traslado completado e inyectado a tienda con éxito.");
        await loadData();
      }
    }
  };

  // 📄 FUNCIÓN GENERADORA DEL PDF DE LA GUÍA DE REMISIÓN
  const handleDownloadPDF = (transfer: any) => {
    const doc = new jsPDF();
    const primaryColor = [242, 119, 141]; // #F2778D

    // 1. Encabezado / Branding
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 25, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ESTILOS BOOM S.A.C.", 15, 16);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("SISTEMA DE GESTIÓN DE INVENTARIOS (SGI)", 120, 16);

    // 2. Bloque del Título del Documento
    doc.setTextColor(51, 51, 51);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("GUÍA DE REMISIÓN INTERNA DE TRASLADO", 15, 40);

    // Caja de código de guía (Estilo Sunat)
    doc.setDrawColor(242, 119, 141);
    doc.setLineWidth(0.5);
    doc.rect(130, 32, 65, 15);
    doc.setFontSize(11);
    doc.text(`R.U.C. 20716253411`, 135, 38);
    doc.text(`${transfer.code || "TR-000000"}`, 135, 44);

    // 3. Detalles de la Operación
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DE TRASLADO:", 15, 58);

    const isFromOC = !!transfer.id_purchase_order;

    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de Emisión:  ${new Date(transfer.created_at || new Date()).toLocaleDateString()}`, 15, 65);
    doc.text(`Tipo de Movimiento: ${isFromOC ? "Entrada por Compra" : "Transferencia Interna SGI"}`, 15, 71);
    doc.text(`Estado Actual:       ${transfer.status || "PENDIENTE"}`, 15, 77);

    // Cuadro Origen y Destino
    doc.setFillColor(250, 249, 246);
    doc.rect(15, 85, 180, 20, "F");
    doc.setDrawColor(235, 234, 232);
    doc.rect(15, 85, 180, 20);

    doc.setFont("helvetica", "bold");
    doc.text("PUNTO PARTIDA (Origen):", 20, 92);
    doc.text("PUNTO LLEGADA (Destino):", 110, 92);

    doc.setFont("helvetica", "normal");
    doc.text(isFromOC ? "PROVEEDOR LOGÍSTICO" : (transfer.id_source_warehouse?.name?.replace("_", " ") || "Almacén Central"), 20, 98);
    doc.text(transfer.id_target_warehouse?.name?.replace("_", " ") || "Tienda Principal", 110, 98);

    // 4. Tabla de Artículos (Items)
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE LAS PRENDAS:", 15, 115);

    const tableRows = (transfer.items || []).map((item: any, i: number) => [
      i + 1,
      item.variant?.sku_variant || `SKU-${i}`,
      item.variant?.name || "Prenda Estilos Boom",
      `${item.variant?.size || "M"} - ${item.variant?.color?.name || "Varios"}`,
      item.quantity,
      "Unidades"
    ]);

    autoTable(doc, {
      startY: 120,
      head: [["Item", "Código SKU", "Descripción del Producto", "Talla/Color", "Cant.", "U.M."]],
      body: tableRows,
      headStyles: { fillColor: [89, 66, 70] },
      styles: { fontSize: 9, font: "helvetica" },
      columnStyles: { 4: { halign: "center" } }
    });

    // 5. Bloque de Firmas de Auditoría
    const finalY = (doc as any).lastAutoTable.finalY + 35;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(25, finalY, 85, finalY);
    doc.line(125, finalY, 185, finalY);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Despachado Por (Almacén)", 38, finalY + 5);
    doc.text("Recibido Por (Tienda)", 142, finalY + 5);
    
    const senderName = transfer.id_sender_worker 
      ? `${transfer.id_sender_worker.first_name} ${transfer.id_sender_worker.last_name?.slice(0,1)}.`
      : "Carlos M.";
      
    const receiverName = transfer.id_receiver_worker 
      ? `${transfer.id_receiver_worker.first_name} ${transfer.id_receiver_worker.last_name?.slice(0,1)}.`
      : "Pendiente";

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Operario: " + senderName, 36, finalY + 10);
    doc.text("Receptor: " + receiverName, 140, finalY + 10);

    doc.save(`Guia_Remision_${transfer.code || "TRASLADO"}.pdf`);
  };

  const handleOpenDetails = (transfer: any) => {
    toast(`Abriendo visor de auditoría para la guía ${transfer.code}`, {
      icon: "🔍",
      style: { borderRadius: '12px', background: '#594246', color: '#fff' }
    });
  };

  // CONFIGURACIÓN DE ACCIONES ATÓMICAS (Agregado Ver Detalles)
  const actions: DataTableAction<any>[] = [
    {
      label: "Recibir en Tienda",
      icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
      onClick: handleProcessReception,
      // Solo se muestra si es una transferencia interna y está PENDIENTE
      show: (row) => !row.id_purchase_order && row.status === "PENDIENTE",
    },
    {
      label: "Imprimir Guía (PDF)",
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      onClick: handleDownloadPDF,
      // 🚀 CONDICIONAL CLAVE: Solo se muestra si NO viene de una Orden de Compra (es decir, solo internas)
      show: (row) => !row.id_purchase_order,
    },
    {
      label: "Ver Guía Proveedor",
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      onClick: (row) => {
        if (row.id_purchase_order?.supplier_guide_url) {
          window.open(row.id_purchase_order.supplier_guide_url, "_blank");
        } else {
          toast.error("No se adjuntó la guía digital del proveedor en la recepción.");
        }
      },
      // 🚀 CONDICIONAL CLAVE: Solo se muestra si SÍ viene de una Orden de Compra
      show: (row) => !!row.id_purchase_order,
    },
    {
      label: "Ver detalles de movimiento",
      icon: <Eye className="h-4 w-4 text-purple-500" />,
      onClick: handleOpenDetails,
      show: () => true, // Siempre visible para auditoría
    }
  ];

  // COLUMNAS BAJO TU PROTOCOLO GRÁFICO EXACTO
  const columns: DataTableColumn<any>[] = [
    {
      id: "created_at",
      label: "Fecha y hora",
      sortable: true,
      width: "140px",
      accessor: (row) => {
        if (!row.created_at) return <span className="text-gray-300">—</span>;
        const date = new Date(row.created_at);
        return (
          <div className="flex flex-col text-xs text-gray-700 font-medium">
            <span>{date.toLocaleDateString("es-PE", { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            <span className="text-[10px] text-gray-400 mt-0.5">{date.toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    },
    { 
      id: "type", 
      label: "Tipo", 
      width: "160px",
      accessor: (row) => {
        const isFromOC = !!row.id_purchase_order;
        if (isFromOC) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-500 border border-blue-100/50">
              📥 ↓ Entrada compra
            </span>
          );
        }
        if (row.type === "INCIDENCIA") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-500 border border-orange-100/50">
              📦 ⚡ Incidencia
            </span>
          );
        }
        if (row.type === "AJUSTE") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100/50">
              ⚖️ ⚖️ Ajuste
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100/50">
            ⇄ ⇄ Transferencia
          </span>
        );
      }
    },
    { 
      id: "id_source_warehouse", 
      label: "Origen ➔ Destino", 
      width: "220px",
      accessor: (row) => {
        const isFromOC = !!row.id_purchase_order;
        const sourceName = isFromOC 
          ? "Proveedor Logístico" 
          : (row.id_source_warehouse?.name?.replace("_", " ") || "Almacén Central");
          
        const targetName = row.id_target_warehouse?.name?.replace("_", " ") || "Tienda Principal";
        
        return (
          <div className="flex flex-col text-xs font-semibold text-gray-700">
            <span className={isFromOC ? "text-blue-500/90 text-[11px]" : ""}>{sourceName} ➔</span>
            <span className="text-rose-400 text-[11px] mt-0.5">{targetName}</span>
          </div>
        );
      }
    },
    {
      id: "reason",
      label: "Motivo",
      width: "180px",
      accessor: (row) => {
        return (
          <span className="text-xs text-gray-500 font-medium truncate max-w-[170px] block">
            {row.reason || "Reposición urgente"}
          </span>
        );
      }
    },
    { 
      id: "status_custom", // 👈 ¡CAMBIADO! Engañamos a la DataTable para que use tu accessor real
      label: "Estado", 
      width: "120px",
      accessor: (row) => {
        const isFromOC = !!row.id_purchase_order;
        const isCompleted = row.status === "CONFIRMADO" || row.status === "COMPLETADO" || isFromOC;

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            isCompleted 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
              : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
          }`}>
            {isCompleted ? "Confirmado" : "Pendiente"}
          </span>
        );
      }
    },
    {
      id: "created_by",
      label: "Creado por",
      width: "140px",
      accessor: (row) => {
        const workerObj = row.id_sender_worker || row.id_worker;
        const name = workerObj && workerObj.first_name 
          ? `${workerObj.first_name} ${workerObj.last_name?.[0] || ""}.` 
          : "Carlos M.";
          
        return (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <div className="w-5 h-5 rounded-full bg-rose-100 text-[#F2778D] flex items-center justify-center font-black text-[9px] shrink-0">
              {name.slice(0,2).toUpperCase()}
            </div>
            <span className="truncate max-w-[95px]">{name}</span>
          </div>
        );
      }
    },
    {
      id: "confirmed_by",
      label: "Confirmado por",
      width: "140px",
      accessor: (row) => {
        const isFromOC = !!row.id_purchase_order;
        
        // Si proviene de una compra consolidada, el encargado del almacén central que firmó en created_by también da la conformidad
        if (isFromOC) {
          const workerObj = row.id_worker || row.id_sender_worker;
          const name = workerObj && workerObj.first_name ? `${workerObj.first_name} ${workerObj.last_name?.[0] || ""}.` : "Carlos M.";
          return (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-black text-[9px] border border-emerald-100 shrink-0">
                {name.slice(0,2).toUpperCase()}
              </div>
              <span className="truncate max-w-[95px]">{name}</span>
            </div>
          );
        }

        if (!row.id_receiver_worker || !row.id_receiver_worker.first_name) {
          return <span className="text-gray-300 text-xs italic block text-center">—</span>;
        }
        const name = `${row.id_receiver_worker.first_name} ${row.id_receiver_worker.last_name?.[0] || ""}.`;
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-black text-[9px] border border-emerald-100 shrink-0">
              {name.slice(0,2).toUpperCase()}
            </div>
            <span className="truncate max-w-[95px]">{name}</span>
          </div>
        );
      }
    }
  ];

  const filteredTransfers = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return transfers;
    const lower = searchTerm.toLowerCase().trim();
    return transfers.filter((t) => {
      const statusText = t.status ? String(t.status) : "";
      const reasonText = t.reason ? String(t.reason) : "";
      const codeText = t.code ? String(t.code) : "";
      const ocNumberText = t.id_purchase_order?.order_number ? String(t.id_purchase_order.order_number) : "";
      const sourceName = t.id_purchase_order ? "proveedor" : (t.id_source_warehouse?.name || "almacen central");
      const targetName = t.id_target_warehouse?.name || "tienda principal";

      return [codeText, ocNumberText, statusText, reasonText, sourceName, targetName]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(lower));
    });
  }, [searchTerm, transfers]);

  return (
    <div className="p-4">
      <DataTable
        rows={filteredTransfers}
        loading={loading || tableLoading}
        title="Movimientos entre Almacenes"
        description="Emisión, seguimiento y control de guías de remisión internas. Autoriza el traslado de prendas desde el Almacén Central hacia la Tienda Principal de Estilos Boom."
        onAddClick={() => {
          toast.success("Abre el asistente de movimientos en Stock Actual.");
        }}
        
        // 🚀 INYECTAMOS LOS CONTROLES DE LA PAGINACIÓN REACTIVA
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        
        globalFilter={searchTerm}
        onGlobalFilterChange={handleSearchChange}
        columns={columns}
        actions={actions}
        hasActions
      />
    </div>
  );
}