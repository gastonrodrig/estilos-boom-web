import {
	InventoryMovement,
	PurchaseOrder,
	PurchaseOrderItem,
	StorehouseSupplier,
} from "./storehouse.moduls";

const asString = (value: unknown) => (typeof value === "string" ? value : "");
const asNumber = (value: unknown, fallback = 0) => {
	const num = Number(value);
	return Number.isFinite(num) ? num : fallback;
};

export const mapSupplier = (raw: Record<string, unknown>): StorehouseSupplier => ({
	_id: asString(raw._id),
	name_company: asString(raw.name_company),
	ruc: asString(raw.ruc),
	contact_person: asString(raw.contact_person) || undefined,
	email: asString(raw.email) || undefined,
	phone: asString(raw.phone) || undefined,
	address: asString(raw.address) || undefined,
	status: Boolean(raw.status ?? true),
	rating: asNumber(raw.rating),
	total_orders: asNumber(raw.total_orders),
	on_time_delivery_rate: asNumber(raw.on_time_delivery_rate),
});

export const mapPurchaseOrderItem = (raw: Record<string, unknown>): PurchaseOrderItem => ({
	id_variant:
		typeof raw.id_variant === "object" && raw.id_variant !== null
			? asString((raw.id_variant as Record<string, unknown>)._id)
			: asString(raw.id_variant),
	quantity: asNumber(raw.quantity),
	unit_cost: asNumber(raw.unit_cost),
	available_stock:
		typeof raw.id_variant === "object" && raw.id_variant !== null
			? asNumber((raw.id_variant as Record<string, unknown>).available_stock)
			: undefined,
	variant_label:
		typeof raw.id_variant === "object" && raw.id_variant !== null
			? `${asString((raw.id_variant as Record<string, unknown>).size)} / ${asString(
					(raw.id_variant as Record<string, unknown>).color
			  )}`
			: undefined,
});

export const mapPurchaseOrder = (raw: Record<string, unknown>): PurchaseOrder => ({
	_id: asString(raw._id),
	order_number: asString(raw.order_number),
	id_supplier:
		typeof raw.id_supplier === "object" && raw.id_supplier !== null
			? {
					_id: asString((raw.id_supplier as Record<string, unknown>)._id),
					name_company: asString((raw.id_supplier as Record<string, unknown>).name_company) || undefined,
				}
			: asString(raw.id_supplier),
	id_worker:
		typeof raw.id_worker === "object" && raw.id_worker !== null
			? {
					_id: asString((raw.id_worker as Record<string, unknown>)._id),
					first_name: asString((raw.id_worker as Record<string, unknown>).first_name) || undefined,
					last_name: asString((raw.id_worker as Record<string, unknown>).last_name) || undefined,
				}
			: asString(raw.id_worker),
	items: Array.isArray(raw.items)
		? raw.items.map((item) => mapPurchaseOrderItem(item as Record<string, unknown>))
		: [],
	total_amount: asNumber(raw.total_amount),
	status: asString(raw.status) as PurchaseOrder["status"],
	notes: asString(raw.notes) || undefined,
	delivery_date_estimated: asString(raw.delivery_date_estimated) || undefined,
	delivery_date_actual: asString(raw.delivery_date_actual) || undefined,
	quality_rating: raw.quality_rating != null ? asNumber(raw.quality_rating) : undefined,
	shipping_cost: raw.shipping_cost != null ? asNumber(raw.shipping_cost) : undefined,
	created_at: asString(raw.created_at) || undefined,
	updated_at: asString(raw.updated_at) || undefined,
});

export const mapInventoryMovement = (raw: Record<string, unknown>): InventoryMovement => ({
	_id: asString(raw._id),
	id_variant:
		typeof raw.id_variant === "object" && raw.id_variant !== null
			? asString((raw.id_variant as Record<string, unknown>)._id)
			: asString(raw.id_variant),
	id_purchase_order:
		typeof raw.id_purchase_order === "object" && raw.id_purchase_order !== null
			? asString((raw.id_purchase_order as Record<string, unknown>)._id)
			: asString(raw.id_purchase_order) || undefined,
	id_worker:
		typeof raw.id_worker === "object" && raw.id_worker !== null
			? asString((raw.id_worker as Record<string, unknown>)._id)
			: asString(raw.id_worker),
	type: asString(raw.type) as InventoryMovement["type"],
	quantity: asNumber(raw.quantity),
	previous_stock: asNumber(raw.previous_stock),
	new_stock: asNumber(raw.new_stock),
	reason: asString(raw.reason) || undefined,
	created_at: asString(raw.created_at) || undefined,
});
