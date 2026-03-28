"use client";

import { useCallback, useState } from "react";
import { productApi } from "@api";
import {
  useAppDispatch,
  useAppSelector,
  setLoadingProduct,
  refreshProducts,
} from "@store";
import { Product } from "@models";
import { getAuthConfigWithParams } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";

type ApiProduct = Record<string, unknown>;

const normalizeProduct = (p: ApiProduct): Product => {
  const idProduct =
    (p.id_product as string | undefined) ??
    (p._id as string | undefined) ??
    "";

  const rawVariants = Array.isArray(p.variants) ? p.variants : [];

  return {
    ...p,
    id_product: idProduct,
    name: (p.name as string) ?? "",
    description: (p.description as string | undefined) ?? "",
    sku: (p.sku as string) ?? "",
    base_price: Number(p.base_price ?? 0),
    is_active: Boolean(p.is_active),
    is_best_seller: Boolean(p.is_best_seller),
    is_new_in: Boolean(p.is_new_in),
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
    id_category: (p.id_category as string) ?? "",
    category: (p.category as Product["category"]) ?? undefined,
    variants: rawVariants as Product["variants"],
    created_at: (p.created_at as string | undefined) ?? undefined,
    updated_at: (p.updated_at as string | undefined) ?? undefined,
  };
};

export const useProductStore = () => {
  const dispatch = useAppDispatch();
  const { products, loading, currentPage, rowsPerPage } = useAppSelector(
    (state) => state.product,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const startLoadingProducts = useCallback(
    async (params: {
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
        let token: string | null = null;
        try {
          token = await getFirebaseAuthToken();
        } catch {
          token = null;
        }

        const queryParams = {
          limit: params.limit ?? rowsPerPage,
          offset: params.offset ?? currentPage * rowsPerPage,
          ...params,
        };

        const { data } = await productApi.get(
          "",
          getAuthConfigWithParams({
            token,
            params: queryParams,
          }),
        );

        const rawItems = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];

        const normalizedItems = rawItems.map((p: ApiProduct) => normalizeProduct(p));

        dispatch(
          refreshProducts({
            items: normalizedItems,
            total: Number(data?.total ?? normalizedItems.length),
            page: currentPage,
          }),
        );
      } catch (error) {
        console.error("Error cargando productos:", error);
        toast.error("Error al cargar el catálogo");
      } finally {
        dispatch(setLoadingProduct(false));
      }
    },
    [dispatch, currentPage, rowsPerPage],
  );

  const getProductById = useCallback(
    async (id: string) => {
      dispatch(setLoadingProduct(true));
      try {
        const { data } = await productApi.get(`/${id}`);
        return normalizeProduct(data as ApiProduct);
      } catch {
        toast.error("No se pudo cargar la información del producto");
        return null;
      } finally {
        dispatch(setLoadingProduct(false));
      }
    },
    [dispatch],
  );

  return {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    startLoadingProducts,
    getProductById,
  };
};