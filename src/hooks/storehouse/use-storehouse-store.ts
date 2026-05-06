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
  refreshStorehousePreOrders,
  setSelectedStorehousePreOrder,
  onUpdatePreOrder,
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
    prePurchaseOrders,
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


  const startLoadingPrePurchaseOrders = useCallback(async () => {
    return await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.get("/pre-purchase-orders", config);
      
      // Aquí podrías usar un mapPrePurchaseOrder si lo tienes en tus models
      dispatch(refreshStorehousePreOrders(data));
      return true;
    }, "No se pudieron cargar las pre-órdenes.");
  }, [dispatch, executeRequest, getConfig]);

  /**
   * 2. Iniciar una nueva Pre-orden (Multi-proveedor)
   * POST /pre-purchase-orders
   */
  const startCreatePrePurchaseOrder = useCallback(async (payload: any) => {
    return await executeRequest(async () => {
      const config = await getConfig();
      await storehouseApi.post("/pre-purchase-orders", payload, config);
      
      await startLoadingPrePurchaseOrders();
      toast.success("Solicitud de cotización iniciada.");
      return true;
    }, "No se pudo iniciar la pre-compra.");
  }, [executeRequest, getConfig, startLoadingPrePurchaseOrders]);

  /**
   * 3. Ver detalle de una OPP (Incluye los Ranking Scores)
   * GET /pre-purchase-orders/:id
   */
  const startLoadingPrePurchaseOrderById = useCallback(async (id: string) => {
    return await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.get(`/pre-purchase-orders/${id}`, config);
      
      dispatch(setSelectedStorehousePreOrder(data));
      return data;
    }, "No se pudo cargar el detalle de la pre-orden.");
  }, [dispatch, executeRequest, getConfig]);

  /**
   * 4. Cargar Cotización de un Proveedor (Dispara el Ranking en Backend)
   * PATCH /pre-purchase-orders/:id/quote
   */
  const startUpdateSupplierQuote = useCallback(async (id: string, payload: { id_supplier: string, items: any[] }) => {
    return await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.patch(`/pre-purchase-orders/${id}/quote`, payload, config);
      
      // Actualizamos el detalle para ver los nuevos ranking scores calculados
      dispatch(setSelectedStorehousePreOrder(data));
      dispatch(onUpdatePreOrder(data));
      toast.success("Cotización registrada. Ranking actualizado.");
      return true;
    }, "No se pudo registrar la cotización.");
  }, [dispatch, executeRequest, getConfig]);

  /**
   * 5. Seleccionar Ganador y Convertir a OC real
   * POST /pre-purchase-orders/:id/convert
   */
  const startSelectWinnerAndConvert = useCallback(async (id: string, supplierId: string, estimatedDate: string) => {
    return await executeRequest(async () => {
        const config = await getConfig();
        const payload = { 
            id_supplier: supplierId, 
            delivery_date_estimated: estimatedDate // <--- Agregado al payload
        };
        
        const { data } = await storehouseApi.post(`/pre-purchase-orders/${id}/convert`, payload, config);

        dispatch(onUpdatePreOrder(data));
        toast.success("Orden de Compra generada exitosamente.");
        return true;
    }, "Error al convertir la orden.");
}, [dispatch, executeRequest, getConfig]);

  const startCreateVariantQuickly = useCallback(async (payload: any) => {
  return await executeRequest(async () => {
    const config = await getConfig();
    const { data } = await storehouseApi.post("/products/variants", payload, config);
    return data; // Retorna la variante creada con su _id real
  }, "Error al registrar la nueva variante.");
}, [executeRequest, getConfig]);

const startInitalQualityCheck = useCallback(async (purchaseOrderId: string, preOrderId: string) => {
  return await executeRequest(async () => {
    const config = await getConfig();
    
    const { data } = await storehouseApi.patch(
      `/purchase-orders/${purchaseOrderId}/start-quality-check`, 
      { preOrderId }, // 👈 Enviamos el ID de la Pre-Orden aquí
      config
    );

    dispatch(onUpdatePreOrder(data.prePurchaseOrder)); 
    toast.success("Mercadería recibida. Iniciando control de calidad.");
    return true;
  }, "Error al iniciar el control de calidad.");
}, [dispatch, executeRequest, getConfig]);

/**
   * 6. Prolongar Fecha (Acuerdo con proveedor)
   * PATCH /purchase-orders/:id/extend
   */
  const extendOCDate = useCallback(async (id: string, newDate: string, reason: string) => {
  return await executeRequest(async () => {
    const config = await getConfig();
    
    // Esta es la ruta que habilitaremos en el back
    const { data } = await storehouseApi.patch(
      `/purchase-orders/${id}/extend`, 
      { newDate, reason }, 
      config
    );

    // Actualizamos la pre-orden en Redux con la nueva fecha y notas
    dispatch(onUpdatePreOrder(data.prePurchaseOrder));
    
    toast.success("Fecha de entrega actualizada correctamente.");
    return true;
  }, "No se pudo extender la fecha de entrega.");
}, [dispatch, executeRequest, getConfig]);



  /**
   * 7. Aprobar e Ingresar a Inventario (Fase Final)
   * PATCH /purchase-orders/:id/approve
   */
 // En useStorehouseStore.ts
const approveInventory = useCallback(async (id: string, rating: number) => {
  return await executeRequest(async () => {
    const config = await getConfig();
    
    const { data } = await storehouseApi.patch(
      `/purchase-orders/${id}/approve`, 
      { quality_rating: rating }, 
      config
    );

    // ✅ DEBUG: Imprime qué está llegando realmente
    console.log("Respuesta de approve:", data);

    // ✅ VALIDACIÓN DEFENSIVA: Solo hacer dispatch si el objeto existe
    if (data && data.prePurchaseOrder) {
        dispatch(onUpdatePreOrder(data.prePurchaseOrder));
    } else {
        // Si el back no mandó la data, recargamos toda la lista como plan B
        console.warn("Backend no devolvió prePurchaseOrder. Recargando la lista...");
        await startLoadingPrePurchaseOrders();
    }
    
    // Refrescamos los movimientos para ver la entrada en el Kardex
    await startLoadingInventoryMovements();

    toast.success("¡Mercadería ingresada al inventario con éxito!");
    return true;
  }, "Error al procesar el ingreso de mercadería.");
}, [dispatch, executeRequest, getConfig, startLoadingInventoryMovements, startLoadingPrePurchaseOrders]);

  const completedOrders = useMemo(() => {
    return purchaseOrders.filter(order => order.status === 'COMPLETADA');
  }, [purchaseOrders]);

  const startUpdatePreOrderStatus = useCallback(async (id: string, status: string) => {
    return await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.patch(`/pre-purchase-orders/${id}/status`, { status }, config);
      
      dispatch(onUpdatePreOrder(data));
      toast.success("Estado de producción actualizado.");
      return true;
    }, "No se pudo actualizar el estado de producción.");
  }, [dispatch, executeRequest, getConfig]);

  return {
    purchaseOrders,
    prePurchaseOrders,
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
    completedOrders,

    setSearchTerm,
    setOrderBy,
    setOrder,
    setSelectedOrder,
    setPageGlobal,
    setRowsPerPageGlobal,

    extendOCDate,
    approveInventory,
    startLoadingPurchaseOrders,
    startLoadingPurchaseOrderById,
    startLoadingSuppliers,
    startLoadingSupplierRanking,
    startLoadingInventoryMovements,
    startCreatePurchaseOrder,
    startUpdateOrderStatus,
    startConfirmOrder,
    startReceiveOrder,
    startLoadingPrePurchaseOrders,
    startCreatePrePurchaseOrder,
    startLoadingPrePurchaseOrderById,
    startUpdateSupplierQuote,
    startSelectWinnerAndConvert,
    startCreateVariantQuickly,
    startInitalQualityCheck,
    startUpdatePreOrderStatus,
  };
};