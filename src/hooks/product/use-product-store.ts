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
  // 1. Mapeo de ID principal
  const idProduct =
    (p.id_product as string | undefined) ??
    (p._id as string | undefined) ??
    "";

  // 2. Mapeo profundo de Variantes (_id -> id_variant)
  const rawVariants = Array.isArray(p.variants) ? p.variants : [];
  const normalizedVariants = rawVariants.map((v: any) => ({
    _id: v._id || v.id_variant || "",
    id_variant: v.id_variant || v._id || "",
    size: v.size || "",
    color: v.color || "",
    stock: Number(v.stock || 0),
    sku_variant: v.sku_variant || "",
    min_stock_alert: Number(v.min_stock_alert ?? 10),
  }));
const categoryData = typeof p.id_category === 'object' ? (p.id_category as any) : null;
const idCategory = categoryData ? categoryData._id : (p.id_category as string ?? "");
  // 3. Retorno del objeto Product COMPLETO
  return {
    id_product: idProduct,
    name: (p.name as string) ?? "",
    description: (p.description as string | undefined) ?? "",
    sku: (p.sku as string) ?? "",
    base_price: Number(p.base_price ?? 0),
    is_active: Boolean(p.is_active),
    is_best_seller: Boolean(p.is_best_seller),
    is_new_in: Boolean(p.is_new_in),
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
    id_category: idCategory,
    category: categoryData ? {
    name: categoryData.name,
    default_size_guide_url: categoryData.default_size_guide_url
  } : (p.category as any),

    // --- NUEVOS CAMPOS (Evita el error de TypeScript) ---
    gender: (p.gender as any) ?? "MUJER",
    style_type: (p.style_type as string) ?? "",
    composition: (p.composition as string) ?? "",
    season: (p.season as string) ?? "",
    highlights: Array.isArray(p.highlights) ? (p.highlights as string[]) : [],
    custom_size_guide_url: (p.custom_size_guide_url as string) ?? "",
    technical_details: (p.technical_details as any) ?? {},
    
    // ----------------------------------------------------

    variants: normalizedVariants,
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
      gender?: string; // Agregamos gender a los params permitidos
      season?: string; // Agregamos season a los params permitidos
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

  const createProduct = useCallback(async (formData: FormData) => {
  dispatch(setLoadingProduct(true));

  // 🕵️‍♂️ LOG DE DEPURACIÓN (Submit Inspector)
  console.group("🚀 Enviando Producto al Servidor");
  const entries: any = {};
  formData.forEach((value, key) => {
    // Si es el campo de variantes, intentamos parsearlo para que se vea bonito en la consola
    if (key === 'variants') {
      try {
        entries[key] = JSON.parse(value as string);
      } catch {
        entries[key] = value;
      }
    } else if (value instanceof File) {
      entries[key] = `Archivo: ${value.name} (${value.size} bytes)`;
    } else {
      entries[key] = value;
    }
  });
  console.table(entries); // Muestra una tabla limpia de los campos
  console.log("Variantes crudas:", entries.variants);
  console.groupEnd();

  try {
    const token = await getFirebaseAuthToken();
    const { data } = await productApi.post("/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success("¡Producto creado con éxito!");
    return normalizeProduct(data);
  } catch (error: any) {
    console.error("❌ Error en el servidor:", error.response?.data);
    const msg = error.response?.data?.message || "Error al crear el producto";
    toast.error(msg);
    return null;
  } finally {
    dispatch(setLoadingProduct(false));
  }
}, [dispatch]);

  const updateProduct = useCallback(async (id: string, formData: FormData) => {
  dispatch(setLoadingProduct(true));
  try {
    const token = await getFirebaseAuthToken();
    const { data } = await productApi.patch(`/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}` 
      }
    });
    toast.success("Producto actualizado");
    return normalizeProduct(data);
  } catch (error) {
    toast.error("Error al actualizar");
    return null;
  } finally {
    dispatch(setLoadingProduct(false));
  }
}, [dispatch])

  return {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    startLoadingProducts,
    getProductById,
    createProduct,
  };
};