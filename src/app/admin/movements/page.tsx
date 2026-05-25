"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableAction, DataTableColumn } from "@/components/organisms";
import { useStorehouseStore } from "@/hooks"; 
import { CheckCircle, ArrowRightLeft, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
    const currentWorkerId = "65f1c2b3e4b0123456789abc"; // ID simulado del usuario logueado
    
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
    // 1. Instanciamos jsPDF de forma nativa
    const doc = new jsPDF();

    // Colores corporativos (Estilos Boom)
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

    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de Emisión:  ${new Date().toLocaleDateString()}`, 15, 65);
    doc.text(`Tipo de Movimiento: Transferencia Externa`, 15, 71);
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
    doc.text(transfer.id_source_warehouse?.name?.replace("_", " ") || "Almacén Central", 20, 98);
    doc.text(transfer.id_target_warehouse?.name?.replace("_", " ") || "Tienda Principal", 110, 98);

    // 4. Tabla de Artículos (Items)
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE LAS PRENDAS:", 15, 115);

    const tableRows = (transfer.items || []).map((item: any, i: number) => [
      i + 1,
      item.variant?.sku_variant || transfer.code + `-V${i}`,
      item.variant?.name || "Prenda Estilos Boom",
      `${item.variant?.size || "M"} - ${item.variant?.color?.name || "Varios"}`,
      item.quantity,
      "Unidades"
    ]);

    // ✅ CORRECCIÓN: Invocamos al plugin pasándole directamente la instancia del documento
    autoTable(doc, {
      startY: 120,
      head: [["Item", "Código SKU", "Descripción del Producto", "Talla/Color", "Cant.", "U.M."]],
      body: tableRows,
      headStyles: { fillColor: [89, 66, 70] }, // #594246 para contraste elegante
      styles: { fontSize: 9, font: "helvetica" },
      columnStyles: { 4: { halign: "center" } }
    });

    // 5. Bloque de Firmas de Auditoría
    // ✅ CORRECCIÓN: Leemos la coordenada final desde el tipado del plugin
    const finalY = (doc as any).lastAutoTable.finalY + 35;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(25, finalY, 85, finalY);
    doc.line(125, finalY, 185, finalY);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Despachado Por (Almacén)", 38, finalY + 5);
    doc.text("Recibido Por (Tienda)", 142, finalY + 5);
    
    
    // ✅ DINÁMICO: Extraemos los nombres reales devueltos por el populate de NestJS
    const senderName = transfer.id_sender_worker 
      ? `${transfer.id_sender_worker.first_name} ${transfer.id_sender_worker.last_name?.slice(0,1)}.`
      : "Carlos M."; // Fallback por si acaso
      
    const receiverName = transfer.id_receiver_worker 
      ? `${transfer.id_receiver_worker.first_name} ${transfer.id_receiver_worker.last_name?.slice(0,1)}.`
      : "Pendiente";

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Operario: " + senderName, 36, finalY + 10);
    doc.text("Receptor: " + receiverName, 140, finalY + 10);
    // Guardar el documento con el código único de guía
    doc.save(`Guia_Remision_${transfer.code || "TRASLADO"}.pdf`);
  };

  // CONFIGURACIÓN DE ACCIONES ATÓMICAS (Añadimos el PDF)
  const actions: DataTableAction<any>[] = [
    {
      label: "Recibir en Tienda",
      icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
      onClick: handleProcessReception,
      show: (row) => row.status === "PENDIENTE",
    },
    {
      label: "Imprimir Guía (PDF)",
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      onClick: handleDownloadPDF, // 🚀 Ejecuta la descarga limpia
      show: () => true, // Visible siempre para auditoría
    }
  ];

  const columns: DataTableColumn<any>[] = [
    {
      id: "created_at",
      label: "Fecha y hora",
      sortable: true,
      width: "130px",
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
      width: "140px",
      accessor: (row) => {
        // En este módulo el flujo base es Transferencia, pero lo dejamos dinámico por esquema
        const isTransfer = row.type === "TRANSFERENCIA" || !row.type;
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100/60">
            ⇄ {isTransfer ? "Transferencia" : row.type}
          </span>
        );
      }
    },
    { 
      id: "id_source_warehouse", 
      label: "Origen ➔ Destino", 
      width: "200px",
      accessor: (row) => {
        const sourceRaw = row.id_source_warehouse?.name || "ALMACEN CENTRAL";
        const targetRaw = row.id_target_warehouse?.name || "TIENDA PRINCIPAL";
        
        const source = sourceRaw.replace("_", " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
        const target = targetRaw.replace("_", " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
        
        return (
          <div className="flex flex-col text-xs font-semibold text-gray-700">
            <span>{source} ➔</span>
            <span className="text-rose-400 text-[11px] mt-0.5">{target}</span>
          </div>
        );
      }
    },
    {
      id: "qty_ordered",
      label: "Qty ordenada",
      width: "100px",
      accessor: (row) => {
        const total = row.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
        return <span className="font-mono text-xs font-bold text-gray-700 block text-center">{total}</span>;
      }
    },
    {
      id: "qty_confirmed",
      label: "Qty confirmada",
      width: "110px",
      accessor: (row) => {
        const total = row.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
        const isPending = row.status === "PENDIENTE";
        // Si está pendiente queda en raya, si ya se recibió se confirma el 100% del lote
        return (
          <span className={`font-mono text-xs font-bold block text-center ${isPending ? "text-gray-300" : "text-gray-700"}`}>
            {isPending ? "—" : total}
          </span>
        );
      }
    },
    {
      id: "qty_incidence",
      label: "Qty incidencia",
      width: "110px",
      accessor: (row) => {
        // Por defecto en transferencias directas es 0 (limpio), a menos que manejes mermas
        return <span className="font-mono text-xs font-bold text-gray-300 block text-center">—</span>;
      }
    },
    {
      id: "reason",
      label: "Motivo",
      width: "160px",
      accessor: (row) => {
        return (
          <span className="text-xs text-gray-500 font-medium truncate max-w-[150px] block">
            {row.reason || "Cambio de temporada"}
          </span>
        );
      }
    },
    { 
      id: "status", 
      label: "Estado", 
      width: "130px",
      accessor: (row) => {
        const isCompleted = row.status === "CONFIRMADO" || row.status === "COMPLETADO";
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
      width: "130px",
      accessor: (row) => {
        const name = row.id_sender_worker 
          ? `${row.id_sender_worker.first_name} ${row.id_sender_worker.last_name?.[0] || ""}.` 
          : "Carlos M.";
        return (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <div className="w-5 h-5 rounded-full bg-rose-100 text-[#F2778D] flex items-center justify-center font-black text-[9px] shrink-0">
              {name.slice(0,2).toUpperCase()}
            </div>
            <span className="truncate max-w-[90px]">{name}</span>
          </div>
        );
      }
    },
    {
      id: "confirmed_by",
      label: "Confirmado por",
      width: "130px",
      accessor: (row) => {
        if (!row.id_receiver_worker) return <span className="text-gray-300 text-xs italic block text-center">—</span>;
        const name = `${row.id_receiver_worker.first_name} ${row.id_receiver_worker.last_name?.[0] || ""}.`;
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-black text-[9px] border border-emerald-100 shrink-0">
              {name.slice(0,2).toUpperCase()}
            </div>
            <span className="truncate max-w-[90px]">{name}</span>
          </div>
        );
      }
    }
  ];

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
          toast.success("Abre el asistente de movimientos en Stock Actual.");
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