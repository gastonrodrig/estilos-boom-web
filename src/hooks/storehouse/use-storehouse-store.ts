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
      const rawData: any[] = Array.isArray(data) ? data : [];
      // Redux recibe la versión mapeada (compatible con InventoryMovement tipado)
      const mapped = rawData.map((row) => mapInventoryMovement(row as Record<string, unknown>));
      dispatch(refreshStorehouseMovements(mapped));
      // El hook retorna los datos crudos para quien necesite los objetos populados (ej. Kárdex tab)
      return rawData;
    }, "No se pudieron cargar los movimientos de inventario.");

    return result ?? [];
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


  const startLoadingPrePurchaseOrders = useCallback(async (type?: string) => {
    return await executeRequest(async () => {
      const config = await getConfig();
      const url = type ? `/pre-purchase-orders?type=${type}` : "/pre-purchase-orders";
      const { data } = await storehouseApi.get(url, config);
      
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
  const startUpdateSupplierQuote = useCallback(async (id: string, payload: { id_agent: string, items: any[] }) => {
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
  const startSelectWinnerAndConvert = useCallback(async (id: string, agentId: string, estimatedDate: string) => {
    return await executeRequest(async () => {
        const config = await getConfig();
        const payload = { 
            id_agent: agentId, 
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
const approveInventory = useCallback(async (
    id: string, 
    rating: number, 
    auditNotes?: string,
    incidencesQty?: number // 👈 Enviamos las unidades dañadas/faltantes encontradas en la inspección
  ) => {
    return await executeRequest(async () => {
      const config = await getConfig();
      
      const payload = { 
        quality_rating: rating,
        observations: auditNotes || "Sin observaciones adicionales.",
        qty_incidences: incidencesQty || 0 // 👈 Mapea el campo extra para el Kardex
      };
      
      const { data } = await storehouseApi.patch(`/purchase-orders/${id}/approve`, payload, config);

      console.log("Respuesta de consolidación de inventario:", data);

      if (data && data.prePurchaseOrder) {
          dispatch(onUpdatePreOrder(data.prePurchaseOrder));
      } else {
          await startLoadingPrePurchaseOrders();
      }
      
      // Refrescamos automáticamente los movimientos globales para ver el nuevo Kardex
      await startLoadingInventoryMovements();

      toast.success("¡Control de calidad cerrado. Mercadería integrada al stock!");
      return true;
    }, "Error al procesar el ingreso de mercadería.");
  }, [dispatch, executeRequest, getConfig, startLoadingInventoryMovements, startLoadingPrePurchaseOrders]);

    const completedOrders = useMemo(() => {
      return purchaseOrders.filter(order => order.status === 'COMPLETADA');
    }, [purchaseOrders]);

    const getPurchaseOrderById = useCallback(async (id: string) => {
  try {
    // ⚠️ Asegúrate de que la ruta coincida con el @Controller del Back
    const { data } = await storehouseApi.get(`/purchase-orders/${id}`); 
    return data;
  } catch (error) {
    toast.error("No se pudo cargar la orden");
    return null;
  }
}, []);

  const startUpdatePreOrderStatus = useCallback(async (id: string, status: string) => {
    return await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.patch(`/pre-purchase-orders/${id}/status`, { status }, config);
      
      dispatch(onUpdatePreOrder(data));
      toast.success("Estado de producción actualizado.");
      return true;
    }, "No se pudo actualizar el estado de producción.");
  }, [dispatch, executeRequest, getConfig]);


  /**
   * Carga la lista de almacenes activos (Almacén Central, Tienda, etc.)
   * GET /inventory/warehouses
   */
  const startLoadingWarehouses = useCallback(async () => {
    return await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.get("/inventory/warehouses", config);
      return data;
    }, "No se pudieron cargar los almacenes.");
  }, [executeRequest, getConfig]);

  /**
   * Consulta el stock de una variante segmentado por almacén.
   * GET /inventory/stock/:variantId
   * Retorna un array de WarehouseStock con physical_stock, reserved_stock y available_stock (virtual).
   */
  const startLoadingStockByVariant = useCallback(async (variantId: string) => {
    return await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.get(`/inventory/stock/${variantId}`, config);
      return data;
    }, "No se pudo recuperar la distribución de stock.");
  }, [executeRequest, getConfig]);

  /**
   * Carga el stock de un array de variantes en una sola pasada paralela.
   * NO usa executeRequest para evitar el parpadeo de loading por cada llamada.
   * Retorna un mapa { [variantId]: available_stock } con los resultados.
   * Las variantes sin registro devuelven 0.
   * GET /inventory/stock/:variantId  ×N  (Promise.allSettled en paralelo)
   */
  const startLoadingStockBatch = useCallback(
    async (variantIds: string[]): Promise<Record<string, number>> => {
      if (variantIds.length === 0) return {};

      // Un solo dispatch de loading al inicio
      dispatch(setLoadingStorehouse(true));

      try {
        const config = await getConfig();
        const results = await Promise.allSettled(
          variantIds.map((id) =>
            storehouseApi
              .get(`/inventory/stock/${id}`, config)
              .then((r) => ({ id, data: r.data as any[] }))
          )
        );

        const stockMap: Record<string, number> = {};
        for (const result of results) {
          if (result.status === "fulfilled") {
            const { id, data } = result.value;
            const available = Array.isArray(data)
              ? data.reduce(
                  (sum, s) => sum + Math.max(0, (s.physical_stock ?? 0) - (s.reserved_stock ?? 0)),
                  0
                )
              : 0;
            stockMap[id] = available;
          }
        }
        return stockMap;
      } catch {
        return {};
      } finally {
        // Un solo dispatch de loading al final
        dispatch(setLoadingStorehouse(false));
      }
    },
    [dispatch, getConfig]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // DOCUMENTOS DE ALMACÉN  (reemplazan el flujo obsoleto de /inventory/transfers)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Lista todos los documentos de almacén (INGRESO_COMPRA, SALIDA_VENTA, TRANSFERENCIA, AJUSTE).
   * GET /inventory/documents
   */
  const startLoadingWarehouseDocuments = useCallback(async () => {
    return await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.get("/inventory/documents", config);
      return Array.isArray(data) ? data : [];
    }, "No se pudieron cargar los documentos de almacén.");
  }, [executeRequest, getConfig]);

  /**
   * Crea un documento en estado PENDIENTE.
   * POST /inventory/documents
   * El catálogo (Producto + Variante) debe existir antes de llamar esto.
   */
  const startCreateWarehouseDocument = useCallback(async (payload: {
    document_number: string;
    type: "INGRESO_COMPRA" | "SALIDA_VENTA" | "TRANSFERENCIA" | "AJUSTE";
    id_source_warehouse?: string | null;
    id_target_warehouse?: string | null;
    id_origin_doc?: string | null;
    id_sender_worker: string;
    notes?: string;
    items: { id_variant: string; quantity_expected: number; incidence_note?: string }[];
  }) => {
    const result = await executeRequest(async () => {
      const config = await getConfig();
      const { data } = await storehouseApi.post("/inventory/documents", payload, config);
      toast.success("Documento de almacén creado correctamente.");
      return data;
    }, "No se pudo crear el documento de almacén.");
    return result ?? null;
  }, [executeRequest, getConfig]);

  /**
   * El almacenero da la conformidad física del documento.
   * Acción atómica: actualiza WarehouseStock.physical_stock + graba líneas en InventoryMovements.
   * PATCH /inventory/documents/:id/process
   */
  const startProcessWarehouseDocument = useCallback(async (
    documentId: string,
    workerId: string,
    items: { id_variant: string; quantity_received: number; incidence_note?: string }[],
  ) => {
    const result = await executeRequest(async () => {
      const config = await getConfig();
      await storehouseApi.patch(`/inventory/documents/${documentId}/process`, {
        id_worker: workerId,
        items,
      }, config);
      await startLoadingInventoryMovements();
      toast.success("¡Documento procesado. Stock e historial actualizados!");
      return true;
    }, "Error al procesar el documento de almacén.");
    return result ?? false;
  }, [executeRequest, getConfig, startLoadingInventoryMovements]);

  // Aliases de compatibilidad hacia atrás (apuntan a los nuevos métodos)
  /** @deprecated Usar startLoadingWarehouseDocuments */
  const startLoadingTransfers = startLoadingWarehouseDocuments;
  /** @deprecated Usar startCreateWarehouseDocument */
  const startCreateTransfer = useCallback(async (payload: any) => {
    return startCreateWarehouseDocument({
      document_number: payload.code ?? `TR-${Date.now().toString().slice(-6)}`,
      type: "TRANSFERENCIA",
      id_source_warehouse: payload.id_source_warehouse ?? null,
      id_target_warehouse: payload.id_target_warehouse ?? null,
      id_sender_worker: payload.id_sender_worker,
      items: (payload.items ?? []).map((i: any) => ({
        id_variant: i.id_variant,
        quantity_expected: i.quantity ?? i.quantity_expected ?? 0,
      })),
    });
  }, [startCreateWarehouseDocument]);
  /** @deprecated Usar startProcessWarehouseDocument */
  const startCompleteTransfer = useCallback(async (id: string, workerId: string) => {
    return startProcessWarehouseDocument(id, workerId, []);
  }, [startProcessWarehouseDocument]);

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
    getPurchaseOrderById,


    startLoadingWarehouses,
    startLoadingStockByVariant,
    startLoadingStockBatch,
    // Nuevos métodos de WarehouseDocuments
    startLoadingWarehouseDocuments,
    startCreateWarehouseDocument,
    startProcessWarehouseDocument,
    // Aliases de compatibilidad (apuntan a los nuevos)
    startLoadingTransfers,
    startCreateTransfer,
    startCompleteTransfer,
  };
};