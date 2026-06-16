'use client';

import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { CheckoutFormValues } from '@/core/models/checkout';
import { useAppSelector } from '@/store';

const CheckoutShippingForm: React.FC = () => {
  const { handleGoToDelivery } = useCheckoutStore();
  
  const { status, email, phone } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';

  const {
    register, control, formState: { errors, isSubmitting }, trigger, setValue,
  } = useFormContext<CheckoutFormValues>();

  useEffect(() => {
    if (isAuthenticated) {
      if (email) setValue('email', email);
      if (phone) setValue('phone', phone);
    }
  }, [isAuthenticated, email, phone, setValue]);

  const handleNext = async () => {
    // Validar siempre email, phone
    let fieldsToValidate: any[] = ['email', 'phone'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) handleGoToDelivery();
  };

  return (
    <div className="bg-[#FAF9F6] dark:bg-[#1a0618]/60 dark:backdrop-blur-md rounded-sm p-6 lg:p-8 border border-[#EBEAE8] dark:border-[#C5A059]/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-8">
      {/* 1. INFORMACIÓN DE CONTACTO */}
      <div>
        <h2 className="text-[18px] font-serif text-[#632034] dark:text-[#C5A059] mb-1">1. Información de Contacto</h2>
        <p className="text-[13px] text-[#594246]/70 dark:text-[#f0d8e8]/70 mb-4">Usa tus datos registrados o actualízalos.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium mb-2 text-[#594246] dark:text-[#f0d8e8]/90">Email*</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              {...register('email', {
                required: 'El email es requerido',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email inválido' },
              })}
              className={`w-full px-4 py-2.5 text-[14px] bg-white dark:bg-black/40 border dark:text-white dark:placeholder-white/30 rounded-sm focus:outline-[#632034] dark:focus:outline-[#C5A059] transition-colors ${errors.email ? 'border-red-500' : 'border-[#EBEAE8] dark:border-[#C5A059]/30'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-2 text-[#594246] dark:text-[#f0d8e8]/90">Teléfono*</label>
            <input
              type="tel"
              placeholder="987654321"
              {...register('phone', { required: 'El teléfono es requerido' })}
              className={`w-full px-4 py-2.5 text-[14px] bg-white dark:bg-black/40 border dark:text-white dark:placeholder-white/30 rounded-sm focus:outline-[#632034] dark:focus:outline-[#C5A059] transition-colors ${errors.phone ? 'border-red-500' : 'border-[#EBEAE8] dark:border-[#C5A059]/30'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* 4. NEWSLETTER */}
      <div className="pt-4 flex items-center gap-3 border-t border-[#EBEAE8] dark:border-[#C5A059]/20">
        <Controller
          name="wantsNews"
          control={control}
          render={({ field: { value, onChange } }) => (
            <input type="checkbox" id="wantsNews" checked={value} onChange={onChange} className="w-4 h-4 rounded accent-[#632034] dark:accent-[#C5A059]" />
          )}
        />
        <label htmlFor="wantsNews" className="text-[13px] text-[#594246] dark:text-[#f0d8e8]/90">Me gustaría recibir actualizaciones sobre los últimos productos y promociones</label>
      </div>

      {/* BOTÓN CONTINUAR */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="btn-checkout w-full md:w-auto px-10 py-3.5 rounded-sm !mt-0 border cursor-pointer" 
        >
          {isSubmitting ? 'Validando...' : 'Siguiente: Entrega'}
        </button>
      </div>

    </div>
  );
};

export default CheckoutShippingForm;