'use client';

import { ArrowLeft, MapPin, CreditCard, Download, HelpCircle, Package, Shirt, Truck, Check, Clock, AlertCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { OrderInvoiceModal } from '@/components/features/admin/orders/order-invoice-modal';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string; // Usually '0042' etc

  // Simulated data based on orderId
  const isPending = orderId === '0042';
  const isObserved = orderId === '0043';
  const currentStep = orderId === '0041' ? 3 : 1; // Assuming 0041 is at step 3, 0042 at step 1
  const isEnCaminoOrDelivered = currentStep >= 4;

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [newOperationNumber, setNewOperationNumber] = useState('');
  const [hasSubmittedCorrection, setHasSubmittedCorrection] = useState(false);

  const dummyOrderData: any = {
    id: `#ORD-${orderId}`,
    date: "15 May 2026, 14:30",
    client: "Ana de Armas",
    amount: 189.90,
    status: isPending ? "Pendiente" : isObserved ? "Observado" : "Finalizado",
    deliveryMethod: "motorized"
  };

  const handleSubsanar = () => {
    if (!newOperationNumber.trim()) return;
    setHasSubmittedCorrection(true);
  };

  return (
    <div className="space-y-8 w-full pb-10">
      
      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <Link 
          href="/client/orders/active" 
          className="flex items-center gap-2 text-[#594246]/60 hover:text-[#594246] transition-colors font-medium group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-[#EBEAE8] flex items-center justify-center group-hover:border-[#F2D0D3] group-hover:bg-[#FAF9F6] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Volver a mis pedidos
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(89,66,70,0.04)] border border-[#EBEAE8]">
        <div>
          <h1 className="text-3xl font-serif font-medium text-[#594246] tracking-wide">
            Detalle del Pedido #{orderId}
          </h1>
          <p className="text-[#594246]/50 text-sm mt-1 font-medium">Realizado el 15 de mayo, 2026</p>
        </div>
        
        {isPending || hasSubmittedCorrection ? (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-200 shadow-sm">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-amber-700 text-sm font-bold tracking-wide uppercase">Pago pendiente</span>
          </div>
        ) : isObserved ? (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-50 border border-orange-200 shadow-sm">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-orange-700 text-sm font-bold tracking-wide uppercase">Pago Observado</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-200 shadow-sm">
            <Check className="w-4 h-4 text-slate-600" />
            <span className="text-slate-700 text-sm font-bold tracking-wide uppercase">Pago confirmado</span>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Products & Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Product List */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(89,66,70,0.04)] border border-[#EBEAE8]">
            <h2 className="text-xl font-bold text-[#594246] mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#F2778D]" /> Productos comprados
            </h2>
            
            <div className="space-y-6">
              {/* Product Item 1 */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FAF9F6] to-[#F2D0D3]/30 border border-[#EBEAE8] flex items-center justify-center shrink-0">
                  <Shirt className="w-8 h-8 text-[#F2778D]/40" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#594246] font-bold text-lg">Blusa Lara</h3>
                  <p className="text-[#594246]/60 text-sm">Talla: M | Color: Blanco</p>
                </div>
                <div className="text-right">
                  <p className="text-[#594246] font-bold">S/ 89.90</p>
                  <p className="text-[#594246]/50 text-sm">Cant: 1</p>
                </div>
              </div>

              {/* Separator */}
              <div className="w-full h-px bg-[#EBEAE8]"></div>

              {/* Product Item 2 */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FAF9F6] to-[#F2D0D3]/30 border border-[#EBEAE8] flex items-center justify-center shrink-0">
                  <Shirt className="w-8 h-8 text-[#F2778D]/40" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#594246] font-bold text-lg">Vestido Floral</h3>
                  <p className="text-[#594246]/60 text-sm">Talla: S | Color: Rosado</p>
                </div>
                <div className="text-right">
                  <p className="text-[#594246] font-bold">S/ 50.00</p>
                  <p className="text-[#594246]/50 text-sm">Cant: 2</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping and Payment Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Shipping Address */}
            <div className="bg-[#FAF9F6] p-6 rounded-3xl border border-[#EBEAE8]/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F2D0D3]/20 rounded-bl-full -z-0"></div>
              <h3 className="text-sm font-bold text-[#594246]/60 uppercase tracking-wider mb-4 relative z-10 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Dirección de envío
              </h3>
              <p className="text-[#594246] font-bold relative z-10">Ana de Armas</p>
              <p className="text-[#594246]/80 text-sm mt-1 relative z-10">Av. Los Rosales 123, Dpto 402</p>
              <p className="text-[#594246]/80 text-sm relative z-10">Miraflores, Lima, Perú</p>
              <p className="text-[#594246]/80 text-sm mt-2 relative z-10">Ref: Frente al parque central.</p>
            </div>

            {/* Payment Method */}
            <div className={`bg-[#FAF9F6] p-6 rounded-3xl border border-[#EBEAE8]/50 shadow-sm relative overflow-hidden ${isObserved && !hasSubmittedCorrection ? 'ring-2 ring-orange-200 bg-orange-50/30' : ''}`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F2D0D3]/20 rounded-bl-full -z-0"></div>
              <h3 className="text-sm font-bold text-[#594246]/60 uppercase tracking-wider mb-4 relative z-10 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Método de pago
              </h3>
              
              {isObserved && !hasSubmittedCorrection ? (
                <div className="relative z-10 flex flex-col gap-3">
                  <p className="text-[#594246] font-bold">Yape / Plin</p>
                  <p className="text-[#594246]/80 text-sm">Operación registrada: <span className="line-through text-gray-400">#4981249</span></p>
                  
                  <div className="bg-orange-100/50 border border-orange-200 p-3 rounded-xl mt-1">
                    <p className="text-orange-800 text-xs font-semibold uppercase tracking-wider mb-1">Motivo de observación:</p>
                    <p className="text-orange-900 text-sm font-medium">El número de operación no coincide con nuestros registros. Por favor verifica y vuelve a ingresarlo.</p>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <label className="text-[11px] font-bold text-[#594246]/60 uppercase tracking-widest">Subsanar Operación</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newOperationNumber}
                        onChange={(e) => setNewOperationNumber(e.target.value)}
                        placeholder="Nuevo N° Operación"
                        className="flex-1 bg-white border border-[#EBEAE8] rounded-xl px-3 py-2 text-sm text-[#594246] font-medium focus:outline-none focus:border-[#F2D0D3] focus:ring-1 focus:ring-[#F2D0D3]"
                      />
                      <button 
                        onClick={handleSubsanar}
                        disabled={!newOperationNumber.trim()}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>
              ) : isPending || hasSubmittedCorrection ? (
                <>
                  <p className="text-[#594246] font-bold relative z-10">Yape / Plin</p>
                  <p className="text-[#594246]/80 text-sm mt-1 relative z-10">Operación: <span className="font-bold">{hasSubmittedCorrection ? newOperationNumber : '#4981249'}</span></p>
                  <p className="text-amber-600 text-sm mt-2 relative z-10 font-medium">Validación manual pendiente.</p>
                </>
              ) : (
                <>
                  <p className="text-[#594246] font-bold relative z-10">Tarjeta de Crédito</p>
                  <p className="text-[#594246]/80 text-sm mt-1 relative z-10">Visa terminada en **** 4567</p>
                  <p className="text-slate-600 text-sm mt-2 relative z-10 font-medium">Cobro realizado exitosamente.</p>
                </>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          
          {/* Order Summary */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(89,66,70,0.04)] border border-[#EBEAE8]">
            <h2 className="text-xl font-bold text-[#594246] mb-6">Resumen</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-[#594246]/80 text-sm font-medium">
                <span>Subtotal (3 artículos)</span>
                <span>S/ 189.90</span>
              </div>
              <div className="flex justify-between text-[#594246]/80 text-sm font-medium">
                <span>Costo de envío</span>
                <span>S/ 10.00</span>
              </div>
              <div className="flex justify-between text-[#F2778D] text-sm font-medium">
                <span>Descuento (Verano)</span>
                <span>- S/ 10.00</span>
              </div>
              
              <div className="w-full h-px bg-[#EBEAE8] my-2"></div>
              
              <div className="flex justify-between text-[#594246] text-xl font-bold">
                <span>Total</span>
                <span>S/ 189.90</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Descargar Boleta */}
            <button 
              onClick={() => setIsInvoiceOpen(true)}
              disabled={isPending || (isObserved && !hasSubmittedCorrection)}
              title={(isPending || (isObserved && !hasSubmittedCorrection)) ? "Disponible cuando se confirme el pago" : "Descargar comprobante PDF"}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all duration-300 
                ${(isPending || (isObserved && !hasSubmittedCorrection))
                  ? "bg-[#EBEAE8] text-[#594246]/40 cursor-not-allowed" 
                  : "bg-[#594246] text-white hover:bg-[#F2778D] shadow-md"}
              `}
            >
              <Download className="w-5 h-5" />
              Descargar Boleta (PDF)
              {(isPending || (isObserved && !hasSubmittedCorrection)) && <span className="text-[10px] absolute mt-12 font-medium">(Requiere confirmación)</span>}
            </button>
            
            {/* Necesito Ayuda */}
            <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-[#EBEAE8] text-[#594246] font-bold hover:bg-[#FAF9F6] hover:border-[#F2D0D3] transition-colors duration-300">
              <HelpCircle className="w-5 h-5" />
              Necesito ayuda
            </button>

            {/* Cancelar Pedido */}
            <button 
              disabled={isEnCaminoOrDelivered}
              title={isEnCaminoOrDelivered ? "No se puede cancelar porque ya está en camino" : "Cancelar este pedido"}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all duration-300 border-2
                ${isEnCaminoOrDelivered
                  ? "border-transparent bg-gray-50 text-gray-300 cursor-not-allowed"
                  : "border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"}
              `}
            >
              <XCircle className="w-5 h-5" />
              Cancelar Pedido
            </button>
          </div>

        </div>

      </div>

      <OrderInvoiceModal 
        open={isInvoiceOpen} 
        order={dummyOrderData} 
        onClose={() => setIsInvoiceOpen(false)} 
      />
    </div>
  );
}
