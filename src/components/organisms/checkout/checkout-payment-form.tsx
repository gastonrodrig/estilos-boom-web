'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore, useCartStore } from '@/hooks';
import { useOrderSubmission } from '@/hooks/extra';
import { CheckoutFormValues } from '@/core/models/checkout';
import { useRouter } from 'next/navigation';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { mercadopagoApi } from '@/api/mercadopago/mercadopago.api';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { X } from 'lucide-react';

const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '';

if (typeof window !== 'undefined') {
  if (MP_PUBLIC_KEY) {
    console.log('🚀 [MP_INIT] Ejecutando initMercadoPago con Public Key:', MP_PUBLIC_KEY);
    initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-PE' });
  } else {
    console.error('❌ [MP_INIT] Error: No se puede inicializar Mercado Pago porque NEXT_PUBLIC_MP_PUBLIC_KEY está vacía o indefinida.');
  }
}

const CheckoutPaymentForm: React.FC = () => {
  const router = useRouter();
  const { handleGoToReview, handleGoToDelivery } = useCheckoutStore();
  const { submitOrder } = useOrderSubmission();
  const { items } = useCartStore();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loadingPreference, setLoadingPreference] = useState(true);
  const fetchedRef = useRef(false);

  const [activeTab, setActiveTab] = useState<'yape' | 'plin'>('yape');
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const {
    register,
    watch,
    control,
    formState: { isSubmitting },
    trigger,
  } = useFormContext<CheckoutFormValues>();

  const billingSameAsShipping = watch('billingSameAsShipping');
  const selectedDeliveryMethod = watch('selectedDeliveryMethod');
  const deliveryCost = selectedDeliveryMethod?.price || 0;
  const paymentMethod = watch('paymentMethod');

  const PAYMENT_METHODS = [
    { 
      id: 'card', 
      label: 'Tarjeta de Crédito / Débito', 
      icon: { src: "/assets/visaymaster.png", alt: 'Visa y Mastercard', width: 60 }
    },
    { 
      id: 'qr', 
      label: 'Yape / Plin / QR', 
      icon: { src: "/assets/yapeyplin.png", alt: 'Pago QR', width: 60 } 
    },
    { 
      id: 'transfer', 
      label: 'Transferencia Bancaria', 
      icon: { src: "/assets/bank.png", alt: 'Transferencia Bancaria', width: 35 } 
    },
  ];

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0) + deliveryCost;

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    console.log('🚀 [CHECKOUT] Componente montado. Public Key disponible:', process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
    const fetchPreference = async () => {
      try {
        setLoadingPreference(true);
        const mpItems = items.map(item => ({
          id: item.productId,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price
        }));

        if (selectedDeliveryMethod && selectedDeliveryMethod.price > 0) {
          mpItems.push({
            id: 'DELIVERY',
            title: `Costo de envío (${selectedDeliveryMethod.name})`,
            quantity: 1,
            unit_price: selectedDeliveryMethod.price
          });
        }

        if (mpItems.length === 0) {
          toast.error('El carrito está vacío. Agrega productos para pagar.');
          setLoadingPreference(false);
          return;
        }

        console.log('📦 [MP_PREFERENCE] Creando preferencia con payload:', mpItems);
        const response = await mercadopagoApi.createPreference({
          items: mpItems,
          orderId: `ORD-${Date.now()}`,
          payerEmail: 'test_user@testuser.com'
        });

        console.log('✅ [MP_PREFERENCE] Respuesta del backend:', response);

        if (response && response.preferenceId) {
          setPreferenceId(response.preferenceId);
        } else {
          console.error('❌ [MP_PREFERENCE] El backend respondió, pero no incluyó un preferenceId válido:', response);
          toast.error('Error al generar la preferencia de pago.');
        }
      } catch (error: any) {
        console.error('❌ [MP_PREFERENCE] Excepción al llamar al backend para la preferencia:', error.response?.data || error.message || error);
        toast.error('Ocurrió un error al comunicarse con el sistema de pagos.');
      } finally {
        setLoadingPreference(false);
      }
    };

    fetchPreference();
  }, [items, selectedDeliveryMethod]);

  const handleNext = async () => {
    const fieldsToValidate: any[] = ['paymentMethod'];
    if (!billingSameAsShipping) {
      fieldsToValidate.push('billingAddress.firstName', 'billingAddress.lastName', 'billingAddress.address', 'billingAddress.district', 'billingAddress.department');
    }
    if (paymentMethod === 'qr' || paymentMethod === 'transfer') {
       fieldsToValidate.push('operationNumber');
    }

    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      if (paymentMethod === 'card') {
         toast('Por favor completa el pago con Mercado Pago arriba primero.', { icon: 'ℹ️' });
      } else {
         handleGoToReview();
      }
    }
  };

  const onSubmitPayment = async (param: any) => {
    return new Promise((resolve, reject) => {
      mercadopagoApi.processPayment({ ...param.formData, orderId: `ORD-${Date.now()}` })
        .then(async (response) => {
          if (response.status === 'approved') {
             toast.success('¡Pago aprobado!');
             const success = await submitOrder();
             if (success) {
               router.push('/checkout/success');
               resolve(true);
             } else {
               reject();
             }
          } else if (response.status === 'pending') {
             toast('Pago pendiente.', { icon: '⏳' });
             handleGoToReview();
             resolve(true);
          } else {
             toast.error('Pago rechazado o con errores.');
             reject();
          }
        })
        .catch((error) => {
          toast.error('Hubo un error al procesar el pago.');
          reject();
        });
    });
  };

  const initialization = {
    amount: totalAmount,
    preferenceId: preferenceId || undefined,
  };

  const customization = {
    paymentMethods: {
      mercadoPago: 'all',
      creditCard: 'all',
      debitCard: 'all',
      ticket: 'all',
    }
  };

  return (
    <div className="border-[#594246]/30 rounded-sm p-8 space-y-8 border border-[#EBEAE8] shadow-sm">
      <header>
        <h2 className="text-[25px] font-semibold text-[#594246]">Método de Pago</h2>
      </header>

      {/* 💳 SELECCIÓN DE MÉTODO */}
      <div className="grid grid-cols-1 gap-3">
        {PAYMENT_METHODS.map((method) => (
          <div key={method.id}>
            <label
              className={`flex items-center p-4 border rounded-sm cursor-pointer transition-all ${
                paymentMethod === method.id 
                  ? 'border-[#F291A3] bg-[#F2D0D3]/10' 
                  : 'border-gray-100 hover:border-[#594246]'
              }`}
            >
              <input
                type="radio"
                {...register('paymentMethod', { required: 'Selecciona un método' })}
                value={method.id}
                className="w-4 h-4 accent-[#F2778D]"
              />
              
              <span className="ml-3 font-semibold text-[#594246] flex-1">
                {method.label}
              </span>

              {method.icon && (
                <div className="flex items-center justify-end w-[80px]">
                  <Image 
                    src={method.icon.src}
                    alt={method.icon.alt} 
                    width={method.icon.width} 
                    height={25}
                    className="object-contain"
                  />
                </div>
              )}
            </label>

            {/* CONTENIDO DESPLEGADO SEGÚN MÉTODO */}
            {paymentMethod === method.id && (
              <div className="mt-2">
                {/* 💳 MERCADOPAGO PAYMENT BRICK */}
                {method.id === 'card' && (
                  <div className="w-full relative min-h-[400px] bg-white p-4 rounded-lg shadow-sm border border-gray-100 mt-2">

                    {loadingPreference ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <span className="text-[#F2778D] font-medium animate-pulse">Cargando métodos de pago...</span>
                      </div>
                    ) : preferenceId ? (
                      <Payment
                        initialization={initialization}
                        customization={customization as any}
                        onSubmit={onSubmitPayment}
                      />
                    ) : (
                      <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        No se pudo inicializar el sistema de pagos. Por favor intenta de nuevo.
                      </div>
                    )}
                  </div>
                )}

                {/* 📱 YAPE / PLIN */}
                {method.id === 'qr' && (
                  <div className="p-6 rounded-lg bg-white border border-[#EBEAE8] space-y-6">
                    {/* TABS YAPE/PLIN */}
                    <div className="flex bg-gray-100 rounded-full p-1">
                      <button 
                        type="button"
                        onClick={() => setActiveTab('yape')}
                        className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${
                          activeTab === 'yape' ? 'bg-[#742284] text-white' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Yape
                      </button>
                      <button 
                        type="button"
                        onClick={() => setActiveTab('plin')}
                        className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${
                          activeTab === 'plin' ? 'bg-[#FF1C44] text-white' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Plin
                      </button>
                    </div>

                    {/* QR INFO YAPE */}
                    <div className="flex gap-6 items-start">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                         <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs px-2 text-center">QR de<br/>{activeTab === 'yape' ? 'Yape' : 'Plin'}</span>
                         </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">O {activeTab === 'yape' ? 'yapea' : 'plinea'} a este número</p>
                        <p className="text-2xl font-bold text-gray-800 tracking-wider">999 888 777</p>
                        <p className="text-sm text-gray-500">A nombre de: Estilos Boom</p>
                        <p className="text-xl font-bold text-[#594246] mt-2">S/ {totalAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* INPUT NÚMERO DE OPERACIÓN */}
                    <div>
                      <label className="block text-xs font-bold text-[#594246] mb-2 uppercase">Número de operación</label>
                      <input 
                        type="text" 
                        {...register('operationNumber')}
                        placeholder="Ej: 20250523001234"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F2B6C1]"
                      />
                      <p className="text-[11px] text-gray-400 mt-2">
                        Encuéntralo en la pantalla de confirmación de tu app {activeTab === 'yape' ? 'Yape' : 'Plin'}.
                      </p>
                    </div>

                    {/* ACORDEÓN GUÍA */}
                    <div className="bg-[#FFF0F2] rounded-lg overflow-hidden border border-[#FAD9DE]">
                      <button 
                        type="button"
                        onClick={() => setIsGuideOpen(!isGuideOpen)}
                        className="w-full px-4 py-3 flex justify-between items-center text-sm font-semibold text-[#594246]"
                      >
                        <div className="flex items-center gap-2">
                          <span>✨</span> Guía para {activeTab === 'yape' ? 'Yapear' : 'Plinear'} correctamente
                        </div>
                        <span className={`transform transition-transform ${isGuideOpen ? 'rotate-180' : ''}`}>
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#F2778D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </button>
                      
                      {isGuideOpen && (
                        <div className="px-4 pb-4 space-y-3">
                          <ol className="text-sm text-[#594246] space-y-2 ml-2">
                            <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-[#F2B6C1] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</span> Abre {activeTab === 'yape' ? 'Yape' : 'Plin'} y busca el número 999 888 777</li>
                            <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-[#F2B6C1] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</span> Ingresa el monto exacto S/ {totalAmount.toFixed(2)}</li>
                            <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-[#F2B6C1] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</span> Copia tu número de operación y pégalo en el campo de arriba</li>
                          </ol>
                          <div className="bg-white p-2 rounded text-xs text-yellow-600 flex flex-col gap-2 border border-yellow-100 mt-2">
                            <div className="flex items-start gap-2">
                              <span>💡</span>
                              <span>Tip: El número de operación aparece debajo del monto en la pantalla de confirmación de {activeTab === 'yape' ? 'Yape' : 'Plin'}.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsImageModalOpen(true)}
                              className="text-[#F2778D] font-semibold hover:underline self-start text-xs ml-6"
                            >
                              Ver guía visual (captura de pantalla)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      ¿Necesitas ayuda? Llámanos al 999 888 777
                    </div>
                  </div>
                )}

                {/* 🏦 TRANSFERENCIA */}
                {method.id === 'transfer' && (
                  <div className="p-6 rounded-lg bg-white border border-[#EBEAE8] space-y-4">
                    <h3 className="text-sm font-bold text-[#594246] uppercase">Cuentas Bancarias</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
                        <span className="text-[#827D7D]">BCP (Soles):</span>
                        <span className="font-mono font-bold text-[#594246]">193-XXXXXX-X-XX</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#827D7D]">CCI:</span>
                        <span className="font-mono font-bold text-[#594246]">002-193XXXXXXXXX-XX</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#F2778D] italic">* El pedido se procesará una vez confirmada la transferencia.</p>
                    
                    {/* INPUT NÚMERO DE OPERACIÓN */}
                    <div className="pt-2 border-t border-gray-100">
                      <label className="block text-xs font-bold text-[#594246] mb-2 uppercase">Número de operación</label>
                      <input 
                        type="text" 
                        {...register('operationNumber', { required: 'Ingresa el número de operación para validar tu transferencia' })}
                        placeholder="Ej: 00123456"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F2B6C1]"
                      />
                      <p className="text-[11px] text-gray-400 mt-2">
                        Ingresa el código de confirmación o número de operación de tu voucher.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🏠 DIRECCIÓN DE FACTURACIÓN */}
      <div className="pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="billingCheck"
            {...register('billingSameAsShipping')}
            className="w-4 h-4 accent-[#F2778D]"
          />
          <label htmlFor="billingCheck" className="text-sm text-[#594246]">
            Mi dirección de facturación es la misma que la de envío
          </label>
        </div>

        {!billingSameAsShipping && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
             <p className="col-span-2 text-xs text-gray-400 italic">Ingresa los datos para tu comprobante de pago.</p>
          </div>
        )}
      </div>

      {/* 🚀 BOTONES DE NAVEGACIÓN */}
      <footer className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={handleGoToDelivery}
          className="w-1/2 py-4 border-2 border-gray-200 rounded-full font-bold text-[#594246] hover:bg-gray-50 transition-colors"
        >
          Atras
        </button>
        {paymentMethod !== 'card' && (
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="py-4 w-1/2 bg-[#F2B6C1] hover:bg-[#F2778D] rounded-full font-bold text-black hover:text-white transition-all disabled:opacity-50"
          >
            Revisar Pedido
          </button>
        )}
      </footer>

      {/* 🖼️ MODAL DE IMAGEN AMPLIADA */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 backdrop-blur-sm p-2 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="min-h-full flex items-center justify-center py-10">
            <div className="relative w-full max-w-[1400px] flex flex-col items-center">
              <button 
                onClick={() => setIsImageModalOpen(false)}
                className="absolute -top-12 right-2 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10"
              >
                <X size={24} />
              </button>
              <Image 
                src="/assets/GuiaYapearV2.png" 
                alt="Guía paso a paso Ampliada" 
                width={2500} 
                height={2500} 
                className="w-full h-auto object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPaymentForm;