import { useState, useCallback } from "react";
import { supplyWarehouseApi } from "@/api";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";

export const useSupplyWarehouseStore = () => {
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [productionOrders, setProductionOrders] = useState<any[]>([]);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getFirebaseAuthToken();
      const { data } = await supplyWarehouseApi.get("/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(data);
    } catch (error) {
      console.error("Error cargando inventario de insumos:", error);
      toast.error("Error al cargar inventario de insumos");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getFirebaseAuthToken();
      const { data } = await supplyWarehouseApi.get("/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(data);
    } catch (error) {
      console.error("Error cargando transacciones de almacén:", error);
      toast.error("Error al cargar historial del almacén");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProductionOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getFirebaseAuthToken();
      const { data } = await supplyWarehouseApi.get("/production-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductionOrders(data);
    } catch (error) {
      console.error("Error cargando órdenes de producción:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const recordPurchase = useCallback(async (purchaseData: {
    supplier_name?: string;
    notes?: string;
    items: { id_supply: string; quantity: number; cost: number; specifications?: string }[];
    evidence_files?: File[];
  }) => {
    setLoading(true);
    try {
      const token = await getFirebaseAuthToken();
      const formData = new FormData();
      if (purchaseData.supplier_name) formData.append('supplier_name', purchaseData.supplier_name);
      if (purchaseData.notes) formData.append('notes', purchaseData.notes);
      formData.append('items', JSON.stringify(purchaseData.items));
      (purchaseData.evidence_files || []).forEach(f => formData.append('evidence_files', f));
      await supplyWarehouseApi.post("/purchase", formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      toast.success("Compra en Gamarra registrada e inventario actualizado");
      await loadInventory();
      return true;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Error desconocido";
      console.error("Error registrando compra:", msg, error?.response?.data);
      toast.error(`Error: ${msg}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadInventory]);

  const recordDispatch = useCallback(async (dispatchData: {
    id_workshop: string;
    notes?: string;
    items: { id_supply: string; quantity: number; specifications?: string }[];
  }) => {
    setLoading(true);
    try {
      const token = await getFirebaseAuthToken();
      await supplyWarehouseApi.post("/dispatch", dispatchData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Despacho de insumos confirmado");
      await loadInventory();
      return true;
    } catch (error) {
      console.error("Error registrando despacho:", error);
      toast.error("Error al confirmar despacho");
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadInventory]);

  const recordReturn = useCallback(async (returnData: {
    id_workshop?: string;
    notes?: string;
    items: { id_supply: string; quantity: number; specifications?: string }[];
  }) => {
    setLoading(true);
    try {
      const token = await getFirebaseAuthToken();
      await supplyWarehouseApi.post("/return", returnData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Devolución reingresada al inventario");
      await loadInventory();
      return true;
    } catch (error) {
      console.error("Error registrando devolución:", error);
      toast.error("Error al confirmar devolución de sobrantes");
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadInventory]);

  return {
    loading,
    inventory,
    transactions,
    productionOrders,
    loadInventory,
    loadTransactions,
    loadProductionOrders,
    recordPurchase,
    recordDispatch,
    recordReturn,
  };
};
