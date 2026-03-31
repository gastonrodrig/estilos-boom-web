'use client';

import React, {useEffect} from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { CheckoutFormValues } from '@/models/checkout';
import { useAppSelector } from '@/store';
import { PERU_DEPARTMENTS } from '@/core/constants';

const CheckoutShippingForm: React.FC = () => {
  const { handleGoToDelivery } = useCheckoutStore();
  const { status, firstName, lastName, email, phone } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';
  const {
    register,
    control,
    formState: { errors, isSubmitting },
    trigger,
    setValue,
  } = useFormContext<CheckoutFormValues>();

  useEffect(() => {
    if (isAuthenticated) {
      if (firstName) setValue('firstName', firstName);
      if (lastName) setValue('lastName', lastName);
      if (email) setValue('email', email);
      if (phone) setValue('phone', phone);
    }
  }, [isAuthenticated, firstName, lastName, email, phone, setValue]);

  const handleNext = async () => {
    // Validar solo los campos de este paso
    const isValid = await trigger([
      'firstName',
      'lastName',
      'address',
      'district',
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
    <div className="bg-[white] rounded-sm p-8 border border-[#594246]/30 shadow-sm">
      <div className="mb-6">
      {isAuthenticated ? (
          <>
            <h1 className="text-[25px] font-semibold mb-2 text-[#594246]">
              Finaliza tu compra, <span className="capitalize">{firstName?.toLowerCase()}</span>
            </h1>
            <p className="text-sm text-gray-500">Hemos pre-llenado tus datos registrados.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2 text-[#594246]">Finalizar Compra como Invitado</h1>
            <p className="text-sm text-[#F2778D]">o inicia sesión para un proceso más rápido</p>
          </>
        )} 
      </div>
      <form className="space-y-6">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>Nombre*</label>
            <input
              type="text"
              placeholder="Ingresa tu nombre"
              {...register('firstName', { required: 'El nombre es requerido' })}
              className={`w-full px-4 py-2 border rounded-sm  focus:ring-1 transition-colors focus:outline-[#594246] ${
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
              className={`w-full px-4 py-2 border rounded-sm  focus:ring-1 transition-colors focus:outline-[#594246] ${
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
            className={`w-full px-4 py-2 border rounded-sm  focus:ring-1 transition-colors focus:outline-[#594246] ${
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
            className="w-full px-4 py-2 border rounded-sm border-gray-200   focus:ring-1 transition-colors focus:outline-[#594246]"
            style={{ borderColor: '#EBEA E8' }}
          />
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>Departamento*</label>
          <select
            {...register('department', { required: 'El departamento es requerido' })}
            className={`w-full px-4 py-2 border rounded-sm  focus:ring-1 transition-colors focus:outline-[#594246] ${
              errors.department ? 'border-red-500' : 'border-gray-200'
            }`}
            style={errors.department ? {} : { borderColor: '#EBEA E8' }}
          >
            <option value="">Selecciona un departamento</option>
            {PERU_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept.toLowerCase()}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>
          )}
        </div>

        {/* Ciudad y Código Postal */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>Distrito*</label>
            <input
              type="text"
              placeholder="Lima"
              {...register('district', { required: 'La ciudad es requerida' })}
              className={`w-full px-4 py-2 border rounded-sm  focus:ring-1 transition-colors focus:outline-[#594246] ${
                errors.district ? 'border-red-500' : 'border-gray-200'
              }`}
              style={errors.district ? {} : { borderColor: '#EBEA E8' }}
            />
            {errors.district && (
              <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#594246' }}>Código Postal*</label>
            <input
              type="text"
              placeholder="15001"
              {...register('postalCode', { required: 'El código postal es requerido' })}
              className={`w-full px-4 py-2 border rounded-sm  focus:ring-1 transition-colors focus:outline-[#594246] ${
                errors.postalCode ? 'border-red-500' : 'border-gray-200'
              }`}
              style={errors.postalCode ? {} : { borderColor: '#EBEA E8' }}
            />
            {errors.postalCode && (
              <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
            )}
          </div>
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
              className={`w-full px-4 py-2 border rounded-sm  focus:ring-0 transition-colors focus:outline-[#594246] ${
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
              className={`w-full px-4 py-2 border rounded-sm  focus:ring-0 transition-colors focus:outline-[#594246] ${
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
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-2/3 h-16 rounded-full text-black font-medium py-3  transition-opacity disabled:opacity-50 hover:cursor-pointer hover:bg-[#F2778D]/80 bg-[#F2B6C1]"
            
          >
            {isSubmitting ? 'Validando...' : 'Guardar y Ver Opciones de Envío'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutShippingForm;
