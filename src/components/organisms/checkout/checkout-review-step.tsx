'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { useClientPersonStore } from '@/hooks'; // 👈 Importamos el store
import { CheckoutFormValues } from '@/core/models/checkout';
import { useAppSelector } from '@/store';
import { AddressInput } from '@models';
import { Loader2 } from 'lucide-react';

const CheckoutReviewStep: React.FC = () => {
  const { handleGoToPayment } = useCheckoutStore();
  const { startLoadingMyAddresses } = useClientPersonStore(); // 👈 Usamos la función

  const { watch } = useFormContext<CheckoutFormValues>();
  const formData = watch(); 
  
  const { status, firstName, lastName } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';

  const [savedAddresses, setSavedAddresses] = useState<AddressInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Lógica de visualización cruzada
  const displayFirstName = isAuthenticated && firstName ? firstName : formData.firstName;
  const displayLastName = isAuthenticated && lastName ? lastName : formData.lastName;

  let displayAddress = formData.address || "";
  let displayDistrict = formData.district || "";
  let displayDepartment = formData.department || "";

  if (isAuthenticated && savedAddresses.length > 0 && formData.selectedAddressId !== undefined) {
    const activeAddr = savedAddresses[Number(formData.selectedAddressId)];
    if (activeAddr) {
      displayAddress = activeAddr.address_line || "";
      displayDistrict = activeAddr.district || "";
      displayDepartment = activeAddr.department || "";
    }
  }

  const onSubmitOrder = () => {
    // 🏗️ CONSTRUCCIÓN DEL PAYLOAD FINAL
    // Este es el objeto que viajará a tu API en NestJS
    const orderPayload = {
      // Datos del Cliente
      customer: {
        firstName: displayFirstName,
        lastName: displayLastName,
        email: formData.email,
        phone: formData.phone,
        isAuthenticated: isAuthenticated,
        
      },
      // Datos de Envío (Consolidados)
      shipping: {
        address: displayAddress,
        district: displayDistrict,
        department: displayDepartment,
        postalCode: formData.postalCode || null,
        method: formData.selectedDeliveryMethod?.id,
        shippingCost: formData.selectedDeliveryMethod?.price,
      },
      // Datos de Pago
      payment: {
        method: formData.paymentMethod,
        billingSameAsShipping: formData.billingSameAsShipping,
        // Si el pago es con tarjeta, aquí irían los tokens (no los datos planos por seguridad)
      },
      // Metadata
      wantsNewsletter: formData.wantsNews,
      createdAt: new Date().toISOString(),
    };

    console.log("🚀 PREPARANDO ENVÍO A ESTILOS BOOM...");
    
    // 1. Log en tabla para lectura rápida
    console.table({
      "👤 Cliente": `${orderPayload.customer.firstName} ${orderPayload.customer.lastName}`,
      "📍 Destino": `${orderPayload.shipping.address} (${orderPayload.shipping.district})`,
      "🚚 Método": orderPayload.shipping.method,
      "💰 Total Envío": `S/ ${orderPayload.shipping.shippingCost}`,
      "💳 Pago": orderPayload.payment.method
    });

    // 2. Log del JSON REAL (Lo que copiarías a Postman para probar el backend)
    console.log("📦 PAYLOAD FINAL PARA API:", orderPayload);

    // 🔴 PRÓXIMO PASO:
    // const success = await startCreatingOrder(orderPayload);
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
          
          {isLoading ? (
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
          disabled={isLoading}
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