'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAppSelector } from '@/store';
import { useClientPersonStore } from '@/hooks';
import { CheckoutFormValues } from '@/core/models/checkout';
import { AddressInput } from '@models';
import toast from 'react-hot-toast';

export const useOrderSubmission = () => {
  const { watch } = useFormContext<CheckoutFormValues>();
  const formData = watch();

  const { status, firstName, lastName } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';

  const { startLoadingMyAddresses } = useClientPersonStore();
  const [savedAddresses, setSavedAddresses] = useState<AddressInput[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchAddresses = async () => {
        setIsLoadingAddresses(true);
        const data = await startLoadingMyAddresses();
        setSavedAddresses(data);
        setIsLoadingAddresses(false);
      };
      fetchAddresses();
    }
  }, [isAuthenticated]);

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

  const submitOrder = async () => {
    try {
      const orderPayload = {
        customer: {
          firstName: displayFirstName,
          lastName: displayLastName,
          email: formData.email,
          phone: formData.phone,
          isAuthenticated: isAuthenticated,
        },
        shipping: {
          address: displayAddress,
          district: displayDistrict,
          department: displayDepartment,
          postalCode: formData.postalCode || null,
          method: formData.selectedDeliveryMethod?.id,
          shippingCost: formData.selectedDeliveryMethod?.price,
        },
        payment: {
          method: formData.paymentMethod,
          billingSameAsShipping: formData.billingSameAsShipping,
        },
        wantsNewsletter: formData.wantsNews,
        createdAt: new Date().toISOString(),
      };

      console.log("🚀 PREPARANDO ENVÍO A ESTILOS BOOM...");
      console.table({
        "👤 Cliente": `${orderPayload.customer.firstName} ${orderPayload.customer.lastName}`,
        "📍 Destino": `${orderPayload.shipping.address} (${orderPayload.shipping.district})`,
        "🚚 Método": orderPayload.shipping.method,
        "💰 Total Envío": `S/ ${orderPayload.shipping.shippingCost}`,
        "💳 Pago": orderPayload.payment.method
      });
      console.log("📦 PAYLOAD FINAL PARA API:", orderPayload);

      // TODO: Cuando exista el módulo real de pedidos/ventas, reemplazar esta simulación por llamada al endpoint real.
      // Retornamos true temporalmente para no bloquear el flujo visual (UI) y permitir pruebas de Checkout -> Confirmación.
      
      return true;
    } catch (error) {
      console.error("Error creating order:", error);
      return false;
    }
  };

  return {
    submitOrder,
    isLoadingAddresses,
    displayFirstName,
    displayLastName,
    displayAddress,
    displayDistrict,
    displayDepartment,
  };
};
