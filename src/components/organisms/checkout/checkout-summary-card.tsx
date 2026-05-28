'use client';

import React,{useEffect} from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { OrderSummary } from '@/components/organisms/order-summary';
import { CartItem } from '@/core/models/cart';
import { useCartStore } from '@/hooks';
import { useFormContext } from 'react-hook-form';
import { CheckoutFormValues } from '@/core/models/checkout';

const CheckoutSummaryCard: React.FC = () => {

  const { items, loadCart } = useCartStore();

  // 3. Tip de Ingeniería: Aseguramos que la data esté cargada
  // por si el usuario entra directamente a la URL de /checkout sin pasar por /cart
  useEffect(() => {
    if (items.length === 0) {
      loadCart();
    }
  }, [items.length, loadCart]);

  const { watch } = useFormContext<CheckoutFormValues>();
  const selectedDeliveryMethod = watch('selectedDeliveryMethod');

  // 4. Renderizamos el resumen con la data real
  return <OrderSummary items={items} showButton={false} deliveryCost={selectedDeliveryMethod?.price} deliveryName={selectedDeliveryMethod?.name} />;
};

export default CheckoutSummaryCard;
