'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { CheckoutFormValues } from '@/models/checkout';
import { PERU_DEPARTMENTS } from '@/core/constants';
import { IMaskInput } from 'react-imask';

import Image from 'next/image';

const CheckoutPaymentForm: React.FC = () => {
  const { handleGoToReview, handleGoToDelivery } = useCheckoutStore();
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
      <div className="p-6 rounded-lg bg-[#FAF9F6] border border-[#F2D0D3]/30 text-center space-y-4 animate-in fade-in duration-300">
        <p className="text-sm font-medium text-[#594246]">Escanea el QR para pagar con Yape o Plin</p>
        <div className="bg-white p-4 inline-block rounded-xl border border-gray-100 shadow-sm">
          {/* Aquí pondrías tu imagen de QR real */}
          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg">
            <span className="text-gray-400 text-xs text-center px-4">[Imagen del QR de Estilos Boom]</span>
          </div>
        </div>
        <p className="text-xs text-[#827D7D]">Una vez realizado el pago, envíanos el comprobante por WhatsApp.</p>
      </div>
    )}

    {paymentMethod === 'transfer' && (
  <div className="p-6 rounded-lg bg-[#FAF9F6] border border-[#F2D0D3]/30 space-y-4 animate-in fade-in duration-300">
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