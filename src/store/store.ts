import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth";
import { 
  clientCompanySlice, 
  clientPersonSlice, 
  clientProfileSlice 
} from "./client";

// Configuración del store
export const store = configureStore({
  reducer: {
    // Slices de autenticación
    auth: authSlice.reducer,

    // Slices de cliente
    clientCompany: clientCompanySlice.reducer,
    clientPerson: clientPersonSlice.reducer,
    clientProfile: clientProfileSlice.reducer,
  },
});

// Tipos para el store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
