'use client';

import { ArrowLeft, MapPin, CreditCard, Download, HelpCircle, Shirt, Check, Clock, AlertCircle, XCircle, FileWarning } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { OrderInvoiceModal } from '@/components/features/admin/orders/order-invoice-modal';
import { ordersApi } from '@/api/orders/orders-api';
import { manualPaymentApi } from '@/api/payment/payment-api';
import { getFirebaseAuthToken } from '@helpers';
import { getAuthConfig } from '@utils';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [newOperationNumber, setNewOperationNumber] = useState('');
  const [hasSubmittedCorrection, setHasSubmittedCorrection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      // Fallback de desarrollo / Mocks controlados
      if (orderId === '0041' || orderId === '0042') {
        setOrderData({
          orderNumber: orderId,
          createdAt: new Date().toISOString(),
          clientName: "Cliente de Prueba",
          amount: orderId === '0041' ? 95.00 : 189.90,
          status: orderId === '0041' ? "CONFIRMED" : "PRE_ORDER",
          paymentMethod: "Yape",
          deliveryMethod: "DELIVERY",
          items: [
            { productId: "1", name: "Blusa Lara", size: "M", color: "Blanco", quantity: 1, price: orderId === '0041' ? 95.00 : 139.90 },
            { productId: "2", name: "Vestido Floral", size: "S", color: "Rosado", quantity: 1, price: 50.00 }
          ]
        });
        setLoading(false);
        return;
      }

      try {
        const token = await getFirebaseAuthToken();
        const { data } = await ordersApi.get(`/client/${orderId}`, getAuthConfig({ token }));
        setOrderData(data);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError('No se pudo cargar el pedido. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Derived states basados en la API real
  const isPending = orderData?.status === 'PRE_ORDER';
  const isConfirmed = orderData?.status === 'CONFIRMED';
  const isPreparing = orderData?.status === 'PREPARING';
  const isShipped = orderData?.status === 'SHIPPED';
  const isDelivered = orderData?.status === 'DELIVERED';
  const isObserved = orderData?.status === 'OBSERVED';
  
  let currentStep = 1;
  if (isConfirmed) currentStep = 2;
  else if (isPreparing) currentStep = 3;
  else if (isShipped) currentStep = 4;
  else if (isDelivered) currentStep = 5;

  const isEnCaminoOrDelivered = currentStep >= 3;

  const handleSubsanar = async () => {
    if (!newOperationNumber.trim()) return;
    setIsSubmitting(true);
    try {
      const token = await getFirebaseAuthToken();
      await manualPaymentApi.patch(`/resubmit-by-order/${orderId}`, {
        newOperationNumber
      }, getAuthConfig({ token }));
      
      setHasSubmittedCorrection(true);
    } catch (err) {
      console.error("Error resubmitting operation number:", err);
      setError("No se pudo enviar el nuevo número de operación. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#594246]/50 dark:text-[#b8afc8]/50">Cargando detalles del pedido...</div>;
  }

  if (error || !orderData) {
    return (
      <div className="p-8 text-center text-red-500 max-w-md mx-auto">
        <FileWarning className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">{error || 'Pedido no encontrado'}</p>
        <Link href="/client/orders/active" className="block mt-4 text-[#c4547a] dark:text-[#f0a0c0] font-bold underline text-sm">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  // Formateos dinámicos basados en la data cargada
  const dateStr = new Date(orderData.createdAt).toLocaleDateString('es-PE', { 
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
  
  const dummyOrderData = {
    id: `#${orderData.orderNumber}`,
    date: dateStr,
    client: orderData.clientName || "Cliente",
    amount: orderData.amount,
    // Castamos el status al tipo esperado por tu tipado global (OrderStatus) para complacer a TS
    status: orderData.status as any, 
    deliveryMethod: orderData.deliveryMethod,
    items: orderData.items || []
  };

  // Cálculos dinámicos para el desglose del cobro
  const shippingCost = orderData.deliveryMethod === 'motorized' ? 10.00 : 0.00;
  const subtotal = orderData.amount - shippingCost;

  return (
    <div className="space-y-8 w-full pb-10 max-w-6xl mx-auto px-4">

      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <Link 
          href="/client/orders/active" 
          className="flex items-center gap-2 text-[#594246]/60 dark:text-[rgba(180,170,200,0.6)] hover:text-[#594246] dark:hover:text-[#e8b86d] transition-colors font-medium group text-sm"
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-[#2d0a1e]/60 border border-[#EBEAE8] dark:border-[rgba(180,170,200,0.2)] flex items-center justify-center group-hover:border-[#F2D0D3] dark:group-hover:border-[#e8b86d]/50 group-hover:bg-[#FAF9F6] dark:group-hover:bg-[#e8b86d]/10 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Volver a mis pedidos
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent py-2 relative">
        <div className="relative z-10 w-full flex flex-col pl-2">
          <h1 className="text-3xl font-semibold font-serif text-[#1a0c12] dark:text-[#fdeef5] tracking-tight">
            Detalle del Pedido <span className="text-[#b8860b] dark:text-[#e8b86d] font-sans font-medium tracking-normal">#{orderData.orderNumber}</span>
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <p className="text-[#9b6070] dark:text-[#b8afc8] text-xs font-sans">Realizado el {dateStr}</p>
            
            <div className="flex items-center">
              {isPending || hasSubmittedCorrection ? (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(184,134,11,0.06)] border border-dashed border-[#b8860b]/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b8860b] animate-pulse relative before:content-[''] before:absolute before:inset-[-2px] before:rounded-full before:bg-[#b8860b] before:opacity-30 before:animate-ping"></div>
                  <span className="text-[#b8860b] text-[11px] font-bold tracking-wider uppercase font-sans">Verificación de Pago</span>
                </div>
              ) : isObserved ? (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/40">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span className="text-orange-600 dark:text-orange-400 text-[11px] font-bold tracking-wider uppercase font-sans">Pago Observado</span>
                </div>
              ) : isPreparing ? (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500 shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-[11px] font-bold tracking-wider uppercase font-sans">Preparando Pedido</span>
                </div>
              ) : isShipped ? (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500 shadow-[0_4px_12px_rgba(99,102,241,0.3)]">
                  <Clock className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  <span className="text-white text-[11px] font-bold tracking-wider uppercase font-sans">Pedido en Camino</span>
                </div>
              ) : isDelivered ? (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-[11px] font-bold tracking-wider uppercase font-sans">Pedido Entregado</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-[11px] font-bold tracking-wider uppercase font-sans">Pago confirmado</span>
                </div>
              )}
            </div>
          </div>
          <div className="dark:hidden w-12 h-0.5 mt-4 rounded-full bg-gradient-to-r from-[#b8860b] via-[#c4547a]/40 to-transparent"></div>
          <div className="hidden dark:block w-16 h-[1px] mt-4 bg-gradient-to-r from-[#e8b86d] to-transparent"></div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Products & Info */}
        <div className="lg:col-span-2 space-y-8">

          {/* Product List Card */}
          <div className="bg-[rgba(255,232,238,0.75)] backdrop-blur-md border border-[rgba(196,84,122,0.18)] shadow-[inset_0_1px_0_rgba(184,134,11,0.1),0_4px_24px_rgba(196,84,122,0.1)] dark:bg-[rgba(30,8,22,0.82)] p-6 sm:p-8 rounded-2xl dark:border-[rgba(180,170,200,0.12)] dark:shadow-[inset_0_1px_0_rgba(232,184,109,0.12),0_4px_24px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <h2 className="mb-4 border-b border-[rgba(196,84,122,0.1)] dark:border-[rgba(180,170,200,0.12)] pb-3 relative z-10">
              <span className="text-[#9a6f00] font-bold dark:text-[rgba(232,184,109,0.6)] text-xs tracking-widest uppercase">Productos comprados</span>
            </h2>

            <div className="flex flex-col relative z-10 space-y-1">
              {orderData.items && orderData.items.map((item: any, i: number) => (
                <div 
                  key={i} 
                  className="group flex flex-row items-center py-3 px-2 border-b border-[rgba(196,84,122,0.1)] dark:border-[rgba(180,170,200,0.12)] border-l-2 border-l-transparent transition-all duration-200 hover:bg-[rgba(255,225,232,0.6)] dark:hover:bg-[rgba(232,184,109,0.03)] hover:border-l-[rgba(196,84,122,0.4)] dark:hover:border-l-[#e8b86d]"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/80 to-[#F2D0D3]/20 dark:from-white/5 dark:to-white/0 border border-[rgba(196,84,122,0.15)] dark:border-[rgba(232,184,109,0.15)] flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Shirt className="w-7 h-7 text-[rgba(196,84,122,0.45)] dark:text-[rgba(232,184,109,0.5)]" strokeWidth={1.5} />
                    )}
                  </div>
                  
                  <div className="flex-1 pl-4">
                    <h3 className="text-[#1a0c12] dark:text-[#fdeef5] font-semibold text-base mb-1">{item.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {item.size && (
                        <span className="inline-block font-medium bg-[rgba(220,140,170,0.15)] dark:bg-[rgba(180,170,200,0.07)] border border-[rgba(196,84,122,0.2)] dark:border-[rgba(180,170,200,0.15)] rounded-full px-2.5 py-0.5 text-[10px] text-[#8b3555] dark:text-[#b8afc8]">
                          Talla: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="inline-block font-medium bg-[rgba(220,140,170,0.15)] dark:bg-[rgba(180,170,200,0.07)] border border-[rgba(196,84,122,0.2)] dark:border-[rgba(180,170,200,0.15)] rounded-full px-2.5 py-0.5 text-[10px] text-[#8b3555] dark:text-[#b8afc8]">
                          Color: {item.color}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <span className="text-[#1a0c12] dark:text-[#fdeef5] font-sans font-bold text-base block">S/ {item.price.toFixed(2)}</span>
                    <p className="text-[#6b3d50] dark:text-[#b8afc8] text-xs font-sans mt-0.5">× {item.quantity}</p>
                  </div>
                </div>
              ))}

              {!orderData.items?.length && (
                <p className="text-[#594246]/50 dark:text-[#fdeef5]/40 text-sm italic py-4 text-center">Los detalles de los productos se están procesando.</p>
              )}
            </div>
          </div>

          {/* Shipping and Payment Info Container */}
          <div className="bg-[rgba(255,232,238,0.75)] backdrop-blur-md border border-[rgba(184,134,11,0.15)] shadow-[inset_0_1px_0_rgba(184,134,11,0.1),0_4px_24px_rgba(196,84,122,0.1)] dark:bg-[rgba(30,8,22,0.82)] dark:border-[rgba(180,170,200,0.12)] rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0">
              
              {/* Shipping Address Section */}
              <div className="flex flex-col md:pr-8">
                <h3 className="text-xs tracking-widest uppercase text-[#9a6f00] dark:text-[rgba(232,184,109,0.6)] font-bold mb-3">
                  Dirección de envío
                </h3>
                <p className="text-[#1a0c12] dark:text-[#fdeef5] font-semibold text-base mb-1.5">{orderData.clientName || 'Cliente'}</p>
                <div className="flex flex-col gap-1 text-sm text-[#9b6070] dark:text-[#b8afc8]">
                  <p>Método: {orderData.deliveryMethod === 'motorized' ? 'Delivery Motorizado' : 'Envío Courier / Provincial'}</p>
                  <p>Lima, Perú</p>

                  {(orderData.trackingNumber || orderData.shippingEvidenceUrl) && (
                    <div className="mt-4 pt-3 border-t border-[rgba(196,84,122,0.15)] dark:border-[rgba(180,170,200,0.12)] flex flex-col gap-2">
                      {orderData.trackingNumber && (
                        <p className="text-sm font-semibold text-[#1a0c12] dark:text-[#fdeef5]">
                          Seguimiento: <span className="font-normal text-[#9b6070] dark:text-[#b8afc8]">{orderData.trackingNumber}</span>
                        </p>
                      )}
                      {orderData.shippingEvidenceUrl && (
                        <a
                          href={orderData.shippingEvidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#c4547a] dark:text-[#f0a0c0] font-bold text-xs hover:underline transition-all mt-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Ver Evidencia de Despacho
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Section & Correction Logic */}
              <div className="flex flex-col md:border-l border-[rgba(196,84,122,0.1)] dark:border-[rgba(180,170,200,0.12)] md:pl-8 justify-center">
                <h3 className="text-xs tracking-widest uppercase text-[#9a6f00] dark:text-[rgba(232,184,109,0.6)] font-bold mb-3">
                  Método de pago
                </h3>
                
                {isObserved && !hasSubmittedCorrection ? (
                  /* Formulario de Subsanación si el Pago está Observado */
                  <div className="flex flex-col gap-2 w-full">
                    <p className="text-[#1a0c12] dark:text-[#fdeef5] font-semibold uppercase text-sm">{orderData.paymentMethod}</p>
                    <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-xl">
                      <p className="text-orange-800 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Motivo de observación:</p>
                      <p className="text-orange-950 dark:text-orange-200 text-xs font-medium">El número de operación no coincide con los registros. Por favor reingrésalo.</p>
                    </div>

                    <div className="mt-1 space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newOperationNumber}
                          onChange={(e) => setNewOperationNumber(e.target.value)}
                          placeholder="Nuevo N° Operación"
                          className="flex-1 bg-white/80 dark:bg-white/5 border border-[#EBEAE8] dark:border-[rgba(180,170,200,0.2)] rounded-xl px-3 py-1.5 text-xs text-[#1a0c12] dark:text-[#fdeef5] focus:outline-none focus:border-[#F2D0D3] dark:focus:border-[#e8b86d]/50"
                        />
                        <button
                          onClick={handleSubsanar}
                          disabled={!newOperationNumber.trim() || isSubmitting}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? '...' : 'Enviar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Flujo Regular de Información */
                  <>
                    <p className="text-[#1a0c12] dark:text-[#fdeef5] font-semibold text-base mb-1 uppercase">{orderData.paymentMethod || "Manual"}</p>
                    {isPending || hasSubmittedCorrection ? (
                      <div>
                        {hasSubmittedCorrection && (
                          <p className="text-xs text-[#9b6070] dark:text-[#b8afc8] font-mono mb-1">Nueva Op: #{newOperationNumber}</p>
                        )}
                        <p className="text-[#b8860b] dark:text-[#e8b86d] text-xs font-medium">Validación manual pendiente.</p>
                      </div>
                    ) : (
                      <p className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">Cobro verificado y cerrado exitosamente.</p>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Cobro Card & Actions */}
        <div className="flex flex-col h-full">
          
          <div className="bg-[rgba(255,232,238,0.75)] backdrop-blur-md border border-[rgba(196,84,122,0.18)] shadow-[0_4px_24px_rgba(196,84,122,0.1)] dark:bg-[rgba(28,7,20,0.88)] p-6 rounded-2xl dark:border-[rgba(180,170,200,0.12)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] relative overflow-hidden flex-1 flex flex-col">
            <h2 className="mb-4 border-b border-[rgba(196,84,122,0.18)] dark:border-[rgba(180,170,200,0.12)] pb-3">
              <span className="text-[#9a6f00] font-bold dark:text-[rgba(232,184,109,0.6)] text-xs tracking-widest uppercase">Resumen</span>
            </h2>
            
            {/* Grid Desglose Financiero */}
            <div className="grid grid-cols-2 grid-rows-2 gap-y-3 gap-x-2">
              <div className="p-3 border-b border-r border-[rgba(184,134,11,0.2)] dark:border-[rgba(180,170,200,0.12)] flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-wider text-[#9b6070] dark:text-[#b8afc8] mb-1">Subtotal</span>
                <span className="text-sm font-sans font-semibold text-[#1a0c12] dark:text-[#fdeef5]">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="p-3 border-b border-[rgba(184,134,11,0.2)] dark:border-[rgba(180,170,200,0.12)] flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-wider text-[#9b6070] dark:text-[#b8afc8] mb-1">Envío</span>
                <span className="text-sm font-sans font-semibold text-[#1a0c12] dark:text-[#fdeef5]">S/ {shippingCost.toFixed(2)}</span>
              </div>
              <div className="p-3 border-r border-[rgba(184,134,11,0.2)] dark:border-[rgba(180,170,200,0.12)] flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-wider text-[#9b6070] dark:text-[#b8afc8] mb-1">Descuento</span>
                <span className="text-sm font-sans font-semibold text-[#c4547a] dark:text-[#f0a0c0]">− S/ 0.00</span>
              </div>
              <div className="p-3 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-wider text-[#9b6070] dark:text-[#b8afc8] mb-1">Artículos</span>
                <span className="text-sm font-sans font-semibold text-[#1a0c12] dark:text-[#fdeef5]">{orderData.items?.length || 0}</span>
              </div>
            </div>

            {/* Separador decorativo de ticket */}
            <div className="relative my-5 mx-[-24px]">
              <div className="absolute top-1/2 left-[-4px] w-2 h-2 rounded-full border border-[rgba(184,134,11,0.25)] dark:border-[rgba(180,170,200,0.12)] bg-[#fff0eb] dark:bg-[#1a0618] transform -translate-y-1/2 z-10"></div>
              <div className="absolute top-1/2 right-[-4px] w-2 h-2 rounded-full border border-[rgba(184,134,11,0.25)] dark:border-[rgba(180,170,200,0.12)] bg-[#fff0eb] dark:bg-[#1a0618] transform -translate-y-1/2 z-10"></div>
              <div className="border-t border-dashed border-[rgba(184,134,11,0.25)] dark:border-[rgba(180,170,200,0.12)] mx-6"></div>
            </div>

            {/* Total Destacado */}
            <div className="mt-auto bg-gradient-to-br from-[rgba(255,220,232,0.5)] to-[rgba(255,235,210,0.4)] dark:bg-none dark:bg-[rgba(240,150,190,0.06)] border border-[rgba(196,84,122,0.12)] dark:border-transparent rounded-xl p-4 flex justify-between items-center mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9b6070] dark:text-[rgba(240,150,190,0.5)] block">Total pagado</span>
                <span className="text-xs text-[#9b6070] dark:text-[#b8afc8] mt-0.5 block uppercase">{orderData.paymentMethod}</span>
              </div>
              <div>
                <span className="text-2xl font-sans font-extrabold text-[#c4547a] dark:text-[#f0a0c0] tracking-tight">S/ {orderData.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Fila Horizontal de Acciones Rápidas */}
            <div className="flex justify-around items-center border-t border-[rgba(184,134,11,0.2)] dark:border-[rgba(240,150,190,0.08)] pt-4">
              
              {/* PDF */}
              <button 
                disabled={!isConfirmed} 
                onClick={() => setIsInvoiceOpen(true)}
                title={!isConfirmed ? "Disponible al confirmar pago" : "Descargar comprobante"} 
                className="group flex flex-col items-center gap-1 bg-transparent border-none outline-none"
              >
                <div className={`w-9 h-9 rounded-full border border-[rgba(196,84,122,0.25)] dark:border-[rgba(232,184,109,0.3)] dark:bg-[rgba(232,184,109,0.04)] text-[rgba(196,84,122,0.6)] dark:text-[rgba(232,184,109,0.8)] flex items-center justify-center transition-all duration-200 ${!isConfirmed ? 'cursor-not-allowed opacity-40' : 'group-hover:border-[#b8860b] group-hover:text-[#b8860b] dark:group-hover:border-[#e8b86d] dark:group-hover:text-[#e8b86d]'}`}>
                  <Download className="w-3.5 h-3.5" strokeWidth={2} />
                </div>
                <span className={`text-[10px] text-center font-sans tracking-wide transition-all duration-200 ${!isConfirmed ? 'text-[#9b6070]/40' : 'text-[rgba(196,84,122,0.6)] dark:text-[rgba(253,238,245,0.65)] group-hover:text-[#b8860b] dark:group-hover:text-[#fdeef5]'}`}>PDF</span>
              </button>

              {/* Ayuda */}
              <button className="group flex flex-col items-center gap-1 bg-transparent border-none outline-none">
                <div className="w-9 h-9 rounded-full border border-[rgba(196,84,122,0.25)] dark:border-[rgba(232,184,109,0.3)] dark:bg-[rgba(232,184,109,0.04)] text-[rgba(196,84,122,0.6)] dark:text-[rgba(232,184,109,0.8)] flex items-center justify-center transition-all duration-200 group-hover:border-[#b8860b] group-hover:text-[#b8860b] dark:group-hover:border-[#e8b86d] dark:group-hover:text-[#e8b86d]">
                  <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
                </div>
                <span className="text-[10px] text-center font-sans tracking-wide text-[rgba(196,84,122,0.6)] dark:text-[rgba(253,238,245,0.65)] transition-all duration-200 group-hover:text-[#b8860b] dark:group-hover:text-[#fdeef5]">Ayuda</span>
              </button>

              {/* Cancelar */}
              <button 
                disabled={isEnCaminoOrDelivered} 
                className="group flex flex-col items-center gap-1 bg-transparent border-none outline-none"
              >
                <div className={`w-9 h-9 rounded-full border border-[rgba(196,84,122,0.25)] dark:border-[rgba(196,84,122,0.25)] text-[rgba(196,84,122,0.6)] dark:text-[rgba(232,184,109,0.8)] flex items-center justify-center transition-all duration-200 ${isEnCaminoOrDelivered ? 'cursor-not-allowed opacity-40' : 'group-hover:border-red-500 group-hover:text-red-500 dark:group-hover:border-red-400 dark:group-hover:text-red-400'}`}>
                  <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                </div>
                <span className={`text-[10px] text-center font-sans tracking-wide transition-all duration-200 ${isEnCaminoOrDelivered ? 'text-[#9b6070]/40' : 'text-[rgba(196,84,122,0.6)] dark:text-[rgba(253,238,245,0.65)] group-hover:text-red-500 dark:group-hover:text-[#fdeef5]'}`}>Cancelar</span>
              </button>
            </div>

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