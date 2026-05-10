"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { 
  Search, ChevronDown, Package, Scissors, 
  Factory, ClipboardCheck, CheckCircle2, 
  XCircle, Eye, CalendarClock, Check,
  FileText, Plus, AlertCircle, ArrowRight,
  Pause, Clock
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

export default function ProductionOrderTracking() {
  const { 
    startLoadingPrePurchaseOrders, 
    prePurchaseOrders, 
    startUpdatePreOrderStatus,
    startUpdateSupplierQuote,
    extendOCDate,
    approveInventory
  } = useStorehouseStore();
  const [filter, setFilter] = useState("TODAS");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState("Todos los Talleres");
  const [selectedMonth, setSelectedMonth] = useState("Todos los Meses");
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [qualityRating, setQualityRating] = useState(5); // Estado para las estrellitas


  useEffect(() => {
    startLoadingPrePurchaseOrders('PRODUCCION');
  }, [startLoadingPrePurchaseOrders]);

  useEffect(() => {
    /*
    const MOCK_TEST_ORDERS = [
      {
        _id: "test-multi-1",
        order_number: "OPP-M-2026",
        status: "SOLICITANDO",
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
          { quote_status: 'SELECCIONADO', id_agent: { name_company: "Textiles del Sur" } },
          { quote_status: 'COTIZADO', id_agent: { name_company: "Confecciones Lima" } }
        ]
      },
      {
        _id: "test-single-2",
        order_number: "OPP-S-2026",
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
          { quote_status: 'SELECCIONADO', id_agent: { name_company: "Taller Los Hermanos" } },
          { quote_status: 'COTIZADO', id_agent: { name_company: "Creaciones Textiles" } }
        ]
      }
    ];
    */

    setLocalOrders(prePurchaseOrders);
  }, [prePurchaseOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await startUpdatePreOrderStatus(orderId, newStatus);
    
    toast.success("Estado de producción actualizado", {
      position: "top-center",
      style: {
        borderRadius: '20px',
        background: '#fbcfe8',
        color: '#594246',
        fontSize: '14px',
        padding: '12px 24px',
      },
      iconTheme: {
        primary: '#22c55e',
        secondary: '#fff',
      },
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
    "ENTREGAS HOY": localOrders.filter(o => {
      const today = new Date().toISOString().split('T')[0];
      const hasWorkshop = o.quotes?.some((q: any) => q.quote_status === 'SELECCIONADO');
      if (!hasWorkshop && o.status !== "SOLICITANDO") return false;
      return o.estimated_delivery_date?.startsWith(today) || o.status === "SOLICITANDO";
    }).length,
    "CONTACTO INICIAL": localOrders.filter(o => o.status === "SOLICITANDO").length,
    "CORTE / HABILITADO": localOrders.filter(o => o.status === "COMPARANDO").length,
    "EN TALLER": localOrders.filter(o => o.status === "EN_REVISION").length,
    "CONTROL CALIDAD": localOrders.filter(o => o.status === "CONVERTIDA").length,
    "RECHAZADOS": 0,
  }), [localOrders]);

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-6 py-10 bg-[#fdfcfc] relative">
      <header className="space-y-2">
        <h1 className="text-4xl font-normal text-[#594246] font-(--font-vidaloka)">Seguimiento de Producción</h1>
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
            {key === "RECHAZADOS" ? <XCircle className="w-3.5 h-3.5" /> : key === "ENTREGAS HOY" ? <CalendarClock className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
            {key} ({count})
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {(() => {
          const filtered = localOrders
            .filter(o => {
              const hasWorkshop = o.quotes?.some((q: any) => q.quote_status === 'SELECCIONADO');
              if (!hasWorkshop && o.status !== "SOLICITANDO") return false;

              const selectedQuotes = o.quotes?.filter((q: any) => q.quote_status === 'SELECCIONADO') || [];
              const workshopNames = selectedQuotes.map((q: any) => q.id_agent?.name_company || q.id_agent?.name).filter(Boolean);
              const workshopDisplayName = workshopNames.length > 0 ? workshopNames.join(", ") : "Taller no asignado";
              const productName = o.base_items?.[0]?.id_variant?.id_product?.name || "";

              // Filtro de Búsqueda
              const matchesSearch = searchTerm === "" || 
                o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workshopDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                productName.toLowerCase().includes(searchTerm.toLowerCase());
              if (!matchesSearch) return false;

              // Filtro de Taller
              if (selectedWorkshop !== "Todos los Talleres" && !workshopNames.includes(selectedWorkshop)) return false;

              // Filtro de Mes
              const orderMonthRaw = new Date(o.created_at).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
              const orderMonth = orderMonthRaw.charAt(0).toUpperCase() + orderMonthRaw.slice(1);
              if (selectedMonth !== "Todos los Meses" && orderMonth !== selectedMonth) return false;

              // Filtro de Etapa
              if (filter === "TODAS") return o.status !== "CONVERTIDA";
              if (filter === "ENTREGAS HOY") {
                const today = new Date().toISOString().split('T')[0];
                return o.estimated_delivery_date?.startsWith(today) || o.status === "SOLICITANDO";
              }
              if (filter === "CONTACTO INICIAL") return o.status === "SOLICITANDO";
              if (filter === "CORTE / HABILITADO") return o.status === "COMPARANDO";
              if (filter === "EN TALLER") return o.status === "EN_REVISION";
              if (filter === "CONTROL CALIDAD") return o.status === "CONVERTIDA";
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
  startUpdateSupplierQuote,
  extendOCDate,
  approveInventory,
  qualityRating,
  setQualityRating
}: { 
  order: any; 
  onUpdateStatus: (id: string, status: string) => Promise<void>; 
  startUpdateSupplierQuote: (id: string, payload: any) => Promise<boolean | null>;
  extendOCDate: (id: string, newDate: string, reason: string) => Promise<boolean | null>;
  approveInventory: (id: string, rating: number) => Promise<boolean | null>;
  qualityRating: number;
  setQualityRating: (r: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"STATUS" | "DATE" | "TECH" | "COST" | null>(null);
  const [now, setNow] = useState(new Date());
  const [tempCosts, setTempCosts] = useState<Record<string, number>>({});
  const [newDate, setNewDate] = useState("");
  const [extendReason, setExtendReason] = useState("");

  useEffect(() => {
    if (activeModal === "STATUS") {
      setNow(new Date());
    }
  }, [activeModal]);
  
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
    : (selectedQuotes[0]?.id_agent?.name_company || selectedQuotes[0]?.id_agent?.name || "Taller no asignado");
  const totalAmount = selectedQuotes.reduce((acc: number, q: any) => acc + (q.total_amount || 0), 0);
  
  const actualTotal = order.base_items?.reduce((acc: number, item: any) => {
    const unitPrice = item.unit_cost || (totalAmount / (order.base_items?.length || 1));
    return acc + (item.quantity * unitPrice);
  }, 0) || 0;

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
      // Registrar costos en el backend
      const selectedQuote = order.quotes?.find((q: any) => q.quote_status === 'SELECCIONADO');
      if (selectedQuote) {
        const updatedItems = order.base_items.map((item: any) => ({
          ...item,
          unit_cost: tempCosts[item.id_variant?._id] || 0
        }));
        
        await startUpdateSupplierQuote(order._id, {
          id_agent: selectedQuote.id_agent?._id || selectedQuote.id_agent,
          items: updatedItems
        });
      }
    }
    setActiveModal(null);
  };

  const CostItem = ({ item }: { item: any }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-rose-50/50 hover:border-rose-100 rounded-xl transition-all shadow-sm mb-2 last:mb-0">
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
            value={tempCosts[item.id_variant?._id] || ""}
            onChange={(e) => setTempCosts(prev => ({ ...prev, [item.id_variant?._id]: parseFloat(e.target.value) || 0 }))}
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === 'e') e.preventDefault();
            }}
            className="w-24 h-10 rounded-lg border border-rose-100 px-3 text-right outline-none focus:ring-1 focus:ring-[#F2778D] font-bold text-[#594246]" 
          />
        </div>
    </div>
  );

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
                  if (order.estimated_delivery_date?.startsWith(today)) {
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
          <div className="absolute top-[22px] sm:top-[26px] left-[10%] right-[10%] h-[6px] sm:h-[8px] bg-[#868686]/20 z-0" />
          
          <div className="grid grid-cols-4 relative z-10">
            <StepItem 
              active={true} 
              icon={<Package className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Contacto Inicial" 
              sub="Orden confirmada" 
              date={order.created_at}
            />

            <StepItem 
              active={totalAmount > 0 && (order.status === "COMPARANDO" || order.status === "EN_REVISION" || order.status === "CONVERTIDA")} 
              icon={<Scissors className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Corte / Habilitado" 
              sub="Preparacion de telas" 
              date={(totalAmount > 0 && (order.status === "COMPARANDO" || order.status === "EN_REVISION" || order.status === "CONVERTIDA")) ? getStepDate(1) : undefined}
            />
            
            <StepItem 
              active={totalAmount > 0 && (order.status === "EN_REVISION" || order.status === "CONVERTIDA")} 
              icon={<Factory className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Confeccion" 
              sub="Trabajo en taller" 
              date={(totalAmount > 0 && (order.status === "EN_REVISION" || order.status === "CONVERTIDA")) ? getStepDate(2) : undefined}
            />

            <StepItem 
              active={totalAmount > 0 && order.status === "CONVERTIDA"} 
              icon={<ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Control Calidad" 
              sub="Revision y acabados" 
              date={(totalAmount > 0 && order.status === "CONVERTIDA") ? getStepDate(3) : undefined}
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h4 className="text-lg font-medium text-[#594246]">Detalle de Produccion</h4>
              <CTA 
                onClick={() => setActiveModal("DATE")}
                className="!py-2 !px-4 !text-xs !bg-white border border-[#f2b6c1] !text-[#594246]"
                icon={CalendarClock}
              >
                Prolongar fecha de producción
              </CTA>
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
                  {order.base_items?.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-rose-50/50 hover:bg-rose-50/30 transition-colors">
                      <td className="py-4 px-2">{item.id_variant?.size}</td>
                      <td className="py-4 px-2">{item.id_variant?.color}</td>
                      <td className="py-4 px-2 text-center font-bold">{item.quantity}</td>
                      <td className="py-4 px-2 text-center text-[#9b8088]">
                        {totalAmount === 0 ? (
                          <span className="text-rose-400 font-bold italic">Pendiente</span>
                        ) : (
                          `S/ ${(item.unit_cost || (totalAmount / order.base_items.length)).toFixed(2)}`
                        )}
                      </td>
                      <td className="py-4 px-2 text-right font-bold text-[#F2778D]">
                        S/ {(item.quantity * (item.unit_cost || (totalAmount / order.base_items.length))).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

              <div className="mt-8 flex flex-wrap justify-end gap-4">
              <CTA 
                onClick={() => setActiveModal("TECH")}
                className="!bg-white border border-[#F2778D] !text-[#F2778D] !py-3 !px-6"
                icon={Eye}
              >
                Ficha Tecnica
              </CTA>
              
              {totalAmount === 0 ? (
                <CTA 
                  onClick={() => setActiveModal("COST")}
                  className="!py-3 !px-8 shadow-lg shadow-rose-100"
                  icon={Check}
                >
                  Registrar Costos de Taller
                </CTA>
              ) : (
                <CTA 
                  onClick={() => setActiveModal("STATUS")}
                  className="!py-3 !px-8 shadow-lg shadow-rose-100"
                >
                  Actualizar Estado
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
                const poId = order.id_purchase_order?._id || order.id_purchase_order;
                if (newDate && poId) {
                  await extendOCDate(poId, newDate, extendReason);
                  setActiveModal(null);
                } else if (!poId) {
                  toast.error("Esta orden aún no tiene una OC generada.");
                }
              }}
              className="flex-1 shadow-lg shadow-rose-100"
            >
              Confirmar
            </CTA>
          </div>
        </div>
      </Modal>

      {/* 2. Modal Actualizar Estado - Rediseñado */}
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
                  // Si estamos finalizando, usamos la lógica de ingreso a inventario con rating
                  const purchaseOrderId = order.id_purchase_order?._id || order.id_purchase_order;
                  await approveInventory(purchaseOrderId, qualityRating); 
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
                const selectedQuotes = order.quotes?.filter((q: any) => q.quote_status === 'SELECCIONADO') || [];
                const productName = order.base_items?.[0]?.id_variant?.id_product?.name || "Producto sin nombre";
                
                if (selectedQuotes.length === 0) {
                  return (
                    <div className="space-y-3">
                      <div className="px-1">
                        <p className="text-[10px] font-bold text-[#b79ca5] uppercase tracking-widest mb-1">Taller General (Pendiente)</p>
                        <h5 className="text-sm font-bold text-[#594246]">{productName}</h5>
                      </div>
                      <div className="space-y-2">
                        {order.base_items?.map((item: any, idx: number) => (
                          <CostItem key={idx} item={item} />
                        ))}
                      </div>
                    </div>
                  );
                }

                return selectedQuotes.map((quote: any, qIdx: number) => (
                  <div key={qIdx} className="space-y-3">
                    <div className="px-1 border-l-2 border-[#F2778D] pl-3">
                      <p className="text-[10px] font-bold text-[#F2778D] uppercase tracking-widest mb-0.5">
                        Taller: {quote.id_agent?.name_company || quote.id_agent?.name || "Taller Asignado"}
                      </p>
                      <h5 className="text-sm font-bold text-[#594246]">{productName}</h5>
                    </div>
                    <div className="space-y-2">
                      {order.base_items?.map((item: any, idx: number) => (
                        <CostItem key={idx} item={item} />
                      ))}
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
    </article>
  );
}

function StepItem({ active, icon, label, sub, date }: { active: boolean; icon: any; label: string; sub: string; date?: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className={`flex h-13 w-13 items-center justify-center rounded-full border-[6px] border-white shadow-lg transition-all z-10 ${
        active ? "bg-[#F2778D] text-white" : "bg-[#ede8e9] text-[#b79ca5]"
      }`}>
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
