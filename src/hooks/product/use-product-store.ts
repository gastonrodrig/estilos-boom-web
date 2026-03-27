"use client";
import { useCallback, useState } from "react";
import { Product, HttpError } from "@models";
import { getAuthConfigWithParams } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";
import { productApi } from "@api";
import { refreshProducts, setLoadingProduct, useAppDispatch, useAppSelector } from "@store";

type LoadProductsParams = {
  section?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
};

type RawProduct = {
  id_product: string;
  is_new_in: boolean;
  base_price: number;
  variants?: unknown[];
  [key: string]: unknown;
};

export const useProductStore = () => {
  const dispatch = useAppDispatch();
  const { products, loading, currentPage, rowsPerPage } = useAppSelector((state) => state.product);
  const [searchTerm, setSearchTerm] = useState('');

  const startLoadingProducts = useCallback(async (params: {
    section?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: string[];
    colors?: string[];
    limit?: number;  // 👈 Añadimos esto
    offset?: number; // 👈 Añadimos esto
  }) => {
    dispatch(setLoadingProduct(true));

    try {

      const queryParams: any = {
        limit: params.limit ?? rowsPerPage, // 👈 Si mandas un limit manual, lo usa
        offset: params.offset ?? (currentPage * rowsPerPage),
        ...params,
      };

      const { data } = await productApi.get("", getAuthConfigWithParams({ token, params: queryParams }));
      const rawItems = data.items ?? data;
      
      const normalizedItems = rawItems.map((p: any) => ({
        ...p,
        id: p.id_product,
        isNewIn: p.is_new_in,
        basePrice: p.base_price,
        variants: p.variants ?? [],
      })) as unknown as Product[];

      dispatch(refreshProducts({ items: normalizedItems, total: data.total ?? normalizedItems.length, page: currentPage }));
    } catch (error) {
      toast.error("Error al cargar productos");
    } finally {
      dispatch(setLoadingProduct(false));
    }
  }, [dispatch, currentPage, rowsPerPage]);

  // 👈 NUEVO: Función para el detalle (Soluciona el F5)
  const getProductById = useCallback(async (id: string) => {
    dispatch(setLoadingProduct(true));
    try {
      const { data } = await productApi.get(`/${id}`);
      return {
        ...data,
        id: data.id_product,
        isNewIn: data.is_new_in,
        basePrice: data.base_price,
        variants: data.variants ?? [],
      } as Product;
    } catch (error) {
      toast.error("No se encontró el producto");
      return null;
    } finally {
      dispatch(setLoadingProduct(false));
    }
  }, [dispatch]);

  return { products, loading, searchTerm, setSearchTerm, startLoadingProducts, getProductById };
};