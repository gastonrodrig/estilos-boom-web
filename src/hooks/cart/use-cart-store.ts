"use client";

import { useCallback, useMemo, useRef } from "react";
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

  const loadInFlightRef = useRef(false);
  const mergeInFlightRef = useRef(false);

  const isAuth = Boolean(authUid) || authStatus === "authenticated";
  const isAuthChecking = authStatus === "checking";
  const isClearlyGuest = authStatus === "not-authenticated" && !authUid;

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
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;

    try {
      if (isAuthChecking) return;

      if (!isAuth) {
        if (!isClearlyGuest) return;
        setReduxCart(readLocal(GUEST_STORAGE_KEY));
        return;
      }

      const config = await getAuthConfig();
      if (!config) return;

      const { data } = await cartApi.get<CartResponse>("/", config);
      setReduxCart((data.items ?? []) as CartItemWithStock[]);
    } catch {
      // no-op
    } finally {
      loadInFlightRef.current = false;
    }
  }, [getAuthConfig, isAuth, isAuthChecking, isClearlyGuest, setReduxCart]);

  const addItem = useCallback(
    async (item: CartItemWithStock) => {
      if (!item.size || !item.color) return;

      const maxStock =
        typeof item.stock === "number" && item.stock >= 0
          ? item.stock
          : Number.MAX_SAFE_INTEGER;

      if (item.quantity <= 0) return;

      if (!isAuth) {
        const current = readLocal(GUEST_STORAGE_KEY);
        const found = current.find((x) => sameItem(x, item));

        const next = found
          ? current.map((x) => {
              if (!sameItem(x, item)) return x;
              const desired = x.quantity + item.quantity;
              return { ...x, stock: item.stock, quantity: Math.min(desired, maxStock) };
            })
          : [{ ...item, quantity: Math.min(item.quantity, maxStock) }, ...current];

        writeLocal(GUEST_STORAGE_KEY, next);
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
    [getAuthConfig, isAuth, setReduxCart],
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
        const current = readLocal(GUEST_STORAGE_KEY);
        const next =
          safeQty <= 0
            ? current.filter((x) => !sameItem(x, payload))
            : current
                .map((x) => (sameItem(x, payload) ? { ...x, quantity: safeQty } : x))
                .filter((x) => x.quantity > 0);

        writeLocal(GUEST_STORAGE_KEY, next);
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
    [getAuthConfig, isAuth, items, setReduxCart],
  );

  const removeItem = useCallback(
    async (productId: string, size: string, color: string) => {
      if (!size || !color) return;

      const payload: RemoveCartItemPayload = { productId, size, color };

      if (!isAuth) {
        const next = readLocal(GUEST_STORAGE_KEY).filter((x) => !sameItem(x, payload));
        writeLocal(GUEST_STORAGE_KEY, next);
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
    [getAuthConfig, isAuth, setReduxCart],
  );

  const mergeLocalCartToRemote = useCallback(async () => {
    if (mergeInFlightRef.current) return;
    if (!isAuth) return;

    mergeInFlightRef.current = true;

    try {
      const mergedGuestItems = readLocal(GUEST_STORAGE_KEY).reduce<CartItemWithStock[]>(
        (acc, item) => {
          if (!item.size || !item.color || item.quantity <= 0) return acc;

          const idx = acc.findIndex((x) => sameItem(x, item));
          if (idx === -1) {
            acc.push({ ...item });
            return acc;
          }

          const prev = acc[idx];
          const maxStock =
            typeof prev.stock === "number" && prev.stock >= 0
              ? prev.stock
              : typeof item.stock === "number" && item.stock >= 0
                ? item.stock
                : Number.MAX_SAFE_INTEGER;

          acc[idx] = {
            ...prev,
            stock: prev.stock ?? item.stock,
            quantity: Math.min(prev.quantity + item.quantity, maxStock),
          };

          return acc;
        },
        [],
      );

      if (!mergedGuestItems.length) return;

      const config = await getAuthConfig();
      if (!config) return;

      await cartApi.post("/merge", { items: mergedGuestItems.map(toApiItem) }, config);

      removeLocal(GUEST_STORAGE_KEY);

      const { data } = await cartApi.get<CartResponse>("/", config);
      setReduxCart((data.items ?? []) as CartItemWithStock[]);
    } catch {
      // no-op
    } finally {
      mergeInFlightRef.current = false;
    }
  }, [getAuthConfig, isAuth, setReduxCart]);

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
