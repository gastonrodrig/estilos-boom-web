import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, LoginPayload, ClientDataPayload } from "@/core/models";
import { ClientType } from "@/core/enums";

// Estado inicial
const initialState: AuthState = {
  status: "not-authenticated",
  id: null,
  uid: null,
  email: null,
  firstName: null,
  lastName: null,
  phone: null,
  documentType: null,
  documentNumber: null,
  role: null,
  clientType: null,
  needsPasswordChange: null,
  userStatus: null,
  photoURL: null,
  isExtraDataCompleted: false,
  companyData: null,
  suppressAccessDenied: false,
};

// Auth Slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login
    login: (state, { payload }: PayloadAction<LoginPayload>) => {
      if (payload.userStatus === "Inactivo") {
        return initialState;
      }

      state.id = payload.id;
      state.uid = payload.uid;
      state.email = payload.email;
      state.firstName = payload.firstName ?? null;
      state.lastName = payload.lastName ?? null;
      state.phone = payload.phone ?? null;
      state.documentType = payload.documentType ?? null;
      state.documentNumber = payload.documentNumber ?? null;
      state.role = payload.role;
      state.needsPasswordChange = payload.needsPasswordChange ?? null;
      state.userStatus = payload.userStatus;
      state.photoURL = payload.photoURL ?? null;
      state.isExtraDataCompleted = payload.isExtraDataCompleted;
      state.companyData = payload.companyData ?? null;

      state.clientType =
        payload.role === "Cliente"
          ? payload.clientType ?? null
          : null;

      state.status = payload.needsPasswordChange
        ? "first-login-password"
        : "authenticated";
    },

    // Logout
    logout: () => {
      return initialState;
    },

    setLogoutSuppression: (state, { payload }: PayloadAction<boolean>) => {
      state.suppressAccessDenied = payload;
    },

    checkingCredentials: (state) => {
      state.status = "checking";
    },

    authenticated: (state) => {
      state.status = "authenticated";
      state.needsPasswordChange = false;
    },

    sendingResetEmail: (state) => {
      state.status = "sending-reset-email";
    },

    resetEmailSent: (state) => {
      state.status = "reset-email-sent";
    },

    changingPassword: (state) => {
      state.status = "changing-password";
    },

    setClientData: (
      state,
      { payload }: PayloadAction<ClientDataPayload>
    ) => {
      state.phone = payload.phone;
      state.documentType = payload.documentType;
      state.documentNumber = payload.documentNumber;
      state.needsPasswordChange = false;
      state.isExtraDataCompleted = true;

      if (payload.clientType === ClientType.PERSON) {
        state.firstName = payload.firstName;
        state.lastName = payload.lastName;
        state.companyData = null;
      }

      if (payload.clientType === ClientType.COMPANY) {
        state.firstName = null;
        state.lastName = null;
        state.companyData = {
          companyName: payload.companyName,
          contactName: payload.contactName,
        };
      }
    },

    setClientProfile: (
      state,
      { payload }: PayloadAction<{ photoURL: string | null }>
    ) => {
      state.photoURL = payload.photoURL ?? null;
    },

    removeClientProfile: (state) => {
      state.photoURL = null;
    },
  },
});

// Exportar las acciones
export const {
  login,
  logout,
  setLogoutSuppression,
  checkingCredentials,
  authenticated,
  sendingResetEmail,
  resetEmailSent,
  changingPassword,
  setClientData,
  setClientProfile,
  removeClientProfile,
} = authSlice.actions;
