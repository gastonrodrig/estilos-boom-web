"use client";

import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { cartApi } from "@api";
import {
	addItemLocal,
	removeItemLocal,
	setCart,
	updateQuantityLocal,
	useAppDispatch,
	useAppSelector,
} from "@store";
import { CartItem, CartResponse } from "@models";

export const useCartStore = () => {
	const dispatch = useAppDispatch();
	const items = useAppSelector((state) => state.cart.items);

	const loadCart = useCallback(async () => {
		try {
			const { data } = await cartApi.get<CartResponse>("");
			dispatch(setCart(data.items ?? []));
		} catch {
			toast.error("No se pudo cargar el carrito");
		}
	}, [dispatch]);

	const addItem = useCallback(
		async (item: CartItem) => {
			try {
				await cartApi.post("/add", item);
				dispatch(addItemLocal(item));
			} catch {
				toast.error("No se pudo agregar el producto");
			}
		},
		[dispatch],
	);

	const updateQuantity = useCallback(
		async (productId: string, quantity: number) => {
			try {
				if (quantity <= 0) {
					await cartApi.delete(`/item/${productId}`);
					dispatch(removeItemLocal(productId));
					return;
				}

				await cartApi.patch("/item", { productId, quantity });
				dispatch(updateQuantityLocal({ productId, quantity }));
			} catch {
				toast.error("No se pudo actualizar la cantidad");
			}
		},
		[dispatch],
	);

	const removeItem = useCallback(
		async (productId: string) => {
			try {
				await cartApi.delete(`/item/${productId}`);
				dispatch(removeItemLocal(productId));
			} catch {
				toast.error("No se pudo eliminar el producto");
			}
		},
		[dispatch],
	);

	const total = useMemo(
		() => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
		[items],
	);

	return {
		items,
		total,
		loadCart,
		addItem,
		updateQuantity,
		removeItem,
	};
};
