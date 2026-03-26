"use client";

import { clientApi } from "@api";
import { 
  useAppDispatch, 
  useAppSelector, 
  setLoadingCategory, 
  refreshCategories 
} from "@store";
import { 
  Category, 
  createCategoryModel, 
  HttpError 
} from "@models";
import { getAuthConfig } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";

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
      const payload = createCategoryModel(category);
      const token = await getFirebaseAuthToken();
      await clientApi.post("/categories", payload, getAuthConfig({ token }));
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

  const startLoadingCategories = async () => {
    dispatch(setLoadingCategory(true));
    try {
      // Nota: Si tu API de categorías no es paginada, la llamada es directa
      const { data } = await clientApi.get("/categories");
      
      dispatch(refreshCategories({
        items: data, // Ajustar según si tu API devuelve data directa o {items, total}
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
  };

  return {
    categories,
    selected,
    total,
    loading,
    startCreateCategory,
    startLoadingCategories
  };
};