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
    // --- NUEVOS CAMPOS PARA PRE-ORDERS ---
    prePurchaseOrders: [], 
    selectedPreOrder: null,
    // -------------------------------------
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
        refreshStorehouseOrders: (state, action: PayloadAction<RefreshStorehouseOrdersPayload>) => {
            const { items, total, page } = action.payload;
            state.purchaseOrders = items;
            state.total = total;
            state.currentPage = page;
            state.loading = false;
        },
        setSelectedStorehouseOrder: (state, action: PayloadAction<PurchaseOrder | null>) => {
            state.selectedOrder = action.payload;
        },
        
        // 🔥 NUEVOS REDUCERS PARA PRE-PURCHASE ORDERS 🔥
        refreshStorehousePreOrders: (state, action: PayloadAction<any[]>) => {
            state.prePurchaseOrders = action.payload;
            state.loading = false;
        },
        setSelectedStorehousePreOrder: (state, action: PayloadAction<any | null>) => {
            state.selectedPreOrder = action.payload;
        },
        // ---------------------------------------------

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
		onUpdatePreOrder: (state, action: PayloadAction<any>) => {
			// 1. Actualizamos el item dentro de la lista general
			state.prePurchaseOrders = state.prePurchaseOrders.map((order) =>
				order._id === action.payload._id ? action.payload : order
			);

			// 2. Si esa orden es la que tenemos seleccionada, también la actualizamos
			if (state.selectedPreOrder?._id === action.payload._id) {
				state.selectedPreOrder = action.payload;
			}
		},
    },
});

export interface TransferItemCart {
  id_product: string;
  product_name: string;
  category_name: string;
  image: string;
  variants: {
    id_variant: string;
    size: string;
    color_name: string;
    color_hex: string;
    sku_variant: string;
    max_available: number; // Stock disponible real en Almacén Central
    quantity_to_move: number; // Lo que el usuario digita para trasladar
  }[];
}

// IMPORTANTE: Exportar las nuevas acciones aquí para que "@store" las reconozca
export const {
    refreshStorehouseOrders,
    setSelectedStorehouseOrder,
    refreshStorehousePreOrders,      // <--- Exportada
    setSelectedStorehousePreOrder,   // <--- Exportada
    refreshStorehouseSuppliers,
    refreshStorehouseSupplierRanking,
    refreshStorehouseMovements,
    setLoadingStorehouse,
    setStorehouseError,
    setPageStorehouse,
    setRowsPerPageStorehouse,
	onUpdatePreOrder,
} = storehouseSlice.actions;