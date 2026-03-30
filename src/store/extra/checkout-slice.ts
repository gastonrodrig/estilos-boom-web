import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CheckoutState, CheckoutStep } from '@/models/checkout';

const initialState: CheckoutState = {
  currentStep: 'shipping',
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCheckoutStep: (state, action: PayloadAction<CheckoutStep>) => {
      state.currentStep = action.payload;
    },
    goToShippingStep: (state) => {
      state.currentStep = 'shipping';
    },
    goToDeliveryStep: (state) => {
      state.currentStep = 'delivery';
    },
    goToPaymentStep: (state) => {
      state.currentStep = 'payment';
    },
    goToReviewStep: (state) => {
      state.currentStep = 'review';
    },
    resetCheckout: (state) => {
      state.currentStep = 'shipping';
    },
  },
});

export const {
  setCheckoutStep,
  goToShippingStep,
  goToDeliveryStep,
  goToPaymentStep,
  goToReviewStep,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
