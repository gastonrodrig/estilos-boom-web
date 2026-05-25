import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
	CartItem,
	CartState,
	RemoveCartItemPayload,
	UpdateQuantityPayload,
} from "@models";

const initialState: CartState = {
	items: [],
};

const isSameCartItem = (
	item: CartItem,
	payload: { productId: string; size: string; color: string },
) =>
	item.productId === payload.productId &&
	item.size === payload.size &&
	item.color === payload.color;

export const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		setCart: (state, action: PayloadAction<CartItem[]>) => {
			state.items = action.payload;
		},
		addItemLocal: (state, action: PayloadAction<CartItem>) => {
			const incoming = action.payload;
			const found = state.items.find(
				(item) =>
					item.productId === incoming.productId &&
					item.size === incoming.size &&
					item.color === incoming.color,
			);

			if (found) {
				found.quantity += incoming.quantity;
				return;
			}

			state.items.push(incoming);
		},
		updateQuantityLocal: (
			state,
			action: PayloadAction<UpdateQuantityPayload>,
		) => {
			const { productId, size, color, quantity } = action.payload;
			const found = state.items.find((item) =>
				isSameCartItem(item, { productId, size, color }),
			);

			if (!found) return;

			found.quantity = quantity;

			if (found.quantity <= 0) {
				state.items = state.items.filter(
					(item) => !isSameCartItem(item, { productId, size, color }),
				);
			}
		},
		removeItemLocal: (state, action: PayloadAction<RemoveCartItemPayload>) => {
			state.items = state.items.filter(
				(item) => !isSameCartItem(item, action.payload),
			);
		},
		clearCart: (state) => {
			state.items = [];
		},
	},
});

export const {
	setCart,
	addItemLocal,
	updateQuantityLocal,
	removeItemLocal,
	clearCart,
} = cartSlice.actions;
