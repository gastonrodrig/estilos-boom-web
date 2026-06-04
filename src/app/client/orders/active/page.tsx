'use client';

import { Check, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const steps = [
  "Inicio de pedido",
  "Pago confirmado",
  "Preparando",
  "En camino",
  "Entregado"
];

function OrderTimeline({ currentStep }: { currentStep: number }) {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full py-6 mt-4">
      <div className="relative flex justify-between items-start w-full">
        
        {/* Background Line */}
        <div className="absolute top-5 left-[10%] right-[10%] h-[4px] bg-[#EBEAE8] rounded-full z-0"></div>
        
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
            className="h-full bg-gradient-to-r from-[#F2778D] via-[#F2B6C1] to-[#F2778D] bg-[length:200%_auto] rounded-full shadow-[0_0_15px_rgba(242,119,141,0.6)]"
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
                    ${isCompleted ? "w-10 h-10 rounded-full bg-gradient-to-br from-[#F2D0D3] to-[#F291A3] text-white shadow-md" : ""}
                    ${isCurrent ? "w-12 h-12 rounded-full bg-gradient-to-br from-[#F2778D] to-[#F291A3] text-white shadow-lg" : ""}
                    ${isPending ? "w-10 h-10 rounded-full bg-white text-[#594246]/40 border-[3px] border-[#EBEAE8]" : ""}
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
                
                {/* Magical Breathing Aura for current step */}
                {isCurrent && (
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
                  ${isCurrent ? "text-[#594246] font-bold text-[13px]" : "text-[#594246]/60 font-medium"}
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
  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-medium text-[#594246] tracking-wide mb-2">Pedidos activos</h1>
      </div>

      {/* Order Cards */}
      <div className="space-y-8">
        
        {/* Order 1: Pago Pendiente */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.06)] border border-[#EBEAE8] border-t-4 border-t-amber-300 flex flex-col gap-6 hover:shadow-[0_12px_40px_-4px_rgba(89,66,70,0.12)] transition-shadow duration-300">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#594246]">Pedido #0042</h2>
              <p className="text-[#594246]/50 text-sm mt-1 font-medium">15 de mayo, 2026</p>
            </div>
            {/* Elegant Amber Pending Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 shadow-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-amber-700 text-xs font-bold tracking-wide uppercase">Pago pendiente</span>
            </div>
          </div>

          {/* Elegant Amber Alert */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <p className="text-amber-800 text-sm font-medium">Estamos verificando tu pago por Yape / Plin / transferencia. Te avisaremos cuando se confirme.</p>
          </div>

          {/* Product Details */}
          <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#EBEAE8]/50 mt-2">
            <p className="text-[#594246]/60 text-xs font-bold uppercase tracking-wider mb-3">Productos</p>
            <div className="space-y-2">
              <p className="text-[#594246] text-sm font-medium">Blusa Lara - Talla M <span className="text-[#594246]/40 ml-2">x 1</span></p>
              <p className="text-[#594246] text-sm font-medium">Vestido Floral - Talla S <span className="text-[#594246]/40 ml-2">x 2</span></p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#EBEAE8]">
              <p className="text-lg font-medium text-[#594246] flex justify-between items-center">
                <span>Total pagado:</span> 
                <span className="text-[#F2778D] font-bold text-xl">S/ 189.90</span>
              </p>
            </div>
          </div>

          {/* Timeline - Step 1 */}
          <OrderTimeline currentStep={1} />

          {/* Action Button */}
          <Link href="/client/orders/0042" className="block w-full">
            <button className="w-full py-4 mt-2 rounded-2xl border-2 border-[#EBEAE8] text-[#594246] font-bold hover:bg-[#FAF9F6] hover:border-[#594246]/30 transition-all duration-300">
              Ver detalle completo del pedido
            </button>
          </Link>
        </div>

        {/* Order 2: Pago Confirmado */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.06)] border border-[#EBEAE8] border-t-4 border-t-[#594246]/60 flex flex-col gap-6 hover:shadow-[0_12px_40px_-4px_rgba(89,66,70,0.12)] transition-shadow duration-300">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#594246]">Pedido #0041</h2>
              <p className="text-[#594246]/50 text-sm mt-1 font-medium">12 de mayo, 2026</p>
            </div>
            {/* Elegant Slate Confirmed Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 shadow-sm">
              <Check className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700 text-xs font-bold tracking-wide uppercase">Pago confirmado</span>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#EBEAE8]/50 mt-2">
            <p className="text-[#594246]/60 text-xs font-bold uppercase tracking-wider mb-3">Productos</p>
            <div className="space-y-2">
              <p className="text-[#594246] text-sm font-medium">Pantalón Wide Leg - Talla M <span className="text-[#594246]/40 ml-2">x 1</span></p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#EBEAE8]">
              <p className="text-lg font-medium text-[#594246] flex justify-between items-center">
                <span>Total pagado:</span> 
                <span className="text-[#F2778D] font-bold text-xl">S/ 95.00</span>
              </p>
            </div>
          </div>

          {/* Timeline - Step 3 */}
          <OrderTimeline currentStep={3} />

          {/* Action Button */}
          <Link href="/client/orders/0041" className="block w-full">
            <button className="w-full py-4 mt-2 rounded-2xl border-2 border-[#EBEAE8] text-[#594246] font-bold hover:bg-[#FAF9F6] hover:border-[#594246]/30 transition-all duration-300">
              Ver detalle completo del pedido
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
