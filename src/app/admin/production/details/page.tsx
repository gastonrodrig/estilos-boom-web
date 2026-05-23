"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { 
  Search, ChevronDown, Package, Scissors, 
  Factory, ClipboardCheck, CheckCircle2, 
  XCircle, Eye, CalendarClock, Check, X,
  FileText, Plus, AlertCircle, ArrowRight,
  Pause, Clock, Activity
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Star } from "lucide-react"; // Importar Star

import { useStorehouseStore } from "@/hooks";
import { Modal, CTA } from "@components";

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

const MOCK_TEST_ORDERS = [
  {
    _id: "test-multi-1",
    pre_order_number: "OPP-M-2026",
    status: "COMPARANDO",
    created_at: new Date().toISOString(),
    estimated_delivery_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    base_items: [
      { 
        quantity: 12, 
        id_variant: { 
          size: "M", 
          color: "Rojo Pasión", 
          id_product: { 
            name: "Vestido Gala Premium",
            image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400",
            images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400"]
          } 
        } 
      },
      { 
        quantity: 8, 
        id_variant: { 
          size: "L", 
          color: "Rojo Pasión", 
          id_product: { 
            name: "Vestido Gala Premium",
            image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400",
            images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400"]
          } 
        } 
      }
    ],
    quotes: [
      { quote_status: 'COTIZADO', id_agent: { name_company: "Textiles del Sur" }, total_amount: 1500.00 },
      { quote_status: 'COTIZADO', id_agent: { name_company: "Confecciones Lima" } }
    ]
  },
  {
    _id: "test-single-2",
    pre_order_number: "OPP-S-2026",
    status: "SOLICITANDO",
    created_at: new Date().toISOString(),
    estimated_delivery_date: new Date().toISOString(), // Entrega hoy
    base_items: [
      { 
        quantity: 50, 
        id_variant: { 
          size: "30", 
          color: "Denim", 
          id_product: { 
            name: "Pantalón Urban Style",
            image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
            images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"]
          } 
        } 
      }
    ],
    quotes: [
      { quote_status: 'COTIZADO', id_agent: { name_company: "Taller Los Hermanos" } },
      { quote_status: 'COTIZADO', id_agent: { name_company: "Creaciones Textiles" } }
    ]
  }
];

export default function ProductionOrderTracking() {
  const { 
    startLoadingPrePurchaseOrders, 
    prePurchaseOrders, 
    startUpdateSupplierQuote,
    extendOCDate,
    approveInventory
  } = useStorehouseStore();
  const [filter, setFilter] = useState("TODAS");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState("Todos los Talleres");
  const [selectedMonth, setSelectedMonth] = useState("Todos los Meses");
  const [localOrders, setLocalOrders] = useState<any[]>(MOCK_TEST_ORDERS);
  const [qualityRating, setQualityRating] = useState(5); // Estado para las estrellitas

  useEffect(() => {
    startLoadingPrePurchaseOrders('PRODUCCION');
    if (typeof window !== "undefined") {
      const createdStr = localStorage.getItem("mocked_created_orders");
      if (createdStr) {
        try {
          const createdOrders = JSON.parse(createdStr);
          setLocalOrders(prev => {
            const currentIds = new Set(prev.map(p => p._id));
            const newOrders = createdOrders.filter((o: any) => !currentIds.has(o._id));
            return [...newOrders, ...prev]; // Put new ones at the top
          });
        } catch (e) {}
      }
    }
  }, [startLoadingPrePurchaseOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string, winnerId?: string) => {
    setLocalOrders(prev => {
      const next = prev.map(o => {
        if (o._id !== orderId) return o;
        
        let newQuotes = o.quotes;
        if (winnerId && o.quotes) {
          newQuotes = o.quotes.map((q: any, idx: number) => {
            const agentId = typeof q.id_agent === 'string' ? q.id_agent : (q.id_agent?._id || q.id_agent?.name_company || `agent-${idx}`);
            return {
              ...q,
              quote_status: agentId === winnerId ? "SELECCIONADO" : "RECHAZADO"
            };
          });
        }
        
        return { ...o, status: newStatus, quotes: newQuotes };
      });
      
      // Persist status change to mocked orders to allow testing the flow locally
      if (typeof window !== "undefined") {
        const createdStr = localStorage.getItem("mocked_created_orders");
        if (createdStr) {
          try {
            const createdOrders = JSON.parse(createdStr);
            const updatedMocked = createdOrders.map((co: any) => {
              if (co._id !== orderId) return co;
              let newQuotes = co.quotes;
              if (winnerId && co.quotes) {
                newQuotes = co.quotes.map((q: any, idx: number) => {
                  const agentId = typeof q.id_agent === 'string' ? q.id_agent : (q.id_agent?._id || q.id_agent?.name_company || `agent-${idx}`);
                  return {
                    ...q,
                    quote_status: agentId === winnerId ? "SELECCIONADO" : "RECHAZADO"
                  };
                });
              }
              return { ...co, status: newStatus, quotes: newQuotes };
            });
            localStorage.setItem("mocked_created_orders", JSON.stringify(updatedMocked));
          } catch(e) {}
        }
      }
      return next;
    });
  };

  const updateOrderCosts = async (orderId: string, costs: Record<string, number>) => {
    setLocalOrders(prev => {
      const next = prev.map(o => {
        if (o._id !== orderId) return o;
        const newQuotes = o.quotes?.map((q: any, idx: number) => {
          const agentId = typeof q.id_agent === 'string' ? q.id_agent : (q.id_agent?._id || q.id_agent?.name_company || `agent-${idx}`);
          let quoteTotal = 0;
          o.base_items?.forEach((item: any, iIdx: number) => {
            const costKey = `${agentId}_${item.id_variant?._id || iIdx}`;
            if (costs[costKey]) quoteTotal += costs[costKey] * item.quantity;
          });
          return { ...q, total_amount: quoteTotal > 0 ? quoteTotal : q.total_amount };
        });
        return { ...o, quotes: newQuotes };
      });
      
      if (typeof window !== "undefined") {
        const createdStr = localStorage.getItem("mocked_created_orders");
        if (createdStr) {
          try {
            const createdOrders = JSON.parse(createdStr);
            const updatedMocked = createdOrders.map((co: any) => {
              if (co._id !== orderId) return co;
              const newQuotes = co.quotes?.map((q: any, idx: number) => {
                const agentId = typeof q.id_agent === 'string' ? q.id_agent : (q.id_agent?._id || q.id_agent?.name_company || `agent-${idx}`);
                let quoteTotal = 0;
                co.base_items?.forEach((item: any, iIdx: number) => {
                  const costKey = `${agentId}_${item.id_variant?._id || iIdx}`;
                  if (costs[costKey]) quoteTotal += costs[costKey] * item.quantity;
                });
                return { ...q, total_amount: quoteTotal > 0 ? quoteTotal : q.total_amount };
              });
              return { ...co, quotes: newQuotes };
            });
            localStorage.setItem("mocked_created_orders", JSON.stringify(updatedMocked));
          } catch(e) {}
        }
      }
      return next;
    });
  };

  const workshops = useMemo(() => {
    const names = new Set<string>();
    localOrders.forEach(o => {
      const selectedQuotes = o.quotes?.filter((q: any) => q.quote_status === 'SELECCIONADO') || [];
      selectedQuotes.forEach((q: any) => {
        if (q?.id_agent?.name_company) names.add(q.id_agent.name_company);
        else if (q?.id_agent?.name) names.add(q.id_agent.name);
      });
    });
    return ["Todos los Talleres", ...Array.from(names)];
  }, [localOrders]);

  const months = useMemo(() => {
    const m = new Set<string>();
    localOrders.forEach(o => {
      const date = new Date(o.created_at);
      const label = date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
      m.add(label.charAt(0).toUpperCase() + label.slice(1));
    });
    return ["Todos los Meses", ...Array.from(m)];
  }, [localOrders]);

  const counts = useMemo(() => ({
    TODAS: localOrders.filter(o => o.status !== "COMPLETADA").length,
    "CONTACTO INICIAL": localOrders.filter(o => o.status === "SOLICITANDO" || o.status === "COMPARANDO").length,
    "EN PRODUCCIÓN": localOrders.filter(o => o.status === "EN_REVISION").length,
    "CONTROL CALIDAD": localOrders.filter(o => o.status === "CONVERTIDA").length,
    "RECHAZADAS": localOrders.filter(o => o.status === "RECHAZADA").length,
  }), [localOrders]);

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-6 py-10 bg-[#fdfcfc] relative">
      <header className="space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-normal text-[#594246] font-(--font-vidaloka)">Seguimiento de Producción</h1>
          <button 
            onClick={() => {
              localStorage.removeItem("mocked_created_orders");
              window.location.reload();
            }}
            className="text-xs text-rose-400 hover:text-rose-600 underline"
          >
            Limpiar simulador
          </button>
        </div>
        <p className="text-base text-[#9b8088]">{counts.TODAS} procesos en curso</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#b79ca5]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por taller, producto o N° de orden..."
            className="h-16 w-full rounded-2xl border border-rose-100 bg-white pl-14 pr-4 text-base outline-none shadow-sm focus:ring-1 focus:ring-[#F2778D]"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={selectedWorkshop}
            onChange={(e) => setSelectedWorkshop(e.target.value)}
            className="h-16 px-6 rounded-2xl border border-rose-100 bg-white text-sm font-medium text-[#594246] outline-none shadow-sm cursor-pointer appearance-none min-w-[180px]"
          >
            {workshops.map(w => <option key={w} value={w}>{w}</option>)}
          </select>

          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-16 px-6 rounded-2xl border border-rose-100 bg-white text-sm font-medium text-[#594246] outline-none shadow-sm cursor-pointer appearance-none min-w-[160px]"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-[11px] font-bold transition-all uppercase tracking-wider ${
              filter === key 
                ? "bg-[#F2778D] text-white shadow-sm" 
                : "border border-rose-100 bg-white text-[#9b8088] hover:bg-rose-50"
            }`}
          >
            {key === "CONTROL CALIDAD" ? <ClipboardCheck className="w-3.5 h-3.5" /> : key === "EN PRODUCCIÓN" ? <Factory className="w-3.5 h-3.5" /> : key === "RECHAZADAS" ? <XCircle className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
            {key} ({count})
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {(() => {
          const filtered = localOrders
            .filter(o => {
              const selectedQuotes = o.quotes?.filter((q: any) => q.quote_status === 'SELECCIONADO') || [];
              const workshopNames = selectedQuotes.map((q: any) => q.id_agent?.name_company || q.id_agent?.name).filter(Boolean);
              const workshopDisplayName = workshopNames.length > 0 ? workshopNames.join(", ") : "Taller no asignado";
              const productName = o.base_items?.[0]?.id_variant?.id_product?.name || "";

              // Filtro de Búsqueda
              const matchesSearch = searchTerm === "" || 
                o.pre_order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workshopDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                productName.toLowerCase().includes(searchTerm.toLowerCase());
              if (!matchesSearch) return false;

              // Filtro de Taller
              if (selectedWorkshop !== "Todos los Talleres" && !workshopNames.includes(selectedWorkshop)) return false;

              // Filtro de Mes
              const orderMonthRaw = new Date(o.created_at).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
              const orderMonth = orderMonthRaw.charAt(0).toUpperCase() + orderMonthRaw.slice(1);
              if (selectedMonth !== "Todos los Meses" && orderMonth !== selectedMonth) return false;

              if (filter === "TODAS") return o.status !== "COMPLETADA" && o.status !== "RECHAZADA";
              if (filter === "CONTACTO INICIAL") return o.status === "SOLICITANDO" || o.status === "COMPARANDO";
              if (filter === "EN PRODUCCIÓN") return o.status === "EN_REVISION";
              if (filter === "CONTROL CALIDAD") return o.status === "CONVERTIDA";
              if (filter === "RECHAZADAS") return o.status === "RECHAZADA";
              if (filter === "TODAS") return o.status !== "COMPLETADA";
              return true;
            });

          if (filtered.length === 0) {
            return (
              <div className="py-24 text-center border-2 border-dashed border-rose-100 rounded-[40px] bg-white/50 backdrop-blur-sm space-y-4">
                <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-10 w-10 text-rose-200" />
                </div>
                <h3 className="text-xl font-bold text-[#594246]">No se encontraron órdenes</h3>
                <p className="text-[#9b8088] max-w-xs mx-auto text-sm leading-relaxed">
                  No hay procesos de producción en la etapa <span className="text-[#F2778D] font-bold">"{filter}"</span> que coincidan con tu búsqueda.
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
              startUpdateSupplierQuote={startUpdateSupplierQuote}
              extendOCDate={extendOCDate}
              approveInventory={approveInventory}
              qualityRating={qualityRating}
              setQualityRating={setQualityRating}
            />
          ));
        })()}
      </div>
    </section>
  );
}

function ProductionCard({ 
  order, 
  onUpdateStatus, 
  onUpdateCosts,
  startUpdateSupplierQuote,
  extendOCDate,
  approveInventory,
  qualityRating,
  setQualityRating
}: { 
  order: any; 
  onUpdateStatus: (id: string, status: string, winnerId?: string) => Promise<void>; 
  onUpdateCosts?: (id: string, costs: Record<string, number>) => Promise<void>;
  startUpdateSupplierQuote: (id: string, payload: any) => Promise<boolean | null>;
  extendOCDate: (id: string, newDate: string, reason: string) => Promise<boolean | null>;
  approveInventory: (id: string, rating: number) => Promise<boolean | null>;
  qualityRating: number;
  setQualityRating: (r: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"STATUS" | "DATE" | "TECH" | "COST" | "PROD_SUB" | "WINNER" | null>(null);
  const [now, setNow] = useState(new Date());
  const [tempCosts, setTempCosts] = useState<Record<string, number>>({});
  const [newDate, setNewDate] = useState("");
  const [extendReason, setExtendReason] = useState("");
  const [prodSubState, setProdSubState] = useState<"CORTE" | "CONFECCION" | "AVANCE" | "ENTREGA">("CORTE");
  const [subStateTimes, setSubStateTimes] = useState<Record<string, string>>({});
  const [localTotal, setLocalTotal] = useState(0);
  const [confirmedCosts, setConfirmedCosts] = useState<Record<string, number>>({});
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(null);
  const [localEstimatedDate, setLocalEstimatedDate] = useState(order.estimated_delivery_date);

  useEffect(() => {
    if (activeModal === "STATUS") {
      setNow(new Date());
    } else if (activeModal === "WINNER") {
      const selectedQuoteIdx = order.quotes?.findIndex((q: any) => q.quote_status === "SELECCIONADO");
      if (selectedQuoteIdx !== -1 && order.quotes?.[selectedQuoteIdx]) {
        const q = order.quotes[selectedQuoteIdx];
        const id = typeof q.id_agent === 'string' ? q.id_agent : (q.id_agent?._id || q.id_agent?.name_company || `agent-${selectedQuoteIdx}`);
        setSelectedWinnerId(id);
      } else {
        const first = order.quotes?.[0];
        if (first) {
          const id = typeof first.id_agent === 'string' ? first.id_agent : (first.id_agent?._id || first.id_agent?.name_company || `agent-0`);
          setSelectedWinnerId(id);
        }
      }
    }
  }, [activeModal, order.quotes]);
  
  const getProgress = () => {
    if (totalAmount === 0) return 25;
    if (order.status === "CONVERTIDA") return 100;
    if (order.status === "EN_REVISION") return 75;
    if (order.status === "COMPARANDO") return 50;
    return 25;
  };

  const firstItem = order.base_items?.[0]?.id_variant?.id_product;
  const selectedQuotes = order.quotes?.filter((q: any) => q.quote_status === 'SELECCIONADO') || [];
  const workshopName = selectedQuotes.length > 1 
    ? `${selectedQuotes.length} Talleres Seleccionados` 
    : (selectedQuotes[0]?.id_agent?.name_company || selectedQuotes[0]?.id_supplier?.name_company || selectedQuotes[0]?.id_agent?.name || selectedQuotes[0]?.id_supplier?.name || "Taller no asignado");
  const totalAmount = selectedQuotes.reduce((acc: number, q: any) => acc + (q.total_amount || 0), 0);
  const displayTotal = totalAmount > 0 ? totalAmount : localTotal;
  
  const actualTotal = displayTotal > 0 ? displayTotal : (order.base_items?.reduce((acc: number, item: any, idx: number) => {
    const anyKey = Object.keys(confirmedCosts).find(k => k.endsWith(`_${item.id_variant?._id || idx}`));
    let unitPrice = anyKey ? confirmedCosts[anyKey] : (item.unit_cost || 0);
    return acc + (item.quantity * unitPrice);
  }, 0) || 0);

  const getStepDate = (stepIdx: number) => {
    const date = new Date(order.created_at);
    date.setHours(date.getHours() + (stepIdx * 5));
    return date.toISOString();
  };

  const handleConfirm = async () => {
    if (activeModal === "STATUS") {
      let nextStatus = "COMPARANDO";
      if (order.status === "COMPARANDO") nextStatus = "EN_REVISION";
      if (order.status === "EN_REVISION") nextStatus = "CONVERTIDA";
      
      await onUpdateStatus(order._id, nextStatus);
    } else if (activeModal === "COST") {
      let sum = 0;
      
      // Calculate sum by picking the first available cost per item, or summing them?
      // Since it's a mock, we just take the first workshop's cost as the localTotal for simplicity,
      // or we just save all to confirmedCosts.
      order.base_items?.forEach((item: any, idx: number) => {
        const anyKey = Object.keys(tempCosts).find(k => k.endsWith(`_${item.id_variant?._id || idx}`));
        if (anyKey) {
          sum += (tempCosts[anyKey] || 0) * item.quantity;
        } else if (tempCosts[item.id_variant?._id || idx]) {
          sum += (tempCosts[item.id_variant?._id || idx] || 0) * item.quantity;
        }
      });
      
      setLocalTotal(sum);
      setConfirmedCosts({...tempCosts});
      if (onUpdateCosts) {
        await onUpdateCosts(order._id, tempCosts);
      }
      toast.success("Costos registrados");
    }
    setActiveModal(null);
  };



  return (
    <article className="rounded-[30px] border border-rose-100 bg-white p-5 sm:p-8 shadow-sm transition-all overflow-hidden relative">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-3xl bg-rose-50 border border-rose-100 shadow-inner">
             <img 
                src={firstItem?.images?.[0] || firstItem?.image || "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400"} 
                alt={firstItem?.name || "Product"} 
                className="h-full w-full object-cover transition-transform hover:scale-110 duration-500" 
             />
          </div>
          <div className="space-y-1 sm:space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 className="text-xl sm:text-2xl font-normal text-[#594246] leading-tight">{firstItem?.name || "Producto sin nombre"}</h3>
              <div className="flex flex-wrap gap-1.5">
                <span className={`rounded-md px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-[13px] font-normal text-white ${
                  order.status === 'CONVERTIDA' ? 'bg-green-500' : 'bg-[#F291A3]/80'
                  }`}>
                  {order.status === 'CONVERTIDA' ? 'Control Calidad' : 'En Proceso'}
                </span>
                <span className="rounded-md bg-[#F2D0D3]/40 px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-[13px] font-normal text-[#b46a7c] flex items-center gap-2">
                  {workshopName}
                  {order.status === 'COMPLETADA' && (
                    <div className="flex gap-0.5 ml-1 border-l border-rose-200 pl-2">
                       <StarRating rating={order.id_purchase_order?.quality_rating || 5} size={3} />
                    </div>
                  )}
                </span>
                {(() => {
                  const today = new Date().toISOString().split('T')[0];
                  if (localEstimatedDate?.startsWith(today)) {
                    return (
                      <span className="rounded-md bg-rose-100 px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-[13px] font-bold text-[#F2778D] flex items-center gap-1.5 border border-rose-200">
                        <Clock className="w-3 h-3" />
                        ENTREGA HOY
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            <p className="text-[12px] sm:text-sm text-[#9b8088] font-medium">
              {order.pre_order_number} · <span className="text-[#594246]">{order.base_items?.length || 0} Variantes</span> · {order.base_items?.reduce((acc:any, i:any) => acc + i.quantity, 0)} uds.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[12px] sm:text-sm text-[#9b8088] font-medium flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" />
                Entrega estimada: <span className="text-[#594246] font-bold">{formatDate(localEstimatedDate)}</span>
              </p>
              <button 
                onClick={() => setActiveModal("DATE")} 
                className="flex items-center gap-1 text-[10px] sm:text-xs text-[#F2778D] font-bold border border-[#f2b6c1] px-2 py-1 rounded-md hover:bg-[#F2778D] hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" />
                Prolongar
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-4 sm:gap-8 lg:gap-12 pt-4 xl:pt-0 border-t xl:border-t-0 border-rose-50">
          <div className="space-y-1 sm:space-y-2 min-w-[120px]">
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-bold text-[#b79ca5] uppercase tracking-widest">
              <span>Progreso</span>
              <span className="text-[#F2778D]">{getProgress()}%</span>
            </div>
            <div className="h-2 w-32 sm:w-40 overflow-hidden rounded-full bg-rose-50">
              <div className="h-full bg-[#F2778D] transition-all duration-700" style={{ width: `${getProgress()}%` }} />
            </div>
            <p className="text-[10px] sm:text-xs text-[#b79ca5]">Iniciado: {formatDate(order.created_at)}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-[20px] sm:text-[25px] text-[#F2778D] tracking-tighter font-medium">
              {formatCurrency(actualTotal)}
            </div>

            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-rose-100 hover:bg-rose-50 transition-colors"
            >
              <ChevronDown className={`h-6 w-6 sm:h-8 sm:w-8 text-[#9b8088] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* STEPPER DE PRODUCCIÓN */}
      <div className="mt-10 sm:mt-14 mb-6 px-2 sm:px-4 relative overflow-x-auto sm:overflow-visible no-scrollbar">
        <div className="min-w-[600px] sm:min-w-0 pb-2">
          <div className="absolute top-[22px] sm:top-[26px] left-[15%] right-[15%] h-[6px] sm:h-[8px] bg-[#868686]/20 z-0" />
          
          <div className="grid grid-cols-3 relative z-10">
            <StepItem 
              active={true} 
              icon={<Package className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Contacto Inicial" 
              sub="Orden confirmada" 
              date={order.created_at}
            />

            <StepItem 
              active={order.status === "COMPARANDO" || order.status === "EN_REVISION" || order.status === "CONVERTIDA"} 
              icon={<Factory className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="En Preparación" 
              sub="Corte y Confección" 
              date={(order.status === "COMPARANDO" || order.status === "EN_REVISION" || order.status === "CONVERTIDA") ? getStepDate(1) : undefined}
              interactive={order.status === "EN_REVISION"}
              onClick={() => {
                if (order.status === "EN_REVISION") setActiveModal("PROD_SUB");
              }}
            />

            <StepItem 
              active={order.status === "CONVERTIDA"} 
              icon={<ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Control Calidad" 
              sub="Revision y acabados" 
              date={order.status === "CONVERTIDA" ? getStepDate(2) : undefined}
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
            className="mt-8 pt-8 border-t border-rose-50"
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
                      <h4 className="text-lg font-medium text-[#594246]">
                        Detalle de Producción {workshopsToRender.length > 1 && <span className="text-[#F2778D]">· {agentName}</span>}
                      </h4>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-[#9b8088] font-medium border-b border-rose-50">
                            <th className="py-3 px-2">Talla</th>
                            <th className="py-3 px-2">Color</th>
                            <th className="py-3 px-2 text-center">Cantidad</th>
                            <th className="py-3 px-2 text-center">Costo Unit.</th>
                            <th className="py-3 px-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="text-[#594246]">
                          {order.base_items?.map((item: any, idx: number) => {
                            const costKey = agentId ? `${agentId}_${item.id_variant?._id || idx}` : `${item.id_variant?._id || idx}`;
                            let unitCost = item.unit_cost;
                            if (unitCost === undefined && confirmedCosts[costKey] !== undefined) {
                              unitCost = confirmedCosts[costKey];
                            }
                            if (unitCost === undefined) {
                              // Intentar buscar sin prefijo
                              const anyKey = Object.keys(confirmedCosts).find(k => k.endsWith(`_${item.id_variant?._id || idx}`));
                              if (anyKey) unitCost = confirmedCosts[anyKey];
                            }
                            if (unitCost === undefined) {
                              unitCost = 0; 
                            }

                            return (
                              <tr key={idx} className="border-b border-rose-50/50 hover:bg-rose-50/30 transition-colors">
                                <td className="py-4 px-2">{item.id_variant?.size}</td>
                                <td className="py-4 px-2">{item.id_variant?.color}</td>
                                <td className="py-4 px-2 text-center font-bold">{item.quantity}</td>
                                <td className="py-4 px-2 text-center text-[#9b8088]">
                                  {isPending && unitCost === 0 ? (
                                    <span className="text-rose-400 font-bold italic">Pendiente</span>
                                  ) : (
                                    `S/ ${unitCost.toFixed(2)}`
                                  )}
                                </td>
                                <td className="py-4 px-2 text-right font-bold text-[#F2778D]">
                                  {isPending && unitCost === 0 ? (
                                    <span className="text-rose-400 font-bold italic">S/ 0.00</span>
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
                className="!bg-white border border-[#F2778D] !text-[#F2778D] !py-3 !px-6"
                icon={Eye}
              >
                Ficha Técnica
              </CTA>
              
              {(order.status === "SOLICITANDO" || order.status === "COMPARANDO") && (
                <>
                  <CTA 
                    onClick={() => setActiveModal("COST")}
                    className="!bg-white border border-[#594246] !text-[#594246] !py-3 !px-8 shadow-sm"
                    icon={FileText}
                  >
                    Registrar Costos de Taller
                  </CTA>
                  <CTA 
                    onClick={() => {
                      onUpdateStatus(order._id, "RECHAZADA");
                      toast.success("Orden rechazada exitosamente.");
                    }}
                    className="!bg-white border border-[#594246] !text-[#594246] !py-3 !px-8 shadow-sm"
                    icon={XCircle}
                  >
                    Rechazar Orden
                  </CTA>
                  {displayTotal > 0 && (
                    <CTA 
                      onClick={() => setActiveModal("WINNER")}
                      className="!py-3 !px-8 shadow-lg shadow-rose-100"
                      icon={CheckCircle2}
                    >
                      Confirmar Taller
                    </CTA>
                  )}
                </>
              )}

              {order.status === "RECHAZADA" && (
                <div className="flex w-full items-center justify-between mt-2 border-t border-rose-50 pt-4">
                  <div className="flex items-center gap-2 text-rose-500 font-bold text-sm bg-rose-50 px-4 py-2 rounded-xl">
                     <Clock className="w-4 h-4" />
                     Se eliminará en 3 días
                  </div>
                  <CTA 
                    onClick={() => {
                      onUpdateStatus(order._id, "SOLICITANDO");
                      toast.success("Orden reanudada. Puedes continuar con la asignación.");
                    }}
                    className="!bg-white border border-[#10b981] !text-[#10b981] !py-3 !px-8 shadow-sm hover:!bg-[#10b981] hover:!text-white transition-all"
                    icon={ArrowRight}
                  >
                    Continuar Orden
                  </CTA>
                </div>
              )}

              {order.status === "EN_REVISION" && (
                <CTA 
                  onClick={() => setActiveModal("PROD_SUB")}
                  className="!py-3 !px-8 shadow-lg shadow-rose-100"
                  icon={Factory}
                >
                  Ir a Producción
                </CTA>
              )}

              {order.status === "CONVERTIDA" && (
                <CTA 
                  onClick={() => {
                    onUpdateStatus(order._id, "COMPLETADA");
                    toast.success("Orden completada e ingresada a inventario.");
                  }}
                  className="!py-3 !px-8 shadow-lg shadow-rose-100"
                  icon={CheckCircle2}
                >
                  Completar Orden
                </CTA>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODALES CON FORMATO ESTILOS BOOM --- */}
      
      {/* 1. Modal Prolongar Fecha */}
      <Modal 
        open={activeModal === "DATE"} 
        onClose={() => setActiveModal(null)}
        panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-8"
        title="Prolongar Fecha de Entrega"
        titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
      >
        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#b79ca5] uppercase tracking-wider">Nueva Fecha de Producción</label>
            <input 
              type="date" 
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full h-12 rounded-xl border border-rose-100 px-4 outline-none focus:ring-1 focus:ring-[#F2778D] text-[#594246]" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#b79ca5] uppercase tracking-wider">Razón de la prórroga</label>
            <select 
              value={extendReason}
              onChange={(e) => setExtendReason(e.target.value)}
              className="w-full h-12 rounded-xl border border-rose-100 px-4 outline-none focus:ring-1 focus:ring-[#F2778D] text-[#594246] appearance-none bg-white"
            >
              <option value="">Selecciona una razón...</option>
              <option value="retraso-taller">Retraso en el taller</option>
              <option value="falta-insumos">Falta de insumos / avíos</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <CTA onClick={() => setActiveModal(null)} className="flex-1 !bg-white border border-rose-100 !text-[#9b8088]">Cancelar</CTA>
            <CTA 
              onClick={async () => {
                if (newDate) {
                  setLocalEstimatedDate(new Date(newDate).toISOString());
                  toast.success("Fecha prolongada");
                  setActiveModal(null);
                } else {
                  toast.error("Seleccione una fecha.");
                }
              }}
              className="flex-1 shadow-lg shadow-rose-100"
            >
              Confirmar
            </CTA>
          </div>
        </div>
      </Modal>

      <Modal 
        open={activeModal === "PROD_SUB"} 
        onClose={() => setActiveModal(null)}
        panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8"
        title="Avance en Taller"
        titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
      >
        <button 
          onClick={() => setActiveModal(null)} 
          className="absolute top-6 right-6 text-[#b79ca5] hover:text-[#594246] hover:bg-rose-50 p-2 rounded-full transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="pt-6 relative">
          <p className="text-sm text-[#9b8088] mb-8">
            Registra el avance consecutivo de la producción en el taller.
          </p>

          <div className="flex flex-col md:flex-row gap-10">
            {/* Columna Izquierda: Pasos y Acciones */}
            <div className="flex-[3] flex flex-col justify-between">
              <div className="relative pl-6 ml-2 space-y-8">
            {/* Línea vertical de fondo */}
            <div className="absolute left-[15px] top-[16px] bottom-[16px] w-[2px] bg-rose-100/50 z-0" />
            
            {[
              { id: "CORTE", label: "Corte / Habilitado", desc: "Telas cortadas y habilitadas para costura.", icon: Scissors },
              { id: "CONFECCION", label: "Confección", desc: "En proceso de costura y armado de prendas.", icon: Factory },
              { id: "AVANCE", label: "Avance Parcial", desc: "Lotes de producción finalizados.", icon: Activity },
              { id: "ENTREGA", label: "Control de Calidad", desc: "Entregado a almacén para revisión.", icon: ClipboardCheck },
            ].map((step, idx) => {
              const orderMap = { "CORTE": 0, "CONFECCION": 1, "AVANCE": 2, "ENTREGA": 3 };
              const currentStateIdx = orderMap[prodSubState];
              const stepIdx = orderMap[step.id as "CORTE" | "CONFECCION" | "AVANCE" | "ENTREGA"];
              
              const isCompleted = stepIdx < currentStateIdx;
              const isActive = stepIdx === currentStateIdx;

              return (
                <div key={step.id} className="relative z-10 flex gap-6 items-start">
                  <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 ${
                    isActive ? "bg-[#F2778D] text-white ring-4 ring-rose-50" : 
                    isCompleted ? "bg-emerald-500 text-white" : 
                    "bg-[#ede8e9] text-[#b79ca5]"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  <div className="pt-1 flex-1">
                    <p className={`text-sm font-bold ${isActive || isCompleted ? "text-[#594246]" : "text-[#b79ca5]"}`}>{step.label}</p>
                    <p className="text-[11px] text-[#9b8088] leading-tight mt-0.5">{step.desc}</p>
                    
                    {subStateTimes[step.id] && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] font-bold text-emerald-600">
                        <Clock className="w-3 h-3" />
                        {new Date(subStateTimes[step.id]).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} · {new Date(subStateTimes[step.id]).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
              </div>
            </div>

            {/* Columna Derecha: Tarjeta de Información */}
            <div className="flex-[2]">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col gap-4 sticky top-0">
                <div className="bg-amber-100 p-2.5 rounded-lg w-fit">
                   <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-amber-900 flex flex-wrap items-center gap-2">
                     Registro Manual 
                     <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Temporal</span>
                  </p>
                  <p className="text-sm text-amber-700 leading-relaxed mt-2">
                     La automatización de avance en taller está <span className="font-bold">en construcción</span>. Por favor, realiza el seguimiento manualmente por ahora para mantener el registro actualizado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-rose-50 flex gap-4">
            
            {prodSubState !== "ENTREGA" && (
              <CTA 
                className={`flex-1 shadow-lg ${
                  prodSubState === "AVANCE" 
                    ? "!bg-[#10b981] hover:!bg-[#059669] shadow-emerald-100/50" 
                    : "shadow-rose-100"
                }`}
                icon={prodSubState === "AVANCE" ? ClipboardCheck : ArrowRight}
                onClick={async () => {
                  const nowStr = new Date().toISOString();
                  if (prodSubState === "CORTE") {
                    setSubStateTimes(prev => ({ ...prev, CORTE: nowStr }));
                    setProdSubState("CONFECCION");
                    toast.success("Corte registrado. Pasando a Confección.");
                  } else if (prodSubState === "CONFECCION") {
                    setSubStateTimes(prev => ({ ...prev, CONFECCION: nowStr }));
                    setProdSubState("AVANCE");
                    toast.success("Confección registrada. Pasando a Avance Parcial.");
                  } else if (prodSubState === "AVANCE") {
                    setSubStateTimes(prev => ({ ...prev, AVANCE: nowStr }));
                    setProdSubState("ENTREGA");
                    await onUpdateStatus(order._id, "CONVERTIDA");
                    toast.success("¡Producción entregada! Pasando a Control de Calidad.");
                    setActiveModal(null);
                  }
                }}
              >
                {prodSubState === "CORTE" ? "Registrar Corte" : 
                 prodSubState === "CONFECCION" ? "Registrar Confección" : 
                 "Entregar a Control Calidad"}
              </CTA>
            )}
          </div>
        </div>
      </Modal>

      {/* 3. Modal Actualizar Estado - Rediseñado */}
      <Modal 
        open={activeModal === "STATUS"} 
        onClose={() => setActiveModal(null)}
        panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8"
        title="Gestión de Fase de Producción"
        titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
      >
        <div className="space-y-8 pt-6">
          {/* Indicador de Flujo Dinámico */}
          {(() => {
            let current = "Contacto Inicial";
            let next = "Corte / Habilitado";
            
            if (order.status === "COMPARANDO") {
              current = "Corte / Habilitado";
              next = "Confección / Costura";
            } else if (order.status === "EN_REVISION") {
              current = "Confección / Costura";
              next = "Control Calidad";
            } else if (order.status === "CONVERTIDA") {
              current = "Control Calidad";
              next = "Finalizar Orden (Almacén)";
            }

            const isFinalizing = order.status === "CONVERTIDA";

            return (
              <div className="space-y-8">
                <div className="flex items-center justify-center gap-4 bg-rose-50/30 p-4 rounded-2xl border border-rose-50">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-[#b79ca5] uppercase">Fase Actual</span>
                    <p className="text-sm font-bold text-[#594246]">{current}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#F2778D]" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-[#F2778D] uppercase">Siguiente Fase</span>
                    <p className="text-sm font-bold text-[#594246]">{next}</p>
                  </div>
                </div>

                {isFinalizing && (
                  <div className="bg-rose-50/20 p-6 rounded-2xl border border-rose-100 flex flex-col items-center gap-4">
                    <p className="text-sm font-bold text-[#594246] text-center">
                      ¿Cómo calificarías el trabajo de este taller?
                    </p>
                    <StarRating rating={qualityRating} setRating={setQualityRating} size={8} />
                    <p className="text-[10px] text-[#9b8088] font-medium uppercase tracking-widest mt-2">Calidad de Confección</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Selector de Acción */}
          <div className="flex flex-col gap-4">
            <div className="p-6 rounded-2xl border-2 border-[#F2778D] bg-rose-50/20 ring-4 ring-rose-50/30 text-left flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F2778D] text-white">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-bold text-[#594246]">Avanzar Fase de Producción</p>
                <p className="text-xs text-[#9b8088] leading-tight">Esta acción registrará el avance a la siguiente etapa.</p>
              </div>
            </div>
          </div>

          {/* Timestamp de Registro */}
          <div className="flex items-center justify-center gap-2 py-2 border-t border-rose-50 pt-6">
            <Clock className="w-3.5 h-3.5 text-[#b79ca5]" />
            <p className="text-[11px] text-[#9b8088] font-medium">
              Se registrará el: <span className="text-[#594246] font-bold">{now.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })} · {now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>

          <div className="flex gap-4">
            <CTA onClick={() => setActiveModal(null)} className="flex-1 !bg-white border border-rose-100 !text-[#9b8088]">Volver</CTA>
            <CTA 
              className="flex-1 shadow-lg shadow-rose-100"
              onClick={async () => {
                if (order.status === "CONVERTIDA") {
                  // Finalizar (MOCK)
                  await onUpdateStatus(order._id, "COMPLETADA");
                  toast.success("Orden completada e ingresada al inventario (MOCK)");
                  setActiveModal(null);
                } else {
                  handleConfirm();
                }
              }}
            >
              Confirmar Avance
            </CTA>
          </div>
        </div>
      </Modal>



      {/* 4. Modal Registrar Costos */}
      <Modal 
        open={activeModal === "COST"} 
        onClose={() => setActiveModal(null)}
        panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8"
        title="Registro de Costos de Taller"
        titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
      >
        <div className="space-y-6 pt-2">
           <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#F2778D] shrink-0" />
              <p className="text-xs text-[#9b8088] leading-tight text-pretty">
                Registra el costo de mano de obra pactado. Si la orden se divide en varios talleres, asegúrate de asignar el costo a cada variante correspondiente.
              </p>
           </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {(() => {
                const activeQuotes = order.quotes?.filter((q: any) => q.quote_status !== 'RECHAZADO') || [];
                const productName = order.base_items?.[0]?.id_variant?.id_product?.name || "Producto sin nombre";
                
                if (activeQuotes.length === 0) {
                  return (
                    <div className="space-y-3">
                      <div className="px-1">
                        <p className="text-[10px] font-bold text-[#b79ca5] uppercase tracking-widest mb-1">Taller General (Pendiente)</p>
                        <h5 className="text-sm font-bold text-[#594246]">{productName}</h5>
                      </div>
                      <div className="space-y-2">
                        {order.base_items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white border border-rose-50/50 hover:border-rose-100 rounded-xl transition-all shadow-sm mb-2 last:mb-0">
                              <div>
                                <p className="text-sm font-bold text-[#594246]">{item.id_variant?.size} · {item.id_variant?.color}</p>
                                <p className="text-[10px] text-[#9b8088] uppercase">{item.quantity} unidades</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#b79ca5]">S/</span>
                                <input 
                                  type="number" 
                                  min="0" 
                                  step="0.01"
                                  placeholder="0.00" 
                                  value={tempCosts[item.id_variant?._id || idx] || ""}
                                  onChange={(e) => setTempCosts(prev => ({ ...prev, [item.id_variant?._id || idx]: parseFloat(e.target.value) || 0 }))}
                                  onKeyDown={(e) => {
                                    if (e.key === '-' || e.key === 'e') e.preventDefault();
                                  }}
                                  className="w-24 h-10 rounded-lg border border-rose-100 px-3 text-right outline-none focus:ring-1 focus:ring-[#F2778D] font-bold text-[#594246] appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
                                />
                              </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return activeQuotes.map((quote: any, qIdx: number) => (
                  <div key={qIdx} className="space-y-3">
                    <div className="px-1 border-l-2 border-[#F2778D] pl-3">
                      <p className="text-[10px] font-bold text-[#F2778D] uppercase tracking-widest mb-0.5">
                        Taller: {quote.id_agent?.name_company || quote.id_agent?.name || "Taller Asignado"}
                      </p>
                      <h5 className="text-sm font-bold text-[#594246]">{productName}</h5>
                    </div>
                    <div className="space-y-2">
                      {order.base_items?.map((item: any, idx: number) => {
                        const agentId = typeof quote.id_agent === 'string' ? quote.id_agent : (quote.id_agent?._id || quote.id_agent?.name_company || `agent-${qIdx}`);
                        const costKey = `${agentId}_${item.id_variant?._id || idx}`;
                        
                        return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-rose-50/50 hover:border-rose-100 rounded-xl transition-all shadow-sm mb-2 last:mb-0">
                            <div>
                              <p className="text-sm font-bold text-[#594246]">{item.id_variant?.size} · {item.id_variant?.color}</p>
                              <p className="text-[10px] text-[#9b8088] uppercase">{item.quantity} unidades</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#b79ca5]">S/</span>
                              <input 
                                type="number" 
                                min="0" 
                                step="0.01"
                                placeholder="0.00" 
                                value={tempCosts[costKey] || ""}
                                onChange={(e) => setTempCosts(prev => ({ ...prev, [costKey]: parseFloat(e.target.value) || 0 }))}
                                onKeyDown={(e) => {
                                  if (e.key === '-' || e.key === 'e') e.preventDefault();
                                }}
                                className="w-24 h-10 rounded-lg border border-rose-100 px-3 text-right outline-none focus:ring-1 focus:ring-[#F2778D] font-bold text-[#594246] appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
                              />
                            </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
           
           <CTA 
            onClick={handleConfirm}
            className="w-full h-14 !text-lg shadow-xl shadow-rose-100"
           >
            Confirmar Registro de Costos
           </CTA>
        </div>
      </Modal>

      {/* 5. Modal Ficha Técnica */}
      <Modal 
        open={activeModal === "TECH"} 
        onClose={() => setActiveModal(null)}
        panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8"
        title="Ficha Técnica de Producción"
        titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
      >
        <div className="space-y-8 pt-4">
           <div className="flex items-start gap-6">
              <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-rose-100">
                 <Image src={firstItem?.images?.[0] || "/placeholder.png"} alt="Product" fill className="object-cover" />
              </div>
              <div className="space-y-4 flex-1">
                 <div>
                    <h4 className="text-2xl font-bold text-[#594246]">{firstItem?.name}</h4>
                    <p className="text-sm text-[#9b8088]">Código de Referencia: {firstItem?.id_product || "N/A"}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                       <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Material Principal</p>
                       <p className="text-sm font-bold text-[#594246]">Tweed / Poliéster</p>
                    </div>
                    <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                       <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Tipo de Confección</p>
                       <p className="text-sm font-bold text-[#594246]">Sastrería</p>
                    </div>
                 </div>
              </div>
           </div>
           <div>
              <h5 className="text-xs font-bold text-[#594246] uppercase tracking-widest mb-4">Especificaciones de Medidas</h5>
              <div className="overflow-hidden border border-rose-50 rounded-xl">
                 <table className="w-full text-left text-xs">
                    <thead className="bg-rose-50/50 text-[#b79ca5]">
                       <tr>
                          <th className="p-3">Medida (cm)</th>
                          <th className="p-3 text-center">S</th>
                          <th className="p-3 text-center">M</th>
                          <th className="p-3 text-center">L</th>
                       </tr>
                    </thead>
                    <tbody className="text-[#594246]">
                       <tr className="border-t border-rose-50"><td className="p-3">Largo Total</td><td className="p-3 text-center">85</td><td className="p-3 text-center">87</td><td className="p-3 text-center">89</td></tr>
                       <tr className="border-t border-rose-50"><td className="p-3">Contorno Pecho</td><td className="p-3 text-center">90</td><td className="p-3 text-center">94</td><td className="p-3 text-center">98</td></tr>
                    </tbody>
                 </table>
              </div>
           </div>
           <CTA className="w-full !bg-white border border-rose-100 !text-[#9b8088]" onClick={() => setActiveModal(null)}>Cerrar Ficha</CTA>
        </div>
      </Modal>

      {/* 6. Modal Confirmar Taller (WINNER) */}
      <Modal 
        open={activeModal === "WINNER"} 
        onClose={() => setActiveModal(null)}
        panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8"
        title="Confirmar Taller"
        titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
      >
        <div className="space-y-6 pt-2">
          <p className="text-sm text-[#9b8088]">Confirma el taller que ejecutará esta orden para avanzar a la etapa de Producción.</p>
          <div className="space-y-3">
            {order.quotes?.filter((q: any) => q.quote_status !== 'RECHAZADO').map((q: any, idx: number) => {
              const agentId = typeof q.id_agent === 'string' ? q.id_agent : (q.id_agent?._id || q.id_agent?.name_company || `agent-${idx}`);
              const agentName = q.id_agent?.name_company || q.id_agent?.name || "Cargando...";
              const isSelected = selectedWinnerId === agentId;
              const amount = q.total_amount || displayTotal;

              return (
                <div 
                  key={agentId}
                  onClick={() => setSelectedWinnerId(agentId)}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                    isSelected ? "border-[#F2778D] bg-rose-50" : "border-rose-50 bg-white hover:border-[#f2b6c1]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-rose-100 text-[#F2778D] flex items-center justify-center">
                      <Factory className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#594246]">{agentName}</p>
                      <p className="text-xs text-[#9b8088] mb-1">{firstItem?.name}</p>
                      <p className="text-xs text-[#9b8088]">Costo total registrado: <span className="font-bold text-[#F2778D]">{formatCurrency(amount)}</span></p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-4 border-t border-rose-100">
            <CTA 
              onClick={async () => {
                if (!selectedWinnerId) return toast.error("Seleccione un taller primero.");
                await onUpdateStatus(order._id, "EN_REVISION", selectedWinnerId);
                toast.success("Taller confirmado. La orden ha pasado a Producción.");
                setActiveModal(null);
              }}
              className="w-full py-4 shadow-lg shadow-rose-100"
            >
              Confirmar y Enviar a Producción
            </CTA>
          </div>
        </div>
      </Modal>
    </article>
  );
}

function StepItem({ active, icon, label, sub, date, onClick, interactive }: { active: boolean; icon: any; label: string; sub: string; date?: string; onClick?: () => void; interactive?: boolean }) {
  return (
    <div 
      className={`flex flex-col items-center text-center space-y-3 ${interactive ? "cursor-pointer hover:scale-105 transition-transform" : ""}`}
      onClick={interactive ? onClick : undefined}
    >
      <div className={`flex h-13 w-13 items-center justify-center rounded-full border-[6px] border-white shadow-lg transition-all z-10 ${
        active ? "bg-[#F2778D] text-white" : "bg-[#ede8e9] text-[#b79ca5]"
      } ${interactive ? "ring-2 ring-offset-2 ring-[#F2778D] hover:shadow-xl hover:bg-[#F2778D] hover:text-white" : ""}`}>
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
