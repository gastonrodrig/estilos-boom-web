'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { useClientPersonStore } from '@/hooks'; // 👈 Importamos el store
import { CheckoutFormValues, DeliveryMethod } from '@/models/checkout';
import { useAppSelector } from '@/store';
import { AddressInput } from '@models';
import { Loader2 } from 'lucide-react';

const CheckoutDeliveryMethodForm: React.FC = () => {
  const { handleGoToPayment, handleGoToShipping } = useCheckoutStore();
  const { startLoadingMyAddresses } = useClientPersonStore(); // 👈 Usamos la función

  const { status } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';

  const { control, watch, formState: { isSubmitting } } = useFormContext<CheckoutFormValues>();

  const [savedAddresses, setSavedAddresses] = useState<AddressInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const formValues = watch() as any;
  const selectedDeliveryMethod = formValues.selectedDeliveryMethod;
  const selectedAddressId = formValues.selectedAddressId;

  // 🚀 FETCH LIMPIO
  useEffect(() => {
    if (isAuthenticated) {
      const fetchAddresses = async () => {
        setIsLoading(true);
        const data = await startLoadingMyAddresses(); // ✨ Magia
        setSavedAddresses(data);
        setIsLoading(false);
      };
      fetchAddresses();
    }
  }, [isAuthenticated]);

  // Lógica de visualización
  let displayAddress = "Selecciona una dirección";

  if (isAuthenticated && savedAddresses.length > 0 && selectedAddressId !== undefined) {
    const activeAddr = savedAddresses[Number(selectedAddressId)];
    if (activeAddr) {
      displayAddress = `${activeAddr.address_line}, ${activeAddr.district}, ${activeAddr.department}`;
    }
  } else if (formValues.address) {
    displayAddress = `${formValues.address}, ${formValues.district}, ${formValues.department}`;
  }

  const deliveryMethods: DeliveryMethod[] = [
    { id: 'store', name: 'Recojo en Tienda', description: 'Tienda física', price: 0, estimatedDays: 0 },
    { id: 'point', name: 'Punto de Encuentro', description: 'Estaciones del tren', price: 3, estimatedDays: 2 },
    { id: 'motorized', name: 'Total Motorizado', description: 'Entrega a domicilio', price: 10, estimatedDays: 1 },
    { id: 'province', name: 'Provincia - Shalom', description: 'Envío a todo el Perú', price: 15, estimatedDays: 3 },
  ];

  const handleNext = () => {
    if (selectedDeliveryMethod) handleGoToPayment();
  };

  return (
    <div className="rounded-sm p-8 border border-[#594246]/30 space-y-6">
      {/* ... (El resto del JSX se mantiene exactamente igual que en la respuesta anterior) ... */}
      <div>
        <h2 className="text-[25px] font-semibold mb-2 text-[#594246]">Método de Entrega</h2>
        <p className="text-sm text-[#827D7D]">Selecciona cómo deseas recibir tu pedido</p>
      </div>

      <button
        type="button"
        onClick={handleGoToShipping}
        className="w-full border-2 rounded-sm p-4 text-left transition-all bg-[#F2D0D3]/30 border-[#F2B6C1] hover:opacity-80"
      >
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] text-[#594246]">Dirección de Entrega</p>
            {isLoading ? (
              <div className="flex items-center gap-2 mt-1">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-xs text-gray-400">Cargando detalles...</span>
              </div>
            ) : (
              <p className="text-sm mt-1 truncate capitalize text-[#827D7D]">
                {displayAddress.toLowerCase()}
              </p>
            )}
          </div>
          <svg className="w-5 h-5 text-[#F2778D] shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      </button>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#594246] mb-2">Opciones de Entrega*</label>
        <Controller
          name="selectedDeliveryMethod"
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <div className="space-y-3">
              {deliveryMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => onChange(method)}
                  className={`border-2 rounded-sm p-4 cursor-pointer transition-all ${
                    value?.id === method.id ? "border-[#F2B6C1] bg-[#F2D0D3]/30" : "border-[#594246]/10 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${value?.id === method.id ? "border-[#F2778D] bg-[#F2778D]" : "border-gray-200"}`}>
                      {value?.id === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#594246]">{method.name}</p>
                      <p className="text-sm text-[#827D7D]">{method.description}</p>
                    </div>
                    <p className="font-bold text-[#594246]">{method.price === 0 ? 'GRATIS' : `S/ ${method.price.toFixed(2)}`}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button type="button" onClick={handleGoToShipping} className="flex-1 border bg-[#FAF9F6] font-semibold py-3 rounded-full text-[#594246]">Atrás</button>
        <button type="button" onClick={handleNext} disabled={!selectedDeliveryMethod || isSubmitting} className="flex-1 bg-[#F2B6C1] text-black font-semibold py-3 rounded-full disabled:opacity-50">Siguiente: Pago</button>
      </div>
    </div>
  );
};

export default CheckoutDeliveryMethodForm;