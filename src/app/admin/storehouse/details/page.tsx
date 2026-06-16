"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { 
  Search, ChevronDown, Package, Truck, 
  ClipboardCheck, CheckCircle2, XCircle, 
  Eye,
  Trophy,
  Check,
  Plus, CalendarClock, Star,
  FileText, Paperclip, ExternalLink
} from "lucide-react";
import { useStorehouseStore } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "@/components";
import { ApproveInventoryModal } from "@/components/features/storehouse/aprove-order-modal";
import { ExtendDateModal } from "@/components/features/storehouse/extended-date-modal";
import { OrderDetailsModal } from "@/components/features/storehouse/order-detail-modal";

// --- HELPERS ---
const formatCurrency = (val: number) => `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "Fecha no disponible";

const StarRating = ({ rating, setRating, size = 6 }: { rating: number; setRating?: (r: number) => void; size?: number }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => setRating?.(star)}
          disabled={!setRating}
          type="button"
          className={`transition-all ${star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} ${!setRating ? "cursor-default" : "hover:scale-110"}`}
        >
          <Star className={`w-${size} h-${size} ${star <= rating ? "fill-amber-400" : ""}`} />
        </button>
      ))}
    </div>
  );
};

export default function PrePurchaseOrderTracking() {
  const { startLoadingPrePurchaseOrders, prePurchaseOrders,loading } = useStorehouseStore();
  const [filter, setFilter] = useState("TODAS");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    startLoadingPrePurchaseOrders('ABASTECIMIENTO');
        console.log("PrePurchaseOrders cargadas:", prePurchaseOrders);
  }, [startLoadingPrePurchaseOrders]);

  const isDeliveryToday = (opp: any) => {
    const deliveryDate = opp.id_purchase_order?.delivery_date_estimated;
    if (!deliveryDate) return false;
    
    const today = new Date();
    const d = new Date(deliveryDate);
    
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const MOCK_TEST_ORDERS = [
    {
      _id: "test-retail-1",
      pre_order_number: "OPP-M-2026",
      status: "COMPARANDO",
      created_at: new Date().toISOString(),
      estimated_delivery_date: new Date(Date.now() + 86400000 * 5).toISOString(),
      base_items: [
        { 
          quantity: 120, 
          id_variant: { 
            size: "M", 
            color: "Azul Marino", 
            id_product: { 
              name: "Pantalón Denim Clásico",
              images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"]
            } 
          } 
        }
      ],
      quotes: [
        { quote_status: 'COTIZADO', id_agent: { name_company: "Textiles del Sur S.A." }, total_amount: 15000, ranking_score: 0.95 },
        { quote_status: 'COTIZADO', id_agent: { name_company: "Confecciones Lima S.A.C" }, total_amount: 16500, ranking_score: 0.88 }
      ]
    },
    {
      _id: "test-retail-2",
      pre_order_number: "OPP-S-2026",
      status: "CONVERTIDA",
      created_at: new Date().toISOString(),
      id_purchase_order: { _id: "po-1", delivery_date_estimated: new Date().toISOString(), order_number: "OC-2026-001" }, // Entrega hoy
      base_items: [
        { 
          quantity: 50, 
          id_variant: { 
            size: "L", 
            color: "Negro", 
            id_product: { 
              name: "Casaca de Cuero Sintético",
              images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400"]
            } 
          } 
        }
      ],
      quotes: [
        { quote_status: 'SELECCIONADO', id_agent: { name_company: "Moda Rápida E.I.R.L" }, total_amount: 4500, ranking_score: 0.90 }
      ]
    }
  ];

  const activeOrders = useMemo(() => {
    const fromApi = prePurchaseOrders.filter(o => o.status !== "COMPLETADA");
    return fromApi.length > 0 ? fromApi : MOCK_TEST_ORDERS;
  }, [prePurchaseOrders]);


  const counts = useMemo(() => ({
    TODAS: activeOrders.length,
    "ENTREGA HOY": activeOrders.filter(o => isDeliveryToday(o)).length,
    "CONTACTO INICIAL": activeOrders.filter(o => o.status === "SOLICITANDO").length,
    "EN CAMINO": activeOrders.filter(o => o.status === "COMPARANDO" || o.status === "CONVERTIDA").length,
    "REVISIÓN": activeOrders.filter(o => o.status === "EN_REVISION").length,
  }), [activeOrders]);

  const filteredOrders = useMemo(() => {
    let result = [...activeOrders];

    // Filtro por Categoría/Fecha
    if (filter === "ENTREGA HOY") {
      result = result.filter(o => isDeliveryToday(o));
    } else if (filter === "CONTACTO INICIAL") {
      result = result.filter(o => o.status === "SOLICITANDO");
    } else if (filter === "EN CAMINO") {
      result = result.filter(o => o.status === "COMPARANDO" || o.status === "CONVERTIDA");
    } else if (filter === "REVISIÓN") {
      result = result.filter(o => o.status === "EN_REVISION");
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.pre_order_number.toLowerCase().includes(q) || 
        o.id_purchase_order?.order_number?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeOrders, filter, searchTerm]);

  
  return (
    <section className="mx-auto max-w-7xl space-y-8 px-6 py-10 transition-colors duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#D6405F] dark:text-[#F8BBD0] mb-2">
            Seguimiento Activo
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-[#40202D] dark:text-white tracking-wide">
            Órdenes de Pre-Compra
          </h1>
          <p className="text-sm font-medium text-[#8C6B79] dark:text-gray-300 mt-1">
            {counts.TODAS} procesos en curso
          </p>
        </div>
      </header>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C6B79] dark:text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por N° de orden o código..."
          className="h-16 w-full rounded-[2rem] border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md pl-14 pr-6 text-[14px] font-bold text-[#40202D] dark:text-white placeholder:text-[#8C6B79] outline-none shadow-inner focus:ring-2 focus:ring-[#D6405F]/50 transition-all"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all shadow-sm ${
              filter === key 
                ? "bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white hover:scale-[1.02]" 
                : "border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md text-[#8C6B79] dark:text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#40202D] dark:hover:text-white"
            }`}
          >
            {key === "ENTREGA HOY" ? <CalendarClock className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            {key} ({count})
          </button>
        ))}
      </div>

      {/* Listado */}
      <div className="space-y-8">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((opp: any) => (
            <OPPCard key={opp._id} opp={opp} />
          ))
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-[#EAE0E2] dark:border-white/20 rounded-[3rem] bg-white/30 dark:bg-white/5 backdrop-blur-sm shadow-inner">
             <Package className="mx-auto h-16 w-16 text-[#8C6B79] dark:text-gray-500 mb-6 opacity-40" />
             <p className="text-[14px] font-bold text-[#8C6B79] dark:text-gray-400">No se encontraron órdenes en esta categoría.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function OPPCard({ opp }: { opp: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { startUpdateSupplierQuote, startSelectWinnerAndConvert, approveInventory, extendOCDate, startInitalQualityCheck, startLoadingPrePurchaseOrders, startUploadPoAttachment, loading } = useStorehouseStore();

  const purchaseOrderId = typeof opp.id_purchase_order === 'object' 
    ? opp.id_purchase_order?._id 
    : opp.id_purchase_order;

  // 🚀 CORRECCIÓN AQUÍ: Usamos 'opp' que es la prop real de tu tarjeta
  // Sumamos las cantidades ordenadas guardadas en los items de la OC
  const totalItemsInOrder = useMemo(() => {
    return opp.id_purchase_order?.items?.reduce(
      (acc: number, item: any) => acc + item.quantity, 0
    ) || 0;
  }, [opp.id_purchase_order?.items]);

  const firstItem = opp.base_items?.[0]?.id_variant?.id_product;
    const handleApprove = async (rating: number) => {
    await approveInventory(purchaseOrderId, rating);
    setIsApproveModalOpen(false);
  };

  const handleExtend = async (date: string, reason: string) => {
    await extendOCDate(purchaseOrderId, date, reason);
    setIsExtendModalOpen(false);
  };
  const getProgress = () => {
  if (opp.status === "EN_REVISION") return 100; // ✅ Salta al final al iniciar control
  if (opp.status === "CONVERTIDA") return 50; 
  if (opp.status === "COMPARANDO") return 25; 
  return 10;
};

	const selectedQuote = opp.quotes?.find((q: any) => q.quote_status === 'SELECCIONADO');
  const totalAmount = opp.quotes?.find((q: any) => q.quote_status === 'SELECCIONADO')?.total_amount || 0;

  return (
    <article className="rounded-[32px] border border-[#EAE0E2] dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl p-6 md:p-8 shadow-sm transition-all overflow-hidden group hover:shadow-md">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8">
        <div className="flex items-start gap-5 sm:gap-6">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-[1.5rem] bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-inner flex items-center justify-center transition-transform group-hover:scale-105">
            {firstItem?.images?.[0] && firstItem.images[0].trim() !== "" ? (
              <Image 
                src={firstItem.images[0]} 
                alt={firstItem?.name || "Product"} 
                fill 
                className="object-cover" 
              />
            ) : (
              <Package className="h-8 w-8 text-[#8C6B79] opacity-60" />
            )}
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl sm:text-[22px] font-black text-[#40202D] dark:text-white tracking-wide leading-tight">{firstItem?.name || "Producto sin nombre"}</h3>
              
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                  opp.status === 'COMPLETADA' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' :
                  opp.status === 'EN_REVISION' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 
                  opp.status === 'CONVERTIDA' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                }`}>
                  {opp.status === 'COMPLETADA' ? 'Finalizada' :
                  opp.status === 'EN_REVISION' ? 'En Inspección' : 
                  opp.status === 'CONVERTIDA' ? 'Orden Generada' : 'Pendiente'}
                </span>

                {opp.status === 'COMPLETADA' && (
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-[#EAE0E2] dark:border-white/10 shadow-inner">
                    <span className="text-[9px] font-black tracking-widest text-[#8C6B79] dark:text-gray-400 uppercase">Calificación:</span>
                    <StarRating rating={opp.id_purchase_order?.quality_rating || 5} size={3} />
                  </div>
                )}
              </div>
            </div>
            <div className="text-[12px] sm:text-[13px] text-[#8C6B79] dark:text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
              <span className="font-bold">{opp.pre_order_number}</span>
              <span className="mx-1 opacity-40">|</span>
              <span className="text-[#40202D] dark:text-white font-black">{opp.quotes?.length || 0} Proveedores</span>
              <span className="mx-1 opacity-40">|</span>
              <span className="font-bold">{opp.base_items?.reduce((acc: number, it: any) => acc + it.quantity, 0) || 0} uds</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-5 sm:gap-8 lg:gap-12 pt-5 xl:pt-0 border-t xl:border-t-0 border-[#EAE0E2] dark:border-white/10">
          <div className="space-y-2 sm:space-y-3 min-w-[140px]">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
              <span className="text-[#8C6B79] dark:text-gray-400">Progreso</span>
              <span className="text-[#D6405F] dark:text-[#F8BBD0]">{getProgress()}%</span>
            </div>
            <div className="h-2.5 w-32 sm:w-48 overflow-hidden rounded-full bg-black/5 dark:bg-white/10 shadow-inner">
              <div className="h-full bg-gradient-to-r from-[#D6405F] to-[#F23B69] transition-all duration-700" style={{ width: `${getProgress()}%` }} />
            </div>
            <p className="text-[10px] font-bold text-[#8C6B79] dark:text-gray-500 uppercase tracking-widest">Creado: {formatDate(opp.created_at)}</p>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="text-[20px] sm:text-[28px] text-[#D6405F] dark:text-[#F8BBD0] tracking-tight font-black">
              {totalAmount > 0 ? formatCurrency(totalAmount) : "S/ 0.00"}
            </div>

            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm transition-all"
            >
              <ChevronDown className={`h-6 w-6 sm:h-7 sm:w-7 text-[#8C6B79] dark:text-gray-400 group-hover:text-[#D6405F] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* STEPPER DE 3 PASOS ADAPTADO */}
      <div className="mt-12 sm:mt-16 mb-8 px-2 sm:px-16 relative overflow-x-auto sm:overflow-visible custom-scrollbar">
        <div className="min-w-[400px] sm:min-w-0 pb-4">
          <div className="absolute top-[26px] sm:top-[30px] left-[15%] right-[15%] h-[4px] sm:h-[6px] bg-[#EAE0E2] dark:bg-white/10 rounded-full z-0 shadow-inner" />
          
          <div className="grid grid-cols-3 relative z-10">
            <StepItem 
              active={true} 
              icon={<Package className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Contacto Inicial" 
              sub="Orden confirmada" 
            />
            
            <StepItem 
              active={opp.status === "CONVERTIDA" || opp.status === "EN_REVISION"} 
              icon={<Truck className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="En Tránsito" 
              sub="Productos en camino" 
            />

            <StepItem 
              active={opp.status === "EN_REVISION"} 
              icon={<ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Verificación" 
              sub="Control de calidad" 
            />
          </div>
        </div>
      </div>
    {/* ACORDEÓN DESPLEGABLE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-8 pt-8 border-t border-[#EAE0E2] dark:border-white/10"
          >
            <h4 className="text-[13px] font-black text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest mb-6">Detalle de Variantes</h4>
            
            <div className="overflow-x-auto custom-scrollbar border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-[#faf5f0] dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-2xl transition-[background-color,border-color] duration-[600ms]">
              <table className="w-full text-left border-collapse">
                <thead className="relative transition-[background-color,border-color] duration-[600ms]">
                  <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                    <th className="py-4 px-6 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Talla</th>
                    <th className="py-4 px-6 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Color</th>
                    <th className="py-4 px-6 text-center border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Cantidad</th>
                    <th className="py-4 px-6 text-center border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Costo Unitario</th>
                    <th className="py-4 px-6 text-right border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0E2]/50 dark:divide-white/5 text-[#40202D] dark:text-white">
					{opp.base_items?.map((item: any, idx: number) => {
						const quoteItem = selectedQuote?.items.find(
						(qi: any) => (qi.id_variant?._id || qi.id_variant) === (item.id_variant?._id || item.id_variant)
						);
						const unitPrice = (opp.status === 'CONVERTIDA' || opp.status === 'EN_REVISION') 
						? (quoteItem?.unit_cost || 0) 
						: 0;
						const subtotal = item.quantity * unitPrice;

						return (
						<tr key={idx} className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
							<td className="py-5 px-6 font-bold text-[13px]">{item.id_variant?.size || item.size}</td>
							<td className="py-5 px-6 flex items-center gap-3">
                {item.id_variant?.color?.hex && (
                  <div 
                    className="w-4 h-4 rounded-full border border-[#EAE0E2] dark:border-white/10 shrink-0 shadow-sm" 
                    style={{ backgroundColor: item.id_variant.color.hex }} 
                  />
                )}
                <span className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-300">
                  {item.id_variant?.color?.name ?? (typeof item.id_variant?.color === "string" ? item.id_variant.color : null) ?? item.color ?? "-"}
                </span>
              </td>
							<td className="py-5 px-6 text-center font-black text-[14px]">{item.quantity}</td>
							
							<td className="py-5 px-6 text-center font-bold text-[13px] text-[#8C6B79] dark:text-gray-400">
							S/ {unitPrice.toFixed(2)}
							</td>
							
							<td className="py-5 px-6 text-right font-black text-[14px] text-[#D6405F] dark:text-[#F8BBD0]">
							S/ {subtotal.toFixed(2)}
							</td>
						</tr>
						);
					})}
					
					{/* Fila de Total */}
					<tr className="bg-white/50 dark:bg-white/5">
						<td className="py-6 px-6 font-black text-[12px] uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">Total</td>
						<td />
						<td className="py-6 px-6 text-center font-black text-[16px] text-[#40202D] dark:text-white">
						{opp.base_items?.reduce((acc: number, it: any) => acc + it.quantity, 0)}
						</td>
						<td />
						<td className="py-6 px-6 text-right font-black text-[18px] text-[#D6405F] dark:text-[#F8BBD0]">
						{formatCurrency(totalAmount)}
						</td>
					</tr>
					</tbody>
              </table>
            </div>

            {/* Cuadro de Observaciones */}
            <div className="mt-6 p-6 rounded-[1.5rem] bg-white/50 dark:bg-black/30 border border-[#EAE0E2] dark:border-white/10 shadow-inner backdrop-blur-md space-y-3">
              <p className="text-[10px] font-black text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">Observaciones:</p>
              {/* Observaciones de control de calidad (post-aprobación) */}
              {opp.id_purchase_order?.quality_observations && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-500/20">
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Control de calidad:</p>
                  <p className="text-[13px] font-medium text-[#40202D] dark:text-white leading-relaxed">{opp.id_purchase_order.quality_observations}</p>
                </div>
              )}
              {/* Notas generales de la pre-orden */}
              {opp.notes && !opp.notes.startsWith("Generada desde") && (
                <p className="text-[13px] font-medium text-[#40202D] dark:text-white leading-relaxed">{opp.notes}</p>
              )}
              {!opp.id_purchase_order?.quality_observations && (!opp.notes || opp.notes.startsWith("Generada desde")) && (
                <p className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-400 italic">Sin observaciones adicionales.</p>
              )}
            </div>

            {/* Adjuntos (PDFs) */}
            <div className="mt-6 p-6 rounded-[1.5rem] bg-white/50 dark:bg-black/30 border border-[#EAE0E2] dark:border-white/10 shadow-inner backdrop-blur-md space-y-4">
              <p className="text-[10px] font-black text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">Documentos Adjuntos (PDF):</p>
              
              {opp.id_purchase_order?.attachments && opp.id_purchase_order.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {opp.id_purchase_order.attachments.map((url: string, index: number) => {
                    const filename = url.split('/').pop()?.split('-').slice(1).join('-') || `Documento_${index + 1}.pdf`;
                    return (
                      <a 
                        key={index} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-[#EAE0E2] dark:border-white/10 hover:border-[#D6405F] hover:bg-white dark:hover:bg-white/10 transition-all text-xs font-bold text-[#40202D] dark:text-white"
                      >
                        <FileText className="w-5 h-5 text-red-500 shrink-0" />
                        <span className="truncate flex-1">{filename}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-55" />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-[#8C6B79] dark:text-gray-400 italic">No hay archivos adjuntos en esta orden.</p>
              )}

              {purchaseOrderId && (opp.status === 'CONVERTIDA' || opp.status === 'EN_REVISION') && (
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <label className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-dashed border-[#8C6B79]/50 hover:border-[#D6405F] bg-white/30 dark:bg-white/5 text-[#8C6B79] hover:text-[#D6405F] cursor-pointer transition-all text-xs font-bold uppercase tracking-wider">
                    <Paperclip className="w-4 h-4" />
                    <span>Seleccionar PDF</span>
                    <input 
                      type="file" 
                      accept=".pdf"
                      multiple
                      className="hidden" 
                      onChange={async (e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const files = Array.from(e.target.files);
                          const isPdf = files.every(f => f.type === 'application/pdf');
                          if (!isPdf) {
                            toast.error("Por favor, selecciona únicamente archivos PDF.");
                            return;
                          }
                          toast.loading("Subiendo archivo(s)...");
                          const res = await startUploadPoAttachment(purchaseOrderId, files);
                          toast.dismiss();
                          if (res) {
                            // Listo
                          }
                        }
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-[#8C6B79] dark:text-gray-500 font-medium">Sube facturas, guías de remisión o reportes de calidad en formato PDF.</p>
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="mt-8 flex flex-wrap justify-end gap-4">
			
			{/* FASE 1: PRE-COMPRA (Solicitando y Comparando precios) */}
			{(opp.status === 'SOLICITANDO' || opp.status === 'COMPARANDO') && (
				<>
				<button 
					onClick={() => setIsQuotationModalOpen(true)}
					className="px-8 py-4 rounded-2xl border border-[#D6405F] text-[#D6405F] dark:text-[#F8BBD0] dark:border-[#F8BBD0] bg-white/50 dark:bg-transparent backdrop-blur-md font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#D6405F] hover:text-white dark:hover:bg-[#F8BBD0] dark:hover:text-black transition-all shadow-sm"
				>
					<Plus className="w-4 h-4" /> Registrar Cotización
				</button>
				
				<button className="px-8 py-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] dark:text-gray-400 font-black text-[11px] uppercase tracking-widest hover:bg-white/80 dark:hover:bg-white/10 transition-colors shadow-sm">
					Rechazar Orden
				</button>

				<button 
					disabled={opp.quotes?.every((q: any) => q.total_amount === 0)}
					onClick={() => setIsWinnerModalOpen(true)}
					className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white font-black text-[11px] uppercase tracking-widest disabled:opacity-50 hover:scale-[1.02] transition-all shadow-lg"
				>
					Marcar como En Camino
				</button>
				</>
			)}

			{/* FASE 2: TRÁNSITO (La OC ya se generó y viene en camino) */}
			{opp.status === 'CONVERTIDA' && (
				<button
					disabled={!purchaseOrderId || loading}
					onClick={async () => {
					if (!purchaseOrderId) {
						return console.error("Error: ID de OC no encontrado.");
					}
					const ok = await startInitalQualityCheck(purchaseOrderId, opp._id);
					if (ok) await startLoadingPrePurchaseOrders();
					}}
					className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${
					!purchaseOrderId ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white hover:scale-[1.02]'
					}`}
				>
					<ClipboardCheck className="w-5 h-5" /> 
					{purchaseOrderId ? 'Recibir (Control)' : 'OC no vinculada'}
				</button>
			)}

			{/* FASE 3: INSPECCIÓN (Control de calidad y decisiones - El ingreso físico es realizado por el Almacenero) */}

			{/* BOTÓN UNIVERSAL: Siempre visible para ver la orden completa */}
			<button 
        onClick={() => setIsDetailsModalOpen(true)}
        className="px-8 py-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-400 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#40202D] dark:hover:text-white transition-colors shadow-sm"
      >
        <Eye className="w-4 h-4" /> Detalles Completos
      </button>

			</div>
          </motion.div>
        )}
      </AnimatePresence>
	  <QuotationModal 
        isOpen={isQuotationModalOpen} 
        onClose={() => setIsQuotationModalOpen(false)} 
        opp={opp}
        onSave={async (supplierId:any, items:any) => {
			// 1. Mapeamos los items para asegurar que los tipos sean correctos
			const sanitizedItems = items.map((it: any) => ({
				// Nos aseguramos de enviar solo el ID, no el objeto completo
				id_variant: it.id_variant?._id || it.id_variant, 
				quantity: Number(it.quantity),
				unit_cost: Number(it.unit_cost) // 🔥 Conversión explícita a número
			}));

			// 2. Construimos el payload con los nombres de campos exactos del DTO
			const payload = {
				id_agent: supplierId,
				items: sanitizedItems
			};

			// 3. Debug: Revisa esto en la consola del navegador
			console.log("Payload que sale al backend:", payload);

			await startUpdateSupplierQuote(opp._id, payload);
			setIsQuotationModalOpen(false);
			}}
      />

      {/* MODAL PARA ELEGIR PROVEEDOR GANADOR */}
      <WinnerModal 
		isOpen={isWinnerModalOpen} 
		onClose={() => setIsWinnerModalOpen(false)} 
		opp={opp}
		// ✅ Agregamos 'deliveryDate' aquí
		onConfirm={async (supplierId: any, deliveryDate: string) => {
			await startSelectWinnerAndConvert(opp._id, supplierId, deliveryDate);
			setIsWinnerModalOpen(false);
			await startLoadingPrePurchaseOrders();
		}}
		/>
    
    <ApproveInventoryModal 
      isOpen={isApproveModalOpen}
      onClose={() => setIsApproveModalOpen(false)}
      // 🚀 CONEXIÓN REFACTORIZADA: Pasa el rating, las notas y las incidencias de forma ordenada
      onConfirm={async (rating, notes, incidences) => {
        await approveInventory(purchaseOrderId, rating, notes, incidences);
        setIsApproveModalOpen(false);
        await startLoadingPrePurchaseOrders();
      }}
      maxQuantity={totalItemsInOrder}
      isLoading={loading}
      agentName={selectedQuote?.id_agent?.name_company || selectedQuote?.id_agent?.name}
    />
    
    <ExtendDateModal 
      isOpen={isExtendModalOpen}
      onClose={() => setIsExtendModalOpen(false)}
      onConfirm={handleExtend}
      isLoading={false}
    />

    <OrderDetailsModal 
      isOpen={isDetailsModalOpen} 
      onClose={() => setIsDetailsModalOpen(false)} 
      opp={opp} 
    />
    </article>
  );
}
function QuotationModal({ isOpen, onClose, opp, onSave }: any) {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (selectedSupplier) {
      const quote = opp.quotes.find((q: any) => (q.id_agent?._id || q.id_agent) === selectedSupplier);
      setItems(quote?.items.map((it: any) => ({ ...it })) || []);
    }
	console.log("Selected Supplier:", selectedSupplier);
  }, [selectedSupplier, opp]);

  return (
    <Modal open={isOpen} onClose={onClose} title="Registrar Cotización Recibida">
      <div className="space-y-6">
        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">Seleccionar Proveedor</span>
          <select 
            className="w-full h-14 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner appearance-none transition-all"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            <option value="">Elegir de la lista...</option>
            {opp.quotes.map((q: any) => {
				const supplier = q.id_agent;
                if (!supplier) return null;

				const name = (typeof supplier === 'object') 
					? (supplier.name_company || supplier.name) 
					: `Cargando ID: ${supplier.toString().slice(-6)}...`;

				return (
					<option key={typeof supplier === 'string' ? supplier : (supplier._id || Math.random().toString())} value={typeof supplier === 'string' ? supplier : (supplier._id || Math.random().toString())}>
					{name}
					</option>
				);
				})}
						</select>
        </label>

        {selectedSupplier && (
          <div className="space-y-6">
            <div className="overflow-x-auto custom-scrollbar border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-[#faf5f0] dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-2xl transition-[background-color,border-color] duration-[600ms]">
              <table className="w-full text-left border-collapse">
                <thead className="relative transition-[background-color,border-color] duration-[600ms]">
                  <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                    <th className="py-4 px-6 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Variante</th>
                    <th className="py-4 px-6 text-center border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Cantidad</th>
                    <th className="py-4 px-6 text-center border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Costo Unitario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0E2]/50 dark:divide-white/5 text-[#40202D] dark:text-white">
                {items.map((it, idx) => (
                  <tr key={idx} className={`transition-colors group/row ${idx % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                    <td className="py-5 px-6 flex items-center gap-3">
                      <span className="font-bold text-[13px]">{it.id_variant?.size}</span>
                      <span className="text-[#EAE0E2] dark:text-gray-600">|</span>
                      {it.id_variant?.color?.hex && (
                        <div 
                          className="w-4 h-4 rounded-full border border-[#EAE0E2] dark:border-white/10 shrink-0 shadow-sm" 
                          style={{ backgroundColor: it.id_variant.color.hex }} 
                        />
                      )}
                      <span className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-300">
                        {it.id_variant?.color?.name ?? (typeof it.id_variant?.color === "string" ? it.id_variant.color : null) ?? "-"}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center font-black text-[14px]">{it.quantity}</td>
                    <td className="py-5 px-6 text-center">
                      <div className="relative inline-block">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#8C6B79]">S/</span>
                        <input 
                          type="number" 
                          value={it.unit_cost} 
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[idx].unit_cost = Number(e.target.value);
                            setItems(newItems);
                          }}
                          className="w-28 h-10 border border-[#EAE0E2] dark:border-white/10 bg-white/70 dark:bg-black/30 rounded-xl pl-8 pr-3 outline-none focus:ring-2 focus:ring-[#D6405F]/50 text-[13px] font-black text-[#40202D] dark:text-white shadow-inner transition-all"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => onSave(selectedSupplier, items)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white font-black text-[11px] uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all"
            >
              Guardar Precios Negociados
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
function WinnerModal({ isOpen, onClose, opp, onConfirm }: any) {
  const [winnerId, setWinnerId] = useState("");
  // Estado para la fecha (por defecto hoy + 3 días)
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  const sortedQuotes = useMemo(() => {
    return [...opp.quotes]
      .filter(q => q.total_amount > 0)
      .sort((a, b) => b.ranking_score - a.ranking_score);
  }, [opp.quotes]);

  return (
    <Modal open={isOpen} onClose={onClose} title="Seleccionar Proveedor y Generar OC">
      <div className="space-y-6">
        <p className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-400">Compara las propuestas recibidas y elige al ganador para pasar la orden a estado <b>En Camino</b>.</p>
        
        <div className="space-y-4">
          {sortedQuotes.map((q, idx) => {
            const agentId = typeof q.id_agent === 'string' ? q.id_agent : (q.id_agent?._id || Math.random().toString());
            const agentName = q.id_agent?.name_company || q.id_agent?.name || "Cargando...";

            return (
              <div 
                key={agentId}
                onClick={() => setWinnerId(agentId)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${
                  winnerId === agentId 
                    ? "border-[#D6405F] bg-gradient-to-r from-[#D6405F]/5 to-[#F23B69]/5 dark:from-[#D6405F]/10 dark:to-[#F23B69]/10 shadow-sm" 
                    : "border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md hover:border-[#8C6B79]/50"
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner ${idx === 0 ? "bg-amber-100 text-amber-500 dark:bg-amber-500/20" : "bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 text-[#8C6B79]"}`}>
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-[15px] font-black ${winnerId === agentId ? "text-[#D6405F] dark:text-[#F8BBD0]" : "text-[#40202D] dark:text-white"}`}>{agentName}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">
                        Score: 
                        <span className="text-[#D6405F] dark:text-[#F8BBD0] ml-1">
                          {(q.ranking_score * 100).toFixed(0)}/100
                        </span>
                      </p>
                      <span className="text-[#EAE0E2] dark:text-gray-600">|</span>
                      <StarRating rating={q.id_agent?.rating || 5} size={3} />
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className={`text-[18px] font-black ${winnerId === agentId ? "text-[#D6405F] dark:text-[#F8BBD0]" : "text-[#40202D] dark:text-white"}`}>{formatCurrency(q.total_amount)}</p>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${winnerId === agentId ? "bg-[#D6405F] text-white" : "border-2 border-[#EAE0E2] dark:border-white/10 text-transparent"}`}>
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {winnerId && (
          <div className="pt-6 border-t border-[#EAE0E2] dark:border-white/10 space-y-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 mb-1">Fecha Estimada de Entrega</label>
              <input 
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full h-14 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all"
              />
            </div>

            <p className="text-[12px] text-center font-medium text-[#8C6B79] dark:text-gray-400 italic px-4">
              Al confirmar, se creará la OC con fecha de llegada para el {formatDate(deliveryDate)}.
            </p>
            
            <button 
              onClick={() => onConfirm(winnerId, deliveryDate)} 
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white font-black text-[11px] uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all"
            >
              Confirmar Ganador y Generar OC
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function StepItem({ active, icon, label, sub }: { active: boolean; icon: React.ReactNode; label: string; sub: string }) {  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl shadow-inner transition-all z-10 backdrop-blur-md ${
        active 
          ? "bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white border border-[#D6405F]/20" 
          : "bg-white/50 dark:bg-black/30 border border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] dark:text-gray-500"
      }`}>
        {icon}
      </div>
      <div className="space-y-1">
        <p className={`text-[12px] font-black uppercase tracking-widest ${active ? "text-[#D6405F] dark:text-[#F8BBD0]" : "text-[#8C6B79] dark:text-gray-500"}`}>{label}</p>
        <p className="text-[11px] font-medium leading-tight text-[#8C6B79] dark:text-gray-400 max-w-[140px] mx-auto">{sub}</p>
      </div>
    </div>
  );

}