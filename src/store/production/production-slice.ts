import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProductionState {
    orders: any[];
    selectedOrder: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProductionState = {
    orders: [],
    selectedOrder: null,
    loading: false,
    error: null,
};

export const productionSlice = createSlice({
    name: "production",
    initialState,
    reducers: {
        setProductionOrders: (state, action: PayloadAction<any[]>) => {
            state.orders = action.payload;
            state.loading = false;
        },
        setSelectedProductionOrder: (state, action: PayloadAction<any | null>) => {
            state.selectedOrder = action.payload;
        },
        setLoadingProduction: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setProductionError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        updateProductionOrderInStore: (state, action: PayloadAction<any>) => {
            state.orders = state.orders.map((order) =>
                order._id === action.payload._id ? action.payload : order
            );
            if (state.selectedOrder?._id === action.payload._id) {
                state.selectedOrder = action.payload;
            }
        },
    },
});

export const {
    setProductionOrders,
    setSelectedProductionOrder,
    setLoadingProduction,
    setProductionError,
    updateProductionOrderInStore,
} = productionSlice.actions;
