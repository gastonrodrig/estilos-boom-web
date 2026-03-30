'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { CheckoutFormValues } from '@/models/checkout';

const CheckoutShippingForm: React.FC = () => {
  const { handleGoToDelivery } = useCheckoutStore();
  const {
    register,
    control,
    formState: { errors, isSubmitting },
    trigger,
  } = useFormContext<CheckoutFormValues>();

  const handleNext = async () => {
    // Validar solo los campos de este paso
    const isValid = await trigger([
      'firstName',
      'lastName',
      'address',
      'city',
      'postalCode',
      'department',
      'email',
      'phone',
    ]);

    if (isValid) {
      handleGoToDelivery();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#594246' }}>Finalizar Compra como Invitado</h1>
      <p className="text-sm mb-6" style={{ color: '#F2778D' }}>o inicia sesión para un proceso más rápido</p>

      <form className="space-y-6">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>Nombre*</label>
            <input
              type="text"
              placeholder="Ingresa tu nombre"
              {...register('firstName', { required: 'El nombre es requerido' })}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-0 transition-colors ${
                errors.firstName ? 'border-red-500' : 'border-gray-200'
              }`}
              style={errors.firstName ? {} : { borderColor: '#EBEA E8' }}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>Apellido*</label>
            <input
              type="text"
              placeholder="Ingresa tu apellido"
              {...register('lastName', { required: 'El apellido es requerido' })}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-0 transition-colors ${
                errors.lastName ? 'border-red-500' : 'border-gray-200'
              }`}
              style={errors.lastName ? {} : { borderColor: '#EBEA E8' }}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>Dirección*</label>
          <input
            type="text"
            placeholder="Av. Principal 123"
            {...register('address', { required: 'La dirección es requerida' })}
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-0 transition-colors ${
              errors.address ? 'border-red-500' : 'border-gray-200'
            }`}
            style={errors.address ? {} : { borderColor: '#EBEA E8' }}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Apartamento */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>
            Apartamento, suite, etc. (opcional)
          </label>
          <input
            type="text"
            placeholder="Dpto 101"
            {...register('apartment')}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-0 transition-colors"
            style={{ borderColor: '#EBEA E8' }}
          />
        </div>

        {/* Ciudad y Código Postal */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>Ciudad*</label>
            <input
              type="text"
              placeholder="Lima"
              {...register('city', { required: 'La ciudad es requerida' })}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-0 transition-colors ${
                errors.city ? 'border-red-500' : 'border-gray-200'
              }`}
              style={errors.city ? {} : { borderColor: '#EBEA E8' }}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>Código Postal*</label>
            <input
              type="text"
              placeholder="15001"
              {...register('postalCode', { required: 'El código postal es requerido' })}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-0 transition-colors ${
                errors.postalCode ? 'border-red-500' : 'border-gray-200'
              }`}
              style={errors.postalCode ? {} : { borderColor: '#EBEA E8' }}
            />
            {errors.postalCode && (
              <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
            )}
          </div>
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>Departamento*</label>
          <select
            {...register('department', { required: 'El departamento es requerido' })}
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-0 transition-colors ${
              errors.department ? 'border-red-500' : 'border-gray-200'
            }`}
            style={errors.department ? {} : { borderColor: '#EBEA E8' }}
          >
            <option value="">Selecciona un departamento</option>
            <option value="lima">Lima</option>
            <option value="arequipa">Arequipa</option>
            <option value="cusco">Cusco</option>
          </select>
          {errors.department && (
            <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>
          )}
        </div>

        {/* Email y Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>Email*</label>
            <input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              {...register('email', {
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-0 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              style={errors.email ? {} : { borderColor: '#EBEA E8' }}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>
              Número de Teléfono*
            </label>
            <input
              type="tel"
              placeholder="987 654 321"
              {...register('phone', { required: 'El teléfono es requerido' })}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-0 transition-colors ${
                errors.phone ? 'border-red-500' : 'border-gray-200'
              }`}
              style={errors.phone ? {} : { borderColor: '#EBEA E8' }}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Checkbox Newsletter */}
        <div className="flex items-center gap-3">
          <Controller
            name="wantsNews"
            control={control}
            render={({ field: { value, onChange } }) => (
              <input
                type="checkbox"
                id="wantsNews"
                checked={value}
                onChange={onChange}
                className="w-4 h-4 rounded"
                style={{ borderColor: '#F2778D', accentColor: '#F2778D' }}
              />
            )}
          />
          <label htmlFor="wantsNews" className="text-sm" style={{ color: '#594246' }}>
            Me gustaría recibir actualizaciones sobre los últimos productos y promociones por correo
            electrónico o otros canales.
          </label>
        </div>

        {/* Botón Next */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-full text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#F2778D' }}
          >
            {isSubmitting ? 'Validando...' : 'Guardar y Ver Opciones de Envío'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutShippingForm;
