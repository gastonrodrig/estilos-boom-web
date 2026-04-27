'use client';

import React from 'react';
import { CheckoutStep } from '@/models/checkout';
import {
  CheckoutShippingForm,
  CheckoutDeliveryMethodForm,
  CheckoutPaymentForm,
} from './index';

interface CheckoutStepRendererProps {
  currentStep: CheckoutStep;
}

const CheckoutStepRenderer: React.FC<CheckoutStepRendererProps> = ({ currentStep }) => {
  switch (currentStep) {
    case 'shipping':
      return <CheckoutShippingForm />;
    case 'delivery':
      return <CheckoutDeliveryMethodForm />;
    case 'payment':
      return <CheckoutPaymentForm />;
    case 'review':
      return <div className="text-center p-8">Revisión de pedido (en construcción)</div>;
    default:
      return null;
  }
};

export default CheckoutStepRenderer;
