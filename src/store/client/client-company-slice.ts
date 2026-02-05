import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ClientCompany,
  ClientCompanyState,
  RefreshClientsCompanyPayload,
} from "@types";

const initialState: ClientCompanyState = {
  clientsCompany: [],
  selected: null,
  total: 0,
  currentPage: 0,
  rowsPerPage: 5,
  loading: false,
};

export const clientCompanySlice = createSlice({
  name: "clientCompany",
  initialState,
  reducers: {
    refreshClientsCompany: (
      state,
      action: PayloadAction<RefreshClientsCompanyPayload>
    ) => {
      const { items, total, page } = action.payload;
      state.clientsCompany = items;
      state.total = total;
      state.currentPage = page;
      state.loading = false;
    },

    selectedClientCompany: (state, action: PayloadAction<ClientCompany>) => {
      state.selected = action.payload;
    },

    setLoadingClientCompany: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setPageClientCompany: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setRowsPerPageClientCompany: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
    },
  },
});

export const {
  refreshClientsCompany,
  selectedClientCompany,
  setLoadingClientCompany,
  setPageClientCompany,
  setRowsPerPageClientCompany,
} = clientCompanySlice.actions;
