"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Search, ChevronDown, Package, Factory, 
  ClipboardCheck, CheckCircle2, XCircle, Eye, 
  CalendarClock, FileText, Plus, ArrowRight,
  Clock, Activity, Star
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { useProductionStore } from "@/hooks/production";
import { CTA } from "@/components/atoms"; 

// ==========================================
// IMPORTACIÓN DE MODALES SEPARADOS
// ==========================================
import { ProductionTrackingView } from "@/components/organisms/production-tracking-view";
import { ConfirmWorkshopModal } from "@/components/organisms";
import { ExtendDeadlineModal } from "@/components/organisms/modals";
import { RegisterCostsModal } from "@/components/organisms/modals";
import { TechnicalSheetModal } from "@/components/organisms/modals";
import { UpdatePhaseModal } from "@/components/organisms/modals";
import { TrackingOrder } from "@/components/organisms/production-tracking-view/production-tracking.types";

// --- HELPERS ---
const formatCurrency = (val: number) => val === 0 ? "Sin registrar" : `S/ ${(val || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
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

// ==========================================
// COMPONENTE PRINCIPAL DE LA PÁGINA
// ==========================================
export default function ProductionOrderTracking() {
const { orders, startLoadingProductionOrders, startUpdateProductionStatus, startConfirmWorkshop, startUpdateWorkshopQuote } = useProductionStore();
  const [filter, setFilter] = useState("TODAS");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState("Todos los Talleres");
  const [selectedMonth, setSelectedMonth] = useState("Todos los Meses");
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Deriva el tracking order siempre fresco desde Redux (se actualiza con cada poll)
  const trackingViewOrder = useMemo(() => {
    if (!trackingOrderId) return null;
    const order = (orders || []).find((o: any) => o._id === trackingOrderId);
    if (!order) return null;
    const selectedQuotes = order.quotes?.filter((q: any) => q.quote_status === "SELECCIONADO") || [];
    const workshopName =
      selectedQuotes.length > 1
        ? `${selectedQuotes.length} Talleres Seleccionados`
        : selectedQuotes[0]?.id_agent?.name_company ||
          selectedQuotes[0]?.id_agent?.name ||
          "Taller asignado";
    return { ...order, order_number: order.order_number || order.pre_order_number, workshopName };
  }, [trackingOrderId, orders]);

  useEffect(() => {
    startLoadingProductionOrders();
  }, [startLoadingProductionOrders]);

  // Polling: refresca la orden cada 5s mientras el tracking view está abierto
  useEffect(() => {
    if (!trackingOrderId) return;
    const interval = setInterval(() => {
      startLoadingProductionOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [trackingOrderId, startLoadingProductionOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string, winnerId?: string) => {
    if (newStatus === "EN_PRODUCCION" && winnerId) {
      await startConfirmWorkshop(orderId, winnerId);
    } else {
      await startUpdateProductionStatus(orderId, newStatus);
    }
  };

  const updateOrderCosts = async (orderId: string, costs: Record<string, number>) => {
    const order = orders.find((o: any) => o._id === orderId);
    if (!order) return;

    const workshopCosts: Record<string, any[]> = {};
    Object.keys(costs).forEach(key => {
      const [workshopId, varId] = key.split('_');
      if (!workshopId || !varId) return;
      if (!workshopCosts[workshopId]) workshopCosts[workshopId] = [];
      const item = order.base_items?.find((i: any) => (typeof i.id_variant === 'string' ? i.id_variant : i.id_variant?._id) === varId);
      if (item) {
        workshopCosts[workshopId].push({ id_variant: varId, quantity: item.quantity, unit_cost: costs[key] });
      }
    });

    for (const [wId, items] of Object.entries(workshopCosts)) {
      if (items.length > 0) {
        await startUpdateWorkshopQuote(orderId, { id_workshop: wId, items });
      }
    }
  };

  const workshops = useMemo(() => {
    const names = new Set<string>();
    (orders || []).forEach((o: any) => {
      const selectedQuotes = o.quotes?.filter((q: any) => q.quote_status === 'SELECCIONADO') || [];
      selectedQuotes.forEach((q: any) => {
        if (q?.id_agent?.name_company) names.add(q.id_agent.name_company);
        else if (q?.id_agent?.name) names.add(q.id_agent.name);
      });
    });
    return ["Todos los Talleres", ...Array.from(names)];
  }, [orders]);

  const months = useMemo(() => {
    const m = new Set<string>();
    (orders || []).forEach((o: any) => {
      const date = new Date(o.created_at);
      const label = date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
      m.add(label.charAt(0).toUpperCase() + label.slice(1));
    });
    return ["Todos los Meses", ...Array.from(m)];
  }, [orders]);

  const counts = useMemo(() => ({
    TODAS: (orders || []).filter((o: any) => o.status !== "COMPLETADA").length,
    "CONTACTO INICIAL": (orders || []).filter((o: any) => o.status === "CONTACTO_INICIAL" || o.status === "COMPARANDO").length,
    "EN PRODUCCIÓN": (orders || []).filter((o: any) => o.status === "EN_PRODUCCION").length,
    "CONTROL CALIDAD": (orders || []).filter((o: any) => o.status === "CONTROL_CALIDAD").length,
    "RECHAZADAS": (orders || []).filter((o: any) => o.status === "RECHAZADA").length,
  }), [orders]);

  const openTrackingView = (order: any) => {
    setTrackingOrderId(order._id);
  };

const handleApproveTrackingQuality = async (orderId: string) => {
  try {
    await updateOrderStatus(orderId, "COMPLETADA");
    toast.success("Control de calidad aprobado. Orden finalizada.");
    setTrackingOrderId(null);
    await startLoadingProductionOrders();
  } catch {
    toast.error("Error al actualizar la orden.");
  }
};

if (trackingViewOrder) {
  return (
    <ProductionTrackingView
      order={trackingViewOrder}
      onBack={() => setTrackingOrderId(null)}
      onApproveQuality={handleApproveTrackingQuality}
    />
  );
}
  

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-6 py-10 transition-colors duration-500 relative min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-2">
        <div>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }} className="mb-2 text-[#8B3A52] opacity-60 dark:text-white dark:opacity-35 font-medium uppercase">
            Inicio / Producción / Seguimiento
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
            <h1 className="text-[#40202D] dark:text-white leading-none mb-2" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2rem', fontWeight: 300 }}>
              Seguimiento de Producción
            </h1>
          </div>
          <p className="text-[#8C6B79] dark:text-white tracking-[0.03em] mt-3" style={{ fontSize: '0.78rem', opacity: 0.45 }}>
            {counts.TODAS} procesos en curso
          </p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem("mocked_created_orders");
            window.location.reload();
          }}
          className="text-[10px] text-[#8B3A52] dark:text-rose-300 hover:text-rose-600 dark:hover:text-rose-100 underline tracking-wider font-bold uppercase transition-colors"
        >
          Limpiar simulador
        </button>
      </header>

      <div className="bg-[#faf5f0] dark:bg-[rgba(255,255,255,0.04)] backdrop-blur-2xl border border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.05)] rounded-[2rem] p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center transition-[background-color,border-color] duration-[600ms]">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por taller, producto o N° de orden..."
            className="w-full rounded-[999px] border border-[#EAE0E2] dark:border-[rgba(255,255,255,0.08)] bg-white/50 dark:bg-[rgba(255,255,255,0.04)] backdrop-blur-md py-2.5 pl-11 pr-4 text-sm text-[#40202D] dark:text-white shadow-sm focus:border-[#D6405F] dark:focus:border-[rgba(139,58,82,0.5)] focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/30"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative shrink-0">
            <select 
              value={selectedWorkshop}
              onChange={(e) => setSelectedWorkshop(e.target.value)}
              className="appearance-none pl-5 pr-11 py-2.5 rounded-[999px] border border-[#EAE0E2] dark:border-[rgba(255,255,255,0.08)] bg-white/50 dark:bg-[rgba(255,255,255,0.04)] backdrop-blur-md text-sm text-[#40202D] dark:text-white shadow-sm focus:border-[#D6405F] dark:focus:border-[rgba(139,58,82,0.5)] focus:outline-none transition-all cursor-pointer min-w-[200px]"
            >
              {workshops.map(w => <option key={w} value={w} className="dark:bg-[#1A0B11]">{w}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C6B79] pointer-events-none opacity-50" size={16} />
          </div>

          <div className="relative shrink-0">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none pl-5 pr-11 py-2.5 rounded-[999px] border border-[#EAE0E2] dark:border-[rgba(255,255,255,0.08)] bg-white/50 dark:bg-[rgba(255,255,255,0.04)] backdrop-blur-md text-sm text-[#40202D] dark:text-white shadow-sm focus:border-[#D6405F] dark:focus:border-[rgba(139,58,82,0.5)] focus:outline-none transition-all cursor-pointer min-w-[180px]"
            >
              {months.map(m => <option key={m} value={m} className="dark:bg-[#1A0B11]">{m}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C6B79] pointer-events-none opacity-50" size={16} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-[999px] px-5 py-2.5 text-[10px] font-bold transition-all uppercase tracking-widest ${
              filter === key 
                ? "bg-[#8B3A52] text-white shadow-md shadow-[#8B3A52]/20 border border-[#8B3A52]" 
                : "bg-white/50 dark:bg-white/5 border border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.05)] text-[#8C6B79] dark:text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 shadow-sm"
            }`}
          >
            {key === "CONTROL CALIDAD" ? <ClipboardCheck className="w-4 h-4" /> : key === "EN PRODUCCIÓN" ? <Factory className="w-4 h-4" /> : key === "RECHAZADAS" ? <XCircle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            {key} ({count})
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {(() => {
          const filtered = (orders || []).filter((o: any) => {
            const selectedQuotes = o.quotes?.filter((q: any) => q.quote_status === 'SELECCIONADO') || [];
            const workshopNames = selectedQuotes.map((q: any) => q.id_agent?.name_company || q.id_agent?.name).filter(Boolean);
            const workshopDisplayName = workshopNames.length > 0 ? workshopNames.join(", ") : "Taller no asignado";
            const productName = o.base_items?.[0]?.id_variant?.id_product?.name || "";

            const matchesSearch = searchTerm === "" || o.pre_order_number?.toLowerCase().includes(searchTerm.toLowerCase()) || workshopDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) || productName.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;
            if (selectedWorkshop !== "Todos los Talleres" && !workshopNames.includes(selectedWorkshop)) return false;
            const orderMonthRaw = new Date(o.created_at).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
            const orderMonth = orderMonthRaw.charAt(0).toUpperCase() + orderMonthRaw.slice(1);
            if (selectedMonth !== "Todos los Meses" && orderMonth !== selectedMonth) return false;

            if (filter === "TODAS") return o.status !== "COMPLETADA" && o.status !== "RECHAZADA";
            if (filter === "CONTACTO INICIAL") return o.status === "CONTACTO_INICIAL" || o.status === "COMPARANDO";
            if (filter === "EN PRODUCCIÓN") return o.status === "EN_PRODUCCION";
            if (filter === "CONTROL CALIDAD") return o.status === "CONTROL_CALIDAD";
            if (filter === "RECHAZADAS") return o.status === "RECHAZADA";
            return true;
          });

          if (filtered.length === 0) {
            return (
              <div className="py-24 text-center border-2 border-dashed border-[#EAE0E2] dark:border-white/10 rounded-[40px] bg-white/30 dark:bg-black/30 backdrop-blur-md space-y-4 shadow-sm">
                <div className="bg-white/50 dark:bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Package className="h-12 w-12 text-[#8C6B79] dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-black text-[#40202D] dark:text-white">No se encontraron órdenes</h3>
                <p className="text-[#8C6B79] dark:text-gray-400 max-w-xs mx-auto text-sm leading-relaxed font-medium">
                  No hay procesos de producción en la etapa <span className="text-[#D6405F] dark:text-[#F8BBD0] font-black uppercase tracking-wider text-[11px]">"{filter}"</span> que coincidan con tu búsqueda.
                </p>
              </div>
            );
          }

          return filtered.map((order: any) => (
            <ProductionCard
  key={order._id}
  order={order}
  onUpdateStatus={updateOrderStatus}
  onUpdateCosts={updateOrderCosts}
  onOpenTracking={openTrackingView}
/>
          ));
        })()}
      </div>
    </section>
  );
}

// ==========================================
// COMPONENTE PRODUCTION CARD
// ==========================================
function ProductionCard({
  order,
  onUpdateStatus,
  onUpdateCosts,
  onOpenTracking,
}: {
  order: any;
  onUpdateStatus: (id: string, status: string, winnerId?: string) => Promise<void>;
  onUpdateCosts: (id: string, costs: Record<string, number>) => Promise<void>;
  onOpenTracking: (order: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"STATUS" | "DATE" | "TECH" | "COST" | "WINNER" | null>(null);
  
  const [trackingOrder, setTrackingOrder] = useState<TrackingOrder | null>(null);
  
  const [localEstimatedDate, setLocalEstimatedDate] = useState(order.delivery_date_estimated);
  const [localTotal, setLocalTotal] = useState(0);
  const [confirmedCosts, setConfirmedCosts] = useState<Record<string, number>>({});

  const getProgress = () => {
    if (order.status === "CONTROL_CALIDAD") return 100;
    if (order.status === "EN_PRODUCCION") return 75;
    if (order.status === "COMPARANDO") return 50;
    return 25;
  };

  const firstItem = order.base_items?.[0]?.id_variant?.id_product;
  const selectedQuotes = order.quotes?.filter((q: any) => q.quote_status === 'SELECCIONADO') || [];
  const workshopName = selectedQuotes.length > 1 
    ? `${selectedQuotes.length} Talleres Seleccionados` 
    : (selectedQuotes[0]?.id_agent?.name_company || selectedQuotes[0]?.id_agent?.name || "Taller no asignado");
  const totalAmount = selectedQuotes.reduce((acc: number, q: any) => acc + (q.total_amount || 0), 0);
  const displayTotal = totalAmount > 0 ? totalAmount : localTotal;
  
  const actualTotal = displayTotal > 0 ? displayTotal : (order.base_items?.reduce((acc: number, item: any, idx: number) => {
    const anyKey = Object.keys(confirmedCosts).find(k => k.endsWith(`_${item.id_variant?._id || idx}`));
    let unitPrice = anyKey ? confirmedCosts[anyKey] : (item.unit_cost || 0);
    return acc + (item.quantity * unitPrice);
  }, 0) || 0);

  const getStepDate = (status: string) => {
    const historyItem = order.history?.find((h: any) => h.status === status);
    return historyItem ? new Date(historyItem.date).toISOString() : null;
  };

  const handleExtendDeadline = (newDate: string, reason: string) => {
    setLocalEstimatedDate(newDate); 
  };

  const handleConfirmCosts = async (costs: Record<string, number>) => {
    let sum = 0;
    order.base_items?.forEach((item: any, idx: number) => {
      const anyKey = Object.keys(costs).find(k => k.endsWith(`_${item.id_variant?._id || idx}`));
      if (anyKey) sum += (costs[anyKey] || 0) * item.quantity;
      else if (costs[item.id_variant?._id || idx]) sum += (costs[item.id_variant?._id || idx] || 0) * item.quantity;
    });
    setLocalTotal(sum);
    setConfirmedCosts({...costs});
    await onUpdateCosts(order._id, costs);
    toast.success("Costos registrados con éxito");
    setActiveModal(null);
  };

  const handleAdvancePhase = async () => {
    let nextStatus = "COMPARANDO";
    if (order.status === "COMPARANDO") nextStatus = "EN_PRODUCCION";
    if (order.status === "EN_PRODUCCION") nextStatus = "CONTROL_CALIDAD";
    await onUpdateStatus(order._id, nextStatus);
    setActiveModal(null);
  };


  return (
    <article className="rounded-[1.5rem] border border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.05)] bg-[#faf5f0] dark:bg-[rgba(255,255,255,0.04)] backdrop-blur-2xl p-6 sm:p-8 shadow-sm transition-[background-color,border-color,box-shadow] duration-[600ms] overflow-hidden relative group hover:shadow-md">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-[20px] bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-inner">
             <img 
                src={firstItem?.images?.[0] || firstItem?.image || "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400"} 
                alt={firstItem?.name || "Product"} 
                className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" 
             />
          </div>
          <div className="space-y-1 sm:space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 className="text-xl sm:text-2xl font-black text-[#40202D] dark:text-white leading-tight">{firstItem?.name || "Producto sin nombre"}</h3>
              <div className="flex flex-wrap gap-1.5">
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${
                  order.status === 'CONTROL_CALIDAD' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-[#D6405F] to-[#F23B69] dark:from-[#F8BBD0] dark:to-[#F48FB1] dark:text-[#1A0B11]'
                  }`}>
                  {order.status === 'CONTROL_CALIDAD' ? 'Control Calidad' : 'En Proceso'}
                </span>
                <span className="rounded-full bg-white/50 dark:bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-300 border border-[#EAE0E2] dark:border-white/10 flex items-center gap-2 shadow-sm">
                  {workshopName}
                  {order.status === 'COMPLETADA' && (
                    <div className="flex gap-0.5 ml-1 border-l border-[#EAE0E2] dark:border-white/10 pl-2">
                       <StarRating rating={order.id_purchase_order?.quality_rating || 5} size={3} />
                    </div>
                  )}
                </span>
                {(() => {
                  const today = new Date().toISOString().split('T')[0];
                  if (localEstimatedDate?.startsWith(today)) {
                    return (
                      <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        ENTREGA HOY
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            <p className="text-xs text-[#8C6B79] dark:text-gray-400 font-medium">
              <span className="font-bold text-[#D6405F] dark:text-[#F8BBD0]">{order.pre_order_number}</span> · <span className="font-bold text-[#40202D] dark:text-white">{order.base_items?.length || 0}</span> Variantes · <span className="font-bold text-[#40202D] dark:text-white">{order.base_items?.reduce((acc:any, i:any) => acc + i.quantity, 0)}</span> uds.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <p className="text-xs text-[#8C6B79] dark:text-gray-400 font-medium flex items-center gap-1.5 bg-white/30 dark:bg-white/5 px-3 py-1.5 rounded-full border border-[#EAE0E2] dark:border-white/10 shadow-sm">
                <CalendarClock className="w-3.5 h-3.5 text-[#D6405F] dark:text-[#F8BBD0]" />
                Entrega estimada: <span className="text-[#40202D] dark:text-white font-black">{formatDate(localEstimatedDate)}</span>
              </p>
              <button 
                onClick={() => setActiveModal("DATE")} 
                className="flex items-center gap-1 text-[10px] text-[#D6405F] dark:text-[#F8BBD0] font-black uppercase tracking-wider bg-[#D6405F]/10 dark:bg-[#F8BBD0]/10 px-3 py-1.5 rounded-full hover:bg-[#D6405F] dark:hover:bg-[#F8BBD0] hover:text-white dark:hover:text-[#1A0B11] transition-colors shadow-sm"
              >
                <Plus className="w-3 h-3" /> Prolongar
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-4 sm:gap-8 lg:gap-12 pt-4 xl:pt-0 border-t xl:border-t-0 border-[#EAE0E2] dark:border-white/10">
          <div className="space-y-1 sm:space-y-2 min-w-[120px]">
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-black text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">
              <span>Progreso</span>
              <span className="text-[#D6405F] dark:text-[#F8BBD0]">{getProgress()}%</span>
            </div>
            <div className="h-2 w-32 sm:w-40 overflow-hidden rounded-full bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-inner">
              <div className="h-full bg-gradient-to-r from-[#D6405F] to-[#F23B69] dark:from-[#F8BBD0] dark:to-[#F48FB1] transition-all duration-700" style={{ width: `${getProgress()}%` }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C6B79] dark:text-gray-500">Iniciado: {formatDate(order.created_at)}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-2xl sm:text-3xl font-black text-[#D6405F] dark:text-[#F8BBD0] tracking-tighter drop-shadow-sm">
              {formatCurrency(actualTotal)}
            </div>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors shadow-sm"
            >
              <ChevronDown className={`h-6 w-6 sm:h-8 sm:w-8 text-[#8C6B79] dark:text-gray-300 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 sm:mt-14 mb-6 px-2 sm:px-4 relative overflow-x-auto sm:overflow-visible no-scrollbar">
        <div className="min-w-[600px] sm:min-w-0 pb-2">
          <div className="absolute top-[22px] sm:top-[26px] left-[15%] right-[15%] h-[6px] sm:h-[8px] bg-[#868686]/20 z-0" />
          <div className="grid grid-cols-3 relative z-10">
            <StepItem 
              active={true} icon={<Package className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Contacto Inicial" sub="Orden confirmada" date={order.created_at}
            />
           <StepItem 
  active={order.status === "COMPARANDO" || order.status === "EN_PRODUCCION" || order.status === "CONTROL_CALIDAD"} 
  icon={<Factory className="h-5 w-5 sm:h-6 sm:w-6" />} 
  label="En Preparación"
  sub="Corte y Confección" 
  date={(order.status === "COMPARANDO" || order.status === "EN_PRODUCCION" || order.status === "CONTROL_CALIDAD") ? (getStepDate("EN_PRODUCCION") || undefined) : undefined}
  interactive={order.status === "EN_PRODUCCION" || order.status === "CONTROL_CALIDAD"}
  onClick={() => onOpenTracking(order)}
/>
            <StepItem
              active={order.status === "CONTROL_CALIDAD" || order.status === "COMPLETADA"} icon={<ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />}
              label="Verificación" sub="Revisión y aprobación"
              date={(order.status === "CONTROL_CALIDAD" || order.status === "COMPLETADA") ? (getStepDate("CONTROL_CALIDAD") || undefined) : undefined}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-8 pt-8 border-t border-[#EAE0E2] dark:border-white/10"
          >
            {(() => {
              const quotesToDisplay = order.quotes?.filter((q: any) => q.quote_status !== 'RECHAZADO') || [];
              const confirmedQuote = quotesToDisplay.find((q: any) => q.quote_status === 'SELECCIONADO');
              const workshopsToRender = confirmedQuote ? [confirmedQuote] : (quotesToDisplay.length > 0 ? quotesToDisplay : [null]);

              return workshopsToRender.map((quote: any, wIdx: number) => {
                const agentName = quote ? (quote.id_agent?.name_company || quote.id_agent?.name || "Taller") : "General";
                const agentId = quote ? (typeof quote.id_agent === 'string' ? quote.id_agent : (quote.id_agent?._id || quote.id_agent?.name_company || `agent-${wIdx}`)) : null;
                const quoteTotal = quote?.total_amount || 0;
                const isPending = quoteTotal === 0 && localTotal === 0;

                return (
                  <div key={wIdx} className="mb-8 last:mb-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <h4 className="text-lg font-black text-[#40202D] dark:text-white tracking-wide">
                        Detalle de Producción {workshopsToRender.length > 1 && <span className="text-[#D6405F] dark:text-[#F8BBD0]">· {agentName}</span>}
                      </h4>
                    </div>
                    
                    <div className="overflow-x-auto rounded-2xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 backdrop-blur-md shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-[#8C6B79] dark:text-gray-400 font-black uppercase tracking-widest text-[10px] border-b border-[#EAE0E2] dark:border-white/10">
                            <th className="py-4 px-4">Talla</th>
                            <th className="py-4 px-4">Color</th>
                            <th className="py-4 px-4 text-center">Cantidad</th>
                            <th className="py-4 px-4 text-center">Costo Unit.</th>
                            <th className="py-4 px-4 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="text-[#40202D] dark:text-gray-300">
                          {order.base_items?.map((item: any, idx: number) => {
                            const varIdStr = typeof item.id_variant === 'string' ? item.id_variant : item.id_variant?._id;
                            let unitCost = 0;
                            const quoteItem = quote?.items?.find((i: any) => (typeof i.id_variant === 'string' ? i.id_variant : i.id_variant?._id) === varIdStr);
                            
                            if (quoteItem && quoteItem.unit_cost > 0) unitCost = quoteItem.unit_cost;
                            else {
                              const costKey = agentId ? `${agentId}_${varIdStr || idx}` : `${varIdStr || idx}`;
                              if (confirmedCosts[costKey] !== undefined) unitCost = confirmedCosts[costKey];
                              else {
                                const anyKey = Object.keys(confirmedCosts).find(k => k.endsWith(`_${varIdStr || idx}`));
                                if (anyKey) unitCost = confirmedCosts[anyKey];
                              }
                            }

                            return (
                              <tr key={idx} className="border-b border-[#EAE0E2]/50 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/10 transition-colors last:border-0">
                                <td className="py-4 px-4 font-bold">{item.id_variant?.size}</td>
                                <td className="py-4 px-4">{item.id_variant?.color?.name || item.id_variant?.color}</td>
                                <td className="py-4 px-4 text-center font-black">{item.quantity}</td>
                                <td className="py-4 px-4 text-center text-[#8C6B79] dark:text-gray-400 font-medium">
                                  {isPending && unitCost === 0 ? (
                                    <span className="text-[#D6405F] dark:text-[#F8BBD0] font-black italic">Pendiente</span>
                                  ) : (
                                    `S/ ${unitCost.toFixed(2)}`
                                  )}
                                </td>
                                <td className="py-4 px-4 text-right font-black text-[#D6405F] dark:text-[#F8BBD0]">
                                  {isPending && unitCost === 0 ? (
                                    <span className="text-[#D6405F] dark:text-[#F8BBD0] font-black italic opacity-50">S/ 0.00</span>
                                  ) : (
                                    `S/ ${(item.quantity * unitCost).toFixed(2)}`
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              });
            })()}

              <div className="mt-8 flex flex-wrap justify-end gap-4">
              <CTA 
                onClick={() => setActiveModal("TECH")}
                className="!bg-white/50 dark:!bg-white/5 border border-[#D6405F] dark:border-[#F8BBD0] !text-[#D6405F] dark:!text-[#F8BBD0] !py-3 !px-6 hover:!bg-[#D6405F] dark:hover:!bg-[#F8BBD0] hover:!text-white dark:hover:!text-[#1A0B11] shadow-sm backdrop-blur-md"
                icon={Eye}
              >
                Ficha Técnica
              </CTA>

              {(order.status === "EN_PRODUCCION" || order.status === "CONTROL_CALIDAD") && (
                <CTA onClick={() => onOpenTracking(order)} className="!bg-white border border-blue-500 !text-blue-500 !py-3 !px-6 shadow-sm" icon={Activity}>
                  Ver Bot Seguimiento
                </CTA>
              )}
              
              {(order.status === "CONTACTO_INICIAL" || order.status === "COMPARANDO") && (
                <>
                  <CTA 
                    onClick={() => setActiveModal("COST")}
                    className="!bg-white/50 dark:!bg-white/5 border border-[#8C6B79] dark:border-gray-500 !text-[#40202D] dark:!text-white !py-3 !px-8 shadow-sm hover:!bg-white/80 dark:hover:!bg-white/10 backdrop-blur-md"
                    icon={FileText}
                  >
                    Registrar Costos de Taller
                  </CTA>
                  <CTA 
                    onClick={() => {
                      onUpdateStatus(order._id, "RECHAZADA");
                      toast.success("Orden rechazada exitosamente.");
                    }}
                    className="!bg-white/50 dark:!bg-white/5 border border-[#8C6B79] dark:border-gray-500 !text-[#40202D] dark:!text-white !py-3 !px-8 shadow-sm hover:!bg-white/80 dark:hover:!bg-white/10 backdrop-blur-md"
                    icon={XCircle}
                  >
                    Rechazar Orden
                  </CTA>
                  {displayTotal > 0 && (
                    <CTA 
                      onClick={() => setActiveModal("WINNER")}
                      className="!bg-gradient-to-r from-[#D6405F] to-[#F23B69] dark:from-[#F8BBD0] dark:to-[#F48FB1] !text-white dark:!text-[#1A0B11] !border-none !py-3 !px-8 shadow-[0_8px_20px_rgba(214,64,95,0.3)] dark:shadow-[0_8px_20px_rgba(248,187,208,0.3)] hover:scale-[1.02]"
                      icon={CheckCircle2}
                    >
                      Confirmar Taller
                    </CTA>
                  )}
                </>
              )}

              {order.status === "RECHAZADA" && (
                <div className="flex w-full items-center justify-between mt-2 border-t border-[#EAE0E2] dark:border-white/10 pt-4">
                  <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 font-bold text-sm bg-rose-50/50 dark:bg-rose-500/10 px-4 py-2 rounded-xl">
                     <Clock className="w-4 h-4" />
                     Se eliminará en 3 días
                  </div>
                  <CTA 
                    onClick={() => {
                      onUpdateStatus(order._id, "CONTACTO_INICIAL");
                      toast.success("Orden reanudada. Puedes continuar con la asignación.");
                    }}
                    className="!bg-white/50 dark:!bg-white/5 border border-[#10b981] !text-[#10b981] !py-3 !px-8 shadow-sm hover:!bg-[#10b981] hover:!text-white dark:hover:!text-[#1A0B11] transition-all backdrop-blur-md"
                    icon={ArrowRight}
                  >
                    Continuar Orden
                  </CTA>
                </div>
              )}

              {order.status === "EN_PRODUCCION" && (
                <CTA 
                  onClick={() => setActiveModal("PROD_SUB")}
                  className="!bg-gradient-to-r from-[#D6405F] to-[#F23B69] dark:from-[#F8BBD0] dark:to-[#F48FB1] !text-white dark:!text-[#1A0B11] !border-none !py-3 !px-8 shadow-[0_8px_20px_rgba(214,64,95,0.3)] dark:shadow-[0_8px_20px_rgba(248,187,208,0.3)] hover:scale-[1.02]"
                  icon={Factory}
                >
                  Ir a Producción
                </CTA>
              )}

              {order.status === "CONTROL_CALIDAD" && (
                <CTA 
                  onClick={() => {
                    onUpdateStatus(order._id, "COMPLETADA");
                    toast.success("Orden completada e ingresada a inventario.");
                  }}
                  className="!bg-gradient-to-r from-emerald-400 to-emerald-500 !text-white !border-none !py-3 !px-8 shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:scale-[1.02]"
                  icon={CheckCircle2}
                >
                  Completar Orden
                </CTA>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence> 

      {/* ========================================== */}
      {/* RENDERIZADO DE MODALES SEPARADOS */}
      {/* ========================================== */}
      <ExtendDeadlineModal isOpen={activeModal === "DATE"} onClose={() => setActiveModal(null)} onConfirm={handleExtendDeadline} />
      
      <TechnicalSheetModal isOpen={activeModal === "TECH"} onClose={() => setActiveModal(null)} item={firstItem} />
      
      <RegisterCostsModal isOpen={activeModal === "COST"} onClose={() => setActiveModal(null)} order={order} onConfirmCosts={handleConfirmCosts} />
      
      <ConfirmWorkshopModal isOpen={activeModal === "WINNER"} onClose={() => setActiveModal(null)} order={order} firstItemName={firstItem?.name || "Producto"} displayTotal={displayTotal} onConfirmWinner={onUpdateStatus} />

      
      <UpdatePhaseModal isOpen={activeModal === "STATUS"} onClose={() => setActiveModal(null)} order={order} onUpdateStatus={onUpdateStatus} onConfirmAdvance={handleAdvancePhase} />
      

    </article>
  );
}

// ==========================================
// COMPONENTE STEP ITEM
// ==========================================
function StepItem({ active, icon, label, sub, date, onClick, interactive }: { active: boolean; icon: any; label: string; sub: string; date?: string; onClick?: () => void; interactive?: boolean }) {
  return (
    <div className={`flex flex-col items-center text-center space-y-3 ${interactive ? "cursor-pointer hover:scale-105 transition-transform" : ""}`} onClick={interactive ? onClick : undefined}>
      <div className={`flex h-13 w-13 items-center justify-center rounded-full border-[6px] border-white shadow-lg transition-all z-10 ${active ? "bg-[#F2778D] text-white" : "bg-[#ede8e9] text-[#b79ca5]"} ${interactive ? "ring-2 ring-offset-2 ring-[#F2778D] hover:shadow-xl hover:bg-[#F2778D] hover:text-white" : ""}`}>
        {icon}
      </div>
      <div className="space-y-1">
        <p className={`text-sm font-bold ${active ? "text-[#F2778D]" : "text-[#b79ca5]"}`}>{label}</p>
        <p className="text-[11px] leading-tight text-[#9b8088] max-w-[140px] mx-auto">{sub}</p>
        {active && date && (
          <p className="text-[10px] font-bold text-[#F2778D] mt-1 animate-pulse-slow">
            {new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} · {new Date(date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}