'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  goToShippingStep,
  goToPaymentStep,
  goToReviewStep,
  setCheckoutStep,
  resetCheckout,
} from '@/store/extra/checkout-slice';
import { CheckoutStep } from '@/core/models/checkout';

export const useCheckoutStore = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector((state: RootState) => state.checkout.currentStep);

  const isShippingStep = currentStep === 'shipping';
  const isPaymentStep = currentStep === 'payment';
  const isReviewStep = currentStep === 'review';

  const handleGoToShipping = () => dispatch(goToShippingStep());
  const handleGoToPayment = () => dispatch(goToPaymentStep());
  const handleGoToReview = () => dispatch(goToReviewStep());
  const handleSetStep = (step: CheckoutStep) => dispatch(setCheckoutStep(step));
  const handleReset = () => dispatch(resetCheckout());

  return {
    currentStep,
    isShippingStep,
    isPaymentStep,
    isReviewStep,
    handleGoToShipping,
    handleGoToPayment,
    handleGoToReview,
    handleSetStep,
    handleReset,
  };
};
