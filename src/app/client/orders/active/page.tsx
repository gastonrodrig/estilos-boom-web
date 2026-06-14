'use client';

import { Check, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ordersApi } from '@/api/orders/orders-api';
import { getFirebaseAuthToken } from '@helpers';
import { getAuthConfig } from '@utils';

const steps = [
  "Inicio de pedido",
  "Pago confirmado",
  "Preparando",
  "En camino",
  "Entregado"
];

function OrderTimeline({ currentStep, isObserved }: { currentStep: number; isObserved?: boolean }) {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full py-6 mt-4">
      <div className="relative flex justify-between items-start w-full">
        
        {/* Background Line */}
        <div className="absolute top-5 left-[10%] right-[10%] h-[4px] bg-[#EBEAE8] dark:bg-[#e8688a]/20 rounded-full z-0"></div>
        
        {/* Magical Active Progress Line */}
        <div className="absolute top-5 left-[10%] right-[10%] h-[4px] z-0">
          <motion.div 
            initial={{ width: 0, backgroundPosition: "0% 50%" }}
            animate={{ 
              width: `${progressPercent}%`, 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
            }}
            transition={{ 
              width: { duration: 1.5, ease: "easeInOut", delay: 0.2 },
              backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
            }}
            className={`h-full bg-[length:200%_auto] rounded-full bg-gradient-to-r from-[#F2778D] via-[#F2B6C1] to-[#F2778D] ${
              isObserved ? 'shadow-sm' : 'shadow-[0_0_15px_rgba(242,119,141,0.6)]'
            }`}
          ></motion.div>
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div key={step} className="flex flex-col items-center relative z-10 w-24">
              {/* Circle Container */}
              <div className="h-10 flex items-center justify-center relative">
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    type: "spring", stiffness: 200, damping: 15, delay: index * 0.15 
                  }}
                  className={`flex items-center justify-center text-sm transition-all duration-500 relative z-10
                    ${isCompleted ? "w-10 h-10 rounded-full bg-gradient-to-br from-[#F2D0D3] to-[#F291A3] dark:from-[#e8688a]/60 dark:to-[#f0a0c0]/60 text-white dark:text-[#f8f0f5] shadow-md border-0" : ""}
                    ${isCurrent ? "w-12 h-12 rounded-full bg-gradient-to-br from-[#F2778D] to-[#F291A3] dark:from-[#e8688a] dark:to-[#f0a0c0] text-white dark:text-[#2d0a1e] shadow-lg border-0" : ""}
                    ${isPending ? "w-10 h-10 rounded-full bg-white dark:bg-[#2d0a1e] text-[#594246]/40 dark:text-[#f8f0f5]/40 border-[3px] border-[#EBEAE8] dark:border-[#e8688a]/30" : ""}
                  `}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, delay: 1.5 + (index * 0.1) }}
                    >
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <span className={isCurrent ? "text-xl font-bold" : "font-medium"}>{stepNumber}</span>
                  )}
                </motion.div>
                
                {/* Magical Breathing Aura for current step (Only if NOT observed) */}
                {isCurrent && !isObserved && (
                  <>
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#F2778D] blur-md z-0"
                    ></motion.div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 border-[#F2778D] z-0"
                    ></motion.div>
                  </>
                )}
              </div>

              {/* Label */}
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`mt-4 text-[12px] text-center leading-tight transition-colors duration-300
                  ${isCurrent && isObserved ? "text-red-600 font-bold text-[13px]" : ""}
                  ${isCurrent && !isObserved ? "text-[#594246] font-bold text-[13px]" : ""}
                  ${!isCurrent ? "text-[#594246] dark:text-[#f0a0c0] font-bold text-[13px]" : "text-[#594246]/60 dark:text-[#f8f0f5]/60 font-medium"}
                `}
              >
                {step}
              </motion.p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ActiveOrdersPage() {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getFirebaseAuthToken();
        const { data } = await ordersApi.get('/client/active', getAuthConfig({ token }));
        setActiveOrders(data);
      } catch (error) {
        console.error("Error fetching active orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-medium text-[#594246] dark:text-[#f8f0f5] tracking-wide mb-2">Pedidos activos</h1>
      </div>

      {/* Order Cards */}
      <div className="space-y-8">
        
        {/* Render Real Orders */}
        {loading && <p className="text-center text-[#594246]/50">Cargando tus pedidos...</p>}
        {!loading && activeOrders.map((order) => {
          const isConfirmed = order.status === 'CONFIRMED';
          const isObserved = order.status === 'OBSERVED';
          const isPreparing = order.status === 'PREPARING';
          const isShipped = order.status === 'SHIPPED';
          
          let step = 1;
          let statusText = 'Verificación de Pago';
          let borderClass = 'border-t-amber-300 dark:border-t-amber-500/50';
          let pillBg = 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20';
          let pillColor = 'text-amber-700 dark:text-amber-400';
          let iconColor = 'text-amber-600 dark:text-amber-400';
          let PillIcon = Clock;

          if (isConfirmed) {
            step = 2;
            statusText = 'Pago confirmado';
            borderClass = 'border-t-[#594246]/60 dark:border-t-[#f0a0c0]/50';
            pillBg = 'bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/20';
            pillColor = 'text-slate-700 dark:text-slate-400';
            iconColor = 'text-slate-600 dark:text-slate-400';
            PillIcon = Check;
          } else if (isPreparing) {
            step = 3;
            statusText = 'Preparando pedido';
            borderClass = 'border-t-blue-500 dark:border-t-blue-500/50';
            pillBg = 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20';
            pillColor = 'text-blue-700 dark:text-blue-400';
            iconColor = 'text-blue-600 dark:text-blue-400';
            PillIcon = Clock;
          } else if (isShipped) {
            step = 4;
            statusText = 'Pedido en camino';
            borderClass = 'border-t-indigo-500 dark:border-t-indigo-500/50';
            pillBg = 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20';
            pillColor = 'text-indigo-700 dark:text-indigo-400';
            iconColor = 'text-indigo-600 dark:text-indigo-400';
            PillIcon = Clock;
          } else if (isObserved) {
            step = 1;
            statusText = 'Pago Observado';
            borderClass = 'border-t-red-500 dark:border-t-red-500/50';
            pillBg = 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20';
            pillColor = 'text-red-700 dark:text-red-400';
            iconColor = 'text-red-600 dark:text-red-400';
            PillIcon = AlertCircle;
          }

          const dateStr = new Date(order.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

          return (
            <div key={order._id} className={`bg-white dark:bg-[#2d0a1e]/40 p-8 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.06)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-[#EBEAE8] dark:border-[#e8688a]/20 border-t-4 ${borderClass} flex flex-col gap-6 hover:shadow-[0_12px_40px_-4px_rgba(89,66,70,0.12)] dark:hover:shadow-[0_12px_40px_-4px_rgba(232,104,138,0.2)] transition-shadow duration-300`}>
              {/* Top Section */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-[#594246] dark:text-[#f0a0c0]">Pedido {order.orderNumber}</h2>
                  <p className="text-[#594246]/50 dark:text-[#f0d8e8]/70 text-sm mt-1 font-medium">{dateStr}</p>
                </div>
                {/* Status Pill */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${pillBg} shadow-sm`}>
                  <PillIcon className={`w-4 h-4 ${iconColor}`} />
                  <span className={`${pillColor} text-xs font-bold tracking-wide uppercase`}>{statusText}</span>
                </div>
              </div>

              {/* Alert */}
              {isObserved ? (
                <div className="flex flex-col gap-2 p-5 rounded-2xl bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0" />
                    <p className="text-red-900 dark:text-red-200/90 font-bold">Tu pago ha sido observado.</p>
                  </div>
                  <p className="text-red-800 dark:text-red-200/80 text-sm ml-9">Por favor ingresa al detalle del pedido para revisar el motivo y corregir tu número de operación.</p>
                </div>
              ) : order.status === 'PRE_ORDER' ? (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
                  <AlertCircle className="w-6 h-6 text-amber-500 dark:text-amber-400 shrink-0" />
                  <p className="text-amber-800 dark:text-amber-200/90 text-sm font-medium">Estamos verificando tu pago por {order.paymentMethod}. Te avisaremos cuando se confirme.</p>
                </div>
              ) : isPreparing ? (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                  <Clock className="w-6 h-6 text-blue-500 dark:text-blue-400 shrink-0" />
                  <p className="text-blue-800 dark:text-blue-200/90 text-sm font-medium">¡Pago verificado con éxito! Tu pedido está siendo preparado en nuestro almacén.</p>
                </div>
              ) : isShipped ? (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                  <Clock className="w-6 h-6 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <p className="text-indigo-800 dark:text-indigo-200/90 text-sm font-medium">Tu pedido ha sido despachado y está en camino a tu dirección de entrega.</p>
                </div>
              ) : null}

              {/* Product Details */}
              <div className="bg-[#FAF9F6] dark:bg-white/5 p-5 rounded-2xl border border-[#EBEAE8]/50 dark:border-[#e8688a]/10 mt-2">
                <p className="text-[#594246]/60 dark:text-[#f8f0f5]/50 text-xs font-bold uppercase tracking-wider mb-3">Productos</p>
                <div className="space-y-2">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item: any, i: number) => (
                      <p key={i} className="text-[#594246] dark:text-[#f8f0f5] text-sm font-medium">{item.name} {item.size ? `- Talla ${item.size}` : ''} <span className="text-[#594246]/40 dark:text-[#f8f0f5]/40 ml-2">x {item.quantity}</span></p>
                    ))
                  ) : (
                    <p className="text-[#594246]/50 dark:text-[#f8f0f5]/50 text-sm italic">Cargando productos del carrito...</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-[#EBEAE8] dark:border-[#e8688a]/20">
                  <p className="text-lg font-medium text-[#594246] dark:text-[#f8f0f5] flex justify-between items-center">
                    <span>Total pagado:</span> 
                    <span className="text-[#F2778D] dark:text-[#f0a0c0] font-bold text-xl">S/ {order.amount.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <OrderTimeline currentStep={step} isObserved={isObserved} />

              {/* Action Button */}
              <Link href={`/client/orders/${order._id}`} className="block w-full">
                <button className="w-full py-4 mt-2 rounded-2xl border-2 border-[#EBEAE8] dark:border-[#e8688a]/30 text-[#594246] dark:text-[#f0a0c0] font-bold hover:bg-[#FAF9F6] dark:hover:bg-[#e8688a]/20 hover:border-[#594246]/30 dark:hover:border-[#e8688a]/50 transition-all duration-300">
                  Ver detalle completo del pedido
                </button>
              </Link>
            </div>
          );
        })}

        {/* MOCKS ORIGINALES (No borrarlos a pedido del usuario) */}
        <div className="w-full border-t border-dashed border-gray-300 my-8"></div>
        <p className="text-center text-xs text-gray-400 mb-4">-- Ejemplos Visuales (Mocks) --</p>
        
        {/* Order 1: Pago Pendiente */}
        <div className="bg-white dark:bg-[#2d0a1e]/40 p-8 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.06)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-[#EBEAE8] dark:border-[#e8688a]/20 border-t-4 border-t-amber-300 dark:border-t-amber-500/50 flex flex-col gap-6 hover:shadow-[0_12px_40px_-4px_rgba(89,66,70,0.12)] dark:hover:shadow-[0_12px_40px_-4px_rgba(232,104,138,0.2)] transition-shadow duration-300">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#594246] dark:text-[#f0a0c0]">Pedido #0042</h2>
              <p className="text-[#594246]/50 dark:text-[#f0d8e8]/70 text-sm mt-1 font-medium">15 de mayo, 2026</p>
            </div>
            {/* Elegant Amber Pending Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 shadow-sm">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-700 dark:text-amber-400 text-xs font-bold tracking-wide uppercase">Pago pendiente</span>
            </div>
          </div>

          {/* Elegant Amber Alert */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
            <AlertCircle className="w-6 h-6 text-amber-500 dark:text-amber-400 shrink-0" />
            <p className="text-amber-800 dark:text-amber-200/90 text-sm font-medium">Estamos verificando tu pago por Yape / Plin / transferencia. Te avisaremos cuando se confirme.</p>
          </div>

          {/* Product Details */}
          <div className="bg-[#FAF9F6] dark:bg-white/5 p-5 rounded-2xl border border-[#EBEAE8]/50 dark:border-[#e8688a]/10 mt-2">
            <p className="text-[#594246]/60 dark:text-[#f8f0f5]/50 text-xs font-bold uppercase tracking-wider mb-3">Productos</p>
            <div className="space-y-2">
              <p className="text-[#594246] dark:text-[#f8f0f5] text-sm font-medium">Blusa Lara - Talla M <span className="text-[#594246]/40 dark:text-[#f8f0f5]/40 ml-2">x 1</span></p>
              <p className="text-[#594246] dark:text-[#f8f0f5] text-sm font-medium">Vestido Floral - Talla S <span className="text-[#594246]/40 dark:text-[#f8f0f5]/40 ml-2">x 2</span></p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#EBEAE8] dark:border-[#e8688a]/20">
              <p className="text-lg font-medium text-[#594246] dark:text-[#f8f0f5] flex justify-between items-center">
                <span>Total pagado:</span> 
                <span className="text-[#F2778D] dark:text-[#f0a0c0] font-bold text-xl">S/ 189.90</span>
              </p>
            </div>
          </div>

          {/* Timeline - Step 1 */}
          <OrderTimeline currentStep={1} />

          {/* Action Button */}
          <Link href="/client/orders/0042" className="block w-full">
            <button className="w-full py-4 mt-2 rounded-2xl border-2 border-[#EBEAE8] dark:border-[#e8688a]/30 text-[#594246] dark:text-[#f0a0c0] font-bold hover:bg-[#FAF9F6] dark:hover:bg-[#e8688a]/20 hover:border-[#594246]/30 dark:hover:border-[#e8688a]/50 transition-all duration-300">
              Ver detalle completo del pedido
            </button>
          </Link>
        </div>

        {/* Order 2: Pago Confirmado */}
        <div className="bg-white dark:bg-[#2d0a1e]/40 p-8 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.06)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-[#EBEAE8] dark:border-[#e8688a]/20 border-t-4 border-t-[#594246]/60 dark:border-t-[#f0a0c0]/50 flex flex-col gap-6 hover:shadow-[0_12px_40px_-4px_rgba(89,66,70,0.12)] dark:hover:shadow-[0_12px_40px_-4px_rgba(232,104,138,0.2)] transition-shadow duration-300">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#594246] dark:text-[#f0a0c0]">Pedido #0041</h2>
              <p className="text-[#594246]/50 dark:text-[#f0d8e8]/70 text-sm mt-1 font-medium">12 de mayo, 2026</p>
            </div>
            {/* Elegant Slate Confirmed Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/20 shadow-sm">
              <Check className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-slate-700 dark:text-slate-400 text-xs font-bold tracking-wide uppercase">Pago confirmado</span>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-[#FAF9F6] dark:bg-white/5 p-5 rounded-2xl border border-[#EBEAE8]/50 dark:border-[#e8688a]/10 mt-2">
            <p className="text-[#594246]/60 dark:text-[#f8f0f5]/50 text-xs font-bold uppercase tracking-wider mb-3">Productos</p>
            <div className="space-y-2">
              <p className="text-[#594246] dark:text-[#f8f0f5] text-sm font-medium">Pantalón Wide Leg - Talla M <span className="text-[#594246]/40 dark:text-[#f8f0f5]/40 ml-2">x 1</span></p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#EBEAE8] dark:border-[#e8688a]/20">
              <p className="text-lg font-medium text-[#594246] dark:text-[#f8f0f5] flex justify-between items-center">
                <span>Total pagado:</span> 
                <span className="text-[#F2778D] dark:text-[#f0a0c0] font-bold text-xl">S/ 95.00</span>
              </p>
            </div>
          </div>

          {/* Timeline - Step 3 */}
          <OrderTimeline currentStep={3} />

          {/* Action Button */}
          <Link href="/client/orders/0041" className="block w-full">
            <button className="w-full py-4 mt-2 rounded-2xl border-2 border-[#EBEAE8] dark:border-[#e8688a]/30 text-[#594246] dark:text-[#f0a0c0] font-bold hover:bg-[#FAF9F6] dark:hover:bg-[#e8688a]/20 hover:border-[#594246]/30 dark:hover:border-[#e8688a]/50 transition-all duration-300">
              Ver detalle completo del pedido
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
