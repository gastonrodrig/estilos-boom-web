'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { CheckoutFormValues, DeliveryMethod } from '@/models/checkout';

const CheckoutDeliveryMethodForm: React.FC = () => {
  const { handleGoToPayment, handleGoToShipping } = useCheckoutStore();
  const { control, watch, formState: { isSubmitting } } = useFormContext<CheckoutFormValues>();

  const selectedDeliveryMethod = watch('selectedDeliveryMethod');
  const address = watch('address');
  const district = watch('district');
  const department = watch('department');
  const postalCode = watch('postalCode');

  const displayAddress = `${address}, ${district}, ${department} ${postalCode ? `(${postalCode})` : ''}`;

  // Mock de métodos de entrega
  const deliveryMethods: DeliveryMethod[] = [
    {
      id: '1',
      name: 'Entrega a Domicilio',
      description: 'Entrega en 3-5 días hábiles',
      price: 0,
      estimatedDays: 5,
    },
    {
      id: '2',
      name: 'Entrega Rápida',
      description: 'Entrega en 1-2 días hábiles',
      price: 15,
      estimatedDays: 2,
    },
    {
      id: '3',
      name: 'Retiro en Tienda',
      description: 'Retira tu pedido mañana',
      price: 0,
      estimatedDays: 1,
    },
  ];

  const handleNext = () => {
    if (selectedDeliveryMethod) {
      handleGoToPayment();
    }
  };

  return (
    <div className=" rounded-sm p-8 border border-[#594246]/30 space-y-6">
      <div>
        <h2 className="text-[25px] font-semibold mb-2" style={{ color: '#594246' }}>
          Método de Entrega
        </h2>
        <p className="text-sm" style={{ color: '#827D7D' }}>
          Selecciona cómo deseas recibir tu pedido
        </p>
      </div>

      {/* Botón para editar dirección */}
      <button
        type="button"
        onClick={handleGoToShipping}
        className="w-full border-2 rounded-sm p-4 text-left  transition-opacity bg-[#F2D0D3]/30"
        style={{ borderColor: '#F2B6C1' }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-[15px]" style={{ color: '#594246' }}>
              Dirección de Entrega
            </p>
            <p className="text-sm mt-1 truncate capitalize" style={{ color: '#827D7D' }}>
              {displayAddress.toLowerCase()}
            </p>
          </div>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: '#F2778D' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
      </button>

      {/* Métodos de entrega */}
      <div className="space-y-3">
        <label className="block text-sm font-medium " style={{ color: '#594246', marginBottom: '12px' }}>
          Opciones de Entrega*
        </label>

        <Controller
          name="selectedDeliveryMethod"
          control={control}
          rules={{ required: 'Debes seleccionar un método de entrega' }}
          render={({ field: { value, onChange } }) => (
            <div className="space-y-3">
              {deliveryMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => onChange(method)}
                  // Quitamos el bg fijo del className y lo hacemos todo condicional
                  className={`border-2 rounded-sm p-4 cursor-pointer transition-all duration-200 ${
                    value?.id === method.id
                      ? "border-[#F2B6C1] bg-[#F2D0D3]/30 shadow-sm" // Estado Seleccionado
                      : "border-[#594246]/30 bg-white hover:border-[#594246]/70" // Estado Normal
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Círculo del Radio Button */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors duration-200 ${
                        value?.id === method.id
                          ? "border-[#F2778D] bg-[#F2778D]" // Seleccionado
                          : "border-gray-300 bg-transparent" // No seleccionado
                      }`}
                    >
                      {value?.id === method.id && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-[16px] text-[#594246]">
                        {method.name}
                      </p>
                      <p className="text-sm mt-1 text-[#827D7D]">
                        {method.description}
                      </p>
                      <p className="text-[11px] mt-1 text-[#827D7D] font-medium uppercase tracking-wider">
                        Estimado: {method.estimatedDays} día(s)
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`font-semibold ${value?.id === method.id ? "text-[#F2778D]" : "text-[#594246]"}`}>
                        {method.price === 0 ? 'GRATIS' : `S/ ${method.price.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        />
      </div>

      {/* Botones de navegación */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={handleGoToShipping}
          className="flex-1 border bg-[#FAF9F6] font-semibold py-3 rounded-full hover:bg-[#EBEAE8] transition-colors "
          style={{ color: '#594246' }}
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedDeliveryMethod || isSubmitting}
          className="flex-1 border  text-black font-semibold py-3 rounded-full  hover:bg-[#F2778D]/80 bg-[#F2B6C1] transition-colors  "
          
        >
          {isSubmitting ? 'Cargando...' : 'Siguiente: Pago'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutDeliveryMethodForm;
