"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableAction, DataTableColumn } from "@/components/organisms";
import { useStorehouseStore, useSupplyWarehouseStore } from "@/hooks";
import { CheckCircle, FileText, Eye, Activity, Paperclip, AlertTriangle, ExternalLink, ShoppingBag, Image } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/atoms";

type ActiveTab = "documentos" | "kardex" | "insumos";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const NUEVOS_LABELS_LIMPIOS: Record<string, string> = {
  INGRESO_COMPRA:     "Ingreso por compra",
  INGRESO_PRODUCCION: "Ingreso por producción",
  SALIDA_VENTA:       "Salida por venta",
  TRANSFERENCIA:      "Transferencia",
  AJUSTE:             "Ajuste de inventario",
  ENTRADA:            "Entrada",
  SALIDA:             "Salida",
};

const NUEVOS_ESTILOS_DE_BADGE_TIPO: Record<string, React.CSSProperties> = {
  INGRESO_COMPRA:     { backgroundColor: '#022c22', color: '#6ee7b7', borderColor: '#065f46' },
  INGRESO_PRODUCCION: { backgroundColor: '#0c1a3a', color: '#93c5fd', borderColor: '#1e40af' },
  ENTRADA:            { backgroundColor: '#022c22', color: '#6ee7b7', borderColor: '#065f46' },
  SALIDA_VENTA:       { backgroundColor: '#4c0519', color: '#fda4af', borderColor: '#9f1239' },
  SALIDA:             { backgroundColor: '#4c0519', color: '#fda4af', borderColor: '#9f1239' },
  TRANSFERENCIA:      { backgroundColor: '#2e1065', color: '#c4b5fd', borderColor: '#5b21b6' },
  AJUSTE:             { backgroundColor: '#451a03', color: '#fcd34d', borderColor: '#92400e' },
  default:            { backgroundColor: '#27272a', color: '#a1a1aa', borderColor: '#3f3f46' },
};

const NUEVOS_ESTILOS_DE_ESTADO: Record<string, React.CSSProperties> = {
  PENDIENTE:  { backgroundColor: '#451a03', color: '#fcd34d', borderColor: '#92400e' },
  COMPLETADO: { backgroundColor: '#022c22', color: '#6ee7b7', borderColor: '#065f46' },
  CANCELADO:  { backgroundColor: '#18181b', color: '#a1a1aa', borderColor: '#3f3f46' },
  default:    { backgroundColor: '#18181b', color: '#a1a1aa', borderColor: '#3f3f46' },
};

const workerName = (w: any) =>
  w?.first_name ? `${w.first_name} ${w.last_name?.[0] ?? ""}.` : "—";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const SUPPLY_TX_LABELS: Record<string, string> = {
  PURCHASE: "Compra de insumos",
  DISPATCH: "Despacho a taller",
  RETURN: "Devolución de taller",
};

const SUPPLY_TX_STYLES: Record<string, React.CSSProperties> = {
  PURCHASE: { backgroundColor: '#022c22', color: '#6ee7b7', borderColor: '#065f46' },
  DISPATCH: { backgroundColor: '#4c0519', color: '#fda4af', borderColor: '#9f1239' },
  RETURN:   { backgroundColor: '#2e1065', color: '#c4b5fd', borderColor: '#5b21b6' },
};

export default function AdminMovementsPage() {
  const {
    startLoadingWarehouseDocuments,
    startProcessWarehouseDocument,
    startLoadingInventoryMovements,
    loading,
  } = useStorehouseStore();

  const { loadTransactions, transactions } = useSupplyWarehouseStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("documentos");
  const [documents, setDocuments] = useState<any[]>([]);
  const [rawMovements, setRawMovements] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isTxDetailOpen, setIsTxDetailOpen] = useState(false);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  const loadData = async () => {
    setTableLoading(true);
    try {
      const [docs, moves] = await Promise.all([
        startLoadingWarehouseDocuments(),
        startLoadingInventoryMovements(),
      ]);
      setDocuments(Array.isArray(docs) ? docs : []);
      setRawMovements(Array.isArray(moves) ? moves : []);
    } catch {
      toast.error("Error al cargar los datos de inventario.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    void loadTransactions();
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



  // ── Columnas — WarehouseDocuments ──────────────────────────────────────────
  const docColumns: DataTableColumn<any>[] = [
    {
      id: "created_at",
      label: "Fecha",
      sortable: true,
      width: "150px",
      accessor: (row) => {
        if (!row.created_at) return <span className="text-zinc-500">—</span>;
        const d = new Date(row.created_at);
        return (
          <div className="flex flex-col">
            <span className="text-sm text-zinc-200 font-medium">{d.toLocaleDateString("es-PE")}</span>
            <span className="text-xs text-zinc-500 font-normal">
              {d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      },
    },
    {
      id: "document_number",
      label: "N° Documento",
      width: "180px",
      accessor: (row) => (
        <span className="text-sm text-zinc-300 font-medium whitespace-nowrap min-w-[140px] inline-block">
          {row.document_number ?? "—"}
        </span>
      ),
    },
    {
      id: "type",
      label: "Tipo",
      width: "180px",
      accessor: (row) => (
        <span 
          className="text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap"
          style={NUEVOS_ESTILOS_DE_BADGE_TIPO[row.type] || NUEVOS_ESTILOS_DE_BADGE_TIPO.default}
        >
          • {NUEVOS_LABELS_LIMPIOS[row.type] ?? row.type}
        </span>
      ),
    },
    {
      id: "route",
      label: "Origen ➔ Destino",
      width: "260px",
      headerClassName: "min-w-[140px] whitespace-nowrap",
      accessor: (row) => {
        const src = row.id_source_warehouse?.name?.replace("_", " ") ?? "Externo";
        const tgt = row.id_target_warehouse?.name?.replace("_", " ") ?? "—";
        return (
          <div className="flex flex-col text-xs">
            <span className="text-zinc-400">{src} <span className="text-zinc-600">➔</span></span>
            <span className="text-zinc-300 font-medium">{tgt}</span>
          </div>
        );
      },
    },
    {
      id: "items_count",
      label: "Prendas",
      width: "100px",
      accessor: (row) => (
        <span className="text-sm text-zinc-300 text-center block">
          {row.items?.length ?? 0}
        </span>
      ),
    },
    {
      id: "status",
      label: "Estado",
      width: "140px",
      accessor: (row) => (
        <span 
          className="text-xs font-medium px-2.5 py-0.5 rounded-full border whitespace-nowrap"
          style={NUEVOS_ESTILOS_DE_ESTADO[row.status] || NUEVOS_ESTILOS_DE_ESTADO.default}
        >
          {row.status ?? "—"}
        </span>
      ),
    },
    {
      id: "attachments",
      label: "Adjuntos",
      width: "140px",
      accessor: (row) => {
        const atts = row.attachments || [];
        if (atts.length === 0) return <span className="text-gray-300 text-xs italic block text-center">—</span>;
        return (
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {atts.map((url: string, index: number) => {
              const parts = url.split("?")[0].split("/");
              const rawName = parts[parts.length - 1];
              const decodedName = decodeURIComponent(rawName);
              const cleanName = decodedName.split("-").slice(1).join("-") || decodedName || `Adjunto ${index + 1}`;
              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 bg-rose-50 text-[#D6405F] hover:bg-rose-100 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 rounded border border-[#EEDCE1] dark:border-white/10 transition-colors"
                  title={cleanName}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>
        );
      },
    },
    {
      id: "sender",
      label: "Creado por",
      width: "170px",
      headerClassName: "min-w-[160px] whitespace-nowrap",
      accessor: (row) => {
        const name = workerName(row.id_sender_worker);
        return (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium whitespace-nowrap">
            <div className="w-5 h-5 rounded-full bg-rose-100 text-[#F2778D] flex items-center justify-center font-medium text-[9px] shrink-0">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <span className="truncate max-w-[120px]">{name}</span>
          </div>
        );
      },
    },
    {
      id: "receiver",
      label: "Procesado por",
      width: "170px",
      accessor: (row) => {
        if (!row.id_receiver_worker?.first_name)
          return <span className="text-gray-300 text-xs italic block text-center">—</span>;
        const name = workerName(row.id_receiver_worker);
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-medium text-[9px] shrink-0">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <span className="truncate max-w-[120px]">{name}</span>
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
      label: "Ver detalle",
      icon: <Eye className="h-4 w-4 text-purple-500" />,
      onClick: (row) => {
        setSelectedDoc(row);
        setIsDetailOpen(true);
      },
      show: () => true,
    },
  ];

  // ── Columnas — Kárdex (InventoryMovements) ─────────────────────────────────
  const kardexColumns: DataTableColumn<any>[] = [
    {
      id: "created_at",
      label: "Fecha",
      sortable: true,
      width: "150px",
      accessor: (row) => {
        if (!row.createdAt && !row.created_at) return <span className="text-zinc-500">—</span>;
        const d = new Date(row.createdAt ?? row.created_at);
        return (
          <div className="flex flex-col">
            <span className="text-sm text-zinc-200 font-medium">{d.toLocaleDateString("es-PE")}</span>
            <span className="text-xs text-zinc-500 font-normal">
              {d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      },
    },
    {
      id: "sku",
      label: "SKU variante",
      width: "180px",
      accessor: (row) => (
        <span className="text-sm text-zinc-300 font-medium">
          {row.id_variant?.sku_variant ?? row.variantSku ?? "—"}
        </span>
      ),
    },
    {
      id: "product_name",
      label: "Producto",
      width: "240px",
      accessor: (row) => (
        <span className="text-xs text-zinc-300 font-medium truncate block max-w-[220px]">
          {row.id_variant?.id_product?.name ?? row.productName ?? "—"}
        </span>
      ),
    },
    {
      id: "warehouse",
      label: "Almacén",
      width: "160px",
      accessor: (row) => (
        <span className="text-xs text-zinc-400">
          {row.id_warehouse?.name?.replace("_", " ") ?? "—"}
        </span>
      ),
    },
    {
      id: "type",
      label: "Tipo",
      width: "120px",
      accessor: (row) => (
        <span 
          className="text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap"
          style={NUEVOS_ESTILOS_DE_BADGE_TIPO[row.type] || NUEVOS_ESTILOS_DE_BADGE_TIPO.default}
        >
          • {NUEVOS_LABELS_LIMPIOS[row.type] ?? row.type}
        </span>
      ),
    },
    {
      id: "quantity",
      label: "Cantidad",
      width: "110px",
      accessor: (row) => (
        <span className="text-sm font-bold text-zinc-300 block text-center">{row.quantity ?? "—"}</span>
      ),
    },
    {
      id: "new_stock",
      label: "Saldo",
      width: "110px",
      accessor: (row) => (
        <span className="text-sm font-bold text-zinc-200 block text-center">{row.new_stock ?? "—"}</span>
      ),
    },
    {
      id: "reason",
      label: "Motivo",
      width: "180px",
      accessor: (row) => (
        <span className="text-xs text-zinc-500 font-medium">{row.reason ?? "—"}</span>
      ),
    },
  ];

  // ── Columnas — Compras de Insumos (SupplyTransactions) ────────────────────
  const supplyTxColumns: DataTableColumn<any>[] = [
    {
      id: "created_at",
      label: "Fecha",
      sortable: true,
      width: "150px",
      accessor: (row) => {
        const d = new Date(row.created_at);
        return (
          <div className="flex flex-col">
            <span className="text-sm text-zinc-200 font-medium">{d.toLocaleDateString("es-PE")}</span>
            <span className="text-xs text-zinc-500">{d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        );
      },
    },
    {
      id: "type",
      label: "Tipo",
      width: "200px",
      accessor: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap"
          style={SUPPLY_TX_STYLES[row.type] || { backgroundColor: '#27272a', color: '#a1a1aa', borderColor: '#3f3f46' }}>
          • {SUPPLY_TX_LABELS[row.type] ?? row.type}
        </span>
      ),
    },
    {
      id: "supplier_name",
      label: "Proveedor / Taller",
      width: "200px",
      accessor: (row) => (
        <span className="text-sm text-zinc-300">{row.supplier_name || row.id_workshop?.name || "—"}</span>
      ),
    },
    {
      id: "items_count",
      label: "Insumos",
      width: "100px",
      accessor: (row) => (
        <span className="text-sm text-zinc-300 text-center block">{row.items?.length ?? 0}</span>
      ),
    },
    {
      id: "total",
      label: "Total S/",
      width: "120px",
      accessor: (row) => {
        const total = (row.items || []).reduce((acc: number, i: any) => acc + ((i.cost ?? 0) * (i.quantity ?? 0)), 0);
        return <span className="text-sm font-bold text-zinc-200 text-right block">{total > 0 ? `S/ ${total.toFixed(2)}` : "—"}</span>;
      },
    },
    {
      id: "evidence",
      label: "Evidencias",
      width: "120px",
      accessor: (row) => {
        const imgs = (row.evidence_images || []).filter((u: string) => typeof u === "string" && u.startsWith("http"));
        if (!imgs.length) return <span className="text-zinc-500 text-xs italic block text-center">—</span>;
        return (
          <div className="flex items-center justify-center gap-1">
            {imgs.map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="p-1 bg-violet-900/30 text-violet-400 hover:bg-violet-900/60 rounded border border-violet-800/40 transition-colors" title="Ver evidencia">
                <Image className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        );
      },
    },
    {
      id: "notes",
      label: "Notas",
      width: "200px",
      accessor: (row) => (
        <span className="text-xs text-zinc-500 truncate block max-w-[180px]">{row.notes || "—"}</span>
      ),
    },
  ];

  const supplyTxActions: DataTableAction<any>[] = [
    {
      label: "Ver detalle",
      icon: <Eye className="h-4 w-4 text-purple-500" />,
      onClick: (row) => { setSelectedTx(row); setIsTxDetailOpen(true); },
      show: () => true,
    },
  ];

  const filteredSupplyTx = useMemo(() => {
    if (!searchTerm.trim()) return transactions;
    const lower = searchTerm.toLowerCase();
    return transactions.filter((t) =>
      [t.type, t.supplier_name, t.notes, t.id_workshop?.name]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(lower))
    );
  }, [transactions, searchTerm]);

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

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <header className="mb-8 px-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B3A52]/60 dark:text-white/30 mb-2">Movimientos</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[#40202D] dark:text-white leading-none" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2.8rem', fontWeight: 300 }}>
              Documentos de Almacén
            </h1>
            <p className="text-[#8C6B79]/60 dark:text-white/30 text-xs mt-2 tracking-wide">
              Gestión de ingresos, salidas, transferencias y movimientos físicos del inventario
            </p>
          </div>
          {/* Stats rápidas */}
          <div className="flex gap-3 shrink-0">
            {[
              { label: "Documentos", value: documents.length, color: "zinc" },
              { label: "Kárdex", value: rawMovements.length, color: "zinc" },
              { label: "Compras", value: transactions.length, color: "violet" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`text-center px-4 py-2.5 rounded-xl border ${color === "violet" ? "bg-violet-900/20 border-violet-800/30" : "bg-zinc-800/40 border-zinc-700/40"}`}>
                <p className={`text-xl font-bold ${color === "violet" ? "text-violet-400" : "text-zinc-200"}`}>{value}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl w-fit mb-6">
          {(
            [
              { id: "documentos", label: "Documentos de Almacén", icon: FileText },
              { id: "kardex",     label: "Historial Kárdex",      icon: Activity },
              { id: "insumos",    label: "Compras de Insumos",    icon: ShoppingBag },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setPage(0); setSearchTerm(""); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === id
                  ? id === "insumos"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                    : "bg-[#8B3A52] text-white shadow-lg shadow-rose-900/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

      {/* Tab: Documentos de Almacén */}
      {activeTab === "documentos" && (
        <DataTable
          rows={filteredDocuments}
          loading={loading || tableLoading}
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
          containerClassName="bg-transparent shadow-none w-full h-full"
          headerRowClassName="bg-zinc-900 border-b border-zinc-700 text-xs font-medium text-zinc-400 uppercase tracking-wide"
          rowClassName={(_, idx) => `transition-colors border-b border-zinc-800 ${idx % 2 === 0 ? "bg-zinc-900/40" : "bg-zinc-800/20"}`}
          hasActions
        />
      )}

      {/* Tab: Kárdex */}
      {activeTab === "kardex" && (
        <DataTable
          rows={filteredMovements as any[]}
          loading={loading || tableLoading}
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
          containerClassName="bg-transparent shadow-none w-full h-full"
          headerRowClassName="bg-zinc-900 border-b border-zinc-700 text-xs font-medium text-zinc-400 uppercase tracking-wide"
          rowClassName={(_, idx) => `transition-colors border-b border-zinc-800 ${idx % 2 === 0 ? "bg-zinc-900/40" : "bg-zinc-800/20"}`}
          hasActions={false}
        />
      )}

      {/* Tab: Compras de Insumos */}
      {activeTab === "insumos" && (
        <DataTable
          rows={filteredSupplyTx}
          loading={tableLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
          globalFilter={searchTerm}
          onGlobalFilterChange={(v) => { setSearchTerm(v); setPage(0); }}
          columns={supplyTxColumns}
          actions={supplyTxActions}
          containerClassName="bg-transparent shadow-none w-full h-full"
          headerRowClassName="bg-zinc-900 border-b border-zinc-700 text-xs font-medium text-zinc-400 uppercase tracking-wide"
          rowClassName={(_, idx) => `transition-colors border-b border-zinc-800 ${idx % 2 === 0 ? "bg-zinc-900/40" : "bg-zinc-800/20"}`}
          hasActions
        />
      )}

      {/* Modal detalle compra insumo */}
      {selectedTx && (
        <SupplyTxDetailModal
          isOpen={isTxDetailOpen}
          onClose={() => { setIsTxDetailOpen(false); setSelectedTx(null); }}
          tx={selectedTx}
        />
      )}

      {/* Modal de Detalles del Documento */}
      {selectedDoc && (
        <MovementDetailsModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedDoc(null);
          }}
          doc={selectedDoc}
        />
      )}
      </div>
    </div>
  );
}

// ── SUBCOMPONENTE: MODAL DETALLE COMPRA INSUMOS ────────────────────────────────
function SupplyTxDetailModal({ isOpen, onClose, tx }: { isOpen: boolean; onClose: () => void; tx: any }) {
  const total = (tx.items || []).reduce((acc: number, i: any) => acc + ((i.cost ?? 0) * (i.quantity ?? 0)), 0);
  return (
    <Modal open={isOpen} onClose={onClose} title={`Documento de ${SUPPLY_TX_LABELS[tx.type] ?? tx.type}`}>
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar text-left font-sans">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10">
            <p className="text-[10px] font-bold tracking-widest text-[#8C6B79] uppercase mb-1">Tipo</p>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md border" style={SUPPLY_TX_STYLES[tx.type]}>
              {SUPPLY_TX_LABELS[tx.type] ?? tx.type}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10">
            <p className="text-[10px] font-bold tracking-widest text-[#8C6B79] uppercase mb-1">Fecha</p>
            <p className="text-sm font-bold text-[#40202D] dark:text-white">
              {new Date(tx.created_at).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {(tx.supplier_name || tx.id_workshop?.name) && (
          <div className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10">
            <p className="text-[10px] font-bold tracking-widest text-[#8C6B79] uppercase mb-1">
              {tx.type === "PURCHASE" ? "Proveedor" : "Taller"}
            </p>
            <p className="text-sm font-bold text-[#40202D] dark:text-white">{tx.supplier_name || tx.id_workshop?.name}</p>
            {tx.notes && <p className="text-xs text-[#8C6B79] mt-1">{tx.notes}</p>}
          </div>
        )}

        <section className="space-y-2">
          <h5 className="text-[11px] font-bold tracking-wider text-[#8C6B79] uppercase border-b border-[#EAE0E2] dark:border-white/5 pb-1">
            Detalle de Insumos ({tx.items?.length ?? 0})
          </h5>
          <div className="rounded-xl border border-[#EAE0E2] dark:border-white/10 overflow-hidden text-[12px]">
            <table className="w-full">
              <thead className="bg-white/50 dark:bg-white/5">
                <tr className="text-[9px] font-bold text-[#8C6B79] uppercase tracking-widest border-b border-[#EAE0E2] dark:border-white/5">
                  <th className="p-3 text-left">Insumo</th>
                  <th className="p-3 text-left">Especificación</th>
                  <th className="p-3 text-center">Cantidad</th>
                  <th className="p-3 text-center">Costo unit.</th>
                  <th className="p-3 text-center">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {(tx.items || []).map((item: any, idx: number) => {
                  const subtotal = (item.cost ?? 0) * (item.quantity ?? 0);
                  return (
                    <tr key={idx} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-[#40202D] dark:text-white">{item.id_supply?.name ?? "—"}</td>
                      <td className="p-3 text-[#8C6B79]">{item.specifications || "—"}</td>
                      <td className="p-3 text-center font-bold text-[#40202D] dark:text-white">{item.quantity}</td>
                      <td className="p-3 text-center text-[#8C6B79]">{item.cost ? `S/ ${item.cost.toFixed(2)}` : "—"}</td>
                      <td className="p-3 text-center font-bold text-[#D6405F]">{subtotal > 0 ? `S/ ${subtotal.toFixed(2)}` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
              {total > 0 && (
                <tfoot className="bg-white/50 dark:bg-white/5 border-t border-[#EAE0E2] dark:border-white/10">
                  <tr>
                    <td colSpan={4} className="p-3 text-right text-xs font-bold text-[#8C6B79] uppercase tracking-wider">Total</td>
                    <td className="p-3 text-center font-bold text-lg text-[#D6405F]">S/ {total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>

        {(() => {
          const validImgs = (tx.evidence_images || []).filter((u: string) => typeof u === "string" && u.startsWith("http"));
          return validImgs.length > 0 && (
          <section className="space-y-2">
            <h5 className="text-[11px] font-bold tracking-wider text-[#8C6B79] uppercase border-b border-[#EAE0E2] dark:border-white/5 pb-1">
              Evidencias ({validImgs.length})
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {validImgs.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="block rounded-xl overflow-hidden border border-[#EAE0E2] dark:border-white/10 hover:border-[#D6405F] transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Evidencia ${i + 1}`} className="w-full h-28 object-cover" />
                </a>
              ))}
            </div>
          </section>
        );})()}

        <button onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white font-bold text-[11px] uppercase tracking-widest transition-all">
          Cerrar
        </button>
      </div>
    </Modal>
  );
}

// ── SUBCOMPONENTE: MODAL DE DETALLES DEL DOCUMENTO ─────────────────────────────
function MovementDetailsModal({ isOpen, onClose, doc }: { isOpen: boolean; onClose: () => void; doc: any }) {
  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })
      : "Fecha no disponible";

  const sourceName = doc.id_source_warehouse?.name?.replace(/_/g, " ") ?? "Proveedor externo";
  const targetName = doc.id_target_warehouse?.name?.replace(/_/g, " ") ?? "—";
  
  const workerName = (worker: any) => {
    if (!worker) return "Sistema / Admin";
    if (typeof worker === "string") return worker;
    return `${worker.first_name || ""} ${worker.last_name || ""}`.trim() || worker.email || "Usuario";
  };

  const senderName = workerName(doc.id_sender_worker);
  const receiverName = workerName(doc.id_receiver_worker);

  const DOC_TYPE_LABELS: Record<string, string> = {
    INGRESO_COMPRA: "📥 Ingreso compra",
    SALIDA_VENTA: "📤 Salida venta",
    TRANSFERENCIA: "⇄ Transferencia",
    AJUSTE: "⚖️ Ajuste",
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={`Expediente de Movimiento: ${doc.document_number}`}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar text-left font-sans">
        {/* Cabecera de Estados y Tipo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-sm backdrop-blur-md">
            <p className="text-[10px] font-medium tracking-widest text-[#8C6B79] dark:text-gray-400 uppercase">Tipo Documento</p>
            <p className="text-[13px] font-bold text-[#40202D] dark:text-white mt-1">
              {DOC_TYPE_LABELS[doc.type] || doc.type}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-sm backdrop-blur-md">
            <p className="text-[10px] font-medium tracking-widest text-[#8C6B79] dark:text-gray-400 uppercase">Estado actual</p>
            <p className="text-[13px] font-medium text-[#D6405F] dark:text-[#F8BBD0] mt-1 uppercase">
              {doc.status}
            </p>
          </div>
        </div>

        {/* Información general */}
        <section className="space-y-3">
          <h5 className="text-[11px] font-medium tracking-wider text-[#8C6B79] dark:text-gray-300 uppercase border-b border-[#EAE0E2] dark:border-white/5 pb-1">
            Información del Movimiento
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-5 text-[12px] bg-white/30 dark:bg-black/25 p-4 rounded-xl border border-[#EAE0E2] dark:border-white/5">
            <div>
              <p className="text-[#8C6B79] dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Fecha Creación:</p>
              <p className="font-bold text-[#40202D] dark:text-white">{formatDate(doc.created_at)}</p>
            </div>
            <div>
              <p className="text-[#8C6B79] dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Ruta de Inventario:</p>
              <p className="font-bold text-[#40202D] dark:text-white">
                <span className="text-gray-600 dark:text-gray-300">{sourceName}</span>
                <span className="mx-1 text-rose-400">➔</span>
                <span className="text-[#D6405F] dark:text-[#F8BBD0]">{targetName}</span>
              </p>
            </div>
            <div>
              <p className="text-[#8C6B79] dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Despachado / Creado por:</p>
              <p className="font-semibold text-gray-700 dark:text-gray-200">{senderName}</p>
            </div>
            <div>
              <p className="text-[#8C6B79] dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Procesado / Conformado por:</p>
              <p className="font-semibold text-gray-700 dark:text-gray-200">{receiverName || "—"}</p>
            </div>
          </div>
        </section>

        {/* Listado de Ítems */}
        <section className="space-y-3">
          <h5 className="text-[11px] font-medium tracking-wider text-[#8C6B79] dark:text-gray-300 uppercase border-b border-[#EAE0E2] dark:border-white/5 pb-1">
            Detalle de Prendas ({doc.items?.length || 0})
          </h5>
          <div className="rounded-xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 overflow-hidden text-[12px] shadow-inner">
            <table className="w-full">
              <thead className="bg-white/50 dark:bg-white/5">
                <tr className="text-[9px] font-bold text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest border-b border-[#EAE0E2] dark:border-white/5">
                  <th className="p-3 text-left">SKU / Producto</th>
                  <th className="p-3 text-center">Talla / Color</th>
                  <th className="p-3 text-center">Esperado</th>
                  <th className="p-3 text-center">Recibido</th>
                  <th className="p-3 text-left">Observación / Incidencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {doc.items?.map((item: any, idx: number) => {
                  const v = item.id_variant;
                  const sku = typeof v === "object" ? v.sku_variant : `SKU-${idx}`;
                  const productName = typeof v === "object" ? v.id_product?.name : "Prenda";
                  const size = typeof v === "object" ? v.size : "—";
                  const colorName = typeof v === "object" ? v.color?.name : "—";
                  
                  return (
                    <tr key={idx} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] text-gray-400">{sku}</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-200">{productName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center font-medium text-gray-600 dark:text-gray-300">
                        {size} / {colorName}
                      </td>
                      <td className="p-3 text-center font-bold text-gray-600 dark:text-gray-300">
                        {item.quantity_expected}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-bold ${item.quantity_received < item.quantity_expected ? 'text-amber-500 font-medium' : 'text-[#D6405F] dark:text-[#F8BBD0]'}`}>
                          {item.quantity_received}
                        </span>
                      </td>
                      <td className="p-3 text-left">
                        {item.incidence_note ? (
                          <div className="flex items-start gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-tight">{item.incidence_note}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Log/Notas del Proceso */}
        {doc.notes && (
          <section className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/5 shadow-inner">
            <h5 className="text-[10px] font-medium tracking-widest text-[#8C6B79] dark:text-gray-400 uppercase mb-1.5">Notas adicionales:</h5>
            <p className="text-[12px] text-gray-600 dark:text-gray-200 font-medium italic leading-relaxed">
              {doc.notes}
            </p>
          </section>
        )}

        {/* Documentos Adjuntos (Evidencias y Guías) */}
        <section className="space-y-3">
          <h5 className="text-[11px] font-medium tracking-wider text-[#8C6B79] dark:text-gray-300 uppercase border-b border-[#EAE0E2] dark:border-white/5 pb-1">
            Evidencias y Guías Documentales ({doc.attachments?.length || 0})
          </h5>
          {doc.attachments && doc.attachments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doc.attachments.map((url: string, index: number) => {
                const parts = url.split("?")[0].split("/");
                const rawName = parts[parts.length - 1];
                const decodedName = decodeURIComponent(rawName);
                const cleanName = decodedName.split("-").slice(1).join("-") || decodedName || `Evidencia_${index + 1}`;
                const ext = cleanName.split(".").pop()?.toLowerCase();
                const isPdf = ext === "pdf";

                return (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-[#EAE0E2] dark:border-white/10 hover:border-[#D6405F] dark:hover:border-[#F2778D] rounded-xl transition-all shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-[#F2778D]/10 flex items-center justify-center shrink-0">
                      <FileText className={`w-4 h-4 ${isPdf ? "text-red-500" : "text-[#D6405F] dark:text-[#F2778D]"}`} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 truncate group-hover:text-[#D6405F] dark:group-hover:text-[#F2778D]">
                        {cleanName}
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium">Ver adjunto</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-60 shrink-0" />
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-white/50 dark:bg-black/10 rounded-xl border border-dashed border-[#EAE0E2] dark:border-white/5 text-center">
              <p className="text-[11px] text-gray-400 italic">No se han subido evidencias o guías físicas para este documento.</p>
            </div>
          )}
        </section>

        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] hover:from-[#5B283A] hover:to-[#40202D] text-white font-bold text-[11px] uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
        >
          Cerrar Detalle
        </button>
      </div>
    </Modal>
  );
}
