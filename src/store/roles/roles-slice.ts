import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  Role,
  RoleState,
  RefreshRolesPayload,
} from '@/core/models/roles'

const initialState: RoleState = {
  roles: [],
  selected: null,
  total: 0,
  currentPage: 0,
  rowsPerPage: 5,
  totalPages: 0,
  loading: false,
}

export const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    refreshRoles: (
      state,
      action: PayloadAction<RefreshRolesPayload>
    ) => {
      const { items, total, page, perPage, totalPages } = action.payload

      state.roles = items
      state.total = total
      state.currentPage = page - 1
      state.rowsPerPage = perPage
      state.totalPages = totalPages
      state.loading = false
    },

    selectedRole: (state, action: PayloadAction<Role | null>) => {
      state.selected = action.payload
    },

    setLoadingRoles: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    setPageRoles: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },

    setRowsPerPageRoles: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload
      state.currentPage = 0
    },
  },
})

export const {
  refreshRoles,
  selectedRole,
  setLoadingRoles,
  setPageRoles,
  setRowsPerPageRoles,
} = rolesSlice.actions

export default rolesSlice.reducer
