"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { 
  Search, Package, CheckCircle2, 
  Eye, FileText, Download, Calendar,
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
    const fromApi = prePurchaseOrders.filter(o => o.status === "CONVERTIDA");
    return [...fromApi, ...MOCK_COMPLETED_ORDERS];
  }, [prePurchaseOrders]);

  const filteredOrders = completedOrders.filter(order => {
    const firstItem = order.base_items?.[0]?.id_variant?.id_product?.name || "";
    return firstItem.toLowerCase().includes(search.toLowerCase()) || 
           order.pre_order_number.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-6 py-10 bg-[#fdfcfc]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-normal text-[#594246] font-(--font-vidaloka)">Ordenes Completadas</h1>
          <p className="text-base text-[#9b8088]">{completedOrders.length} producciones finalizadas e ingresadas</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-rose-100 rounded-xl text-sm font-bold text-[#594246] hover:bg-rose-50 transition-colors shadow-sm">
          <Download className="w-4 h-4 text-[#F2778D]" /> Exportar Historial
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#b79ca5]" />
          <input
            type="text"
            placeholder="Buscar por producto o N° de orden finalizada..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-16 w-full rounded-2xl border border-rose-100 bg-white pl-14 pr-4 text-base outline-none shadow-sm focus:ring-1 focus:ring-[#F2778D]"
          />
        </div>
        <div className="flex gap-4">
          <select className="h-16 px-6 rounded-2xl border border-rose-100 bg-white text-[#594246] outline-none shadow-sm focus:ring-1 focus:ring-[#F2778D] appearance-none font-medium min-w-[160px]">
            <option value="">Todos los Talleres</option>
            <option value="rosa">Creaciones Rosa</option>
            <option value="sur">Textiles del Sur</option>
            <option value="elite">Moda Elite</option>
          </select>
          <select className="h-16 px-6 rounded-2xl border border-rose-100 bg-white text-[#594246] outline-none shadow-sm focus:ring-1 focus:ring-[#F2778D] appearance-none font-medium min-w-[160px]">
            <option value="">Todos los Periodos</option>
            <option value="mayo">Mayo 2026</option>
            <option value="abril">Abril 2026</option>
            <option value="marzo">Marzo 2026</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map((order: any) => (
          <CompletedOrderCard key={order._id} order={order} />
        ))}

        {filteredOrders.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-white rounded-[30px] border border-dashed border-rose-200">
            <Package className="w-16 h-16 text-rose-100 mx-auto" />
            <p className="text-[#9b8088] font-medium">No se encontraron órdenes completadas con esos criterios.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CompletedOrderCard({ order }: { order: any }) {
  const [activeModal, setActiveModal] = useState<"TECH" | "OBS" | null>(null);
  
  const firstItem = order.base_items?.[0]?.id_variant?.id_product;
  const selectedQuote = order.quotes?.find((q: any) => q.quote_status === 'SELECCIONADO');
  const workshopName = selectedQuote?.id_supplier?.name_company || selectedQuote?.id_supplier?.name || "Taller finalizado";
  const totalAmount = selectedQuote?.total_amount || 0;
  const totalUnits = order.base_items?.reduce((acc: any, i: any) => acc + i.quantity, 0);

  return (
    <>
      <article className="rounded-[30px] border border-rose-100 bg-white p-6 shadow-sm hover:shadow-md transition-all group">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-rose-50 border border-rose-100">
              <Image 
                src={firstItem?.images?.[0] || "/placeholder.png"} 
                alt="Product" 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-[#594246]">{firstItem?.name || "Producto terminado"}</h3>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                  <CheckCircle2 className="w-3 h-3" /> Ingresado
                </span>
              </div>
              <p className="text-sm text-[#9b8088]">
                {order.pre_order_number} · <span className="font-bold text-[#594246]">{workshopName}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0 border-rose-50">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#b79ca5] uppercase tracking-widest">Finalizado el</p>
              <div className="flex items-center gap-2 text-sm font-bold text-[#594246]">
                <Calendar className="w-3.5 h-3.5 text-[#F2778D]" /> {formatDate(order.updated_at)}
              </div>
            </div>

            <div className="space-y-1 text-center">
              <p className="text-[10px] font-bold text-[#b79ca5] uppercase tracking-widest">Cantidad</p>
              <p className="text-sm font-bold text-[#594246]">{totalUnits} unidades</p>
            </div>

            <div className="space-y-1 text-center">
              <p className="text-[10px] font-bold text-[#b79ca5] uppercase tracking-widest">Inversión Total</p>
              <p className="text-sm font-bold text-[#F2778D]">{formatCurrency(totalAmount)}</p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => setActiveModal("OBS")}
                title="Ver Bitácora" 
                className="p-3 rounded-xl border border-rose-50 text-[#9b8088] hover:bg-rose-50 hover:text-[#F2778D] transition-colors"
              >
                <FileText className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveModal("TECH")}
                title="Ver Ficha Técnica" 
                className="p-3 rounded-xl bg-rose-50 text-[#F2778D] hover:bg-[#F2778D] hover:text-white transition-all"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Modales mejorados */}
      <Modal 
        open={activeModal === "OBS"} 
        onClose={() => setActiveModal(null)}
        panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8"
        title="Línea de Tiempo de Producción"
        titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
      >
        <div className="pt-8 pb-4">
          <div className="relative">
            {/* Línea horizontal de fondo */}
            <div className="absolute top-[26px] left-[10%] right-[10%] h-[4px] bg-rose-100/50 rounded-full z-0" />
            
            <div className="grid grid-cols-3 relative z-10">
              {/* Paso 1: Inicio */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-rose-100 flex items-center justify-center text-[#b79ca5] shadow-sm group-hover:border-[#F2778D] group-hover:text-[#F2778D] transition-all duration-300">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="mt-4 space-y-1 px-2">
                  <p className="text-sm font-bold text-[#594246]">Corte e Insumos</p>
                  <p className="text-[10px] font-bold text-[#F2778D] uppercase tracking-tighter">7 días antes</p>
                  <p className="text-[11px] text-[#9b8088] font-medium leading-tight">24 de abril de 2026</p>
                  <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity max-w-[150px]">
                    <p className="text-[10px] text-[#b79ca5] leading-none">Telas habilitadas e insumos entregados.</p>
                  </div>
                </div>
              </div>

              {/* Paso 2: Producción */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-rose-100 flex items-center justify-center text-[#b79ca5] shadow-sm group-hover:border-[#F2778D] group-hover:text-[#F2778D] transition-all duration-300">
                  <Factory className="w-6 h-6" />
                </div>
                <div className="mt-4 space-y-1 px-2">
                  <p className="text-sm font-bold text-[#594246]">Confección</p>
                  <p className="text-[10px] font-bold text-[#F2778D] uppercase tracking-tighter">2 días antes</p>
                  <p className="text-[11px] text-[#9b8088] font-medium leading-tight">29 de abril de 2026</p>
                  <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity max-w-[150px]">
                    <p className="text-[10px] text-[#b79ca5] leading-none">Costura y acabados finalizados en taller.</p>
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
                  <p className="text-[10px] font-bold text-[#F2778D] uppercase tracking-tighter">Entregado</p>
                  <p className="text-[11px] text-[#9b8088] font-medium leading-tight">{formatDate(order.updated_at)}</p>
                  <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity max-w-[150px]">
                    <p className="text-[10px] text-[#b79ca5] leading-none">Ingresado a almacén con éxito.</p>
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
              La orden <span className="font-bold text-[#594246]">{order.pre_order_number}</span> completó satisfactoriamente todas las etapas de validación. 
              Se confirma el ingreso de <span className="font-bold text-[#F2778D]">{order.base_items?.reduce((acc: any, i: any) => acc + i.quantity, 0)} unidades</span> al inventario central bajo la supervisión del taller <span className="font-bold text-[#594246]">{workshopName}</span>.
            </p>
          </div>

          <CTA className="w-full !bg-white border border-rose-100 !text-[#9b8088] mt-8" onClick={() => setActiveModal(null)}>Cerrar Historial</CTA>
        </div>
      </Modal>

      <Modal 
        open={activeModal === "TECH"} 
        onClose={() => setActiveModal(null)}
        panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8"
        title="Ficha Técnica Detallada"
        titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
      >
        <div className="space-y-8 pt-4">
           <div className="flex flex-col sm:flex-row items-start gap-8">
              <div className="relative h-48 w-full sm:w-48 shrink-0 overflow-hidden rounded-2xl border border-rose-100 shadow-inner">
                 <Image src={firstItem?.images?.[0] || "/placeholder.png"} alt="Product" fill className="object-cover" />
              </div>
              <div className="space-y-6 flex-1 w-full">
                 <div>
                    <h4 className="text-2xl font-bold text-[#594246]">{firstItem?.name}</h4>
                    <p className="text-sm text-[#F2778D] font-bold">Orden N° {order.pre_order_number}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                       <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Taller</p>
                       <p className="text-sm font-bold text-[#594246] truncate">{workshopName}</p>
                    </div>
                    <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                       <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Costo Unit. Promedio</p>
                       <p className="text-sm font-bold text-[#594246]">S/ {(totalAmount / totalUnits).toFixed(2)}</p>
                    </div>
                    <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                       <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Material</p>
                       <p className="text-sm font-bold text-[#594246]">Algodón / Poliéster</p>
                    </div>
                    <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                       <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Inversión Total</p>
                       <p className="text-sm font-bold text-[#F2778D]">{formatCurrency(totalAmount)}</p>
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
                       {order.base_items?.map((item: any, idx: number) => (
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

           <CTA className="w-full !bg-white border border-rose-100 !text-[#9b8088]" onClick={() => setActiveModal(null)}>Cerrar Ficha Técnica</CTA>
        </div>
      </Modal>
    </>
  );
}
