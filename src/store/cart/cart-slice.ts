import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, CartState, UpdateQuantityPayload } from "@models";

const initialState: CartState = {
	items: [],
};

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
			const { productId, quantity } = action.payload;
			const found = state.items.find((item) => item.productId === productId);

			if (!found) return;

			found.quantity = quantity;

			if (found.quantity <= 0) {
				state.items = state.items.filter((item) => item.productId !== productId);
			}
		},
		removeItemLocal: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter(
				(item) => item.productId !== action.payload,
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
