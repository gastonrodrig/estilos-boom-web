"use client";

import { useCallback, useState } from "react";
import { productApi } from "@api"; 
import { 
  useAppDispatch, 
  useAppSelector, 
  setLoadingProduct, 
  refreshProducts 
} from "@store";
import { Product } from "@models";
import { getAuthConfigWithParams } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";

export const useProductStore = () => {
  const dispatch = useAppDispatch();
  const { products, loading, currentPage, rowsPerPage } = useAppSelector((state) => state.product);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. CARGA DE PRODUCTOS (CATÁLOGO)
  const startLoadingProducts = useCallback(async (params: {
    section?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: string[];
    colors?: string[];
    limit?: number;
    offset?: number;
  }) => {
    dispatch(setLoadingProduct(true));
    try {
      // Manejo silencioso del token para acceso público
      let token = null;
      try { 
        token = await getFirebaseAuthToken(); 
      } catch (e) {
        // Si falla, el token sigue siendo null y el backend lo manejará como público
      }

      const queryParams: any = {
        limit: params.limit ?? rowsPerPage,
        offset: params.offset ?? (currentPage * rowsPerPage),
        ...params,
      };

      const { data } = await productApi.get("", getAuthConfigWithParams({
        token,
        params: queryParams,
      }));

      // Normalización: MongoDB devuelve '_id' y el Front necesita 'id_product'
      const rawItems = data.items || (Array.isArray(data) ? data : []);
      const normalizedItems = rawItems.map((p: any) => ({
        ...p,
        id: p._id,           // Referencia estándar
        id_product: p._id,   // Referencia de tu modelo actual
        isNewIn: p.is_new_in,
        basePrice: p.base_price,
        variants: p.variants ?? [],
      }));

      dispatch(refreshProducts({ 
        items: normalizedItems, 
        total: data.total ?? normalizedItems.length, 
        page: currentPage 
      }));

    } catch (error) {
      console.error("Error cargando productos:", error);
      toast.error("Error al cargar el catálogo");
    } finally {
      dispatch(setLoadingProduct(false));
    }
  }, [dispatch, currentPage, rowsPerPage]);

  // 2. OBTENER UN SOLO PRODUCTO (PARA EL DETALLE / F5)
  const getProductById = useCallback(async (id: string) => {
    dispatch(setLoadingProduct(true));
    try {
      const { data } = await productApi.get(`/${id}`);
      
      // También normalizamos aquí para que el detalle no rompa
      return {
        ...data,
        id: data._id,
        id_product: data._id,
        isNewIn: data.is_new_in,
        basePrice: data.base_price,
        variants: data.variants ?? [],
      } as Product;

    } catch (error) {
      toast.error("No se pudo cargar la información del producto");
      return null;
    } finally {
      dispatch(setLoadingProduct(false));
    }
  }, [dispatch]);

  return {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    startLoadingProducts,
    getProductById,
  };
};