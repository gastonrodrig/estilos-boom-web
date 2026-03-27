"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { productApi } from "@api";
import { Product } from "@models";
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

  const [searchTerm, setSearchTerm] = useState("");

  const startLoadingProducts = useCallback(async (params: LoadProductsParams) => {
    dispatch(setLoadingProduct(true));

    try {

      const queryParams = {
        limit: rowsPerPage,
        offset: currentPage * rowsPerPage,
        ...params,
      };

      const { data } = await productApi.get("", { params: queryParams });

      const rawItems: RawProduct[] = data.items ?? data;
      const normalizedItems = rawItems.map((p) => ({
        ...p,
        id: p.id_product,
        isNewIn: p.is_new_in,
        basePrice: p.base_price,
        variants: p.variants ?? [],
      })) as unknown as Product[];

      dispatch(
        refreshProducts({
          items: normalizedItems,
          total: data.total ?? normalizedItems.length,
          page: currentPage,
        }),
      );
    } catch {
      toast.error("Error al filtrar productos");
    } finally {
      dispatch(setLoadingProduct(false));
    }
  }, [currentPage, dispatch, rowsPerPage]);

  return {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    startLoadingProducts,
  };
};