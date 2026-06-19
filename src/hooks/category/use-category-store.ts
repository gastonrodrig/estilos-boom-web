"use client";

import { categoryApi } from "@api";
import { 
  useAppDispatch, 
  useAppSelector, 
  setLoadingCategory, 
  refreshCategories 
} from "@store";
import { 
  Category, 
  createCategoryToApi, 
  HttpError 
} from "@models";
import { getAuthConfig } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";
import { useCallback } from "react";

export const useCategoryStore = () => {
  const dispatch = useAppDispatch();

  const {
    categories,
    selected,
    total,
    loading,
  } = useAppSelector((state) => state.category);

  const startCreateCategory = async (category: Partial<Category>) => {
    dispatch(setLoadingCategory(true));
    try {
      const token = await getFirebaseAuthToken();
      await categoryApi.post("/", category, getAuthConfig({ token }));
      await startLoadingCategories();
      toast.success("Categoría creada exitosamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Ocurrió un error al crear la categoría.");
      return false;
    } finally {
      dispatch(setLoadingCategory(false));
    }
  };

  // ✅ NUEVO MÉTODO: Para actualizar categorías cruzando el ID
  const startUpdateCategory = async (id: string, category: Partial<Category>) => {
    dispatch(setLoadingCategory(true));
    try {
      const token = await getFirebaseAuthToken();
      await categoryApi.patch(`/${id}`, category, getAuthConfig({ token }));
      await startLoadingCategories();
      toast.success("Categoría actualizada correctamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Ocurrió un error al actualizar la categoría.");
      return false;
    } finally {
      dispatch(setLoadingCategory(false));
    }
  };

  const startDeactivateCategory = async (id: string) => {
    dispatch(setLoadingCategory(true));
    try {
      const token = await getFirebaseAuthToken();
      await categoryApi.delete(`/${id}`, getAuthConfig({ token }));
      await startLoadingCategories();
      toast.success("Categoría desactivada correctamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Ocurrió un error al desactivar la categoría.");
      return false;
    } finally {
      dispatch(setLoadingCategory(false));
    }
  };

  const startLoadingCategories = useCallback(async () => {
    dispatch(setLoadingCategory(true));
    try {
      const { data } = await categoryApi.get("/");
      dispatch(refreshCategories({
        items: data,
        total: data.length,
      }));
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Ocurrió un error al cargar las categorías.");
      return false;
    } finally {
      dispatch(setLoadingCategory(false));
    }
  }, [dispatch]);

  return {
    categories,
    selected,
    total,
    loading,
    startCreateCategory,
    startUpdateCategory,
    startDeactivateCategory,
    startLoadingCategories,
  };
};