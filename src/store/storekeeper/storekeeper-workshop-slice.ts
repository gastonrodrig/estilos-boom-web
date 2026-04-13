import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RefreshWorkshopsPayload, Workshop, WorkshopState } from "@/core/models/storekeeper/storekeeper.models";

const initialState: WorkshopState = {
  workshops: [],
  selected: null,
  total: 0,
  currentPage: 0,
  rowsPerPage: 5,
  loading: false,
};

export const storekeeperWorkshopSlice = createSlice({
  name: "workshop",
  initialState,
  reducers: {
    refreshWorkshops: (
      state,
      action: PayloadAction<RefreshWorkshopsPayload>
    ) => {
      const { items, total, page } = action.payload;
      state.workshops = items;
      state.total = total;
      state.currentPage = page;
      state.loading = false;
    },

    selectedWorkshop: (state, action: PayloadAction<Workshop | null>) => {
      state.selected = action.payload;
    },

    setLoadingWorkshop: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setPageWorkshop: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setRowsPerPageWorkshop: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
    },
  },
});

export const {
  refreshWorkshops,
  selectedWorkshop,
  setLoadingWorkshop,
  setPageWorkshop,
  setRowsPerPageWorkshop,
} = storekeeperWorkshopSlice.actions;
