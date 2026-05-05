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

import { useStorehouseStore } from "@/hooks";
import { Modal, CTA } from "@components";

// --- HELPERS ---
const formatCurrency = (val: number) => val === 0 ? "Sin registrar" : `S/ ${(val || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "Fecha no disponible";

export default function ProductionOrderTracking() {
  const { startLoadingPrePurchaseOrders, prePurchaseOrders } = useStorehouseStore();
  const [filter, setFilter] = useState("TODAS");

  useEffect(() => {
    startLoadingPrePurchaseOrders();
  }, [startLoadingPrePurchaseOrders]);

  const counts = useMemo(() => ({
    TODAS: prePurchaseOrders.filter(o => o.status !== "CONVERTIDA").length,
    "CONTACTO INICIAL": prePurchaseOrders.filter(o => o.status === "SOLICITANDO").length,
    "CORTE / HABILITADO": 0,
    "EN TALLER": prePurchaseOrders.filter(o => o.status === "COMPARANDO").length,
    "CONTROL CALIDAD": prePurchaseOrders.filter(o => o.status === "EN_REVISION").length,
    "RECHAZADO": 0,
  }), [prePurchaseOrders]);

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-6 py-10 bg-[#fdfcfc]">
      <header className="space-y-2">
        <h1 className="text-4xl font-normal text-[#594246] font-(--font-vidaloka)">Seguimiento de Ordenes de Produccion</h1>
        <p className="text-base text-[#9b8088]">{counts.TODAS} ordenes en curso</p>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#b79ca5]" />
        <input
          type="text"
          placeholder="Buscar por taller, producto o N° de orden..."
          className="h-16 w-full rounded-2xl border border-rose-100 bg-white pl-14 pr-4 text-base outline-none shadow-sm focus:ring-1 focus:ring-[#F2778D]"
        />
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-[11px] font-bold transition-all ${
              filter === key 
                ? "bg-[#F2778D] text-white shadow-sm" 
                : "border border-rose-100 bg-white text-[#9b8088] hover:bg-rose-50"
            }`}
          >
            {key === "RECHAZADO" ? <XCircle className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
            {key.charAt(0) + key.slice(1).toLowerCase()} ({count})
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {prePurchaseOrders.map((order: any) => (
          <ProductionCard key={order._id} order={order} />
        ))}
      </div>
    </section>
  );
}

function ProductionCard({ order }: { order: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"STATUS" | "DATE" | "TECH" | "OBS" | "COST" | null>(null);
  const [now, setNow] = useState(new Date());
  const [statusAction, setStatusAction] = useState<"NEXT" | "PAUSE">("NEXT");
  const [pauseReason, setPauseReason] = useState("");

  useEffect(() => {
    if (activeModal === "OBS" || activeModal === "STATUS") {
      setNow(new Date());
    }
  }, [activeModal]);
  
  const getProgress = () => {
    if (order.status === "EN_REVISION") return 100;
    if (order.status === "CONVERTIDA") return 75;
    if (order.status === "COMPARANDO") return 50;
    return 25;
  };

  const firstItem = order.base_items?.[0]?.id_variant?.id_product;
  const selectedQuote = order.quotes?.find((q: any) => q.quote_status === 'SELECCIONADO');
  const workshopName = selectedQuote?.id_supplier?.name_company || selectedQuote?.id_supplier?.name || "Taller no asignado";
  const totalAmount = selectedQuote?.total_amount || 0;

  return (
    <article className="rounded-[30px] border border-rose-100 bg-white p-5 sm:p-8 shadow-sm transition-all overflow-hidden">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-3xl bg-rose-50 border border-rose-100">
             <Image 
                src={firstItem?.images?.[0] || "/placeholder.png"} 
                alt="Product" 
                fill 
                className="object-cover" 
             />
          </div>
          <div className="space-y-1 sm:space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 className="text-xl sm:text-2xl font-normal text-[#594246] leading-tight">{firstItem?.name || "Producto sin nombre"}</h3>
              <div className="flex flex-wrap gap-1.5">
                <span className={`rounded-md px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-[13px] font-normal text-white ${
                  order.status === 'EN_REVISION' ? 'bg-green-500' : 'bg-[#F291A3]/80'
                  }`}>
                  {order.status === 'EN_REVISION' ? 'Control Calidad' : 'En Proceso'}
                </span>
                <span className="rounded-md bg-[#F2D0D3]/40 px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-[13px] font-normal text-[#b46a7c]">
                  {workshopName}
                </span>
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
              {formatCurrency(totalAmount)}
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
            />

            <StepItem 
              active={order.status === "COMPARANDO" || order.status === "EN_REVISION" || order.status === "CONVERTIDA"} 
              icon={<Scissors className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Corte / Habilitado" 
              sub="Preparacion de telas" 
            />
            
            <StepItem 
              active={order.status === "EN_REVISION" || order.status === "CONVERTIDA"} 
              icon={<Factory className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Confeccion" 
              sub="Trabajo en taller" 
            />

            <StepItem 
              active={order.status === "CONVERTIDA"} 
              icon={<ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Control Calidad" 
              sub="Revision y acabados" 
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
                Prolongar fecha de abastecimiento
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
                onClick={() => setActiveModal("OBS")}
                className="!bg-white border border-[#f2b6c1] !text-[#594246] !py-3 !px-6"
                icon={FileText}
              >
                Ver Observaciones
              </CTA>
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
        title="Prolongar Abastecimiento"
        titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
      >
        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#b79ca5] uppercase tracking-wider">Nueva Fecha Estimada</label>
            <input type="date" className="w-full h-12 rounded-xl border border-rose-100 px-4 outline-none focus:ring-1 focus:ring-[#F2778D] text-[#594246]" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#b79ca5] uppercase tracking-wider">Razón de la prórroga</label>
            <select className="w-full h-12 rounded-xl border border-rose-100 px-4 outline-none focus:ring-1 focus:ring-[#F2778D] text-[#594246] appearance-none bg-white">
              <option value="">Selecciona una razón...</option>
              <option value="productos-mal-estado">Productos en mal estado</option>
              <option value="retraso-taller">Retraso en el taller</option>
              <option value="falta-insumos">Falta de insumos / avíos</option>
              <option value="otro">Otro (especificar en observaciones)</option>
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <CTA onClick={() => setActiveModal(null)} className="flex-1 !bg-white border border-rose-100 !text-[#9b8088]">Cancelar</CTA>
            <CTA className="flex-1 shadow-lg shadow-rose-100">Confirmar</CTA>
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
          {/* Indicador de Flujo */}
          <div className="flex items-center justify-center gap-4 bg-rose-50/30 p-4 rounded-2xl border border-rose-50">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#b79ca5] uppercase">Fase Actual</span>
              <p className="text-sm font-bold text-[#594246]">Corte / Habilitado</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#F2778D]" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#F2778D] uppercase">Siguiente Fase</span>
              <p className="text-sm font-bold text-[#594246]">Confección / Costura</p>
            </div>
          </div>

          {/* Selector de Acción */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setStatusAction("NEXT")}
              className={`p-5 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 ${
                statusAction === "NEXT" 
                  ? "border-[#F2778D] bg-rose-50/20 ring-4 ring-rose-50/30" 
                  : "border-rose-50 bg-white hover:border-rose-100"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusAction === "NEXT" ? "bg-[#F2778D] text-white" : "bg-rose-50 text-[#F2778D]"}`}>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#594246]">Avanzar Fase</p>
                <p className="text-[10px] text-[#9b8088] leading-tight">Continuar con el flujo normal de producción.</p>
              </div>
            </button>

            <button 
              onClick={() => setStatusAction("PAUSE")}
              className={`p-5 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 ${
                statusAction === "PAUSE" 
                  ? "border-amber-400 bg-amber-50/20 ring-4 ring-amber-50/30" 
                  : "border-rose-50 bg-white hover:border-rose-100"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusAction === "PAUSE" ? "bg-amber-400 text-white" : "bg-amber-50 text-amber-500"}`}>
                <Pause className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#594246]">Pausar Orden</p>
                <p className="text-[10px] text-[#9b8088] leading-tight">Detener temporalmente por algún incidente.</p>
              </div>
            </button>
          </div>

          {/* Campo Condicional para Pausa */}
          {statusAction === "PAUSE" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-bold text-[#594246] uppercase tracking-widest ml-1">Motivo de la detención</label>
              <textarea 
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="Escribe aquí por qué se detiene la orden (ej: Falta de insumos)..."
                className="w-full h-24 p-4 rounded-xl border border-rose-100 bg-white text-sm text-[#594246] outline-none focus:ring-2 focus:ring-amber-200 resize-none transition-all"
              />
            </div>
          )}

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
              className={`flex-1 shadow-lg ${statusAction === "PAUSE" ? "!bg-amber-400 shadow-amber-100" : "shadow-rose-100"}`}
              disabled={statusAction === "PAUSE" && !pauseReason.trim()}
            >
              Confirmar Cambio
            </CTA>
          </div>
        </div>
      </Modal>

      {/* 3. Modal Observaciones */}
      <Modal 
        open={activeModal === "OBS"} 
        onClose={() => setActiveModal(null)}
        panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8"
        title="Bitácora de Seguimiento"
        titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
      >
        <div className="space-y-6 pt-2">
          <div className="max-h-60 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
             <div className="p-4 bg-rose-50/20 rounded-xl border border-rose-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-[#F2778D] uppercase">04 May 2026 · Admin</span>
                </div>
                <p className="text-sm text-[#594246] leading-relaxed">Se enviaron 10 cierres adicionales para la variante L por requerimiento del taller.</p>
             </div>
             <div className="p-4 bg-rose-50/20 rounded-xl border border-rose-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase">05 May 2026 · Taller</span>
                </div>
                <p className="text-sm text-[#594246] leading-relaxed">Telas recibidas en buen estado. Iniciando corte hoy mismo.</p>
             </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-[#b79ca5] uppercase tracking-wider">Agregar nueva nota</label>
              <span className="text-[10px] font-bold text-[#F2778D] uppercase tracking-wider">
                {now.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')} · {now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </div>
            <textarea className="w-full h-24 rounded-xl border border-rose-100 p-4 outline-none focus:ring-1 focus:ring-[#F2778D] resize-none text-sm text-[#594246]" placeholder="Escribe aquí cualquier detalle..." />
          </div>
          <CTA className="w-full shadow-lg shadow-rose-100" icon={Plus}>Añadir Observación</CTA>
        </div>
      </Modal>

      {/* 4. Modal Registrar Costos */}
      <Modal 
        open={activeModal === "COST"} 
        onClose={() => setActiveModal(null)}
        panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8"
        title="Registro de Costos"
        titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
      >
        <div className="space-y-6 pt-2">
          <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-[#F2778D] shrink-0" />
             <p className="text-xs text-[#9b8088] leading-tight">Ingresa el costo de mano de obra acordado con el taller para desbloquear el inicio de producción.</p>
          </div>
          <div className="space-y-2">
             {order.base_items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-rose-50/30 rounded-lg transition-colors">
                   <div>
                      <p className="text-sm font-bold text-[#594246]">{item.id_variant?.size} · {item.id_variant?.color}</p>
                      <p className="text-[10px] text-[#9b8088] uppercase">{item.quantity} unidades</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#b79ca5]">S/</span>
                      <input type="number" placeholder="0.00" className="w-24 h-10 rounded-lg border border-rose-100 px-3 text-right outline-none focus:ring-1 focus:ring-[#F2778D] font-bold text-[#594246]" />
                   </div>
                </div>
             ))}
          </div>
          <CTA className="w-full h-14 !text-lg shadow-xl shadow-rose-100">Confirmar Costos</CTA>
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

function StepItem({ active, icon, label, sub }: { active: boolean; icon: any; label: string; sub: string }) {
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
      </div>
    </div>
  );
}
