import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Payment, PaymentMetrics } from "@models";

interface PaymentState {
  loading: boolean;
  items: Payment[];
  metrics: PaymentMetrics | null;
}

const initialState: PaymentState = {
  loading: false,
  items: [],
  metrics: null,
};

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setItems(state, action: PayloadAction<Payment[]>) {
      state.items = action.payload;
    },
    setMetrics(state, action: PayloadAction<PaymentMetrics>) {
      state.metrics = action.payload;
    },
    removePayment(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { setLoading, setItems, setMetrics, removePayment } = paymentSlice.actions;
