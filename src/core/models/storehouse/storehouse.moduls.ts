export type OrderStatus = "PENDIENTE" | "CONFIRMADO" | "RECIBIDO" | "CANCELADO"|"COMPLETADA";

export interface StorehouseSupplier {
	_id: string;
	name_company: string;
	ruc: string;
	contact_person?: string;
	email?: string;
	phone?: string;
	address?: string;
	status: boolean;
	rating: number;
	total_orders: number;
	on_time_delivery_rate: number;
	category?: {
    name: string;
  };
  last_price?: string | number;
  description?: string;
}

export interface PurchaseOrderItem {
	id_variant: string;
	quantity: number;
	unit_cost: number;
	available_stock?: number;
	variant_label?: string;
}

export interface PurchaseOrderSupplierRef {
	_id: string;
	name_company?: string;
}

export interface PurchaseOrderWorkerRef {
	_id: string;
	first_name?: string;
	last_name?: string;
}

export interface PurchaseOrder {
	_id: string;
	order_number: string;
	id_supplier: PurchaseOrderSupplierRef;
	id_worker: string | PurchaseOrderWorkerRef;
	items: PurchaseOrderItem[];
	total_amount: number;
	status: OrderStatus;
	notes?: string;
	delivery_date_estimated?: string;
	delivery_date_actual?: string;
	quality_rating?: number;
	shipping_cost?: number;
	created_at?: string;
	updated_at?: string;
}

export interface InventoryMovement {
	_id: string;
	id_variant: string;
	id_purchase_order?: string;
	id_worker: string;
	type: "ENTRADA" | "SALIDA" | "AJUSTE";
	quantity: number;
	previous_stock: number;
	new_stock: number;
	reason?: string;
	created_at?: string;
}

export interface CreatePurchaseOrderModelInput {
	order_number: string;
	id_supplier: string;
	id_worker: string;
	items: PurchaseOrderItem[];
	total_amount: number;
	notes?: string;
	delivery_date_estimated?: string;
}

export interface UpdateOrderStatusModelInput {
	status: OrderStatus;
	delivery_date_actual?: string;
	id_worker_receiver?: string;
	quality_rating?: number;
	shipping_cost?: number;
}

export interface RefreshStorehouseOrdersPayload {
	items: PurchaseOrder[];
	total: number;
	page: number;
}

export interface StorehouseState {
	purchaseOrders: PurchaseOrder[];
	prePurchaseOrders: any[];
	selectedPreOrder: any | null;
	selectedOrder: PurchaseOrder | null;
	suppliers: StorehouseSupplier[];
	supplierRanking: StorehouseSupplier[];
	movements: InventoryMovement[];
	total: number;
	currentPage: number;
	rowsPerPage: number;
	loading: boolean;
	error: string | null;
}

export interface WarehouseStockApi {
	id_warehouse: {
		_id: string;
		name: string;
		code: string;
	} | string;
	id_variant: string;
	physical_stock: number;
	reserved_stock: number;
}

