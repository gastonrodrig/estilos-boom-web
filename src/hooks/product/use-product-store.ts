"use client";

import { useCallback, useState } from "react";
import { productApi } from "@api"; 
import { 
  useAppDispatch, 
  useAppSelector, 
  setLoadingProduct, 
  refreshProducts 
} from "@store";
import { Product, HttpError } from "@models";
import { getAuthConfigWithParams } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";

export const useProductStore = () => {
  const dispatch = useAppDispatch();
  const { products, loading, currentPage, rowsPerPage } = useAppSelector((state) => state.product);

  const [searchTerm, setSearchTerm] = useState('');
  
  // 1. Envolvemos todo en useCallback para evitar bucles infinitos (Error 429)
  const startLoadingProducts = useCallback(async (params: {
    section?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: string[];
    colors?: string[];
  }) => {
    dispatch(setLoadingProduct(true));
    try {
      let token = null;
      try { token = await getFirebaseAuthToken(); } catch (e) {}

      // Construimos los Query Params dinámicamente
      const queryParams: any = {
        limit: rowsPerPage,
        offset: currentPage * rowsPerPage,
        ...params, // Esparcimos los filtros (maxPrice, sizes, etc.)
      };

      // Si enviamos arrays (sizes/colors), Axios los convierte a ?sizes=S&sizes=M
      const { data } = await productApi.get("", getAuthConfigWithParams({
        token,
        params: queryParams,
      }));

      const rawItems = data.items ?? data;
      const normalizedItems = rawItems.map((p: any) => ({
        ...p,
        id: p.id_product,
        isNewIn: p.is_new_in,
        basePrice: p.base_price,
        variants: p.variants ?? [],
      }));

      dispatch(refreshProducts({ items: normalizedItems, total: data.total ?? normalizedItems.length, page: currentPage }));
    } catch (error) {
      toast.error("Error al filtrar productos");
    } finally {
      dispatch(setLoadingProduct(false));
    }
  }, [dispatch, currentPage, rowsPerPage]);



  return {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    startLoadingProducts,
  };
};