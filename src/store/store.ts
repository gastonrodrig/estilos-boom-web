import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth";
import { 
  clientCompanySlice, 
  clientPersonSlice, 
  clientProfileSlice 
} from "./client";
import { productSlice } from "./product";
import { categorySlice } from "./category";
import { cartSlice } from "./cart";
import checkoutReducer from "./extra/checkout-slice";
import mockCartReducer from "./extra/mock-cart-slice";

// Configuración del store
export const store = configureStore({
  reducer: {
    // Slices de autenticación
    auth: authSlice.reducer,

    // Slices de cliente
    clientCompany: clientCompanySlice.reducer,
    clientPerson: clientPersonSlice.reducer,
    clientProfile: clientProfileSlice.reducer,

    product: productSlice.reducer,
    category: categorySlice.reducer,
    cart: cartSlice.reducer,
    checkout: checkoutReducer,
    mockCart: mockCartReducer,
  },
});

// Tipos para el store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
