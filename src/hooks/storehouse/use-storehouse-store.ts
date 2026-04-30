"use client";

import { useCallback, useMemo, useState } from "react";
import { storehouseApi } from "@api";
import {
  useAppDispatch,
  useAppSelector,
  refreshStorehouseOrders,
  setSelectedStorehouseOrder,
  refreshStorehouseSuppliers,
  refreshStorehouseSupplierRanking,
  refreshStorehouseMovements,
  setLoadingStorehouse,
  setStorehouseError,
  setPageStorehouse,
  setRowsPerPageStorehouse,
} from "@store";
import {
  CreatePurchaseOrderModelInput,
  HttpError,
  OrderStatus,
  PurchaseOrder,
  UpdateOrderStatusModelInput,
  mapInventoryMovement,
  mapPurchaseOrder,
  mapSupplier,
} from "@models";
import { getAuthConfig, getAuthConfigWithParams } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";

type SafeRequestConfig = Record<string, unknown>;

export const useStorehouseStore = () => {
  const dispatch = useAppDispatch();
  const {
    purchaseOrders,
    selectedOrder,
    suppliers,
    supplierRanking,
    movements,
    total,
    loading,
    currentPage,
    rowsPerPage,
    error,
  } = useAppSelector((state) => state.storehouse);

  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const getFriendlyErrorMessage = useCallback((error: unknown, fallbackMessage: string) => {
    const httpError = error as HttpError;
    const rawMessage = String(httpError.response?.data?.message ?? "");
    return rawMessage || fallbackMessage;
  }, []);

  const getOptionalToken = useCallback(async () => {
    try {
      return await getFirebaseAuthToken();
    } catch {
      return null;
    }
  }, []);

  const getConfig = useCallback(
    async (params?: Record<string, unknown>): Promise<SafeRequestConfig> => {
      const token = await getOptionalToken();
      if (token && params) return getAuthConfigWithParams({ token, params }) as SafeRequestConfig;
      if (token) return getAuthConfig({ token }) as SafeRequestConfig;
      return params ? { params } : {};
    },
    [getOptionalToken]
  );

  // 🔥 AQUÍ ESTÁ LA MAGIA: El Wrapper que recicla la lógica repetida
  const executeRequest = useCallback(
    async <T>(requestFn: () => Promise<T>, errorMessage: string): Promise<T | null> => {
      dispatch(setLoadingStorehouse(true));
      dispatch(setStorehouseError(null));
      try {
        return await requestFn();
      } catch (error: unknown) {
        const friendly = getFriendlyErrorMessage(error, errorMessage);
        dispatch(setStorehouseError(friendly));
        toast.error(friendly);
        return null;
      } finally {
        dispatch(setLoadingStorehouse(false));
      }
    },
    [dispatch, getFriendlyErrorMessage]
  );

  // 👇 Mira lo limpios que quedan ahora los llamados a la API 👇

  const startLoadingPurchaseOrders = useCallback(async () => {
    const result = await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.get("/purchase-orders", config);
      const items = Array.isArray(data) ? data.map((row) => mapPurchaseOrder(row as Record<string, unknown>)) : [];
      
      dispatch(refreshStorehouseOrders({ items, total: items.length, page: currentPage }));
      return true;
    }, "No se pudieron cargar las ordenes de compra.");
    
    return result ?? false;
  }, [dispatch, executeRequest, getConfig, currentPage]);

  const startLoadingPurchaseOrderById = useCallback(async (id: string) => {
    return await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.get(`/purchase-orders/${id}`, config);
      const mapped = mapPurchaseOrder(data as Record<string, unknown>);
      
      dispatch(setSelectedStorehouseOrder(mapped));
      return mapped;
    }, "No se pudo cargar el detalle de la orden.");
  }, [dispatch, executeRequest, getConfig]);

  const startLoadingSuppliers = useCallback(async () => {
    const result = await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.get("/suppliers", config);
      const items = Array.isArray(data) ? data.map((row) => mapSupplier(row as Record<string, unknown>)) : [];
      
      dispatch(refreshStorehouseSuppliers(items));
      return true;
    }, "No se pudieron cargar los proveedores.");

    return result ?? false;
  }, [dispatch, executeRequest, getConfig]);

  const startLoadingSupplierRanking = useCallback(async (limit = 5) => {
    const result = await executeRequest(async () => {
      const config = await getConfig({ limit });
      const { data } = await storehouseApi.get("/suppliers/ranking", config);
      const ranking = Array.isArray(data) ? data.map((row) => mapSupplier(row as Record<string, unknown>)) : [];
      
      dispatch(refreshStorehouseSupplierRanking(ranking));
      return true;
    }, "No se pudo cargar el ranking de proveedores.");

    return result ?? false;
  }, [dispatch, executeRequest, getConfig]);

  const startLoadingInventoryMovements = useCallback(async () => {
    const result = await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.get("/inventory/movements", config);
      const items = Array.isArray(data) ? data.map((row) => mapInventoryMovement(row as Record<string, unknown>)) : [];
      
      dispatch(refreshStorehouseMovements(items));
      return true;
    }, "No se pudieron cargar los movimientos de inventario.");

    return result ?? false;
  }, [dispatch, executeRequest, getConfig]);

  const startCreatePurchaseOrder = useCallback(async (payload: CreatePurchaseOrderModelInput) => {
    const result = await executeRequest(async () => {
      const config = await getConfig();
      await storehouseApi.post("/purchase-orders", payload, config);

      // Refrescamos todo lo necesario tras crear la orden
      await Promise.all([
        startLoadingPurchaseOrders(),
        startLoadingSupplierRanking(5),
        startLoadingInventoryMovements(),
      ]);

      toast.success("Orden de compra creada correctamente.");
      return true;
    }, "No se pudo crear la orden de compra.");

    return result ?? false;
  }, [executeRequest, getConfig, startLoadingPurchaseOrders, startLoadingSupplierRanking, startLoadingInventoryMovements]);

  const startUpdateOrderStatus = useCallback(async (id: string, payload: UpdateOrderStatusModelInput) => {
    const result = await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.patch(`/purchase-orders/${id}/status`, payload, config);
      const mapped = mapPurchaseOrder(data as Record<string, unknown>);

      dispatch(setSelectedStorehouseOrder(mapped));
      
      await Promise.all([
        startLoadingPurchaseOrders(),
        startLoadingSupplierRanking(5),
        startLoadingInventoryMovements(),
      ]);

      toast.success("Estado de la orden actualizado correctamente.");
      return true;
    }, "No se pudo actualizar la orden.");

    return result ?? false;
  }, [dispatch, executeRequest, getConfig, startLoadingPurchaseOrders, startLoadingSupplierRanking, startLoadingInventoryMovements]);

  const startConfirmOrder = useCallback(async (id: string) => {
    return startUpdateOrderStatus(id, { status: "CONFIRMADO" as OrderStatus });
  }, [startUpdateOrderStatus]);

  const startReceiveOrder = useCallback(async (id: string, payload: Omit<UpdateOrderStatusModelInput, "status">) => {
    return startUpdateOrderStatus(id, { ...payload, status: "RECIBIDO" as OrderStatus });
  }, [startUpdateOrderStatus]);

  const setSelectedOrder = useCallback((order: PurchaseOrder | null) => {
    dispatch(setSelectedStorehouseOrder(order));
  }, [dispatch]);

  const setPageGlobal = useCallback((page: number) => {
    dispatch(setPageStorehouse(page));
  }, [dispatch]);

  const setRowsPerPageGlobal = useCallback((rows: number) => {
    dispatch(setRowsPerPageStorehouse(rows));
    dispatch(setPageStorehouse(0));
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return purchaseOrders;

    const normalized = searchTerm.toLowerCase().trim();
    return purchaseOrders.filter((orderItem) => {
      const supplierName = typeof orderItem.id_supplier === "object"
        ? orderItem.id_supplier.name_company ?? ""
        : orderItem.id_supplier;
      return [orderItem.order_number, orderItem.status, supplierName].join(" ").toLowerCase().includes(normalized);
    });
  }, [purchaseOrders, searchTerm]);

  return {
    purchaseOrders,
    filteredOrders,
    selectedOrder,
    suppliers,
    supplierRanking,
    movements,
    total,
    loading,
    currentPage,
    rowsPerPage,
    error,
    searchTerm,
    orderBy,
    order,

    setSearchTerm,
    setOrderBy,
    setOrder,
    setSelectedOrder,
    setPageGlobal,
    setRowsPerPageGlobal,

    startLoadingPurchaseOrders,
    startLoadingPurchaseOrderById,
    startLoadingSuppliers,
    startLoadingSupplierRanking,
    startLoadingInventoryMovements,
    startCreatePurchaseOrder,
    startUpdateOrderStatus,
    startConfirmOrder,
    startReceiveOrder,
  };
};