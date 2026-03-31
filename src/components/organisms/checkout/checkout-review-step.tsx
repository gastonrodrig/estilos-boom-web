'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { CheckoutFormValues } from '@/models/checkout';
import Image from 'next/image';

const CheckoutReviewStep: React.FC = () => {
  const {  handleGoToPayment } = useCheckoutStore();
  const { watch } = useFormContext<CheckoutFormValues>();

  // 1. Vigilamos toda la data consolidada
  const formData = watch(); 

  const onSubmitOrder = () => {
    console.log("🚀 Enviando Pedido a Estilos Boom...");
    
    // Mostramos la data en una tabla para que sea más fácil de leer en la consola
    console.table({
      Cliente: `${formData.firstName} ${formData.lastName}`,
      Email: formData.email,
      Telefono: formData.phone,
      Direccion: `${formData.address}, ${formData.district}`,
      MetodoPago: formData.paymentMethod,
      Delivery: formData.selectedDeliveryMethod?.name,
      CostoEnvio: `S/ ${formData.selectedDeliveryMethod?.price}`
    });

    // Log del objeto completo para copiar y pegar en Postman/Insomnia
    console.log("📦 Full JSON Data:", JSON.stringify(formData, null, 2));

    // Aquí llamarías a tu función del store para finalizar
    // handleCompleteOrder(); 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 border-[#594246]/30 rounded-sm p-8 border border-[#EBEAE8] shadow-sm">
      <header>
        <h2 className="text-[25px] font-semibold text-[#594246] pb-3">Revisa tu Pedido</h2>
        <p className="text-sm text-[#827D7D]">Confirmar que todo esté correcto antes de finalizar.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BLOQUE: ENVÍO */}
        <div className="p-5 border border-[#EBEAE8] rounded-sm bg-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-[#594246] uppercase text-[15px]">Envío</h3>
            <button onClick={() => {/* Volver al paso 1 */}} className="text-[#F2778D] text-xs underline">Editar</button>
          </div>
          <p className="text-sm text-[#594246] font-medium">{formData.firstName} {formData.lastName}</p>
          <p className="text-sm text-[#827D7D]">{formData.address}, {formData.district}</p>
          <p className="text-sm text-[#827D7D]">{formData.department}</p>
        </div>

        {/* BLOQUE: MÉTODO Y PAGO */}
        <div className="p-5 border border-[#EBEAE8] rounded-sm bg-white">
          <h3 className="font-bold text-[#594246] uppercase text-[15px] mb-3">Método de Pago</h3>
          <p className="text-sm text-[#594246]">
            {formData.paymentMethod === 'card' ? ' Tarjeta de Crédito' : ' Pago QR / Transferencia'}
          </p>
          <p className="text-xs text-[#827D7D] mt-1">
            {formData.selectedDeliveryMethod?.name} - S/ {formData.selectedDeliveryMethod?.price}
          </p>
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN FINAL */}
      <div className="pt-6 flex flex-col items-center gap-4">
        <p className="text-[11px] text-gray-400 text-center max-w-md">
          Al hacer clic en "Finalizar Compra", aceptas nuestros términos y condiciones. 
          Tu pago será procesado de forma segura.
        </p>
        
        <button
          onClick={onSubmitOrder} // 👈 Gatilla el log y la lógica de envío
          className="w-full md:w-2/3 py-5 bg-[#F2778D] text-white rounded-full font-bold text-lg hover:bg-[#F2778D]/90 shadow-lg transition-all active:scale-95"
        >
          Finalizar Compra y Pagar
        </button>
        
        <button 
          onClick={handleGoToPayment} 
          className="text-[#594246] text-sm font-medium hover:underline opacity-70"
        >
          Regresar a Pago
        </button>
      </div>
    </div>
  );
};
export default CheckoutReviewStep;