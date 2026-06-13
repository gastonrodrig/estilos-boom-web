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
          className="flex items-center gap-2 text-[#594246]/60 dark:text-[rgba(180,170,200,0.6)] hover:text-[#594246] dark:hover:text-[rgba(232,184,109,0.8)] transition-colors font-medium group"
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-[#2d0a1e]/60 border border-[#EBEAE8] dark:border-[rgba(180,170,200,0.2)] flex items-center justify-center group-hover:border-[#F2D0D3] dark:group-hover:border-[rgba(232,184,109,0.5)] group-hover:bg-[#FAF9F6] dark:group-hover:bg-[#e8b86d]/10 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Volver a mis pedidos
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent py-4 relative mt-4">
        <div className="relative z-10 w-full flex flex-col pl-6 sm:pl-10">
          <div className="relative flex flex-col">
            <h1 className="text-[2.4rem] font-semibold font-serif text-[#1a0c12] dark:text-[#fdeef5] tracking-tight">
              Detalle del Pedido <span className="text-[#b8860b] dark:text-[#e8b86d] font-['Inter',sans-serif] font-medium tracking-normal">#{orderId}</span>
            </h1>
            
            <div className="flex items-center gap-[14px] mt-[4px]">
              <p className="text-[#9b6070] dark:text-[#b8afc8] text-[0.85rem] font-normal font-['Inter',sans-serif]">Realizado el 15 de mayo, 2026</p>
              
              <div className="flex items-center">
                {isPending ? (
                  <div className="inline-flex items-center gap-2 px-[16px] py-[6px] rounded-[20px] bg-[rgba(184,134,11,0.06)] border-[1.5px] border-dashed border-[rgba(184,134,11,0.6)]">
                    <div className="w-[6px] h-[6px] rounded-full bg-[#b8860b] animate-pulse relative before:content-[''] before:absolute before:inset-[-2px] before:rounded-full before:bg-[#b8860b] before:opacity-30 before:animate-ping"></div>
                    <span className="text-[#b8860b] text-[0.75rem] font-medium tracking-[0.08em] uppercase font-['Inter',sans-serif]">Pago pendiente</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-[14px] py-[6px] rounded-[6px] bg-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
                    <Check className="w-[18px] h-[18px] text-white" />
                    <span className="text-white text-[0.75rem] font-bold tracking-[0.08em] uppercase font-['Inter',sans-serif]">Pago confirmado</span>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden dark:block w-[60px] h-[1px] mt-[16px] mb-[24px] bg-gradient-to-r from-[#e8b86d] to-transparent"></div>
            <div className="dark:hidden w-[50px] h-[2px] mt-[14px] mb-[24px] rounded-[2px] bg-[linear-gradient(90deg,#b8860b,rgba(196,84,122,0.4),transparent)]"></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Products & Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Product List */}
          <div className="bg-[rgba(255,232,238,0.75)] backdrop-blur-[8px] border border-[rgba(196,84,122,0.18)] shadow-[inset_0_1px_0_rgba(184,134,11,0.1),0_4px_24px_rgba(196,84,122,0.1),0_1px_4px_rgba(196,84,122,0.06)] transition-all duration-300 dark:bg-[rgba(30,8,22,0.82)] p-8 rounded-[14px] dark:border-[rgba(180,170,200,0.12)] dark:shadow-[inset_0_1px_0_rgba(232,184,109,0.12),inset_0_0_30px_rgba(196,84,122,0.04),0_4px_24px_rgba(0,0,0,0.3)] relative overflow-hidden">
            
            <h2 className="mb-[16px] border-b border-[rgba(196,84,122,0.1)] dark:border-[rgba(180,170,200,0.12)] pb-[14px] relative z-10">
              <span className="text-[#9a6f00] font-semibold dark:text-[rgba(232,184,109,0.6)] text-[0.85rem] tracking-[0.15em] uppercase">Productos comprados</span>
            </h2>
            
            <div className="flex flex-col relative z-10">
              {/* Product Item 1 */}
              <div className="group flex flex-row items-center py-[12px] px-[12px] border-b border-[rgba(196,84,122,0.1)] dark:border-[rgba(180,170,200,0.12)] border-l-[2px] border-l-transparent transition-all duration-[0.25s] ease-out hover:bg-[rgba(255,225,232,0.8)] hover:translate-x-[2px] dark:hover:bg-[rgba(232,184,109,0.04)] hover:border-l-[rgba(196,84,122,0.4)] dark:hover:border-l-[#e8b86d]">
                <div className="w-[64px] h-[64px] rounded-[10px] bg-[linear-gradient(135deg,rgba(250,220,230,0.6),rgba(245,225,210,0.5))] dark:bg-[linear-gradient(135deg,rgba(232,184,109,0.08)_0%,rgba(196,84,122,0.1)_100%)] border border-[rgba(196,84,122,0.15)] dark:border-[rgba(232,184,109,0.15)] flex items-center justify-center shrink-0">
                  <Shirt className="w-8 h-8 text-[rgba(196,84,122,0.45)] dark:text-[rgba(232,184,109,0.5)]" strokeWidth={1} />
                </div>
                <div className="flex-1 pl-[16px]">
                  <h3 className="text-[#1a0c12] dark:text-[#fdeef5] font-semibold text-[1rem] mb-[4px]">Blusa Lara</h3>
                  <div>
                    <span className="inline-block font-medium bg-[rgba(220,140,170,0.18)] dark:bg-[rgba(180,170,200,0.07)] border border-[rgba(196,84,122,0.25)] dark:border-[rgba(180,170,200,0.18)] rounded-[20px] px-[10px] py-[2px] text-[0.72rem] text-[#8b3555] dark:text-[#b8afc8] mr-[6px]">
                      Talla: M
                    </span>
                    <span className="inline-block font-medium bg-[rgba(220,140,170,0.18)] dark:bg-[rgba(180,170,200,0.07)] border border-[rgba(196,84,122,0.25)] dark:border-[rgba(180,170,200,0.18)] rounded-[20px] px-[10px] py-[2px] text-[0.72rem] text-[#8b3555] dark:text-[#b8afc8] mr-[6px]">
                      Color: Blanco
                    </span>
                  </div>
                </div>
                <div className="text-right min-w-[90px]">
                  <span className="text-[#1a0c12] dark:text-[#fdeef5] font-['Inter',sans-serif] not-italic font-bold text-[1.05rem] block" style={{ fontVariantNumeric: 'normal' }}>S/ 89.90</span>
                  <p className="text-[#6b3d50] dark:text-[#b8afc8] text-[0.8rem] font-['Inter',sans-serif] mt-[4px]">× 1</p>
                </div>
              </div>

              {/* Product Item 2 */}
              <div className="group flex flex-row items-center py-[12px] px-[12px] border-b border-[rgba(196,84,122,0.1)] dark:border-[rgba(180,170,200,0.12)] border-l-[2px] border-l-transparent transition-all duration-[0.25s] ease-out hover:bg-[rgba(255,225,232,0.8)] hover:translate-x-[2px] dark:hover:bg-[rgba(232,184,109,0.04)] hover:border-l-[rgba(196,84,122,0.4)] dark:hover:border-l-[#e8b86d]">
                <div className="w-[64px] h-[64px] rounded-[10px] bg-[linear-gradient(135deg,rgba(250,220,230,0.6),rgba(245,225,210,0.5))] dark:bg-[linear-gradient(135deg,rgba(232,184,109,0.08)_0%,rgba(196,84,122,0.1)_100%)] border border-[rgba(196,84,122,0.15)] dark:border-[rgba(232,184,109,0.15)] flex items-center justify-center shrink-0">
                  <Shirt className="w-8 h-8 text-[rgba(196,84,122,0.45)] dark:text-[rgba(232,184,109,0.5)]" strokeWidth={1} />
                </div>
                <div className="flex-1 pl-[16px]">
                  <h3 className="text-[#1a0c12] dark:text-[#fdeef5] font-semibold text-[1rem] mb-[4px]">Vestido Floral</h3>
                  <div>
                    <span className="inline-block font-medium bg-[rgba(220,140,170,0.18)] dark:bg-[rgba(180,170,200,0.07)] border border-[rgba(196,84,122,0.25)] dark:border-[rgba(180,170,200,0.18)] rounded-[20px] px-[10px] py-[2px] text-[0.72rem] text-[#8b3555] dark:text-[#b8afc8] mr-[6px]">
                      Talla: S
                    </span>
                    <span className="inline-block font-medium bg-[rgba(220,140,170,0.18)] dark:bg-[rgba(180,170,200,0.07)] border border-[rgba(196,84,122,0.25)] dark:border-[rgba(180,170,200,0.18)] rounded-[20px] px-[10px] py-[2px] text-[0.72rem] text-[#8b3555] dark:text-[#b8afc8] mr-[6px]">
                      Color: Rosado
                    </span>
                  </div>
                </div>
                <div className="text-right min-w-[90px]">
                  <span className="text-[#1a0c12] dark:text-[#fdeef5] font-['Inter',sans-serif] not-italic font-bold text-[1.05rem] block" style={{ fontVariantNumeric: 'normal' }}>S/ 50.00</span>
                  <p className="text-[#6b3d50] dark:text-[#b8afc8] text-[0.8rem] font-['Inter',sans-serif] mt-[4px]">× 2</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping and Payment Info */}
          <div className="bg-[rgba(255,232,238,0.75)] backdrop-blur-[8px] border border-[rgba(184,134,11,0.15)] shadow-[inset_0_1px_0_rgba(184,134,11,0.1),0_4px_24px_rgba(196,84,122,0.1),0_1px_4px_rgba(196,84,122,0.06)] transition-all duration-300 dark:bg-[rgba(30,8,22,0.82)] dark:border-[rgba(180,170,200,0.12)] rounded-[14px] p-8 dark:shadow-[inset_0_1px_0_rgba(232,184,109,0.12),inset_0_0_30px_rgba(196,84,122,0.04),0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              
              {/* Shipping Address */}
              <div className="flex flex-col md:pr-8">
                <h3 className="text-[0.85rem] tracking-[0.15em] uppercase text-[#9a6f00] dark:text-[rgba(232,184,109,0.6)] font-semibold mb-[10px]">
                  Dirección de envío
                </h3>
                <p className="text-[#1a0c12] dark:text-[#fdeef5] font-semibold text-[1rem] mb-[6px]">Ana de Armas</p>
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[0.81rem] text-[#9b6070] dark:text-[#b8afc8]">Av. Los Rosales 123, Dpto 402</p>
                  <p className="text-[0.81rem] text-[#9b6070] dark:text-[#b8afc8]">Miraflores, Lima, Perú</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex flex-col md:border-l border-[rgba(196,84,122,0.1)] dark:border-[rgba(180,170,200,0.12)] md:pl-8">
                <h3 className="text-[0.85rem] tracking-[0.15em] uppercase text-[#9a6f00] dark:text-[rgba(232,184,109,0.6)] font-semibold mb-[10px]">
                  Método de pago
                </h3>
                {isPending ? (
                  <>
                    <p className="text-[#1a0c12] dark:text-[#fdeef5] font-semibold text-[1rem] mb-[6px]">Yape / Plin</p>
                    <p className="text-[#9b6070] dark:text-[#b8afc8] text-[0.82rem] leading-[1.65] flex items-center">
                      <span className="text-[0.65rem] text-[#b8860b] dark:text-[rgba(240,150,190,0.4)] tracking-[0.1em] mr-1">OP.</span>
                      <span className="text-[#b8860b] dark:text-[#e8b86d] font-['Inter',sans-serif] not-italic font-medium text-[0.9rem] tracking-wider" style={{ fontVariantNumeric: 'normal' }}>#4981249</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[#1a0c12] dark:text-[#fdeef5] font-semibold text-[1rem] mb-[6px]">Tarjeta de Crédito</p>
                    <p className="text-[#9b6070] dark:text-[#b8afc8] text-[0.82rem] leading-[1.65]">Visa terminada en **** 4567</p>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Summary & Actions */}
        <div className="flex flex-col h-full">
          
          {/* Order Summary - Tarjeta de Cobro Elegante */}
          <div className="bg-[rgba(255,232,238,0.75)] backdrop-blur-[8px] border border-[rgba(196,84,122,0.18)] shadow-[inset_0_1px_0_rgba(184,134,11,0.1),0_4px_24px_rgba(196,84,122,0.1),0_1px_4px_rgba(196,84,122,0.06)] transition-all duration-300 dark:bg-[rgba(28,7,20,0.88)] p-6 rounded-[14px] dark:border-[rgba(180,170,200,0.12)] dark:shadow-[inset_0_1px_0_rgba(232,184,109,0.12),inset_0_0_30px_rgba(196,84,122,0.04),0_4px_24px_rgba(0,0,0,0.3)] relative overflow-hidden group/summary flex-1 flex flex-col">
            <div className="dark:hidden absolute top-0 left-0 right-0 h-[1px] bg-[linear-gradient(90deg,transparent,rgba(184,134,11,0.3),transparent)] animate-[shimmer_4s_ease-in-out_infinite]" />
            <h2 className="mb-[16px] border-b border-[rgba(196,84,122,0.18)] dark:border-[rgba(180,170,200,0.12)] pb-[14px]">
              <span className="text-[#9a6f00] font-semibold dark:text-[rgba(232,184,109,0.6)] text-[0.85rem] tracking-[0.15em] uppercase">Resumen</span>
            </h2>
            
            {/* Zona superior: Grid 2x2 */}
            <div className="grid grid-cols-2 grid-rows-2">
              <div className="p-[14px] border-b border-r border-[rgba(184,134,11,0.25)] dark:border-[rgba(180,170,200,0.12)] flex flex-col justify-center">
                <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[#9b6070] dark:text-[#b8afc8] mb-[6px]">Subtotal</span>
                <span className="text-[1rem] font-['Inter',sans-serif] not-italic font-semibold text-[#1a0c12] dark:text-[#fdeef5] tracking-wide" style={{ fontVariantNumeric: 'normal' }}>S/ 189.90</span>
              </div>
              <div className="p-[14px] border-b border-[rgba(184,134,11,0.25)] dark:border-[rgba(180,170,200,0.12)] flex flex-col justify-center">
                <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[#9b6070] dark:text-[#b8afc8] mb-[6px]">Envío</span>
                <span className="text-[1rem] font-['Inter',sans-serif] not-italic font-semibold text-[#1a0c12] dark:text-[#fdeef5] tracking-wide" style={{ fontVariantNumeric: 'normal' }}>S/ 10.00</span>
              </div>
              <div className="p-[14px] border-r border-[rgba(184,134,11,0.25)] dark:border-[rgba(180,170,200,0.12)] flex flex-col justify-center">
                <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[#9b6070] dark:text-[#b8afc8] mb-[6px]">Descuento</span>
                <span className="text-[1rem] font-['Inter',sans-serif] not-italic font-semibold text-[#c4547a] dark:text-[#f0a0c0] tracking-wide" style={{ fontVariantNumeric: 'normal' }}>− S/ 10.00</span>
              </div>
              <div className="p-[14px] flex flex-col justify-center">
                <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[#9b6070] dark:text-[#b8afc8] mb-[6px]">Artículos</span>
                <span className="text-[1rem] font-['Inter',sans-serif] not-italic font-semibold text-[#1a0c12] dark:text-[#fdeef5] tracking-wide" style={{ fontVariantNumeric: 'normal' }}>3</span>
              </div>
            </div>

            {/* Separador decorativo (Línea punteada con círculos) */}
            <div className="relative my-[20px] mx-[-24px]">
              <div className="absolute top-1/2 left-[-4px] w-[8px] h-[8px] rounded-full border border-[rgba(184,134,11,0.25)] dark:border-[rgba(180,170,200,0.12)] bg-[#fff0eb] dark:bg-[#1a0618] transform -translate-y-1/2 z-10"></div>
              <div className="absolute top-1/2 right-[-4px] w-[8px] h-[8px] rounded-full border border-[rgba(184,134,11,0.25)] dark:border-[rgba(180,170,200,0.12)] bg-[#fff0eb] dark:bg-[#1a0618] transform -translate-y-1/2 z-10"></div>
              <div className="border-t border-dashed border-[rgba(184,134,11,0.25)] dark:border-[rgba(180,170,200,0.12)] mx-[24px]"></div>
            </div>

            {/* Zona inferior: Total destacado */}
            <div className="mt-auto bg-[linear-gradient(135deg,rgba(255,220,232,0.6),rgba(255,235,210,0.5))] dark:bg-none dark:bg-[rgba(240,150,190,0.06)] border border-[rgba(196,84,122,0.15)] dark:border-transparent rounded-[12px] p-[16px] flex justify-between items-center mb-[24px]">
              <div>
                <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[#9b6070] dark:text-[rgba(240,150,190,0.5)] block">Total a pagar</span>
                <span className="text-[0.78rem] text-[#9b6070] dark:text-[#b8afc8] mt-[4px] block">{isPending ? "Yape / Plin" : "Tarjeta de Crédito"}</span>
              </div>
              <div>
                <span className="text-[1.75rem] font-['Inter',sans-serif] not-italic font-extrabold text-[#c4547a] dark:text-[#f0a0c0] tracking-tight" style={{ fontVariantNumeric: 'normal' }}>S/ 189.90</span>
              </div>
            </div>

            {/* Zona acciones: Fila horizontal de 3 */}
            <div className="flex justify-around items-center border-t border-[rgba(184,134,11,0.25)] dark:border-[rgba(240,150,190,0.08)] pt-[16px]">
              {/* PDF */}
              <button disabled={isPending} className="group flex flex-col items-center gap-[6px]">
                <div className={`w-[36px] h-[36px] rounded-full border border-[rgba(196,84,122,0.25)] dark:border-[rgba(232,184,109,0.3)] dark:bg-[rgba(232,184,109,0.04)] text-[rgba(196,84,122,0.6)] dark:text-[rgba(232,184,109,0.8)] flex items-center justify-center transition-all duration-200 ${isPending ? 'cursor-not-allowed opacity-40' : 'group-hover:border-[#b8860b] group-hover:text-[#b8860b] dark:group-hover:border-[#e8b86d] dark:group-hover:bg-[rgba(232,184,109,0.12)] dark:group-hover:text-[#e8b86d]'}`}>
                  <Download className="w-[15px] h-[15px]" strokeWidth={2} />
                </div>
                <span className={`text-[0.68rem] text-center font-['Inter',sans-serif] tracking-wide transition-all duration-200 ${isPending ? 'text-[#9b6070]/50 dark:text-[rgba(253,238,245,0.3)]' : 'text-[rgba(196,84,122,0.6)] dark:text-[rgba(253,238,245,0.65)] group-hover:text-[#b8860b] dark:group-hover:text-[#fdeef5]'}`}>PDF</span>
              </button>

              {/* Ayuda */}
              <button className="group flex flex-col items-center gap-[6px]">
                <div className="w-[36px] h-[36px] rounded-full border border-[rgba(196,84,122,0.25)] dark:border-[rgba(232,184,109,0.3)] dark:bg-[rgba(232,184,109,0.04)] text-[rgba(196,84,122,0.6)] dark:text-[rgba(232,184,109,0.8)] flex items-center justify-center transition-all duration-200 group-hover:border-[#b8860b] group-hover:text-[#b8860b] dark:group-hover:border-[#e8b86d] dark:group-hover:bg-[rgba(232,184,109,0.12)] dark:group-hover:text-[#e8b86d]">
                  <HelpCircle className="w-[15px] h-[15px]" strokeWidth={2} />
                </div>
                <span className="text-[0.68rem] text-center font-['Inter',sans-serif] tracking-wide text-[rgba(196,84,122,0.6)] dark:text-[rgba(253,238,245,0.65)] transition-all duration-200 group-hover:text-[#b8860b] dark:group-hover:text-[#fdeef5]">Ayuda</span>
              </button>

              {/* Cancelar */}
              <button disabled={isEnCaminoOrDelivered} className="group flex flex-col items-center gap-[6px]">
                <div className={`w-[36px] h-[36px] rounded-full border border-[rgba(196,84,122,0.25)] dark:border-[rgba(232,184,109,0.3)] dark:bg-[rgba(232,184,109,0.04)] text-[rgba(196,84,122,0.6)] dark:text-[rgba(232,184,109,0.8)] flex items-center justify-center transition-all duration-200 ${isEnCaminoOrDelivered ? 'cursor-not-allowed opacity-40' : 'group-hover:border-[#b8860b] group-hover:text-[#b8860b] dark:group-hover:border-[#e8b86d] dark:group-hover:bg-[rgba(232,184,109,0.12)] dark:group-hover:text-[#e8b86d]'}`}>
                  <XCircle className="w-[15px] h-[15px]" strokeWidth={2} />
                </div>
                <span className={`text-[0.68rem] text-center font-['Inter',sans-serif] tracking-wide transition-all duration-200 ${isEnCaminoOrDelivered ? 'text-[#9b6070]/50 dark:text-[rgba(253,238,245,0.3)]' : 'text-[rgba(196,84,122,0.6)] dark:text-[rgba(253,238,245,0.65)] group-hover:text-[#b8860b] dark:group-hover:text-[#fdeef5]'}`}>Cancelar</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
