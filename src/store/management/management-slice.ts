import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface Role {
    id: string;
    name: string;
    permissions: string[];
}

interface ManagementState {
    users: User[];
    roles: Role[];
    loading: boolean;
    total: number;
    currentPage: number;
    rowsPerPage: number;
}

const initialState: ManagementState = {
    users: [],
    roles: [],
    loading: false,
    total: 0,
    currentPage: 0,
    rowsPerPage: 5,
};

export const managementSlice = createSlice({
    name: 'management',
    initialState,
    reducers: {
        setLoadingManagement: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setUsers: (state, action: PayloadAction<{ items: User[]; total: number; page: number }>) => {
            state.users = action.payload.items;
            state.total = action.payload.total;
            state.currentPage = action.payload.page;
        },
        setRoles: (state, action: PayloadAction<Role[]>) => {
            state.roles = action.payload;
        },
        setPageManagement: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setRowsPerPageManagement: (state, action: PayloadAction<number>) => {
            state.rowsPerPage = action.payload;
        },
        addRole: (state, action: PayloadAction<Role>) => {
            state.roles.push(action.payload);
        },
        updateRole: (state, action: PayloadAction<Role>) => {
            const index = state.roles.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.roles[index] = action.payload;
            }
        },
    },
});

export const {
    setLoadingManagement,
    setUsers,
    setRoles,
    setPageManagement,
    setRowsPerPageManagement,
    addRole,
    updateRole
} = managementSlice.actions;
