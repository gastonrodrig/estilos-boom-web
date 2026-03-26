import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// Asumiendo que crearás estas interfaces en tus modelos
import { Product,ProductState,RefreshProductsPayload } from "@/core/models";

const initialState: ProductState = {
  products: [],
  selected: null,
  total: 0,
  currentPage: 0,
  rowsPerPage: 10,
  loading: false,
};

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    refreshProducts: (state, action: PayloadAction<RefreshProductsPayload>) => {
      const { items, total, page } = action.payload;
      state.products = items;
      state.total = total;
      state.currentPage = page;
      state.loading = false;
    },
    selectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selected = action.payload;
    },
    setLoadingProduct: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPageProduct: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setRowsPerPageProduct: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
    },
  },
});

export const {
  refreshProducts,
  selectedProduct,
  setLoadingProduct,
  setPageProduct,
  setRowsPerPageProduct,
} = productSlice.actions;