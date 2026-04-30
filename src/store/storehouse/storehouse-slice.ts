import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
	InventoryMovement,
	PurchaseOrder,
	RefreshStorehouseOrdersPayload,
	StorehouseState,
	StorehouseSupplier,
} from "@models";

const initialState: StorehouseState = {
	purchaseOrders: [],
	selectedOrder: null,
	suppliers: [],
	supplierRanking: [],
	movements: [],
	total: 0,
	currentPage: 0,
	rowsPerPage: 5,
	loading: false,
	error: null,
};

export const storehouseSlice = createSlice({
	name: "storehouse",
	initialState,
	reducers: {
		refreshStorehouseOrders: (
			state,
			action: PayloadAction<RefreshStorehouseOrdersPayload>
		) => {
			const { items, total, page } = action.payload;
			state.purchaseOrders = items;
			state.total = total;
			state.currentPage = page;
			state.loading = false;
		},
		setSelectedStorehouseOrder: (state, action: PayloadAction<PurchaseOrder | null>) => {
			state.selectedOrder = action.payload;
		},
		refreshStorehouseSuppliers: (state, action: PayloadAction<StorehouseSupplier[]>) => {
			state.suppliers = action.payload;
		},
		refreshStorehouseSupplierRanking: (state, action: PayloadAction<StorehouseSupplier[]>) => {
			state.supplierRanking = action.payload;
		},
		refreshStorehouseMovements: (state, action: PayloadAction<InventoryMovement[]>) => {
			state.movements = action.payload;
		},
		setLoadingStorehouse: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setStorehouseError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		setPageStorehouse: (state, action: PayloadAction<number>) => {
			state.currentPage = action.payload;
		},
		setRowsPerPageStorehouse: (state, action: PayloadAction<number>) => {
			state.rowsPerPage = action.payload;
		},
	},
});

export const {
	refreshStorehouseOrders,
	setSelectedStorehouseOrder,
	refreshStorehouseSuppliers,
	refreshStorehouseSupplierRanking,
	refreshStorehouseMovements,
	setLoadingStorehouse,
	setStorehouseError,
	setPageStorehouse,
	setRowsPerPageStorehouse,
} = storehouseSlice.actions;
