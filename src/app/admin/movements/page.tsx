"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableAction, DataTableColumn } from "@/components/organisms";
import { useStorehouseStore } from "@/hooks";
import { CheckCircle, FileText, Eye, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type ActiveTab = "documentos" | "kardex";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const DOC_TYPE_LABELS: Record<string, string> = {
  INGRESO_COMPRA: "📥 Ingreso compra",
  SALIDA_VENTA: "📤 Salida venta",
  TRANSFERENCIA: "⇄ Transferencia",
  AJUSTE: "⚖️ Ajuste",
};

const DOC_TYPE_STYLES: Record<string, string> = {
  INGRESO_COMPRA: "bg-blue-50 text-blue-600 border-blue-100",
  SALIDA_VENTA: "bg-orange-50 text-orange-600 border-orange-100",
  TRANSFERENCIA: "bg-amber-50 text-amber-600 border-amber-100",
  AJUSTE: "bg-slate-50 text-slate-600 border-slate-100",
};

const STATUS_STYLES: Record<string, string> = {
  PENDIENTE: "bg-amber-50 text-amber-600 border-amber-100 animate-pulse",
  EN_TRANSITO: "bg-sky-50 text-sky-600 border-sky-100",
  COMPLETADO: "bg-emerald-50 text-emerald-600 border-emerald-100",
  CANCELADO: "bg-gray-50 text-gray-400 border-gray-100",
};

const workerName = (w: any) =>
  w?.first_name ? `${w.first_name} ${w.last_name?.[0] ?? ""}.` : "—";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminMovementsPage() {
  const {
    startLoadingWarehouseDocuments,
    startProcessWarehouseDocument,
    startLoadingInventoryMovements,
    loading,
  } = useStorehouseStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("documentos");
  const [documents, setDocuments] = useState<any[]>([]);
  // rawMovements: datos directos del API sin pasar por el mapper del store (conserva objetos populados)
  const [rawMovements, setRawMovements] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  const loadData = async () => {
    setTableLoading(true);
    try {
      const [docs, moves] = await Promise.all([
        startLoadingWarehouseDocuments(),
        startLoadingInventoryMovements(),
      ]);
      setDocuments(Array.isArray(docs) ? docs : []);
      // startLoadingInventoryMovements retorna el array crudo antes del dispatch
      setRawMovements(Array.isArray(moves) ? moves : []);
    } catch {
      toast.error("Error al cargar los datos de inventario.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Procesar documento (conformidad física del almacenero) ─────────────────
  const handleProcessDocument = async (doc: any) => {
    if (doc.status !== "PENDIENTE") {
      toast.error("Este documento ya fue procesado o cancelado.");
      return;
    }

    const workerId =
      (typeof window !== "undefined"
        ? localStorage.getItem("worker_id") ?? ""
        : "") || "000000000000000000000001";

    const confirm = window.confirm(
      `¿Confirmas la recepción física del documento ${doc.document_number}?\n` +
        "Esto actualizará el stock y registrará las líneas en el Kárdex."
    );
    if (!confirm) return;

    // Auto-receive: quantity_received = quantity_expected para cada ítem
    const items = (doc.items ?? []).map((item: any) => ({
      id_variant: typeof item.id_variant === "object" ? item.id_variant._id : item.id_variant,
      quantity_received: item.quantity_expected,
    }));

    const success = await startProcessWarehouseDocument(doc._id, workerId, items);
    if (success) await loadData();
  };

  // ── Descargar PDF de la guía ───────────────────────────────────────────────
  const handleDownloadPDF = (doc: any) => {
    const pdf = new jsPDF();
    const primaryColor: [number, number, number] = [242, 119, 141];

    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 25, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("ESTILOS BOOM S.A.C.", 15, 16);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("SISTEMA DE GESTIÓN DE INVENTARIOS (SGI)", 105, 16);

    pdf.setTextColor(51, 51, 51);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("DOCUMENTO DE ALMACÉN", 15, 40);

    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.5);
    pdf.rect(130, 32, 65, 15);
    pdf.setFontSize(10);
    pdf.text(doc.document_number ?? "DOC-000000", 135, 44);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Fecha: ${new Date(doc.created_at ?? Date.now()).toLocaleDateString()}`, 15, 55);
    pdf.text(`Tipo: ${DOC_TYPE_LABELS[doc.type] ?? doc.type}`, 15, 62);
    pdf.text(`Estado: ${doc.status ?? "PENDIENTE"}`, 15, 69);

    const srcName = doc.id_source_warehouse?.name?.replace("_", " ") ?? "Proveedor externo";
    const tgtName = doc.id_target_warehouse?.name?.replace("_", " ") ?? "—";
    pdf.setFont("helvetica", "bold");
    pdf.text("Origen:", 15, 82);
    pdf.setFont("helvetica", "normal");
    pdf.text(srcName, 45, 82);
    pdf.setFont("helvetica", "bold");
    pdf.text("Destino:", 110, 82);
    pdf.setFont("helvetica", "normal");
    pdf.text(tgtName, 140, 82);

    const rows = (doc.items ?? []).map((item: any, i: number) => {
      const v = item.id_variant;
      return [
        i + 1,
        v?.sku_variant ?? `SKU-${i}`,
        v?.id_product?.name ?? "Prenda",
        `${v?.size ?? "—"} / ${v?.color?.name ?? "—"}`,
        item.quantity_expected,
        item.quantity_received ?? "—",
        "Unidades",
      ];
    });

    autoTable(pdf, {
      startY: 90,
      head: [["#", "SKU", "Producto", "Talla / Color", "Esperado", "Recibido", "U.M."]],
      body: rows,
      headStyles: { fillColor: [89, 66, 70] },
      styles: { fontSize: 9 },
    });

    pdf.save(`Guia_${doc.document_number ?? "DOC"}.pdf`);
  };

  // ── Columnas — WarehouseDocuments ──────────────────────────────────────────
  const docColumns: DataTableColumn<any>[] = [
    {
      id: "created_at",
      label: "Fecha",
      sortable: true,
      width: "130px",
      accessor: (row) => {
        if (!row.created_at) return <span className="text-gray-300">—</span>;
        const d = new Date(row.created_at);
        return (
          <div className="flex flex-col text-xs text-gray-700 font-medium">
            <span>{d.toLocaleDateString("es-PE")}</span>
            <span className="text-[10px] text-gray-400">
              {d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      },
    },
    {
      id: "document_number",
      label: "N° Documento",
      width: "150px",
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-[#594246]">
          {row.document_number ?? "—"}
        </span>
      ),
    },
    {
      id: "type",
      label: "Tipo",
      width: "160px",
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            DOC_TYPE_STYLES[row.type] ?? "bg-gray-50 text-gray-500 border-gray-100"
          }`}
        >
          {DOC_TYPE_LABELS[row.type] ?? row.type}
        </span>
      ),
    },
    {
      id: "route",
      label: "Origen ➔ Destino",
      width: "220px",
      accessor: (row) => {
        const src = row.id_source_warehouse?.name?.replace("_", " ") ?? "Externo";
        const tgt = row.id_target_warehouse?.name?.replace("_", " ") ?? "—";
        return (
          <div className="flex flex-col text-xs font-semibold text-gray-700">
            <span>{src} ➔</span>
            <span className="text-rose-400 text-[11px] mt-0.5">{tgt}</span>
          </div>
        );
      },
    },
    {
      id: "items_count",
      label: "Prendas",
      width: "80px",
      accessor: (row) => (
        <span className="text-xs font-bold text-gray-600 text-center block">
          {row.items?.length ?? 0} variantes
        </span>
      ),
    },
    {
      id: "status",
      label: "Estado",
      width: "120px",
      accessor: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            STATUS_STYLES[row.status] ?? "bg-gray-50 text-gray-400 border-gray-100"
          }`}
        >
          {row.status ?? "—"}
        </span>
      ),
    },
    {
      id: "sender",
      label: "Creado por",
      width: "130px",
      accessor: (row) => {
        const name = workerName(row.id_sender_worker);
        return (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <div className="w-5 h-5 rounded-full bg-rose-100 text-[#F2778D] flex items-center justify-center font-black text-[9px] shrink-0">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <span className="truncate max-w-[90px]">{name}</span>
          </div>
        );
      },
    },
    {
      id: "receiver",
      label: "Procesado por",
      width: "130px",
      accessor: (row) => {
        if (!row.id_receiver_worker?.first_name)
          return <span className="text-gray-300 text-xs italic block text-center">—</span>;
        const name = workerName(row.id_receiver_worker);
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-black text-[9px] shrink-0">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <span className="truncate max-w-[90px]">{name}</span>
          </div>
        );
      },
    },
  ];

  const docActions: DataTableAction<any>[] = [
    {
      label: "Procesar / Dar conformidad",
      icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
      onClick: handleProcessDocument,
      show: (row) => row.status === "PENDIENTE",
    },
    {
      label: "Descargar guía PDF",
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      onClick: handleDownloadPDF,
      show: () => true,
    },
    {
      label: "Ver detalle",
      icon: <Eye className="h-4 w-4 text-purple-500" />,
      onClick: (row) =>
        toast(`Documento: ${row.document_number}`, {
          icon: "🔍",
          style: { borderRadius: "12px", background: "#594246", color: "#fff" },
        }),
      show: () => true,
    },
  ];

  // ── Columnas — Kárdex (InventoryMovements) ─────────────────────────────────
  const kardexColumns: DataTableColumn<any>[] = [
    {
      id: "created_at",
      label: "Fecha",
      sortable: true,
      width: "130px",
      accessor: (row) => {
        if (!row.createdAt && !row.created_at) return <span className="text-gray-300">—</span>;
        const d = new Date(row.createdAt ?? row.created_at);
        return (
          <div className="flex flex-col text-xs text-gray-700 font-medium">
            <span>{d.toLocaleDateString("es-PE")}</span>
            <span className="text-[10px] text-gray-400">
              {d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      },
    },
    {
      id: "sku",
      label: "SKU variante",
      width: "150px",
      accessor: (row) => (
        <span className="font-mono text-xs text-gray-600">
          {row.id_variant?.sku_variant ?? row.variantSku ?? "—"}
        </span>
      ),
    },
    {
      id: "product_name",
      label: "Producto",
      width: "180px",
      accessor: (row) => (
        <span className="text-xs font-semibold text-gray-800 truncate block max-w-[170px]">
          {row.id_variant?.id_product?.name ?? row.productName ?? "—"}
        </span>
      ),
    },
    {
      id: "warehouse",
      label: "Almacén",
      width: "130px",
      accessor: (row) => (
        <span className="text-xs text-gray-600">
          {row.id_warehouse?.name?.replace("_", " ") ?? "—"}
        </span>
      ),
    },
    {
      id: "type",
      label: "Tipo",
      width: "100px",
      accessor: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            row.type === "ENTRADA"
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-rose-50 text-rose-600 border-rose-100"
          }`}
        >
          {row.type === "ENTRADA" ? "↑ Entrada" : "↓ Salida"}
        </span>
      ),
    },
    {
      id: "quantity",
      label: "Cantidad",
      width: "90px",
      accessor: (row) => (
        <span className="text-sm font-bold text-gray-700 block text-center">{row.quantity ?? "—"}</span>
      ),
    },
    {
      id: "new_stock",
      label: "Saldo",
      width: "90px",
      accessor: (row) => (
        <span className="text-sm font-bold text-[#594246] block text-center">{row.new_stock ?? "—"}</span>
      ),
    },
    {
      id: "reason",
      label: "Motivo",
      width: "130px",
      accessor: (row) => (
        <span className="text-xs text-gray-500 font-medium">{row.reason ?? "—"}</span>
      ),
    },
  ];

  // ── Filtros ────────────────────────────────────────────────────────────────
  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) return documents;
    const lower = searchTerm.toLowerCase();
    return documents.filter((d) =>
      [
        d.document_number,
        d.type,
        d.status,
        d.id_source_warehouse?.name,
        d.id_target_warehouse?.name,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(lower))
    );
  }, [documents, searchTerm]);

  const filteredMovements = useMemo(() => {
    if (!searchTerm.trim()) return rawMovements;
    const lower = searchTerm.toLowerCase();
    return rawMovements.filter((m) =>
      [
        m.type,
        m.reason,
        m.id_variant?.sku_variant,
        m.id_variant?.id_product?.name,
        m.id_warehouse?.name,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(lower))
    );
  }, [rawMovements, searchTerm]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#EBEAE8]">
        {(
          [
            { id: "documentos", label: "Documentos de Almacén", icon: FileText },
            { id: "kardex", label: "Historial Kárdex", icon: Activity },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setPage(0); setSearchTerm(""); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors border border-b-0 ${
              activeTab === id
                ? "bg-white text-[#594246] border-[#EBEAE8]"
                : "bg-transparent text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Documentos de Almacén */}
      {activeTab === "documentos" && (
        <DataTable
          rows={filteredDocuments}
          loading={loading || tableLoading}
          title="Documentos de Almacén"
          description="Todos los movimientos físicos del inventario: ingresos por compra, salidas por venta, transferencias entre almacenes y ajustes por merma."
          onAddClick={() =>
            toast("Selecciona productos en 'Stock Actual' y usa el asistente de movimiento.", {
              icon: "💡",
            })
          }
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          globalFilter={searchTerm}
          onGlobalFilterChange={(v) => { setSearchTerm(v); setPage(0); }}
          columns={docColumns}
          actions={docActions}
          hasActions
        />
      )}

      {/* Tab: Kárdex */}
      {activeTab === "kardex" && (
        <DataTable
          rows={filteredMovements as any[]}
          loading={loading || tableLoading}
          title="Historial del Kárdex"
          description="Líneas inmutables de auditoría generadas automáticamente al procesar cada documento de almacén. Solo lectura."
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          globalFilter={searchTerm}
          onGlobalFilterChange={(v) => { setSearchTerm(v); setPage(0); }}
          columns={kardexColumns}
          hasActions={false}
        />
      )}
    </div>
  );
}
