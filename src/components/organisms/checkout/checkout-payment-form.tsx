'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { CheckoutFormValues } from '@/core/models/checkout';
import { IMaskInput } from 'react-imask';

import Image from 'next/image';
import { useState } from 'react';

const CheckoutPaymentForm: React.FC = () => {
  const { handleGoToReview, handleGoToDelivery } = useCheckoutStore();
  const [qrMethod, setQrMethod] = useState<'yape' | 'plin'>('yape');
  const {
    register,
    control,
    watch,
    formState: { errors, isSubmitting },
    trigger,
  } = useFormContext<CheckoutFormValues>();

  const paymentMethod = watch('paymentMethod');
  const billingSameAsShipping = watch('billingSameAsShipping');

  const PAYMENT_METHODS = [
  { 
    id: 'card', 
    label: 'Tarjeta de Crédito / Débito', 
    icon: { src: "/assets/visaymaster.png", alt: 'Visa y Mastercard', width: 70 } 
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

  const handleNext = async () => {
    const fieldsToValidate: any[] = ['paymentMethod'];
    if (paymentMethod === 'card') {
      fieldsToValidate.push('cardNumber', 'expiryDate', 'securityCode');
    }
    if (!billingSameAsShipping) {
      fieldsToValidate.push('billingAddress.firstName', 'billingAddress.lastName', 'billingAddress.address', 'billingAddress.district', 'billingAddress.department');
    }
    if (paymentMethod === 'qr' || paymentMethod === 'transfer') {
      fieldsToValidate.push('operationNumber');
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) handleGoToReview();
  };

  return (
    <div className="border-[#594246]/30 rounded-sm p-8 space-y-8 border border-[#EBEAE8] shadow-sm">
      <header>
        <h2 className="text-[25px] font-semibold text-[#594246]">Método de Pago</h2>
        <p className="text-sm text-[#827D7D]">Selecciona tu forma de pago preferida.</p>
      </header>

      {/* 💳 SELECCIÓN DE MÉTODO */}
      <div className="grid grid-cols-1 gap-3">
        {PAYMENT_METHODS.map((method) => (
          <label
          key={method.id}
          className={`flex items-center p-4 border rounded-sm cursor-pointer transition-all ${
            paymentMethod === method.id 
              ? 'border-[#F291A3] bg-[#F2D0D3]/60' 
              : 'border-gray-100 hover:border-[#594246]'
          }`}
        >
          <input
            type="radio"
            {...register('paymentMethod', { required: 'Selecciona un método' })}
            value={method.id}
            className="w-4 h-4 "
          />
          
          <span className="ml-3 font-semibold text-[#594246] flex-1">
            {method.label}
          </span>

          <div className="flex items-center justify-end w-[80px]">
            <Image 
              src={method.icon.src}
              alt={method.icon.alt} 
              width={method.icon.width} 
              height={25}
              className="object-contain"
            />
          </div>
        </label>
      ))}
    </div>

      {/* 📝 FORMULARIO DE TARJETA */}
      {paymentMethod === 'card' && (
        <div className="p-6 rounded-lg bg-[#FAF9F6] border border-[#F2D0D3]/30 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#594246] mb-1">Número de Tarjeta</label>
              <Controller
                name="cardNumber"
                control={control}
                render={({ field }) => (
                  <IMaskInput
                    mask="0000 0000 0000 0000"
                    placeholder="0000 0000 0000 0000"
                    onAccept={(value) => field.onChange(value)}
                    className="w-full px-4 py-2 border rounded-sm focus:outline-[#594246]"
                  />
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#594246] mb-1">Vencimiento</label>
                <Controller
                  name="expiryDate"
                  control={control}
                  render={({ field }) => (
                    <IMaskInput
                      mask="00/00"
                      placeholder="MM/YY"
                      onAccept={(value) => field.onChange(value)}
                      className="w-full px-4 py-2 border rounded-sm focus:outline-[#594246]"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#594246] mb-1">CVC</label>
                <input
                  type="password"
                  maxLength={4}
                  {...register('securityCode')}
                  className="w-full px-4 py-2 border rounded-sm focus:outline-[#594246]"
                  placeholder="***"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'qr' && (
        <div className="space-y-6 animate-in fade-in duration-300 border border-[#F2D0D3]/30 rounded-lg p-6 bg-[#FAF9F6]">
          
          {/* Tabs Yape / Plin */}
          <div className="flex rounded-full border border-gray-200 p-1 bg-white">
            <button
              type="button"
              onClick={() => setQrMethod('yape')}
              className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${
                qrMethod === 'yape' ? 'shadow-sm' : 'text-[#827D7D] hover:bg-gray-50'
              }`}
              style={qrMethod === 'yape' ? { backgroundColor: '#742365', color: 'white' } : {}}
            >
              Yape
            </button>
            <button
              type="button"
              onClick={() => setQrMethod('plin')}
              className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${
                qrMethod === 'plin' ? 'shadow-sm' : 'text-[#827D7D] hover:bg-gray-50'
              }`}
              style={qrMethod === 'plin' ? { backgroundColor: '#00E4A4', color: 'white' } : {}}
            >
              Plin
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            {/* QR Code */}
            <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 shrink-0">
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400 text-xs text-center px-2">[QR {qrMethod === 'yape' ? 'Yape' : 'Plin'}]</span>
              </div>
            </div>

            {/* Info */}
            <div className="text-left flex-1 space-y-1 w-full">
              <p className="text-xs text-[#827D7D]">O {qrMethod === 'yape' ? 'yapea' : 'plinea'} a este número</p>
              <p className="text-2xl font-bold tracking-widest text-[#594246]">999 888 777</p>
              <p className="text-xs font-medium text-[#827D7D]">A nombre de: Estilos Boom</p>
              <p className="text-xl font-bold text-[#594246] mt-2">S/ 89.00</p>
            </div>
          </div>

          {/* Número de operación */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <label className="block text-xs font-bold uppercase text-[#594246] mb-2">Número de operación</label>
            <input
              type="text"
              {...register('operationNumber', { required: 'Ingresa el número de operación' })}
              placeholder="Ej: 20250523001234"
              className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-[#F2B6C1]"
            />
            <p className="text-[11px] text-[#827D7D] mt-2">
              Encuéntralo en la pantalla de confirmación de tu app {qrMethod === 'yape' ? 'Yape' : 'Plin'}.
            </p>
            {errors.operationNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.operationNumber.message as string}</p>
            )}
          </div>

          {/* Guía con Imagen */}
          <div className="rounded-xl border border-[#F2D0D3]/50 overflow-hidden bg-[#FAF9F6] shadow-sm">
            <div className="bg-[#F2D0D3]/20 px-5 py-3 border-b border-[#F2D0D3]/50">
              <h3 className="text-sm font-bold text-[#594246] flex items-center gap-2">
                ✨ Guía para {qrMethod === 'yape' ? 'Yapear' : 'Plinear'} correctamente
              </h3>
            </div>
            <div className="p-4 flex justify-center bg-white">
              <div className="relative w-full max-w-lg aspect-[16/9] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                <span className="text-gray-400 text-sm text-center px-4">[Imagen de Guía paso a paso de {qrMethod === 'yape' ? 'Yape' : 'Plin'}]</span>
                {/* 
                  Aquí iría la imagen real de la guía, ej:
                  <Image src={`/assets/guia-${qrMethod}.png`} alt="Guia" fill className="object-contain" />
                */}
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

    {paymentMethod === 'transfer' && (
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
            {...register('operationNumber', { required: 'Ingresa el número de operación del voucher' })}
            placeholder="Ej: 0123456"
            className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-[#F2B6C1]"
          />
          <p className="text-[11px] text-[#827D7D] mt-2">
            Lo encuentras en el voucher físico o captura de pantalla de tu transferencia.
          </p>
          {errors.operationNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.operationNumber.message as string}</p>
          )}
        </div>
      </div>
    )}

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
             {/* Aquí usarías los mismos campos de Ubigeo que en el paso anterior */}
             <p className="col-span-2 text-xs text-gray-400 italic">Ingresa los datos para tu comprobante de pago.</p>
          </div>
        )}
      </div>

      {/* 🚀 BOTONES */}
      <footer className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={handleGoToDelivery}
          className="w-1/2 py-4 border-2 border-gray-200 rounded-full font-bold text-[#594246] hover:bg-gray-50 transition-colors"
        >
          Atras
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className=" py-4  w-1/2 bg-[#F2B6C1] hover:bg-[#F2778D] rounded-full font-bold text-black hover:text-white transition-all "
        >
          {isSubmitting ? 'Procesando...' : 'Revisar Pedido'}
        </button>
      </footer>
    </div>
  );
};

export default CheckoutPaymentForm;