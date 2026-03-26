import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Category, CategoryState, RefreshCategoriesPayload } from "@models";

const initialState: CategoryState = {
  categories: [],
  selected: null,
  total: 0,
  loading: false,
};

export const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    refreshCategories: (
      state,
      action: PayloadAction<RefreshCategoriesPayload>
    ) => {
      const { items, total } = action.payload;
      state.categories = items;
      state.total = total;
      state.loading = false;
    },

    selectedCategory: (state, action: PayloadAction<Category>) => {
      state.selected = action.payload;
    },

    setLoadingCategory: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  refreshCategories,
  selectedCategory,
  setLoadingCategory,
} = categorySlice.actions;