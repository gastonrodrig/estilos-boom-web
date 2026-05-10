"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { 
  Search, ChevronDown, Package, Truck, 
  ClipboardCheck, CheckCircle2, XCircle, 
  Eye,
  Trophy,
  Check,
  Plus,CalendarClock, Star
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
  const { startLoadingPrePurchaseOrders, prePurchaseOrders } = useStorehouseStore();
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

  const activeOrders = useMemo(() => {
    return prePurchaseOrders.filter(o => o.status !== "COMPLETADA");
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
    <section className="mx-auto max-w-7xl space-y-8 px-6 py-10 bg-[#fdfcfc]">
      <header className="space-y-2">
        <h1 className="text-4xl font-normal text-[#594246] font-(--font-vidaloka)">Seguimiento de Órdenes</h1>
        <p className="text-base text-[#9b8088]">{counts.TODAS} procesos en curso</p>
      </header>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#b79ca5]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por N° de orden o código..."
          className="h-16 w-full rounded-2xl border border-rose-100 bg-white pl-14 pr-4 text-base outline-none shadow-sm focus:ring-1 focus:ring-[#F2778D]"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
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
          <div className="py-20 text-center border-2 border-dashed border-rose-100 rounded-3xl">
             <Package className="mx-auto h-12 w-12 text-rose-200 mb-4" />
             <p className="text-[#9b8088]">No se encontraron órdenes en esta categoría.</p>
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
  
  const { startUpdateSupplierQuote, startSelectWinnerAndConvert,approveInventory, extendOCDate } = useStorehouseStore();
  const { startInitalQualityCheck } = useStorehouseStore();
  const purchaseOrderId = typeof opp.id_purchase_order === 'object' 
    ? opp.id_purchase_order?._id 
    : opp.id_purchase_order;

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
    <article className="rounded-[30px] border border-rose-100 bg-white p-5 sm:p-8 shadow-sm transition-all overflow-hidden">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-3xl bg-rose-50 border border-rose-100">
             <Image 
                src={firstItem?.images?.[0]} 
                alt="Product" 
                fill 
                className="object-cover" 
             />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-normal text-[#594246] leading-tight">{firstItem?.name || "Producto sin nombre"}</h3>
              
              <div className="flex flex-wrap gap-1.5">
                <span className={`rounded-md px-3 py-1 text-[13px] font-normal text-white ${
                  opp.status === 'COMPLETADA' ? 'bg-blue-500' :
                  opp.status === 'EN_REVISION' ? 'bg-amber-500' : 
                  opp.status === 'CONVERTIDA' ? 'bg-green-500' : 'bg-[#F291A3]/80'
                }`}>
                  {opp.status === 'COMPLETADA' ? 'Finalizada' :
                  opp.status === 'EN_REVISION' ? 'En Inspección' : 
                  opp.status === 'CONVERTIDA' ? 'Orden Generada' : 'Pendiente'}
                </span>

                {opp.status === 'COMPLETADA' && (
                  <div className="flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">
                    <span className="text-[11px] font-bold text-[#b79ca5] uppercase">Calificación:</span>
                    <StarRating rating={opp.id_purchase_order?.quality_rating || 5} size={3} />
                  </div>
                )}
              </div>
            </div>
            <p className="text-[12px] sm:text-sm text-[#9b8088] font-medium">
              {opp.pre_order_number} · <span className="text-[#594246]">{opp.quotes?.length || 0} Proveedores</span> · {opp.base_items?.length || 0} unidades
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
            <p className="text-[10px] sm:text-xs text-[#b79ca5]">Creado: {formatDate(opp.created_at)}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-[20px] sm:text-[25px] text-[#F2778D] tracking-tighter font-medium">
              {totalAmount > 0 ? formatCurrency(totalAmount) : "S/ 0.00"}
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

      {/* STEPPER DE 3 PASOS ADAPTADO */}
      <div className="mt-10 sm:mt-14 mb-6 px-2 sm:px-16 relative overflow-x-auto sm:overflow-visible no-scrollbar">
        <div className="min-w-[400px] sm:min-w-0 pb-2">
          <div className="absolute top-[22px] sm:top-[26px] left-[15%] right-[15%] h-[6px] sm:h-[8px] bg-[#868686]/20 z-0" />
          
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
              label="En Transito" 
              sub="Productos en camino" 
            />

            <StepItem 
              active={opp.status === "EN_REVISION"} 
              icon={<ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />} 
              label="Verificacion" 
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
            className="mt-8 pt-8 border-t border-rose-50"
          >
            <h4 className="text-lg font-medium text-[#594246] mb-4">Detalle de Variantes</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[#9b8088] font-medium border-b border-rose-50">
                    <th className="py-3 px-2">Talla</th>
                    <th className="py-3 px-2">Color</th>
                    <th className="py-3 px-2 text-center">Cantidad</th>
                    <th className="py-3 px-2 text-center">Costo Unitario</th>
                    <th className="py-3 px-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="text-[#594246]">
					{opp.base_items?.map((item: any, idx: number) => {
						// 1. Buscamos el item correspondiente en la cotización seleccionada
						// Comparamos los IDs de las variantes para encontrar el precio exacto
						const quoteItem = selectedQuote?.items.find(
						(qi: any) => (qi.id_variant?._id || qi.id_variant) === (item.id_variant?._id || item.id_variant)
						);

						// 2. Lógica de precio: Si es OC (CONVERTIDA), usamos el costo de la cotización.
						// Si sigue en OPC, mostramos 0.00.
						const unitPrice = (opp.status === 'CONVERTIDA' || opp.status === 'EN_REVISION') 
						? (quoteItem?.unit_cost || 0) 
						: 0;
						const subtotal = item.quantity * unitPrice;

						return (
						<tr key={idx} className="border-b border-rose-50/50">
							<td className="py-4 px-2">{item.id_variant?.size || item.size}</td>
							<td className="py-4 px-2">{item.id_variant?.color || item.color}</td>
							<td className="py-4 px-2 text-center font-bold">{item.quantity}</td>
							
							{/* Mostramos el costo unitario real solo si ya hay OC */}
							<td className="py-4 px-2 text-center text-[#9b8088]">
							S/ {unitPrice.toFixed(2)}
							</td>
							
							<td className="py-4 px-2 text-right font-bold text-[#F2778D]">
							S/ {subtotal.toFixed(2)}
							</td>
						</tr>
						);
					})}
					
					{/* Fila de Total */}
					<tr className="font-bold text-lg">
						<td className="py-6 px-2 uppercase">Total</td>
						<td />
						<td className="py-6 px-2 text-center">
						{opp.base_items?.reduce((acc: number, it: any) => acc + it.quantity, 0)}
						</td>
						<td />
						<td className="py-6 px-2 text-right text-[#F2778D]">
						{/* Usamos el totalAmount que calculaste arriba del componente */}
						{formatCurrency(totalAmount)}
						</td>
					</tr>
					</tbody>
              </table>
            </div>

            {/* Cuadro de Observaciones */}
            <div className="mt-6 p-4 rounded-2xl bg-[#F2D0D3]/30 border border-[#F2D0D3]/50">
              <p className="text-xs font-bold text-[#b46a7c] uppercase mb-1">Observaciones:</p>
              <p className="text-sm text-[#594246]">{opp.notes || "Sin observaciones adicionales."}</p>
            </div>

            {/* Botones de Acción */}
            <div className="mt-8 flex flex-wrap justify-end gap-4">
			
			{/* FASE 1: PRE-COMPRA (Solicitando y Comparando precios) */}
			{(opp.status === 'SOLICITANDO' || opp.status === 'COMPARANDO') && (
				<>
				<button 
					onClick={() => setIsQuotationModalOpen(true)}
					className="px-8 py-3 rounded-xl border border-[#F2778D] text-[#F2778D] font-bold text-sm flex items-center gap-2 hover:bg-rose-50 transition-colors"
				>
					<Plus className="w-4 h-4" /> Registrar Cotización
				</button>
				
				<button className="px-8 py-3 rounded-xl border border-[#594246] text-[#594246] font-bold text-sm hover:bg-gray-50 transition-colors">
					Rechazar Orden
				</button>

				<button 
					disabled={opp.quotes?.every((q: any) => q.total_amount === 0)}
					onClick={() => setIsWinnerModalOpen(true)}
					className="px-8 py-3 rounded-xl bg-[#F2778D] text-white font-bold text-sm disabled:opacity-50 hover:bg-[#d9667a] transition-shadow shadow-md shadow-rose-100"
				>
					Marcar como En Camino
				</button>
				</>
			)}

			{/* FASE 2: TRÁNSITO (La OC ya se generó y viene en camino) */}
			{opp.status === 'CONVERTIDA' && (
				<button 
					disabled={!purchaseOrderId}
					onClick={() => {
					if (!purchaseOrderId) {
						return console.error("Error: ID de OC no encontrado.");
					}
					// ✅ Pasamos el ID de la OC y el ID de la Pre-Orden (opp._id)
					startInitalQualityCheck(purchaseOrderId, opp._id); 
					}}
					className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
					!purchaseOrderId ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#F2778D] text-white hover:bg-[#d9667a]'
					}`}
				>
					<ClipboardCheck className="w-4 h-4" /> 
					{purchaseOrderId ? 'Mercadería Recibida (Iniciar Control)' : 'OC no vinculada'}
				</button>
			)}

			{/* FASE 3: INSPECCIÓN (Control de calidad y decisiones) */}
			

      {opp.status === 'EN_REVISION' && (
      <>
        <button 
          onClick={() => setIsExtendModalOpen(true)}
          className="px-8 py-3 rounded-xl border border-amber-500 text-amber-600 font-bold text-sm flex items-center gap-2 hover:bg-amber-50"
        >
          <CalendarClock className="w-4 h-4" /> Prolongar Fecha
        </button>

        <button 
          onClick={() => setIsApproveModalOpen(true)}
          className="px-8 py-3 rounded-xl bg-[#4CAF50] text-white font-bold text-sm flex items-center gap-2 hover:bg-[#43a047]"
        >
          <CheckCircle2 className="w-4 h-4" /> Aprobar e Ingresar a Inventario
        </button>
      </>
    )}

			{/* BOTÓN UNIVERSAL: Siempre visible para ver la orden completa */}
			<button 
        onClick={() => setIsDetailsModalOpen(true)}
        className="px-8 py-3 rounded-xl border border-[#F2778D] text-[#F2778D] font-bold text-sm flex items-center gap-2 hover:bg-rose-50 transition-colors"
      >
        <Eye className="w-4 h-4" /> Ver Detalles Completos
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
			// ✅ Ahora pasamos los 3 argumentos: ID de orden, ID de proveedor y la Fecha
			await startSelectWinnerAndConvert(opp._id, supplierId, deliveryDate);
			setIsWinnerModalOpen(false);
		}}
		/>
    <ApproveInventoryModal 
      isOpen={isApproveModalOpen}
      onClose={() => setIsApproveModalOpen(false)}
      onConfirm={handleApprove}
      isLoading={false}
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
      <div className="space-y-6 p-2">
        <label className="block space-y-2">
          <span className="text-sm font-bold text-[#594246]">Seleccionar Proveedor</span>
          <select 
            className="w-full h-12 rounded-xl border border-rose-100 px-4 outline-none"
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
					<option key={supplier._id || supplier} value={supplier._id || supplier}>
					{name}
					</option>
				);
				})}
						</select>
        </label>

        {selectedSupplier && (
          <div className="space-y-4">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#9b8088]"><th>Variante</th><th>Cantidad</th><th>Costo Unitario</th></tr></thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-b border-rose-50/50">
                    <td className="py-3">{it.id_variant?.size} - {it.id_variant?.color}</td>
                    <td className="py-3 font-bold">{it.quantity}</td>
                    <td className="py-3">
                      <input 
                        type="number" 
                        value={it.unit_cost} 
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].unit_cost = Number(e.target.value);
                          setItems(newItems);
                        }}
                        className="w-24 h-9 border border-rose-200 rounded-lg px-2 outline-none focus:border-[#F2778D]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button 
              onClick={() => onSave(selectedSupplier, items)}
              className="w-full py-4 bg-[#F2778D] text-white rounded-xl font-bold shadow-lg shadow-rose-100"
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
        <p className="text-sm text-[#9b8088]">Compara las propuestas recibidas y elige al ganador para pasar la orden a estado <b>En Camino</b>.</p>
        
        <div className="space-y-3">
          {sortedQuotes.map((q, idx) => {
            const agentId = q.id_agent?._id || q.id_agent;
            const agentName = q.id_agent?.name_company || q.id_agent?.name || "Cargando...";

            return (
              <div 
                key={agentId}
                onClick={() => setWinnerId(agentId)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  winnerId === agentId ? "border-[#F2778D] bg-rose-50" : "border-rose-50 bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${idx === 0 ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#594246]">{agentName}</p>
                    <p className="text-xs text-[#9b8088] flex items-center gap-2">
                      Ranking Score: 
                      <span className="text-[#F2778D] font-bold">
                        {(q.ranking_score * 100).toFixed(0)}/100
                      </span>
                      <span className="text-[#ede8e9]">|</span>
                      <StarRating rating={q.id_agent?.rating || 5} size={3} />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#F2778D]">{formatCurrency(q.total_amount)}</p>
                  {winnerId === agentId && <Check className="inline w-5 h-5 text-[#F2778D]" />}
                </div>
              </div>
            );
          })}
        </div>

        {winnerId && (
          <div className="pt-4 border-t border-rose-100 space-y-4">
            {/* NUEVO CAMPO DE FECHA */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#594246]">Fecha Estimada de Entrega</label>
              <input 
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full h-12 rounded-xl border border-rose-100 px-4 outline-none focus:ring-1 focus:ring-[#F2778D]"
              />
            </div>

            <p className="text-xs text-center text-[#9b8088] italic">
              Al confirmar, se creará la OC con fecha de llegada para el {formatDate(deliveryDate)}.
            </p>
            
            <button 
              onClick={() => onConfirm(winnerId, deliveryDate)} // Enviamos ambos datos
              className="w-full py-4 bg-[#F2778D] text-white rounded-xl font-bold"
            >
              Confirmar Ganador y Generar OC
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function StepItem({ active, icon, label, sub }: { active: boolean; icon: any; label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      {/* El círculo tiene bg sólido y border-white para ocultar la línea detrás de él */}
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