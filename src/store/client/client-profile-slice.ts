import { createSlice } from "@reduxjs/toolkit";
import { ClientProfileState } from "@types";

const initialState: ClientProfileState = {
  loadingClientProfile: false,
};

export const clientProfileSlice = createSlice({
  name: "clientProfile",
  initialState,
  reducers: {
    setLoadingClientProfile(state) {
      state.loadingClientProfile = true;
    },
    stopLoadingClientProfile(state) {
      state.loadingClientProfile = false;
    },
  },
});

export const {
  setLoadingClientProfile,
  stopLoadingClientProfile,
} = clientProfileSlice.actions;
