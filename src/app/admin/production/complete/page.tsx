"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { 
  Search, Package, CheckCircle2, 
  Eye, FileText, Download, Calendar, History,
  Factory, Scissors
} from "lucide-react";
import { useStorehouseStore } from "@/hooks";

// --- HELPERS ---
const formatCurrency = (val: number) => val === 0 ? "Sin registrar" : `S/ ${(val || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "Fecha no disponible";

const MOCK_COMPLETED_ORDERS = [
  {
    _id: "mock-1",
    pre_order_number: "OP-2026-001",
    status: "CONVERTIDA",
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
    status: "CONVERTIDA",
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
    status: "CONVERTIDA",
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
  const { startLoadingPrePurchaseOrders, prePurchaseOrders } = useStorehouseStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    startLoadingPrePurchaseOrders();
  }, [startLoadingPrePurchaseOrders]);

  const completedOrders = useMemo(() => {
    if (typeof window !== "undefined") {
      const createdStr = localStorage.getItem("mocked_created_orders");
      if (createdStr) {
        try {
          const parsed = JSON.parse(createdStr);
          const finished = parsed.filter((o: any) => {
            if (o.status !== "CONVERTIDA" && o.status !== "COMPLETADA") return false;
            const sq = o.quotes?.find((q: any) => q.quote_status === 'SELECCIONADO');
            if (!sq?.total_amount) return false; // Hide buggy orders without registered costs
            return true;
          });
          return [...finished, ...MOCK_COMPLETED_ORDERS];
        } catch (e) {}
      }
    }
    return MOCK_COMPLETED_ORDERS;
  }, []);

  const filteredOrders = completedOrders.filter(order => {
    const firstItem = order.base_items?.[0]?.id_variant?.id_product?.name || "";
    return firstItem.toLowerCase().includes(search.toLowerCase()) || 
           order.pre_order_number.toLowerCase().includes(search.toLowerCase());
  });

  const totalInvestment = useMemo(() => 
    completedOrders.reduce((acc, oc) => {
      const q = oc.quotes?.find((q: any) => q.quote_status === 'SELECCIONADO');
      return acc + (q?.total_amount || 0);
    }, 0)
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
  const selectedTotalAmount = selectedQuoteObj?.total_amount || 0;
  const selectedTotalUnits = selectedOrder?.base_items?.reduce((acc: any, i: any) => acc + i.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#F2778D]">
            <History className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Producción</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <h1 className="text-4xl text-[#594246] font-serif font-(--font-vidaloka)">Órdenes Finalizadas</h1>
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
          <p className="text-[#9b8088] mt-1">Historial de prendas producidas ingresadas al inventario.</p>
        </div>

        <div className="flex gap-4">
          <div className="rounded-2xl bg-white border border-rose-100 p-5 shadow-sm min-w-[200px]">
            <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Inversión Total</p>
            <p className="text-2xl font-black text-[#F2778D] mt-1">{formatCurrency(totalInvestment)}</p>
          </div>
          <div className="rounded-2xl bg-[#594246] p-5 shadow-sm min-w-[160px]">
            <p className="text-[10px] font-bold text-rose-200/60 uppercase">Órdenes</p>
            <p className="text-2xl font-black text-white mt-1">{completedOrders.length} OP</p>
          </div>
        </div>
      </header>

      {/* Tabla */}
      <main className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-rose-50/50 text-[11px] font-bold uppercase tracking-wider text-[#b79ca5]">
                <th className="px-6 py-5">Código OP</th>
                <th className="px-6 py-5">Taller</th>
                <th className="px-6 py-5">Fecha Término</th>
                <th className="px-6 py-5 text-center">Unidades</th>
                <th className="px-6 py-5">Inversión</th>
                <th className="px-6 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50 text-sm">
              {filteredOrders.map((order: any) => (
                <CompletedOrderRow 
                  key={order._id} 
                  order={order} 
                  onOpenTech={() => handleOpenModal("TECH", order)} 
                  onOpenObs={() => handleOpenModal("OBS", order)} 
                />
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-[#9b8088]">
                    No se encontraron órdenes completadas con esos criterios.
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
          panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8"
          title="Línea de Tiempo de Producción"
          titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
        >
          <div className="pt-8 pb-4">
            <div className="relative">
              {/* Línea horizontal de fondo */}
              <div className="absolute top-[26px] left-[10%] right-[10%] h-[4px] bg-rose-100/50 rounded-full z-0" />
              
              <div className="grid grid-cols-3 relative z-10">
                {/* Paso 1: Contacto Inicial */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-rose-100 flex items-center justify-center text-[#b79ca5] shadow-sm group-hover:border-[#F2778D] group-hover:text-[#F2778D] transition-all duration-300">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="mt-4 space-y-1 px-2">
                    <p className="text-sm font-bold text-[#594246]">Contacto Inicial</p>
                    <p className="text-[10px] font-bold text-[#F2778D] uppercase tracking-tighter">Negociación</p>
                    <p className="text-[11px] text-[#9b8088] font-medium leading-tight">{formatDate(selectedOrder.created_at)}</p>
                    <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity max-w-[150px]">
                      <p className="text-[10px] text-[#b79ca5] leading-none">Acuerdo de costos y asignación de taller.</p>
                    </div>
                  </div>
                </div>

                {/* Paso 2: Producción */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-rose-100 flex items-center justify-center text-[#b79ca5] shadow-sm group-hover:border-[#F2778D] group-hover:text-[#F2778D] transition-all duration-300">
                    <Factory className="w-6 h-6" />
                  </div>
                  <div className="mt-4 space-y-1 px-2">
                    <p className="text-sm font-bold text-[#594246]">En Producción</p>
                    <div className="flex flex-col gap-1 mt-2 bg-rose-50/50 p-2 rounded-lg border border-rose-100/50">
                       <p className="text-[9px] font-bold text-[#F2778D] uppercase flex justify-between gap-4"><span>Corte:</span> <span className="text-[#9b8088]">{new Date(new Date(selectedOrder.created_at).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span></p>
                       <p className="text-[9px] font-bold text-[#F2778D] uppercase flex justify-between gap-4"><span>Confección:</span> <span className="text-[#9b8088]">{new Date(new Date(selectedOrder.created_at).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span></p>
                    </div>
                  </div>
                </div>

                {/* Paso 3: Finalización */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-[#F2778D] text-white shadow-lg shadow-rose-100 flex items-center justify-center transition-transform hover:scale-110 duration-300">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="mt-4 space-y-1 px-2">
                    <p className="text-sm font-bold text-[#594246]">Finalizado</p>
                    <p className="text-[10px] font-bold text-[#F2778D] uppercase tracking-tighter">Entregado y Validado</p>
                    <p className="text-[11px] text-[#9b8088] font-medium leading-tight">{formatDate(selectedOrder.updated_at)}</p>
                    <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity max-w-[150px]">
                      <p className="text-[10px] text-[#b79ca5] leading-none">Control de calidad aprobado y registrado en inventario.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-rose-50/30 rounded-2xl p-5 border border-rose-50/50">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-[#F2778D]" />
                <h4 className="text-xs font-bold text-[#594246] uppercase tracking-widest">Resumen de Auditoría</h4>
              </div>
              <p className="text-xs text-[#9b8088] leading-relaxed">
                La orden <span className="font-bold text-[#594246]">{selectedOrder.pre_order_number}</span> completó satisfactoriamente todas las etapas de validación. 
                Se confirma el ingreso de <span className="font-bold text-[#F2778D]">{selectedTotalUnits} unidades</span> al inventario central bajo la supervisión del taller <span className="font-bold text-[#594246]">{selectedWorkshopName}</span>.
              </p>
            </div>

            <CTA className="w-full !bg-white border border-rose-100 !text-[#9b8088] mt-8" onClick={closeModal}>Cerrar Historial</CTA>
          </div>
        </Modal>
      )}

      {selectedOrder && (
        <Modal 
          open={activeModal === "TECH"} 
          onClose={closeModal}
          panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8"
          title="Ficha Técnica Detallada"
          titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
        >
          <div className="space-y-8 pt-4">
             <div className="flex flex-col sm:flex-row items-start gap-8">
                <div className="relative h-48 w-full sm:w-48 shrink-0 overflow-hidden rounded-2xl border border-rose-100 shadow-inner">
                   <Image src={selectedFirstItem?.images?.[0] || "/placeholder.png"} alt="Product" fill className="object-cover" />
                </div>
                <div className="space-y-6 flex-1 w-full">
                   <div>
                      <h4 className="text-2xl font-bold text-[#594246]">{selectedFirstItem?.name}</h4>
                      <p className="text-sm text-[#F2778D] font-bold">Orden N° {selectedOrder.pre_order_number}</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                         <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Taller</p>
                         <p className="text-sm font-bold text-[#594246] truncate">{selectedWorkshopName}</p>
                      </div>
                      <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                         <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Costo Unit. Promedio</p>
                         <p className="text-sm font-bold text-[#594246]">S/ {(selectedTotalAmount / selectedTotalUnits).toFixed(2)}</p>
                      </div>
                      <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                         <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Material</p>
                         <p className="text-sm font-bold text-[#594246]">Algodón / Poliéster</p>
                      </div>
                      <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                         <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Inversión Total</p>
                         <p className="text-sm font-bold text-[#F2778D]">{formatCurrency(selectedTotalAmount)}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h5 className="text-xs font-bold text-[#594246] uppercase tracking-widest border-b border-rose-50 pb-2">Distribución de Producción</h5>
                <div className="overflow-hidden border border-rose-50 rounded-xl bg-rose-50/10">
                   <table className="w-full text-left text-xs">
                      <thead className="bg-rose-50/50 text-[#b79ca5]">
                         <tr>
                            <th className="p-4">Variante</th>
                            <th className="p-4 text-center">Talla</th>
                            <th className="p-4 text-center">Color</th>
                            <th className="p-4 text-right">Cantidad Final</th>
                         </tr>
                      </thead>
                      <tbody className="text-[#594246]">
                         {selectedOrder.base_items?.map((item: any, idx: number) => (
                           <tr key={idx} className="border-t border-rose-50">
                              <td className="p-4 font-medium">Lote A-{idx + 1}</td>
                              <td className="p-4 text-center">{item.id_variant?.size || "M"}</td>
                              <td className="p-4 text-center">{item.id_variant?.color || "N/A"}</td>
                              <td className="p-4 text-right font-bold text-[#F2778D]">{item.quantity} uds.</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             <CTA className="w-full !bg-white border border-rose-100 !text-[#9b8088]" onClick={closeModal}>Cerrar Ficha Técnica</CTA>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CompletedOrderRow({ order, onOpenTech, onOpenObs }: { order: any; onOpenTech: () => void; onOpenObs: () => void; }) {
  const selectedQuote = order.quotes?.find((q: any) => q.quote_status === 'SELECCIONADO');
  const workshopName = selectedQuote?.id_agent?.name_company || selectedQuote?.id_supplier?.name_company || selectedQuote?.id_agent?.name || selectedQuote?.id_supplier?.name || "Taller finalizado";
  const totalAmount = selectedQuote?.total_amount || 0;
  const totalUnits = order.base_items?.reduce((acc: any, i: any) => acc + i.quantity, 0);

  return (
    <tr className="hover:bg-rose-50/20 transition-colors group">
      <td className="px-6 py-5 font-bold text-[#594246]">{order.pre_order_number}</td>
      <td className="px-6 py-5">
          <p className="font-semibold text-[#594246]">{workshopName}</p>
          <p className="text-[11px] text-[#9b8088]">Producción</p>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2 text-[#594246]">
          <Calendar className="h-3.5 w-3.5 text-[#F2778D]" />
          {formatDate(order.updated_at)}
        </div>
      </td>
      <td className="px-6 py-5 text-center">
        <span className="rounded-full bg-rose-50 px-3 py-1 text-[12px] font-bold text-[#F2778D]">
          {totalUnits} uds.
        </span>
      </td>
      <td className="px-6 py-5 font-bold text-[#594246]">{formatCurrency(totalAmount)}</td>
      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2">
          {/* Ojo = Ficha Técnica */}
          <button onClick={onOpenTech} title="Ver Ficha Técnica" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 text-[#9b8088] hover:bg-[#594246] hover:text-white transition-all">
            <Eye className="h-4 w-4" />
          </button>
          
          {/* Documento = Línea de Tiempo / Bitácora */}
          <button onClick={onOpenObs} title="Línea de Tiempo" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 text-[#F2778D] hover:bg-[#F2778D] hover:text-white transition-all shadow-sm">
            <History className="h-4 w-4" />
          </button>

          {/* Comprobante OP = Nueva Factura en Tab (Icono de documento) */}
          <button onClick={() => window.open(`/admin/production/invoice/${order._id}`, '_blank')} title="Ver Comprobante OP" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-[#F2778D] hover:bg-[#F2778D] hover:text-white transition-all shadow-sm">
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
