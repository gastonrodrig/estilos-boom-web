import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Interfaz local adaptable
export interface Supply {
  _id?: string;
  id?: string;
  name: string;
  unit: 'metros' | 'unidades' | 'rollos' | 'conos';
  is_active: boolean;
  used_in?: string;
  created_at?: string;
}

export interface SupplyState {
  supplies: Supply[];
  selected: Supply | null;
  total: number;
  loading: boolean;
}

interface RefreshSuppliesPayload {
  items: Supply[];
  total: number;
}

const initialState: SupplyState = {
  supplies: [],
  selected: null,
  total: 0,
  loading: false,
};

export const supplySlice = createSlice({
  name: "supply",
  initialState,
  reducers: {
    refreshSupplies: (state, action: PayloadAction<RefreshSuppliesPayload>) => {
      const { items, total } = action.payload;
      state.supplies = items;
      state.total = total;
      state.loading = false;
    },
    selectedSupply: (state, action: PayloadAction<Supply | null>) => {
      state.selected = action.payload;
    },
    setLoadingSupply: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  refreshSupplies,
  selectedSupply,
  setLoadingSupply,
} = supplySlice.actions;