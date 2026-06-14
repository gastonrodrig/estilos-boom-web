'use client';

import { ArrowLeft, MapPin, CreditCard, Download, HelpCircle, Package, Shirt, Truck, Check, Clock, AlertCircle, XCircle, FileWarning } from 'lucide-react';
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
  const orderId = params.id as string; // Usually '0042' etc

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [newOperationNumber, setNewOperationNumber] = useState('');
  const [hasSubmittedCorrection, setHasSubmittedCorrection] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      // FALLBACK PARA MOCKS: Si es 0041 o 0042, mostrar data mockeada directamente sin llamar a la API
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
            { productId: "1", name: "Producto de Prueba", size: "M", color: "Azul", quantity: 1, price: orderId === '0041' ? 95.00 : 189.90, image: "https://placehold.co/100x100?text=Mock" }
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

  // Derived state from real order data
  const isPending = orderData?.status === 'PRE_ORDER';
  const isConfirmed = orderData?.status === 'CONFIRMED';
  const isObserved = orderData?.status === 'OBSERVED';
  const currentStep = isConfirmed ? 2 : 1; 
  const isEnCaminoOrDelivered = currentStep >= 4;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubsanar = async () => {
    if (!newOperationNumber.trim()) return;
    setIsSubmitting(true);
    try {
      const token = await getFirebaseAuthToken();
      await manualPaymentApi.patch(`/resubmit-by-order/${orderId}`, {
        newOperationNumber
      }, getAuthConfig({ token }));
      
      setHasSubmittedCorrection(true);
      // Opcional: Recargar la data de la orden para que vuelva a mostrar "En validación"
      // window.location.reload(); 
    } catch (err) {
      console.error("Error resubmitting operation number:", err);
      setError("No se pudo enviar el nuevo número de operación. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#594246]/50">Cargando detalles del pedido...</div>;
  }

  if (error || !orderData) {
    return (
      <div className="p-8 text-center text-red-500">
        <FileWarning className="w-12 h-12 mx-auto mb-4 opacity-50" />
        {error || 'Pedido no encontrado'}
        <Link href="/client/orders/active" className="block mt-4 text-[#F2778D] font-bold underline">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const dateStr = new Date(orderData.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  const dummyOrderData: any = {
    id: `#${orderData.orderNumber}`,
    date: dateStr,
    client: orderData.clientName || "Cliente",
    amount: orderData.amount,
    status: isPending ? "Verificación de Pago" : isObserved ? "Observado" : "Finalizado",
    deliveryMethod: orderData.deliveryMethod,
    items: orderData.items || []
  };

  return (
    <div className="space-y-8 w-full pb-10">

      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/client/orders/active"
          className="flex items-center gap-2 text-[#594246]/60 hover:text-[#594246] transition-colors font-medium group"
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-[#2d0a1e]/60 border border-[#EBEAE8] dark:border-[rgba(180,170,200,0.2)] flex items-center justify-center group-hover:border-[#F2D0D3] dark:group-hover:border-[rgba(232,184,109,0.5)] group-hover:bg-[#FAF9F6] dark:group-hover:bg-[#e8b86d]/10 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Volver a mis pedidos
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(89,66,70,0.04)] border border-[#EBEAE8]">
        <div>
          <h1 className="text-3xl font-serif font-medium text-[#594246] tracking-wide">
            Detalle del Pedido {orderData.orderNumber}
          </h1>
          <p className="text-[#594246]/50 text-sm mt-1 font-medium">Realizado el {dateStr}</p>
        </div>

        {isPending || hasSubmittedCorrection ? (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-200 shadow-sm">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-amber-700 text-sm font-bold tracking-wide uppercase">Verificación de Pago</span>
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

            <div className="space-y-6">
              {orderData.items && orderData.items.map((item: any, i: number) => (
                <div key={i}>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FAF9F6] to-[#F2D0D3]/30 border border-[#EBEAE8] flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shirt className="w-8 h-8 text-[#F2778D]/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#594246] font-bold text-lg">{item.name}</h3>
                      <p className="text-[#594246]/60 text-sm">
                        {item.size ? `Talla: ${item.size}` : ''} {item.color ? `| Color: ${item.color}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#594246] font-bold">S/ {item.price.toFixed(2)}</p>
                      <p className="text-[#594246]/50 text-sm">Cant: {item.quantity}</p>
                    </div>
                  </div>
                  {i < orderData.items.length - 1 && <div className="w-full h-px bg-[#EBEAE8] mt-6"></div>}
                </div>
              ))}
              
              {!orderData.items?.length && (
                 <p className="text-[#594246]/50 text-sm italic">Los productos de este pedido se encuentran en preparación.</p>
              )}
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
              <p className="text-[#594246] font-bold relative z-10">{orderData.clientName || 'Cliente'}</p>
              <p className="text-[#594246]/80 text-sm mt-1 relative z-10">Método: {orderData.deliveryMethod === 'motorized' ? 'Delivery Motorizado' : 'Envío Courier / Provincial'}</p>
              <p className="text-[#594246]/80 text-sm relative z-10">Lima, Perú</p>
            </div>

            {/* Payment Method */}
            <div className={`bg-[#FAF9F6] p-6 rounded-3xl border border-[#EBEAE8]/50 shadow-sm relative overflow-hidden ${isObserved && !hasSubmittedCorrection ? 'ring-2 ring-orange-200 bg-orange-50/30' : ''}`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F2D0D3]/20 rounded-bl-full -z-0"></div>
              <h3 className="text-sm font-bold text-[#594246]/60 uppercase tracking-wider mb-4 relative z-10 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Método de pago
              </h3>

              {isObserved && !hasSubmittedCorrection ? (
                <div className="relative z-10 flex flex-col gap-3">
                  <p className="text-[#594246] font-bold uppercase">{orderData.paymentMethod}</p>
                  <p className="text-[#594246]/80 text-sm">Operación registrada: <span className="line-through text-gray-400">Desconocida</span></p>

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
                  <p className="text-[#594246] font-bold relative z-10 uppercase">{orderData.paymentMethod}</p>
                  {orderData.paymentMethod?.toLowerCase() === 'mercadopago' ? (
                    <p className="text-amber-600 text-sm mt-2 relative z-10 font-medium">Procesando pago con Mercado Pago...</p>
                  ) : (
                    <>
                      <p className="text-[#594246]/80 text-sm mt-1 relative z-10">Operación: <span className="font-bold">{hasSubmittedCorrection ? newOperationNumber : 'Enviada'}</span></p>
                      <p className="text-amber-600 text-sm mt-2 relative z-10 font-medium">Validación manual pendiente.</p>
                    </>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[#594246] font-bold relative z-10 uppercase">{orderData.paymentMethod}</p>
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
                <span>Subtotal ({orderData.items?.length || 0} artículos)</span>
                <span>S/ {(orderData.amount - (orderData.deliveryMethod === 'motorized' ? 10 : 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#594246]/80 text-sm font-medium">
                <span>Costo de envío</span>
                <span>S/ {orderData.deliveryMethod === 'motorized' ? '10.00' : '0.00'}</span>
              </div>

              <div className="w-full h-px bg-[#EBEAE8] my-2"></div>

              <div className="flex justify-between text-[#594246] text-xl font-bold">
                <span>Total</span>
                <span>S/ {orderData.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Descargar Boleta */}
            <button
              onClick={() => setIsInvoiceOpen(true)}
              disabled={!isConfirmed}
              title={!isConfirmed ? "Disponible cuando se confirme el pago" : "Descargar comprobante PDF"}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all duration-300 
                ${!isConfirmed
                  ? "bg-[#EBEAE8] text-[#594246]/40 cursor-not-allowed"
                  : "bg-[#594246] text-white hover:bg-[#F2778D] shadow-md"}
              `}
            >
              <Download className="w-5 h-5" />
              Descargar Boleta (PDF)
              {!isConfirmed && <span className="text-[10px] absolute mt-12 font-medium">(Requiere confirmación)</span>}
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
