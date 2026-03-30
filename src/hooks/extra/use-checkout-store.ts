'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  goToShippingStep,
  goToDeliveryStep,
  goToPaymentStep,
  goToReviewStep,
  setCheckoutStep,
  resetCheckout,
} from '@/store/extra/checkout-slice';
import { CheckoutStep } from '@/models/checkout';

export const useCheckoutStore = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector((state: RootState) => state.checkout.currentStep);

  const isShippingStep = currentStep === 'shipping';
  const isDeliveryStep = currentStep === 'delivery';
  const isPaymentStep = currentStep === 'payment';
  const isReviewStep = currentStep === 'review';

  const handleGoToShipping = () => dispatch(goToShippingStep());
  const handleGoToDelivery = () => dispatch(goToDeliveryStep());
  const handleGoToPayment = () => dispatch(goToPaymentStep());
  const handleGoToReview = () => dispatch(goToReviewStep());
  const handleSetStep = (step: CheckoutStep) => dispatch(setCheckoutStep(step));
  const handleReset = () => dispatch(resetCheckout());

  return {
    currentStep,
    isShippingStep,
    isDeliveryStep,
    isPaymentStep,
    isReviewStep,
    handleGoToShipping,
    handleGoToDelivery,
    handleGoToPayment,
    handleGoToReview,
    handleSetStep,
    handleReset,
  };
};
