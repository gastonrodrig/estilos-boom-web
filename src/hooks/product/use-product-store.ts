"use client";

import { useState } from "react";
import { productApi } from "@api"; // <--- Importas la nueva instancia que creaste
import { 
  useAppDispatch, 
  useAppSelector, 
  setLoadingProduct, 
  refreshProducts 
} from "@store";
import { Product, HttpError } from "@models";
import { getAuthConfig, getAuthConfigWithParams } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";

export const useProductStore = () => {
  const dispatch = useAppDispatch();
  const { products, loading, currentPage, rowsPerPage } = useAppSelector((state) => state.product);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const startLoadingProducts = async () => {
    dispatch(setLoadingProduct(true));
    try {
      // 1. Manejo opcional de token (para que no explote si no hay login)
      let token = null;
      try { token = await getFirebaseAuthToken(); } catch (e) { token = null; }

      const queryParams: any = {
        limit: rowsPerPage,
        offset: currentPage * rowsPerPage,
      };
      if (searchTerm.trim()) queryParams.search = searchTerm.trim();
      if (categoryId) queryParams.categoryId = categoryId;

      // 2. PETICIÓN: Al usar productApi, el path es "" o "/"
      const { data } = await productApi.get(
        "", // <--- Vacío, porque la base ya es /api/v1/products
        getAuthConfigWithParams({
          token,
          params: queryParams,
        })
      );
      
      const items = data.items ?? data;
      const totalCount = data.total ?? items.length;

      dispatch(refreshProducts({
        items: items,
        total: totalCount,
        page: currentPage,
      }));
      
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Error al conectar con el catálogo.");
    } finally {
      dispatch(setLoadingProduct(false));
    }
  };

  return {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    setCategoryId,
    startLoadingProducts,
  };
};