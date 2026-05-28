'use client';

import React, { useEffect } from 'react';
import { useCartStore } from '@/hooks';
import { useFormContext } from 'react-hook-form';
import { CheckoutFormValues } from '@/core/models/checkout';
import { OrderSummary } from '@/components/organisms/order-summary';

const CheckoutSummaryCard: React.FC = () => {
  const { items, loadCart } = useCartStore();
  const { watch } = useFormContext<CheckoutFormValues>();
  const selectedDeliveryMethod = watch('selectedDeliveryMethod');

  // 3. Tip de Ingenieria: Aseguramos que la data este cargada
  // por si el usuario entra directamente a la URL de /checkout sin pasar por /cart
  useEffect(() => {
    if (items.length === 0) {
      loadCart();
    }
  }, [items.length, loadCart]);

  // 4. Renderizamos el resumen con la data real
  return <OrderSummary items={items} showButton={false} deliveryCost={selectedDeliveryMethod?.price} deliveryName={selectedDeliveryMethod?.name} />;
};

export default CheckoutSummaryCard;
