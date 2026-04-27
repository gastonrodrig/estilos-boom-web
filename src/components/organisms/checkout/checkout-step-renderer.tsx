'use client';

import React from 'react';
import { CheckoutStep } from '@/models/checkout';
import {
  CheckoutShippingForm,
  CheckoutDeliveryMethodForm,
  CheckoutPaymentForm,
  CheckoutReviewStep
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
      return <CheckoutReviewStep />;
    default:
      return null;
  }
};

export default CheckoutStepRenderer;
