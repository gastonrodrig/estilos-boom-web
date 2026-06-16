'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore, useCartStore, useAuthStore } from '@/hooks';
import { useOrderSubmission } from '@/hooks/extra';
import { CheckoutFormValues } from '@/core/models/checkout';
import { useRouter } from 'next/navigation';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { mercadopagoApi } from '@/api/mercadopago/mercadopago.api';
import { manualPaymentApi } from '@/api/payment/payment-api';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { X } from 'lucide-react';
import { getAuthConfig } from '@/core/utils';
import { getFirebaseAuthToken } from '@/core/helpers';

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
  const { firstName, lastName } = useAuthStore();
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
    formState: { isSubmitting, errors },
    trigger,
  } = useFormContext<CheckoutFormValues>();

  const billingSameAsShipping = watch('billingSameAsShipping');
  const selectedDeliveryMethod = watch('selectedDeliveryMethod');
  const deliveryCost = selectedDeliveryMethod?.price || 0;
  const paymentMethod = watch('paymentMethod');

  const PAYMENT_METHODS = [
    {
      id: 'card',
      label: 'Mercado Pago (Tarjetas / Efectivo)',
      icon: { src: "/assets/visaymaster.png", alt: 'Mercado Pago', width: 60 }
    },
    {
      id: 'qr',
      label: 'Yape / Plin',
      icon: { src: "/assets/yapeyplin.png", alt: 'Yape y Plin', width: 60 }
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
          payerEmail: watch('email') || 'cliente@estilosboom.com'
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

  // Auto-scroll to the selected payment method
  useEffect(() => {
    if (paymentMethod) {
      setTimeout(() => {
        const el = document.getElementById(`payment-block-${paymentMethod}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 120; // 120px offset for navbar/header
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150);
    }
  }, [paymentMethod]);

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
        try {
          const operationNumber = watch('operationNumber');
          const token = await getFirebaseAuthToken();
          
          const typedFirstName = watch('firstName') || '';
          const typedLastName = watch('lastName') || '';
          const clientNameStr = (firstName || lastName) 
            ? `${firstName || ''} ${lastName || ''}`.trim() 
            : (typedFirstName || typedLastName) 
              ? `${typedFirstName} ${typedLastName}`.trim() 
              : 'Cliente Web';

          await manualPaymentApi.post('/process', {
            operationNumber,
            amount: totalAmount,
            paymentMethod: paymentMethod === 'qr' ? activeTab : 'transferencia',
            clientName: clientNameStr || 'Cliente Web',
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              size: item.size,
              price: item.price,
              quantity: item.quantity,
              color: item.color,
              image: item.image
            })),
            deliveryMethod: selectedDeliveryMethod?.id
          }, getAuthConfig({ token }));

          handleGoToReview();
        } catch (error) {
          toast.error('Error al enviar el pago manual al servidor.');
          console.error(error);
        }
      }
    }
  };

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const deliveryMethodRef = useRef(selectedDeliveryMethod);
  useEffect(() => {
    deliveryMethodRef.current = selectedDeliveryMethod;
  }, [selectedDeliveryMethod]);

  const onSubmitPayment = async (param: any) => {
    return new Promise((resolve, reject) => {
      const typedFirstName = watch('firstName') || '';
      const typedLastName = watch('lastName') || '';
      const clientNameStr = (firstName || lastName) 
        ? `${firstName || ''} ${lastName || ''}`.trim() 
        : (typedFirstName || typedLastName) 
          ? `${typedFirstName} ${typedLastName}`.trim() 
          : 'Cliente Web';

      mercadopagoApi.processPayment({ 
        ...param.formData, 
        orderId: `ORD-${Date.now()}`,
        clientName: clientNameStr,
        items: itemsRef.current.map(item => ({
          id: item.id,
          name: item.name,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          color: item.color
        })),
        deliveryMethod: deliveryMethodRef.current?.id
      })
        .then(async (response) => {
          if (response.status === 'approved') {
            toast.success('¡Pago aprobado!');
            const success = await submitOrder();
            if (success) {
              handleGoToReview();
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

  const initialization = React.useMemo(() => ({
    amount: totalAmount,
    preferenceId: preferenceId || undefined,
  }), [totalAmount, preferenceId]);

  const customization = React.useMemo(() => ({
    paymentMethods: {
      mercadoPago: 'all',
      creditCard: 'all',
      debitCard: 'all',
      ticket: 'all',
    }
  }), []);

  return (
    <div className="border-[#594246]/30 rounded-sm p-8 space-y-8 border border-[#EBEAE8] shadow-sm">
      <header>
        <h2 className="text-[25px] font-semibold text-[#594246]">Método de Pago</h2>
      </header>

      {/* 💳 SELECCIÓN DE MÉTODO */}
      <div className="grid grid-cols-1 gap-3">
        {PAYMENT_METHODS.map((method) => (
          <div key={method.id} id={`payment-block-${method.id}`}>
            <label
              className={`flex items-center p-4 border rounded-sm cursor-pointer transition-all ${paymentMethod === method.id
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
                        key={preferenceId}
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
                  <div className="space-y-6 animate-in fade-in duration-300 border border-[#F2D0D3]/30 rounded-lg p-6 bg-[#FAF9F6]">

                    {/* Tabs Yape / Plin */}
                    <div className="flex rounded-full border border-gray-200 p-1 bg-white">
                      <button
                        type="button"
                        onClick={() => setActiveTab('yape')}
                        className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'yape' ? 'shadow-sm' : 'text-[#827D7D] hover:bg-gray-50'
                          }`}
                        style={activeTab === 'yape' ? { backgroundColor: '#742365', color: 'white' } : {}}
                      >
                        Yape
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('plin')}
                        className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'plin' ? 'shadow-sm' : 'text-[#827D7D] hover:bg-gray-50'
                          }`}
                        style={activeTab === 'plin' ? { backgroundColor: '#00E4A4', color: 'white' } : {}}
                      >
                        Plin
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      {/* QR Code */}
                      <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 shrink-0">
                        <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg">
                          <span className="text-gray-400 text-xs text-center px-2">[QR {activeTab === 'yape' ? 'Yape' : 'Plin'}]</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="text-left flex-1 space-y-1 w-full">
                        <p className="text-xs text-[#827D7D]">O {activeTab === 'yape' ? 'yapea' : 'plinea'} a este número</p>
                        <p className="text-2xl font-bold tracking-widest text-[#594246]">999 888 777</p>
                        <p className="text-xs font-medium text-[#827D7D]">A nombre de: Estilos Boom</p>
                        <p className="text-xl font-bold text-[#594246] mt-2">S/ {totalAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Número de operación */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <label className="block text-xs font-bold uppercase text-[#594246] mb-2">Número de operación</label>
                      <input
                        type="text"
                        {...register('operationNumber', { 
                          required: 'Ingresa el número de operación',
                          pattern: {
                            value: /^[0-9]+$/,
                            message: 'El número de operación solo debe contener números'
                          },
                          minLength: {
                            value: 6,
                            message: 'Debe tener al menos 6 dígitos'
                          }
                        })}
                        placeholder="Ej: 20250523001234"
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-[#F2B6C1]"
                      />
                      <p className="text-[11px] text-[#827D7D] mt-2">
                        Encuéntralo en la pantalla de confirmación de tu app {activeTab === 'yape' ? 'Yape' : 'Plin'}.
                      </p>
                      {errors.operationNumber && (
                        <p className="text-xs text-red-500 mt-1">{errors.operationNumber?.message as string}</p>
                      )}
                    </div>

                    {/* Guía con Imagen */}
                    <div className="rounded-xl border border-[#F2D0D3]/50 overflow-hidden bg-[#FAF9F6] shadow-sm">
                      <div className="bg-[#F2D0D3]/20 px-5 py-3 border-b border-[#F2D0D3]/50">
                        <h3 className="text-sm font-bold text-[#594246] flex items-center gap-2">
                          ✨ Guía para {activeTab === 'yape' ? 'Yapear' : 'Plinear'} correctamente
                        </h3>
                      </div>
                      <div className="p-4 bg-white">
                        <div
                          className="relative w-full h-[250px] overflow-hidden rounded-lg border border-gray-100 cursor-pointer group shadow-sm bg-gray-50"
                          onClick={() => setIsImageModalOpen(true)}
                        >
                          <Image
                            src="/assets/GuiaYapearV2.png"
                            alt="Guía paso a paso"
                            width={600}
                            height={1200}
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Degradado blanco en la parte inferior para dar a entender que sigue */}
                          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <span className="bg-white text-[#594246] px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all">
                              Ampliar guía completa
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ayuda Telefónica */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      <div className="w-8 h-8 rounded-full bg-[#F2D0D3]/30 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#594246" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[#827D7D]">¿Necesitas ayuda o prefieres asistencia por teléfono?</p>
                        <p className="text-sm font-bold text-[#594246]">Llámanos al 999 888 777</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🏦 TRANSFERENCIA */}
                {method.id === 'transfer' && (
                  <div className="space-y-6 animate-in fade-in duration-300 border border-[#F2D0D3]/30 rounded-lg p-6 bg-[#FAF9F6]">
                    {/* Guía/Tips para transferencias */}
                    <div className="rounded-xl border border-[#F2D0D3]/50 overflow-hidden bg-white shadow-sm">
                      <div className="bg-[#F2D0D3]/20 px-5 py-3 border-b border-[#F2D0D3]/50">
                        <h3 className="text-sm font-bold text-[#594246] flex items-center gap-2">
                          💡 Recomendaciones importantes
                        </h3>
                      </div>
                      <div className="p-5 space-y-3">
                        <p className="text-xs text-[#594246] flex items-start gap-2">
                          <span className="text-[#F2778D] font-bold">1.</span> Si transfieres desde otro banco (Interbancario), el pago puede demorar hasta 24h hábiles en reflejarse.
                        </p>
                        <p className="text-xs text-[#594246] flex items-start gap-2">
                          <span className="text-[#F2778D] font-bold">2.</span> Es obligatorio ingresar el Número de Operación abajo para poder rastrear tu pago rápidamente.
                        </p>
                        <p className="text-xs text-[#594246] flex items-start gap-2">
                          <span className="text-[#F2778D] font-bold">3.</span> Envíanos la captura o foto del voucher por WhatsApp para agilizar la validación.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-[#594246] uppercase mb-4">Cuentas Bancarias Disponibles</h3>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between text-sm border-b border-gray-100 pb-3 gap-1">
                          <span className="text-[#827D7D] flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#002A8D]"></div>
                            BCP (Soles):
                          </span>
                          <span className="font-mono font-bold text-[#594246] tracking-wide">193-XXXXXX-X-XX</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between text-sm pb-1 gap-1">
                          <span className="text-[#827D7D] flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#E5E7EB]"></div>
                            CCI (Interbancario):
                          </span>
                          <span className="font-mono font-bold text-[#594246] tracking-wide">002-193XXXXXXXXX-XX</span>
                        </div>
                      </div>
                    </div>

                    {/* Número de operación */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <label className="block text-xs font-bold uppercase text-[#594246] mb-2">Número de operación</label>
                      <input
                        type="text"
                        {...register('operationNumber', { 
                          required: 'Ingresa el número de operación del voucher',
                          pattern: {
                            value: /^[0-9A-Za-z]+$/,
                            message: 'El número de operación solo debe contener letras o números'
                          },
                          minLength: {
                            value: 4,
                            message: 'Debe tener al menos 4 caracteres'
                          }
                        })}
                        placeholder="Ej: 0123456"
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-[#F2B6C1]"
                      />
                      <p className="text-[11px] text-[#827D7D] mt-2">
                        Lo encuentras en el voucher físico o captura de pantalla de tu transferencia.
                      </p>
                      {errors.operationNumber && (
                        <p className="text-xs text-red-500 mt-1">{errors.operationNumber?.message as string}</p>
                      )}
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