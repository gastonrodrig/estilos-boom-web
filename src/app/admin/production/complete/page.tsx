"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { 
  Search, Package, CheckCircle2, 
  Eye, FileText, Download, Calendar, History,
  Factory, Scissors
} from "lucide-react";
import { useProductionStore } from "@/hooks/production";

// --- HELPERS ---
const formatCurrency = (val: number) => val === 0 ? "Sin registrar" : `S/ ${(val || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
const formatDate = (date?: string | Date) => {
  if (!date) return "Fecha no disponible";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Fecha no disponible";
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
};
const formatSubStateDate = (date?: string | Date) => {
  if (!date) return '---';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '---';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

const MOCK_COMPLETED_ORDERS = [
  {
    _id: "mock-1",
    pre_order_number: "OP-2026-001",
    status: "COMPLETADA",
    updated_at: "2026-05-01T10:00:00Z",
    base_items: [
      {
        id_variant: {
          id_product: {
            name: "Vestido Gala Velvet",
            images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80\u0026w=400\u0026auto=format\u0026fit=crop"]
          }
        },
        quantity: 45
      }
    ],
    quotes: [
      {
        quote_status: "SELECCIONADO",
        id_supplier: { name_company: "Taller Creaciones Rosa" },
        total_amount: 2850.50
      }
    ]
  },
  {
    _id: "mock-2",
    pre_order_number: "OP-2026-005",
    status: "COMPLETADA",
    updated_at: "2026-04-28T15:30:00Z",
    base_items: [
      {
        id_variant: {
          id_product: {
            name: "Blusa Seda Ivory",
            images: ["https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80\u0026w=200\u0026auto=format\u0026fit=crop"]
          }
        },
        quantity: 120
      }
    ],
    quotes: [
      {
        quote_status: "SELECCIONADO",
        id_supplier: { name_company: "Textiles del Sur S.A.C." },
        total_amount: 4200.00
      }
    ]
  },
  {
    _id: "mock-3",
    pre_order_number: "OP-2026-012",
    status: "COMPLETADA",
    updated_at: "2026-05-04T09:15:00Z",
    base_items: [
      {
        id_variant: {
          id_product: {
            name: "Pantalón Sastrero Negro",
            images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80\u0026w=200\u0026auto=format\u0026fit=crop"]
          }
        },
        quantity: 60
      }
    ],
    quotes: [
      {
        quote_status: "SELECCIONADO",
        id_supplier: { name_company: "Taller Moda Elite" },
        total_amount: 3150.00
      }
    ]
  }
];

// Importamos componentes necesarios
import { Modal, CTA } from "@components";

export default function CompletedProductionOrders() {
  const { startLoadingProductionOrders, orders } = useProductionStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    startLoadingProductionOrders();
  }, [startLoadingProductionOrders]);

  const completedOrders = useMemo(() => {
    return (orders || []).filter((o: any) => {
      if (o.status !== "COMPLETADA" && o.status !== "CONTROL_CALIDAD") return false;
      const sq = o.quotes?.find((q: any) => q.quote_status === 'SELECCIONADO');
      return true;
    });
  }, [orders]);

  const filteredOrders = completedOrders.filter((order: any) => {
    const firstItem = order.base_items?.[0]?.id_variant?.id_product?.name || "";
    const orderNum = order.pre_order_number || order.order_number || "";
    return firstItem.toLowerCase().includes(search.toLowerCase()) || 
           orderNum.toLowerCase().includes(search.toLowerCase());
  });

  const totalInvestment = useMemo(() => 
    completedOrders.reduce((acc, oc) => acc + (oc.total_amount || 0), 0)
  , [completedOrders]);

  const [activeModal, setActiveModal] = useState<"TECH" | "OBS" | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleOpenModal = (type: "TECH" | "OBS", order: any) => {
    setSelectedOrder(order);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedOrder(null);
  };

  const selectedFirstItem = selectedOrder?.base_items?.[0]?.id_variant?.id_product;
  const selectedQuoteObj = selectedOrder?.quotes?.find((q: any) => q.quote_status === 'SELECCIONADO');
  const selectedWorkshopName = selectedQuoteObj?.id_agent?.name_company || selectedQuoteObj?.id_supplier?.name_company || selectedQuoteObj?.id_agent?.name || selectedQuoteObj?.id_supplier?.name || "Taller finalizado";
  const selectedTotalAmount = selectedOrder?.total_amount || 0;
  const selectedTotalUnits = selectedOrder?.base_items?.reduce((acc: any, i: any) => acc + (i.quantity || 0), 0) || 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 transition-colors duration-500 relative min-h-screen">
      <header className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-end justify-between px-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8C6B79] dark:text-white/30 mb-2">
            <span>Inicio</span>
            <span>/</span>
            <span>Producción</span>
            <span>/</span>
            <span className="text-[#D6405F] dark:text-white/50">Finalizadas</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
            <h1 className="text-[#40202D] dark:text-white leading-none mb-2" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2rem', fontWeight: 300 }}>
              Órdenes Finalizadas
            </h1>
          </div>
          <p className="text-[#8C6B79] dark:text-white tracking-[0.03em] mt-3" style={{ fontSize: '0.78rem', opacity: 0.45 }}>
            Historial de prendas producidas ingresadas al inventario.
          </p>
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full md:w-auto items-end">
          <div className="rounded-[1rem] bg-white/70 backdrop-blur-2xl dark:bg-[rgba(255,255,255,0.04)] border border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.05)] p-5 shadow-sm min-w-[160px] flex-1">
            <p className="text-[10px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">Inversión Total</p>
            <p className="text-xl font-medium text-[#D6405F] dark:text-[#F8BBD0] mt-1 drop-shadow-sm">{formatCurrency(totalInvestment)}</p>
          </div>
          <div className="rounded-[1rem] bg-white/70 backdrop-blur-2xl dark:bg-[rgba(255,255,255,0.04)] border border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.05)] p-5 shadow-sm min-w-[120px] flex-1">
            <p className="text-[10px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">Órdenes</p>
            <p className="text-xl font-medium text-[#40202D] dark:text-white mt-1 drop-shadow-sm">{completedOrders.length} OP</p>
          </div>
        </div>
      </header>

      {/* Tabla */}
      <main className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-white/70 backdrop-blur-2xl dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-[2rem] overflow-hidden transition-[background-color,border-color] duration-[600ms]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="relative transition-[background-color,border-color] duration-[600ms]">
              <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-medium uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Código OP</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Taller</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Fecha Término</th>
                <th className="px-6 py-5 text-center border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Unidades</th>
                <th className="px-6 py-5 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Inversión</th>
                <th className="px-6 py-5 text-right border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(139,58,82,0.06)] dark:divide-[rgba(255,255,255,0.06)] text-sm">
              {filteredOrders.map((order: any, idx: number) => (
                <CompletedOrderRow 
                  key={order._id} 
                  order={order} 
                  idx={idx}
                  onOpenTech={() => handleOpenModal("TECH", order)} 
                  onOpenObs={() => handleOpenModal("OBS", order)} 
                />
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="bg-white/50 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center shadow-inner">
                        <Package className="h-10 w-10 text-[#8C6B79] dark:text-gray-500" />
                      </div>
                      <p className="text-[#8C6B79] dark:text-gray-400 font-medium">No se encontraron órdenes completadas.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modales trasladados fuera de la tabla */}
      {selectedOrder && (
        <Modal 
          open={activeModal === "OBS"} 
          onClose={closeModal}
          panelClassName="relative bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-[32px] border border-[#EAE0E2] dark:border-white/10 shadow-sm w-full max-w-3xl p-8"
          title="Línea de Tiempo de Producción"
          titleClassName="text-2xl font-medium text-[#40202D] dark:text-white"
        >
          <div className="pt-8 pb-4">
            <div className="relative">
              {/* Línea horizontal de fondo */}
              <div className="absolute top-[26px] left-[10%] right-[10%] h-[4px] bg-[#EAE0E2]/50 dark:bg-white/5 rounded-full z-0" />
              
              <div className="grid grid-cols-3 relative z-10">
                {/* Paso 1: Contacto Inicial */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-full bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 flex items-center justify-center text-[#8C6B79] dark:text-gray-400 shadow-sm group-hover:border-[#D6405F] dark:group-hover:border-[#F8BBD0] group-hover:text-[#D6405F] dark:group-hover:text-[#F8BBD0] transition-all duration-300">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="mt-4 space-y-1 px-2">
                    <p className="text-sm font-medium text-[#40202D] dark:text-white">Contacto Inicial</p>
                    <p className="text-[10px] font-medium text-[#D6405F] dark:text-[#F8BBD0] uppercase tracking-widest">Negociación</p>
                    <p className="text-[11px] text-[#8C6B79] dark:text-gray-400 font-medium leading-tight">{formatDate(selectedOrder.created_at)}</p>
                    <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity max-w-[150px]">
                      <p className="text-[10px] text-[#8C6B79] dark:text-gray-500 font-medium leading-none">Acuerdo de costos y asignación de taller.</p>
                    </div>
                  </div>
                </div>

                {/* Paso 2: Producción */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-full bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 flex items-center justify-center text-[#8C6B79] dark:text-gray-400 shadow-sm group-hover:border-[#D6405F] dark:group-hover:border-[#F8BBD0] group-hover:text-[#D6405F] dark:group-hover:text-[#F8BBD0] transition-all duration-300">
                    <Factory className="w-6 h-6" />
                  </div>
                  <div className="mt-4 space-y-1 px-2">
                    <p className="text-sm font-medium text-[#40202D] dark:text-white">En Producción</p>
                    <div className="flex flex-col gap-1 mt-2 bg-white/30 dark:bg-white/5 p-2 rounded-lg border border-[#EAE0E2] dark:border-white/10 backdrop-blur-md">
                       <p className="text-[9px] font-medium text-[#D6405F] dark:text-[#F8BBD0] uppercase flex justify-between gap-4 tracking-widest"><span>Corte:</span> <span className="text-[#8C6B79] dark:text-gray-400 font-medium">
                         {(() => {
                            const sub = selectedOrder.sub_states?.find((s: any) => s.step === 'CORTE');
                            return formatSubStateDate(sub?.date);
                          })()}
                       </span></p>
                       <p className="text-[9px] font-medium text-[#D6405F] dark:text-[#F8BBD0] uppercase flex justify-between gap-4 tracking-widest"><span>Confección:</span> <span className="text-[#8C6B79] dark:text-gray-400 font-medium">
                         {(() => {
                            const sub = selectedOrder.sub_states?.find((s: any) => s.step === 'CONFECCION');
                            return formatSubStateDate(sub?.date);
                          })()}
                       </span></p>
                    </div>
                  </div>
                </div>

                {/* Paso 3: Finalización */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-md shadow-emerald-400/20 flex items-center justify-center transition-transform hover:scale-110 duration-300">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="mt-4 space-y-1 px-2">
                    <p className="text-sm font-medium text-[#40202D] dark:text-white">Finalizado</p>
                    <p className="text-[10px] font-medium text-[#10b981] dark:text-emerald-400 uppercase tracking-widest">Entregado y Validado</p>
                    <p className="text-[11px] text-[#8C6B79] dark:text-gray-400 font-medium leading-tight">{formatDate(selectedOrder.updated_at)}</p>
                    <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity max-w-[150px]">
                      <p className="text-[10px] text-[#8C6B79] dark:text-gray-500 font-medium leading-none">Control de calidad aprobado y registrado en inventario.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-white/50 dark:bg-white/5 rounded-2xl p-5 border border-[#EAE0E2] dark:border-white/10 shadow-inner">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-[#D6405F] dark:text-[#F8BBD0]" />
                <h4 className="text-xs font-medium text-[#40202D] dark:text-white uppercase tracking-widest">Resumen de Auditoría</h4>
              </div>
              <p className="text-xs text-[#8C6B79] dark:text-gray-400 leading-relaxed font-medium">
                La orden <span className="font-medium text-[#40202D] dark:text-white">{selectedOrder.pre_order_number || selectedOrder.order_number}</span> completó satisfactoriamente todas las etapas de validación. 
                Se confirma el ingreso de <span className="font-medium text-[#D6405F] dark:text-[#F8BBD0]">{selectedTotalUnits} unidades</span> al inventario central bajo la supervisión del taller <span className="font-medium text-[#40202D] dark:text-white">{selectedWorkshopName}</span>.              </p>
            </div>

            <CTA className="w-full !bg-white/50 dark:!bg-white/5 border border-[#EAE0E2] dark:border-white/10 !text-[#8C6B79] dark:!text-gray-400 mt-8 hover:!bg-white/80 dark:hover:!bg-white/10 hover:!text-[#40202D] dark:hover:!text-white backdrop-blur-md" onClick={closeModal}>Cerrar Historial</CTA>
          </div>
        </Modal>
      )}

      {selectedOrder && (
        <Modal 
          open={activeModal === "TECH"} 
          onClose={closeModal}
          panelClassName="relative bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-[32px] border border-[#EAE0E2] dark:border-white/10 shadow-sm w-full max-w-2xl p-8"
          title="Ficha Técnica Detallada"
          titleClassName="text-2xl font-medium text-[#40202D] dark:text-white"
        >
          <div className="space-y-8 pt-4">
             <div className="flex flex-col sm:flex-row items-start gap-8">
                <div className="relative h-48 w-full sm:w-48 shrink-0 overflow-hidden rounded-[20px] bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 shadow-inner">
                   <Image src={(typeof selectedFirstItem?.images?.[0] === 'object' ? selectedFirstItem?.images?.[0]?.url : selectedFirstItem?.images?.[0]) || "/placeholder.png"} alt="Product" fill className="object-cover" />
                </div>
                <div className="space-y-6 flex-1 w-full">
                   <div>
                      <h4 className="text-3xl font-medium text-[#40202D] dark:text-white leading-tight">{selectedFirstItem?.name}</h4>
                      <p className="text-sm text-[#D6405F] dark:text-[#F8BBD0] font-medium mt-1">Orden N° {selectedOrder.pre_order_number || selectedOrder.order_number}</p>                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/50 dark:bg-white/5 p-3.5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 shadow-inner">
                         <p className="text-[10px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">Taller</p>
                         <p className="text-sm font-medium text-[#40202D] dark:text-white truncate mt-0.5">{selectedWorkshopName}</p>
                      </div>
                      <div className="bg-white/50 dark:bg-white/5 p-3.5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 shadow-inner">
                         <p className="text-[10px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">Costo Unit. Promedio</p>
                         <p className="text-sm font-medium text-[#40202D] dark:text-white mt-0.5">S/ {selectedTotalUnits > 0 ? (selectedTotalAmount / selectedTotalUnits).toFixed(2) : "0.00"}</p>                      </div>
                      <div className="bg-white/50 dark:bg-white/5 p-3.5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 shadow-inner">
                         <p className="text-[10px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">Material</p>
                         <p className="text-sm font-medium text-[#40202D] dark:text-white mt-0.5">Algodón / Poliéster</p>
                      </div>
                      <div className="bg-white/50 dark:bg-white/5 p-3.5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 shadow-inner">
                         <p className="text-[10px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest">Inversión Total</p>
                         <p className="text-sm font-medium text-[#D6405F] dark:text-[#F8BBD0] mt-0.5">{formatCurrency(selectedTotalAmount)}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h5 className="text-[11px] font-medium text-[#40202D] dark:text-white uppercase tracking-widest border-b border-[#EAE0E2] dark:border-white/10 pb-2">Distribución de Producción</h5>
                <div className="overflow-hidden border border-[#EAE0E2] dark:border-white/10 rounded-2xl bg-white/50 dark:bg-white/5 shadow-inner">
                   <table className="w-full text-left text-xs">
                      <thead className="bg-white/30 dark:bg-white/5 text-[#8C6B79] dark:text-gray-400 font-medium uppercase tracking-widest text-[10px]">
                         <tr>
                            <th className="p-4 border-b border-[#EAE0E2] dark:border-white/10">Variante</th>
                            <th className="p-4 text-center border-b border-[#EAE0E2] dark:border-white/10">Talla</th>
                            <th className="p-4 text-center border-b border-[#EAE0E2] dark:border-white/10">Color</th>
                            <th className="p-4 text-right border-b border-[#EAE0E2] dark:border-white/10">Cantidad Final</th>
                         </tr>
                      </thead>
                      <tbody className="text-[#40202D] dark:text-gray-300">
                         {selectedOrder.base_items?.map((item: any, idx: number) => (
                           <tr key={idx} className={`transition-colors group/row ${idx % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)] border-b border-[#EAE0E2]/50 dark:border-[rgba(255,255,255,0.04)] last:border-0`}>
                              <td className="p-4 font-bold">Lote A-{idx + 1}</td>
                              <td className="p-4 text-center font-medium">{item.id_variant?.size || "M"}</td>
                              <td className="p-4 text-center font-medium">{typeof item.id_variant?.color === "object" ? (item.id_variant?.color?.name || "N/A") : (item.id_variant?.color || "N/A")}</td>
                              <td className="p-4 text-right font-medium text-[#D6405F] dark:text-[#F8BBD0]">{item.quantity} uds.</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             <CTA className="w-full !bg-white/50 dark:!bg-white/5 border border-[#EAE0E2] dark:border-white/10 !text-[#8C6B79] dark:!text-gray-400 hover:!bg-white/80 dark:hover:!bg-white/10 hover:!text-[#40202D] dark:hover:!text-white backdrop-blur-md" onClick={closeModal}>Cerrar Ficha Técnica</CTA>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CompletedOrderRow({ order, idx, onOpenTech, onOpenObs }: { order: any; idx: number; onOpenTech: () => void; onOpenObs: () => void; }) {
  const selectedQuote = order.quotes?.find((q: any) => q.quote_status === 'SELECCIONADO');
  const workshopName = selectedQuote?.id_agent?.name_company || selectedQuote?.id_supplier?.name_company || selectedQuote?.id_agent?.name || selectedQuote?.id_supplier?.name || "Taller finalizado";
  const totalAmount = selectedQuote?.total_amount || 0;
  const totalUnits = order.base_items?.reduce((acc: any, i: any) => acc + (i.quantity || 0), 0) || 0;

  return (
    <tr className={`transition-colors group ${idx % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
      <td className="px-6 py-5 font-medium text-[#D6405F] dark:text-[#F8BBD0]">{order.pre_order_number || order.order_number || "Sin número"}</td>
      <td className="px-6 py-5">
          <p className="font-bold text-[#40202D] dark:text-white">{workshopName}</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">Producción</p>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2 text-[#40202D] dark:text-white font-medium text-xs">
          <Calendar className="h-3.5 w-3.5 text-[#D6405F] dark:text-[#F8BBD0]" />
          {formatDate(order.updated_at)}
        </div>
      </td>
      <td className="px-6 py-5 text-center">
        <span className="rounded-full bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 px-3 py-1 text-[11px] font-medium text-[#40202D] dark:text-white shadow-sm">
          {totalUnits} uds.
        </span>
      </td>
      <td className="px-6 py-5 font-medium text-[#40202D] dark:text-white">{formatCurrency(totalAmount)}</td>
      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2">
          {/* Ojo = Ficha Técnica */}
          <button onClick={onOpenTech} title="Ver Ficha Técnica" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] dark:text-gray-400 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#40202D] dark:hover:text-white transition-all shadow-sm">
            <Eye className="h-4 w-4" />
          </button>
          
          {/* Documento = Línea de Tiempo / Bitácora */}
          <button onClick={onOpenObs} title="Línea de Tiempo" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D6405F]/30 dark:border-[#F8BBD0]/30 text-[#D6405F] dark:text-[#F8BBD0] bg-[#D6405F]/10 dark:bg-[#F8BBD0]/10 hover:bg-[#D6405F] dark:hover:bg-[#F8BBD0] hover:text-white dark:hover:text-[#1A0B11] transition-all shadow-sm">
            <History className="h-4 w-4" />
          </button>

          {/* Comprobante OP = Nueva Factura en Tab (Icono de documento) */}
          <button onClick={() => window.open(`/admin/production/invoice/${order._id}`, '_blank')} title="Ver Comprobante OP" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 dark:border-emerald-400/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 hover:bg-emerald-500 dark:hover:bg-emerald-400 hover:text-white dark:hover:text-[#1A0B11] transition-all shadow-sm">
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
