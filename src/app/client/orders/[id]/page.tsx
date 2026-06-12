'use client';

import { ArrowLeft, MapPin, CreditCard, Download, HelpCircle, Package, Shirt, Truck, Check, Clock, AlertCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string; // Usually '0042' etc

  // Simulated data based on orderId
  const isPending = orderId === '0042';
  const currentStep = orderId === '0041' ? 3 : 1; // Assuming 0041 is at step 3, 0042 at step 1
  const isEnCaminoOrDelivered = currentStep >= 4;

  return (
    <div className="space-y-8 w-full pb-10">
      
      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <Link 
          href="/client/orders/active" 
          className="flex items-center gap-2 text-[#594246]/60 dark:text-[#f0d8e8]/60 hover:text-[#594246] dark:hover:text-[#f8f0f5] transition-colors font-medium group"
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-[#2d0a1e]/60 border border-[#EBEAE8] dark:border-[#e8688a]/30 flex items-center justify-center group-hover:border-[#F2D0D3] dark:group-hover:border-[#e8688a] group-hover:bg-[#FAF9F6] dark:group-hover:bg-[#e8688a]/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Volver a mis pedidos
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#2d0a1e]/40 p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(89,66,70,0.04)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-[#EBEAE8] dark:border-[#e8688a]/20">
        <div>
          <h1 className="text-3xl font-serif font-medium text-[#594246] dark:text-[#f8f0f5] tracking-wide">
            Detalle del Pedido #{orderId}
          </h1>
          <p className="text-[#594246]/50 dark:text-[#f0d8e8]/70 text-sm mt-1 font-medium">Realizado el 15 de mayo, 2026</p>
        </div>
        
        {isPending ? (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 shadow-sm">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-700 dark:text-amber-400 text-sm font-bold tracking-wide uppercase">Pago pendiente</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/20 shadow-sm">
            <Check className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-slate-700 dark:text-slate-400 text-sm font-bold tracking-wide uppercase">Pago confirmado</span>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Products & Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Product List */}
          <div className="bg-white dark:bg-[#2d0a1e]/40 p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(89,66,70,0.04)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-[#EBEAE8] dark:border-[#e8688a]/20">
            <h2 className="text-xl font-bold text-[#594246] dark:text-[#f8f0f5] mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#F2778D] dark:text-[#f0a0c0]" /> Productos comprados
            </h2>
            
            <div className="space-y-6">
              {/* Product Item 1 */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FAF9F6] to-[#F2D0D3]/30 dark:from-white/5 dark:to-[#e8688a]/10 border border-[#EBEAE8] dark:border-[#e8688a]/20 flex items-center justify-center shrink-0">
                  <Shirt className="w-8 h-8 text-[#F2778D]/40 dark:text-[#f0a0c0]/50" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#594246] dark:text-[#f8f0f5] font-bold text-lg">Blusa Lara</h3>
                  <p className="text-[#594246]/60 dark:text-[#f0d8e8]/60 text-sm">Talla: M | Color: Blanco</p>
                </div>
                <div className="text-right">
                  <p className="text-[#594246] dark:text-[#f8f0f5] font-bold">S/ 89.90</p>
                  <p className="text-[#594246]/50 dark:text-[#f0d8e8]/50 text-sm">Cant: 1</p>
                </div>
              </div>

              {/* Separator */}
              <div className="w-full h-px bg-[#EBEAE8] dark:bg-[#e8688a]/20"></div>

              {/* Product Item 2 */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FAF9F6] to-[#F2D0D3]/30 dark:from-white/5 dark:to-[#e8688a]/10 border border-[#EBEAE8] dark:border-[#e8688a]/20 flex items-center justify-center shrink-0">
                  <Shirt className="w-8 h-8 text-[#F2778D]/40 dark:text-[#f0a0c0]/50" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#594246] dark:text-[#f8f0f5] font-bold text-lg">Vestido Floral</h3>
                  <p className="text-[#594246]/60 dark:text-[#f0d8e8]/60 text-sm">Talla: S | Color: Rosado</p>
                </div>
                <div className="text-right">
                  <p className="text-[#594246] dark:text-[#f8f0f5] font-bold">S/ 50.00</p>
                  <p className="text-[#594246]/50 dark:text-[#f0d8e8]/50 text-sm">Cant: 2</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping and Payment Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Shipping Address */}
            <div className="bg-[#FAF9F6] dark:bg-white/5 p-6 rounded-3xl border border-[#EBEAE8]/50 dark:border-[#e8688a]/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F2D0D3]/20 dark:bg-[#e8688a]/10 rounded-bl-full -z-0"></div>
              <h3 className="text-sm font-bold text-[#594246]/60 dark:text-[#f0d8e8]/60 uppercase tracking-wider mb-4 relative z-10 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Dirección de envío
              </h3>
              <p className="text-[#594246] dark:text-[#f8f0f5] font-bold relative z-10">Ana de Armas</p>
              <p className="text-[#594246]/80 dark:text-[#f0d8e8]/80 text-sm mt-1 relative z-10">Av. Los Rosales 123, Dpto 402</p>
              <p className="text-[#594246]/80 dark:text-[#f0d8e8]/80 text-sm relative z-10">Miraflores, Lima, Perú</p>
              <p className="text-[#594246]/80 dark:text-[#f0d8e8]/80 text-sm mt-2 relative z-10">Ref: Frente al parque central.</p>
            </div>

            {/* Payment Method */}
            <div className="bg-[#FAF9F6] dark:bg-white/5 p-6 rounded-3xl border border-[#EBEAE8]/50 dark:border-[#e8688a]/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F2D0D3]/20 dark:bg-[#e8688a]/10 rounded-bl-full -z-0"></div>
              <h3 className="text-sm font-bold text-[#594246]/60 dark:text-[#f0d8e8]/60 uppercase tracking-wider mb-4 relative z-10 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Método de pago
              </h3>
              {isPending ? (
                <>
                  <p className="text-[#594246] dark:text-[#f8f0f5] font-bold relative z-10">Yape / Plin</p>
                  <p className="text-[#594246]/80 dark:text-[#f0d8e8]/80 text-sm mt-1 relative z-10">Operación: <span className="font-bold">#4981249</span></p>
                  <p className="text-amber-600 dark:text-amber-400 text-sm mt-2 relative z-10 font-medium">Validación manual pendiente.</p>
                </>
              ) : (
                <>
                  <p className="text-[#594246] dark:text-[#f8f0f5] font-bold relative z-10">Tarjeta de Crédito</p>
                  <p className="text-[#594246]/80 dark:text-[#f0d8e8]/80 text-sm mt-1 relative z-10">Visa terminada en **** 4567</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 relative z-10 font-medium">Cobro realizado exitosamente.</p>
                </>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          
          {/* Order Summary */}
          <div className="bg-white dark:bg-[#2d0a1e]/40 p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(89,66,70,0.04)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-[#EBEAE8] dark:border-[#e8688a]/20">
            <h2 className="text-xl font-bold text-[#594246] dark:text-[#f8f0f5] mb-6">Resumen</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-[#594246]/80 dark:text-[#f0d8e8]/80 text-sm font-medium">
                <span>Subtotal (3 artículos)</span>
                <span>S/ 189.90</span>
              </div>
              <div className="flex justify-between text-[#594246]/80 dark:text-[#f0d8e8]/80 text-sm font-medium">
                <span>Costo de envío</span>
                <span>S/ 10.00</span>
              </div>
              <div className="flex justify-between text-[#F2778D] dark:text-[#f0a0c0] text-sm font-medium">
                <span>Descuento (Verano)</span>
                <span>- S/ 10.00</span>
              </div>
              
              <div className="w-full h-px bg-[#EBEAE8] dark:bg-[#e8688a]/20 my-2"></div>
              
              <div className="flex justify-between text-[#594246] dark:text-[#f8f0f5] text-xl font-bold">
                <span>Total</span>
                <span>S/ 189.90</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Descargar Boleta */}
            <button 
              disabled={isPending}
              title={isPending ? "Disponible cuando se confirme el pago" : "Descargar comprobante PDF"}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all duration-300 border-2 border-transparent
                ${isPending 
                  ? "bg-[#EBEAE8] dark:bg-white/5 text-[#594246]/40 dark:text-[#f8f0f5]/40 cursor-not-allowed" 
                  : "bg-[#594246] dark:bg-[#e8688a]/20 text-white dark:text-[#f0a0c0] hover:bg-[#F2778D] dark:hover:bg-[#e8688a] dark:hover:text-[#f8f0f5] dark:border-[#e8688a]/30 shadow-md"}
              `}
            >
              <Download className="w-5 h-5" />
              Descargar Boleta (PDF)
              {isPending && <span className="text-[10px] absolute mt-12 font-medium">(Requiere validación)</span>}
            </button>
            
            {/* Necesito Ayuda */}
            <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-[#EBEAE8] dark:border-[#e8688a]/30 text-[#594246] dark:text-[#f0a0c0] font-bold hover:bg-[#FAF9F6] dark:hover:bg-[#e8688a]/20 hover:border-[#F2D0D3] dark:hover:border-[#e8688a]/50 transition-colors duration-300">
              <HelpCircle className="w-5 h-5" />
              Necesito ayuda
            </button>

            {/* Cancelar Pedido */}
            <button 
              disabled={isEnCaminoOrDelivered}
              title={isEnCaminoOrDelivered ? "No se puede cancelar porque ya está en camino" : "Cancelar este pedido"}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all duration-300 border-2
                ${isEnCaminoOrDelivered
                  ? "border-transparent bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-500 cursor-not-allowed"
                  : "border-red-100 dark:border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/50"}
              `}
            >
              <XCircle className="w-5 h-5" />
              Cancelar Pedido
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
