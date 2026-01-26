import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ClientPerson,
  ClientPersonState,
  RefreshClientsPersonPayload,
} from "@types";

const initialState: ClientPersonState = {
  clientsPerson: [],
  selected: null,
  total: 0,
  currentPage: 0,
  rowsPerPage: 5,
  loading: false,
};

export const clientPersonSlice = createSlice({
  name: "clientPerson",
  initialState,
  reducers: {
    refreshClientsPerson: (
      state,
      action: PayloadAction<RefreshClientsPersonPayload>
    ) => {
      const { items, total, page } = action.payload;
      state.clientsPerson = items;
      state.total = total;
      state.currentPage = page;
      state.loading = false;
    },

    selectedClientPerson: (state, action: PayloadAction<ClientPerson>) => {
      state.selected = action.payload;
    },

    setLoadingClientPerson: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setPageClientPerson: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setRowsPerPageClientPerson: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
    },
  },
});

export const {
  refreshClientsPerson,
  selectedClientPerson,
  setLoadingClientPerson,
  setPageClientPerson,
  setRowsPerPageClientPerson,
} = clientPersonSlice.actions;
