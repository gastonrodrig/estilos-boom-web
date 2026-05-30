'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useCheckoutStore, useOrderSubmission } from '@/hooks/extra';
import { CheckoutFormValues } from '@/core/models/checkout';
import { AddressInput } from '@models';
import { Loader2 } from 'lucide-react';

const CheckoutReviewStep: React.FC = () => {
  const { handleGoToPayment } = useCheckoutStore();
  const { watch } = useFormContext<CheckoutFormValues>();
  const formData = watch();

  const {
    submitOrder,
    isLoadingAddresses,
    displayFirstName,
    displayLastName,
    displayAddress,
    displayDistrict,
    displayDepartment,
  } = useOrderSubmission();

  const onSubmitOrder = async () => {
    const success = await submitOrder();
    // 🔴 PRÓXIMO PASO:
    // if(success) router.push('/checkout/success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 border-[#594246]/30 rounded-sm p-8 border border-[#EBEAE8] shadow-sm">
      {/* ... (El resto del JSX se mantiene exactamente igual que en la respuesta anterior) ... */}
      <header>
        <h2 className="text-[25px] font-semibold text-[#594246] pb-3">Revisa tu Pedido</h2>
        <p className="text-sm text-[#827D7D]">Confirmar que todo esté correcto antes de finalizar.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 border border-[#EBEAE8] rounded-sm bg-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-[#594246] uppercase text-[15px]">Envío</h3>
            <button className="text-[#F2778D] text-xs underline">Editar</button>
          </div>
          
          {isLoadingAddresses ? (
             <div className="flex items-center gap-2 py-2">
               <Loader2 size={14} className="animate-spin text-[#F2778D]" />
               <span className="text-xs text-gray-400">Cargando datos...</span>
             </div>
          ) : (
            <>
              <p className="text-sm text-[#594246] font-medium capitalize">
                {displayFirstName} {displayLastName}
              </p>
              <p className="text-sm text-[#827D7D] capitalize">
                {displayAddress}, {displayDistrict}
              </p>
              <p className="text-sm text-[#827D7D] capitalize">
                {displayDepartment}
              </p>
            </>
          )}
        </div>

        <div className="p-5 border border-[#EBEAE8] rounded-sm bg-white">
          <h3 className="font-bold text-[#594246] uppercase text-[15px] mb-3">Método de Pago</h3>
          <p className="text-sm text-[#594246]">
            {formData.paymentMethod === 'card' ? '💳 Tarjeta de Crédito / Débito' : '📱 Pago QR / Transferencia'}
          </p>
          <p className="text-xs text-[#827D7D] mt-2 font-medium">
            Envío: {formData.selectedDeliveryMethod?.name} - S/ {formData.selectedDeliveryMethod?.price}
          </p>
        </div>
      </div>

      <div className="pt-6 flex flex-col items-center gap-4">
        <p className="text-[11px] text-gray-400 text-center max-w-md">
          Al hacer clic en "Finalizar Compra", aceptas nuestros términos y condiciones. Tu pago será procesado de forma segura.
        </p>
        
        <button
          onClick={onSubmitOrder}
          disabled={isLoadingAddresses}
          className="w-full md:w-2/3 py-5 bg-[#F2778D] text-white rounded-full font-bold text-lg hover:bg-[#F2778D]/90 shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          Finalizar Compra y Pagar
        </button>
        
        <button onClick={handleGoToPayment} className="text-[#594246] text-sm font-medium hover:underline opacity-70">
          Regresar a Pago
        </button>
      </div>
    </div>
  );
};

export default CheckoutReviewStep;