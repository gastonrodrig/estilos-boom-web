"use client";

import { useCallback, useMemo } from "react";
import { cartApi } from "@api";
import { getFirebaseAuthToken } from "@helpers";
import {
  CartItem,
  CartResponse,
  RemoveCartItemPayload,
  UpdateQuantityPayload,
} from "@models";
import { setCart, useAppDispatch, useAppSelector } from "@store";

type CartItemWithStock = CartItem & { stock?: number };

const GUEST_STORAGE_KEY = "boom_cart_guest";
const getStorageKey = (uid: string | null) => `boom_cart_${uid ?? "guest"}`;

const sameItem = (
  a: { productId: string; size: string; color: string },
  b: { productId: string; size: string; color: string },
) =>
  a.productId === b.productId &&
  a.size === b.size &&
  a.color === b.color;

const readLocal = (key: string): CartItemWithStock[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartItemWithStock[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocal = (key: string, items: CartItemWithStock[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
};

const removeLocal = (key: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
};

const toApiItem = (item: CartItemWithStock) => ({
  productId: item.productId,
  quantity: item.quantity,
  size: item.size,
  color: item.color,
});

export const useCartStore = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items) as CartItemWithStock[];
  const authUid = useAppSelector((state) => state.auth.uid);
  const authStatus = useAppSelector((state) => state.auth.status);

  const isAuth = Boolean(authUid) || authStatus === "authenticated";
  const localKey = getStorageKey(authUid);

  const setReduxCart = useCallback(
    (next: CartItemWithStock[]) => dispatch(setCart(next)),
    [dispatch],
  );

  const getAuthConfig = useCallback(async () => {
    const token = await getFirebaseAuthToken();
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const loadCart = useCallback(async () => {
    if (!isAuth) {
      setReduxCart(readLocal(localKey));
      return;
    }

    try {
      const config = await getAuthConfig();
      if (!config) {
        setReduxCart(readLocal(localKey));
        return;
      }

      const { data } = await cartApi.get<CartResponse>("/", config);
      setReduxCart((data.items ?? []) as CartItemWithStock[]);
    } catch {
      // no-op
    }
  }, [getAuthConfig, isAuth, localKey, setReduxCart]);

  const addItem = useCallback(
    async (item: CartItemWithStock) => {
      // obligatorio: talla y color
      if (!item.size || !item.color) return;

      const maxStock =
        typeof item.stock === "number" && item.stock >= 0
          ? item.stock
          : Number.MAX_SAFE_INTEGER;

      if (item.quantity <= 0) return;

      if (!isAuth) {
        const current = readLocal(localKey);
        const found = current.find((x) => sameItem(x, item));

        const next = found
          ? current.map((x) => {
              if (!sameItem(x, item)) return x;
              const desired = x.quantity + item.quantity;
              return { ...x, stock: item.stock, quantity: Math.min(desired, maxStock) };
            })
          : [{ ...item, quantity: Math.min(item.quantity, maxStock) }, ...current];

        writeLocal(localKey, next);
        setReduxCart(next);
        return;
      }

      try {
        const config = await getAuthConfig();
        if (!config) return;

        const payload = {
          ...toApiItem(item),
          quantity: Math.min(item.quantity, maxStock),
        };

        const { data } = await cartApi.post<CartResponse>("/items", payload, config);
        setReduxCart((data.items ?? []) as CartItemWithStock[]);
      } catch {
        // no-op
      }
    },
    [getAuthConfig, isAuth, localKey, setReduxCart],
  );

  const updateQuantity = useCallback(
    async (productId: string, size: string, color: string, quantity: number) => {
      if (!size || !color) return;

      const currentItem = items.find((i) => sameItem(i, { productId, size, color }));
      const maxStock =
        currentItem && typeof currentItem.stock === "number" && currentItem.stock >= 0
          ? currentItem.stock
          : Number.MAX_SAFE_INTEGER;

      const safeQty = Math.max(0, Math.min(quantity, maxStock));
      const payload: UpdateQuantityPayload = { productId, size, color, quantity: safeQty };

      if (!isAuth) {
        const current = readLocal(localKey);
        const next =
          safeQty <= 0
            ? current.filter((x) => !sameItem(x, payload))
            : current
                .map((x) => (sameItem(x, payload) ? { ...x, quantity: safeQty } : x))
                .filter((x) => x.quantity > 0);

        writeLocal(localKey, next);
        setReduxCart(next);
        return;
      }

      try {
        const config = await getAuthConfig();
        if (!config) return;

        if (safeQty <= 0) {
          const removePayload: RemoveCartItemPayload = { productId, size, color };
          const { data } = await cartApi.delete<CartResponse>("/items", {
            ...config,
            data: removePayload,
          });
          setReduxCart((data.items ?? []) as CartItemWithStock[]);
          return;
        }

        const { data } = await cartApi.patch<CartResponse>("/items", payload, config);
        setReduxCart((data.items ?? []) as CartItemWithStock[]);
      } catch {
        // no-op
      }
    },
    [getAuthConfig, isAuth, items, localKey, setReduxCart],
  );

  const removeItem = useCallback(
    async (productId: string, size: string, color: string) => {
      if (!size || !color) return;

      const payload: RemoveCartItemPayload = { productId, size, color };

      if (!isAuth) {
        const next = readLocal(localKey).filter((x) => !sameItem(x, payload));
        writeLocal(localKey, next);
        setReduxCart(next);
        return;
      }

      try {
        const config = await getAuthConfig();
        if (!config) return;

        const { data } = await cartApi.delete<CartResponse>("/items", {
          ...config,
          data: payload,
        });
        setReduxCart((data.items ?? []) as CartItemWithStock[]);
      } catch {
        // no-op
      }
    },
    [getAuthConfig, isAuth, localKey, setReduxCart],
  );

  const mergeLocalCartToRemote = useCallback(async () => {
    if (!isAuth) return;

    const guestItems = readLocal(GUEST_STORAGE_KEY);
    if (!guestItems.length) return;

    try {
      const config = await getAuthConfig();
      if (!config) return;

      await cartApi.post("/merge", { items: guestItems.map(toApiItem) }, config);
      removeLocal(GUEST_STORAGE_KEY);
    } catch {
      // no-op
    }
  }, [getAuthConfig, isAuth]);

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
    mergeLocalCartToRemote,
  };
};