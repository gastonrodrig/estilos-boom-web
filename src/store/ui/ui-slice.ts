import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UiState } from "@types";

// Estado inicial
export const initialState: UiState = {
  snackbar: {
    open: false,
    message: "",
  },
};

// UI Slice
export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showSnackbar: (state, action: PayloadAction<{ message: string }>) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload.message;
    },

    closeSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
});

// Exportar las acciones
export const { showSnackbar, closeSnackbar } = uiSlice.actions;