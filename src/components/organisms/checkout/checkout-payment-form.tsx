'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { CheckoutFormValues } from '@/models/checkout';

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

  const handleNext = async () => {
    // Validar campos de este paso
    const fieldsToValidate: (keyof CheckoutFormValues)[] = ['paymentMethod'];

    if (paymentMethod === 'card') {
      fieldsToValidate.push('cardNumber', 'expiryDate', 'securityCode');
    }

    if (!billingSameAsShipping) {
      fieldsToValidate.push(
        'billingAddress' as keyof CheckoutFormValues
      );
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      handleGoToReview();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 space-y-6 border border-gray-200">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#594246' }}>
          Método de Pago
        </h2>
        <p className="text-sm" style={{ color: '#827D7D' }}>
          Selecciona cómo deseas pagar tu pedido
        </p>
      </div>

      <form className="space-y-6">
        {/* Métodos de pago */}
        <div className="space-y-3">
          <label className="block text-sm font-medium" style={{ color: '#594246' }}>
            Método de Pago*
          </label>

          <div className="space-y-3">
            {/* Tarjeta de Crédito */}
            <label
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
              style={{
                borderColor:
                  paymentMethod === 'card' ? '#F2778D' : '#EBEA E8',
                backgroundColor:
                  paymentMethod === 'card' ? '#FAF9F6' : '#FFFFFF',
              }}
            >
              <input
                type="radio"
                {...register('paymentMethod', {
                  required: 'Debe seleccionar un método de pago',
                })}
                value="card"
                className="w-4 h-4"
                style={{ accentColor: '#F2778D' }}
              />
              <span className="ml-3 font-semibold" style={{ color: '#594246' }}>
                Tarjeta de Crédito/Débito
              </span>
            </label>

            {/* Transferencia Bancaria */}
            <label
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
              style={{
                borderColor:
                  paymentMethod === 'transfer' ? '#F2778D' : '#EBEA E8',
                backgroundColor:
                  paymentMethod === 'transfer' ? '#FAF9F6' : '#FFFFFF',
              }}
            >
              <input
                type="radio"
                {...register('paymentMethod')}
                value="transfer"
                className="w-4 h-4"
                style={{ accentColor: '#F2778D' }}
              />
              <span className="ml-3 font-semibold" style={{ color: '#594246' }}>
                Transferencia Bancaria
              </span>
            </label>

            {/* Contraentrega */}
            <label
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
              style={{
                borderColor:
                  paymentMethod === 'cash' ? '#F2778D' : '#EBEA E8',
                backgroundColor:
                  paymentMethod === 'cash' ? '#FAF9F6' : '#FFFFFF',
              }}
            >
              <input
                type="radio"
                {...register('paymentMethod')}
                value="cash"
                className="w-4 h-4"
                style={{ accentColor: '#F2778D' }}
              />
              <span className="ml-3 font-semibold" style={{ color: '#594246' }}>
                Contraentrega (Pago en entrega)
              </span>
            </label>
          </div>

          {errors.paymentMethod && (
            <p className="text-red-500 text-xs mt-1">
              {errors.paymentMethod.message}
            </p>
          )}
        </div>

        {/* Datos de tarjeta si es tarjeta */}
        {paymentMethod === 'card' && (
          <div
            className="space-y-4 border rounded-lg p-4"
            style={{ backgroundColor: '#FAF9F6', borderColor: '#EBEA E8' }}
          >
            <h3 className="font-semibold" style={{ color: '#594246' }}>
              Datos de la Tarjeta
            </h3>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#594246' }}
              >
                Número de Tarjeta*
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                {...register('cardNumber', {
                  required: 'El número de tarjeta es requerido',
                  pattern: {
                    value: /^\d{16}$/,
                    message: 'Debe tener 16 dígitos',
                  },
                })}
                className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                style={{
                  borderColor: errors.cardNumber ? '#EF4444' : '#EBEA E8',
                  backgroundColor: '#FFFFFF',
                  color: '#594246',
                }}
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.cardNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#594246' }}
                >
                  Fecha de Vencimiento*
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  {...register('expiryDate', {
                    required: 'La fecha de vencimiento es requerida',
                    pattern: {
                      value: /^\d{2}\/\d{2}$/,
                      message: 'Formato MM/YY',
                    },
                  })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                  style={{
                    borderColor: errors.expiryDate ? '#EF4444' : '#EBEA E8',
                    backgroundColor: '#FFFFFF',
                    color: '#594246',
                  }}
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.expiryDate.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#594246' }}
                >
                  CVV*
                </label>
                <input
                  type="text"
                  placeholder="123"
                  {...register('securityCode', {
                    required: 'El CVV es requerido',
                    pattern: {
                      value: /^\d{3,4}$/,
                      message: 'Debe tener 3 o 4 dígitos',
                    },
                  })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                  style={{
                    borderColor: errors.securityCode ? '#EF4444' : '#EBEA E8',
                    backgroundColor: '#FFFFFF',
                    color: '#594246',
                  }}
                />
                {errors.securityCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.securityCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dirección de Facturación */}
        <div className="space-y-4">
          <h3 className="font-semibold" style={{ color: '#594246' }}>
            Dirección de Facturación
          </h3>

          <div className="flex items-center gap-3">
            <Controller
              name="billingSameAsShipping"
              control={control}
              render={({ field: { value, onChange } }) => (
                <input
                  type="checkbox"
                  id="billingSameAsShipping"
                  checked={value}
                  onChange={onChange}
                  className="w-4 h-4 rounded border"
                  style={{
                    accentColor: '#F2778D',
                    borderColor: '#EBEA E8',
                  }}
                />
              )}
            />
            <label
              htmlFor="billingSameAsShipping"
              className="text-sm"
              style={{ color: '#827D7D' }}
            >
              La dirección de facturación es la misma que la de entrega
            </label>
          </div>

          {!billingSameAsShipping && (
            <div
              className="space-y-4 mt-4 border rounded-lg p-4"
              style={{ backgroundColor: '#FAF9F6', borderColor: '#EBEA E8' }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#594246' }}
                  >
                    Nombre*
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre"
                    {...register('billingAddress.firstName', {
                      required: 'El nombre es requerido',
                    })}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                    style={{
                      borderColor: errors.billingAddress?.firstName
                        ? '#EF4444'
                        : '#EBEA E8',
                      backgroundColor: '#FFFFFF',
                      color: '#594246',
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#594246' }}
                  >
                    Apellido*
                  </label>
                  <input
                    type="text"
                    placeholder="Apellido"
                    {...register('billingAddress.lastName', {
                      required: 'El apellido es requerido',
                    })}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                    style={{
                      borderColor: errors.billingAddress?.lastName
                        ? '#EF4444'
                        : '#EBEA E8',
                      backgroundColor: '#FFFFFF',
                      color: '#594246',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#594246' }}
                >
                  Dirección*
                </label>
                <input
                  type="text"
                  placeholder="Dirección"
                  {...register('billingAddress.address', {
                    required: 'La dirección es requerida',
                  })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                  style={{
                    borderColor: errors.billingAddress?.address
                      ? '#EF4444'
                      : '#EBEA E8',
                    backgroundColor: '#FFFFFF',
                    color: '#594246',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#594246' }}
                  >
                    Ciudad*
                  </label>
                  <input
                    type="text"
                    placeholder="Ciudad"
                    {...register('billingAddress.city', {
                      required: 'La ciudad es requerida',
                    })}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                    style={{
                      borderColor: errors.billingAddress?.city
                        ? '#EF4444'
                        : '#EBEA E8',
                      backgroundColor: '#FFFFFF',
                      color: '#594246',
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#594246' }}
                  >
                    Código Postal*
                  </label>
                  <input
                    type="text"
                    placeholder="Código Postal"
                    {...register('billingAddress.postalCode', {
                      required: 'El código postal es requerido',
                    })}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                    style={{
                      borderColor: errors.billingAddress?.postalCode
                        ? '#EF4444'
                        : '#EBEA E8',
                      backgroundColor: '#FFFFFF',
                      color: '#594246',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#594246' }}
                >
                  Departamento*
                </label>
                <select
                  {...register('billingAddress.department', {
                    required: 'El departamento es requerido',
                  })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                  style={{
                    borderColor: errors.billingAddress?.department
                      ? '#EF4444'
                      : '#EBEA E8',
                    backgroundColor: '#FFFFFF',
                    color: '#594246',
                  }}
                >
                  <option value="">Selecciona un departamento</option>
                  <option value="lima">Lima</option>
                  <option value="arequipa">Arequipa</option>
                  <option value="cusco">Cusco</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Botones de navegación */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleGoToDelivery}
            className="flex-1 border-2 font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
            style={{ borderColor: '#EBEA E8', color: '#594246' }}
          >
            Atrás
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex-1 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#F2778D' }}
          >
            {isSubmitting ? 'Procesando...' : 'Revisar Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPaymentForm;
