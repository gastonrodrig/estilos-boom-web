import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface WorkerRow {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    document_type: string;
    document_number: string;
    system_role: string;        // rol del sistema (User.role)
    worker_role: string;        // posición/cargo del Worker (Worker.role)
    employment_status: string;
    hired_at: string;
}

export interface RoleRow {
    id: string;
    name: string;
    user_count: number;
    is_active: boolean;
    permissions: string[];
}

interface ManagementState {
    users: User[];
    workers: WorkerRow[];
    roles: RoleRow[];
    loading: boolean;
    loadingWorkers: boolean;
    loadingRoles: boolean;
    total: number;
    currentPage: number;
    rowsPerPage: number;
}

const initialState: ManagementState = {
    users: [],
    workers: [],
    roles: [],
    loading: false,
    loadingWorkers: false,
    loadingRoles: false,
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
        setLoadingWorkers: (state, action: PayloadAction<boolean>) => {
            state.loadingWorkers = action.payload;
        },
        setLoadingRoles: (state, action: PayloadAction<boolean>) => {
            state.loadingRoles = action.payload;
        },
        setUsers: (state, action: PayloadAction<{ items: User[]; total: number; page: number }>) => {
            state.users = action.payload.items;
            state.total = action.payload.total;
            state.currentPage = action.payload.page;
        },
        setWorkers: (state, action: PayloadAction<WorkerRow[]>) => {
            state.workers = action.payload;
        },
        setRoles: (state, action: PayloadAction<RoleRow[]>) => {
            state.roles = action.payload;
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
    setLoadingWorkers,
    setLoadingRoles,
    setUsers,
    setWorkers,
    setRoles,
    setPageManagement,
    setRowsPerPageManagement,
} = managementSlice.actions;
