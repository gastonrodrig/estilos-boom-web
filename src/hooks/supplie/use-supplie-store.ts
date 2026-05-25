"use client";

import { supplyApi } from "@api"; // Asegúrate de tener definido supplyApi apuntando a /supplies o /client/supplies
import { useAppDispatch, useAppSelector } from "@store";
import { refreshSupplies, setLoadingSupply, selectedSupply } from "@store";

import { Supply } from "@store";
import { HttpError } from "@models";
import { getAuthConfig } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";
import { useCallback } from "react";

export const useSupplyStore = () => {
  const dispatch = useAppDispatch();

  const { supplies, selected, total, loading } = useAppSelector((state) => state.supply);

  const startLoadingSupplies = useCallback(async () => {
    dispatch(setLoadingSupply(true));
    try {
      const { data } = await supplyApi.get("/");
      dispatch(refreshSupplies({
        items: data,
        total: data.length,
      }));
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Error al cargar el catálogo de insumos.");
      return false;
    } finally {
      dispatch(setLoadingSupply(false));
    }
  }, [dispatch]);

  const startCreateSupply = async (supply: Partial<Supply>) => {
    dispatch(setLoadingSupply(true));
    try {
      const token = await getFirebaseAuthToken();
      await supplyApi.post("/", supply, getAuthConfig({ token }));
      await startLoadingSupplies();
      toast.success("Insumo registrado con éxito.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Ocurrió un error al registrar el insumo.");
      return false;
    } finally {
      dispatch(setLoadingSupply(false));
    }
  };

  const startUpdateSupply = async (id: string, supply: Partial<Supply>) => {
    dispatch(setLoadingSupply(true));
    try {
      const token = await getFirebaseAuthToken();
      await supplyApi.patch(`/${id}`, supply, getAuthConfig({ token }));
      await startLoadingSupplies();
      toast.success("Insumo actualizado correctamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Ocurrió un error al actualizar el insumo.");
      return false;
    } finally {
      dispatch(setLoadingSupply(false));
    }
  };

  // 🚫 Método directo para gatillar la acción de "Suspender" o "Reactivar"
  const startToggleSupplyStatus = async (id: string, isActive: boolean) => {
    dispatch(setLoadingSupply(true));
    try {
      const token = await getFirebaseAuthToken();
      await supplyApi.patch(`/${id}/status`, { is_active: isActive }, getAuthConfig({ token }));
      await startLoadingSupplies();
      toast.success(`Insumo ${isActive ? 'reactivado' : 'suspendido'} correctamente.`);
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Error al modificar el estado del insumo.");
      return false;
    } finally {
      dispatch(setLoadingSupply(false));
    }
  };

  const setSelectSupply = (supply: Supply | null) => {
    dispatch(selectedSupply(supply));
  };

  return {
    supplies,
    selected,
    total,
    loading,
    startLoadingSupplies,
    startCreateSupply,
    startUpdateSupply,
    startToggleSupplyStatus,
    setSelectSupply,
  };
};