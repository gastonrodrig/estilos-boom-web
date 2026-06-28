'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/hooks';
import { useFormContext } from 'react-hook-form';
import { CheckoutFormValues } from '@/core/models/checkout';
import { OrderSummary } from '@/components/organisms/order-summary';

const CheckoutSummaryCard: React.FC = () => {
  const { items, loadCart } = useCartStore();
  const { watch } = useFormContext<CheckoutFormValues>();
  const selectedDeliveryMethod = watch('selectedDeliveryMethod');
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      const saved = sessionStorage.getItem('mp_order_total');
      if (saved) {
        setConfirmedTotal(parseFloat(saved));
      } else {
        loadCart();
      }
    }
  }, [items.length, loadCart]);

  if (confirmedTotal !== null && items.length === 0) {
    return <OrderSummary items={[]} showButton={false} deliveryCost={0} deliveryName="Confirmado" confirmedTotal={confirmedTotal} />;
  }

  return <OrderSummary items={items} showButton={false} deliveryCost={selectedDeliveryMethod?.price} deliveryName={selectedDeliveryMethod?.name} />;
};

export default CheckoutSummaryCard;
