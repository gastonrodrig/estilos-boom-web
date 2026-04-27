'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { OrderSummary } from '@/components/organisms/order-summary';
import { CartItem } from '@/core/models/cart';

const CheckoutSummaryCard: React.FC = () => {
  // Obtener items del mockCart de Redux (para testing)
  const { items } = useSelector((state: RootState) => state.mockCart);

  // Reutilizar el componente OrderSummary sin mostrar el botón (solo resumen)
  return <OrderSummary items={items as CartItem[]} showButton={false} />;
};

export default CheckoutSummaryCard;
