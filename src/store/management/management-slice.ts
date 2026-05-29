import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}


interface ManagementState {
    users: User[];

    loading: boolean;
    total: number;
    currentPage: number;
    rowsPerPage: number;
}

const initialState: ManagementState = {
    users: [],

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

        setPageManagement: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setRowsPerPageManagement: (state, action: PayloadAction<number>) => {
            state.rowsPerPage = action.payload;
        },

    },
});

export const {
    setLoadingManagement,
    setUsers,
    setPageManagement,
    setRowsPerPageManagement
} = managementSlice.actions;
