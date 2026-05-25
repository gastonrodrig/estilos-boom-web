"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { storehouseApi } from "@api";
import { useProductStore, useStorehouseStore, useUsersStore } from "@hooks";
import { useAppSelector } from "@store";
import { SupplyDraftItem, ConfirmationState, WorkerOption, PrefillData } from "./types";

// --- HELPERS ---
export const getToday = () => new Date().toISOString().slice(0, 10);
export const getMaxDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};

const normalizeImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("gs://")) {
    const raw = url.replace("gs://", "");
    const slash = raw.indexOf("/");
    if (slash > 0) return `https://storage.googleapis.com/${raw.slice(0, slash)}/${raw.slice(slash + 1)}`;
  }
  return url;
};

const parseVariant = (label?: string) => {
  if (!label) return { size: "", color: "" };
  const [size = "", color = ""] = label.split("/").map((v) => v.trim());
  return { size, color };
};

const sanitizeItemsToSingleProduct = (rawItems: SupplyDraftItem[]) => {
  if (!Array.isArray(rawItems) || !rawItems.length) return [];
  const firstProductId = rawItems[0]?.product_id ?? rawItems[0]?.product_name ?? "";
  return rawItems.filter((item) => (item.product_id ?? item.product_name ?? "") === firstProductId);
};

// --- HOOK PRINCIPAL ---
export const useStorehouseCreate = () => {
  const router = useRouter();
  
  // Selectores de Redux
  const authId = useAppSelector((state) => state.auth.id);
  const authState = useAppSelector((state) => state.auth);
  
  // Hooks de Store (Lógica de API)
  const { startLoadingUserDocument } = useUsersStore();
  const { 
    startLoadingSuppliers, 
    suppliers, 
    startLoadingPurchaseOrderById, 
    selectedOrder,
    // Aquí usamos el nuevo método que definimos para la OPP
    startCreatePrePurchaseOrder,
    startCreateVariantQuickly, 
  } = useStorehouseStore();
  const { products, startLoadingProducts } = useProductStore();

  const [prefill, setPrefill] = useState<PrefillData | null>(null);
  // Cambio: Ahora es un array para soportar múltiples proveedores
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]); 
  const [workerId, setWorkerId] = useState("");
  const [workers, setWorkers] = useState<WorkerOption[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [items, setItems] = useState<SupplyDraftItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [imageError, setImageError] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    open: false,
    deliveryDate: getToday(),
    notes: "",
  });
  // --- LÓGICA DE PROVEEDORES MULTIPLES ---
  const toggleSupplier = (id: string) => {
    setSelectedSupplierIds(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // --- CARGA INICIAL ---
  useEffect(() => {
    void startLoadingSuppliers();
    void startLoadingProducts({ limit: 100 });

    const loadWorkers = async () => {
      setLoadingWorkers(true);
      try {
        const { data } = await storehouseApi.get("/workers");
        setWorkers(Array.isArray(data) ? (data as WorkerOption[]) : []);
      } catch (error) {
        console.warn("No se pudo cargar la lista de trabajadores", error);
      } finally {
        setLoadingWorkers(false);
      }
    };
    void loadWorkers();

    // Recuperar datos de "abastecimiento_prefill" (viniendo de la tabla de alertas)
    const raw = localStorage.getItem("abastecimiento_prefill");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      setPrefill(data);
      if (data.workerId) setWorkerId(String(data.workerId));
      if (Array.isArray(data.items)) {
        const singleProductItems = sanitizeItemsToSingleProduct(data.items);
        setItems(singleProductItems.map((it: SupplyDraftItem) => ({
          ...it,
          id_variant: String(it.id_variant ?? ""),
          quantity: Number(it.quantity ?? 1),
          unit_cost: 0, // En OPP siempre empezamos en 0
          product_image: normalizeImageUrl(it.product_image),
          ...parseVariant(it.variant_label),
        })));
      }
    } catch (e) { console.warn(e); }
  }, []);

  const availableVariants = useMemo(() => {
    const productId = items[0]?.product_id;
    if (!productId) return [];
    const product = products.find(p => p.id_product === productId);
    if (!product || !product.variants) return [];
    return product.variants.filter(v => !items.some(i => i.id_variant === v.id_variant));
  }, [products, items]);

  // --- MEMOS ---
  const totalUnits = useMemo(() => items.reduce((acc, it) => acc + Number(it.quantity || 0), 0), [items]);

  const filteredSuppliers = useMemo(() => {
    const q = supplierSearch.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) => 
      [s.name_company, s.address ?? "", s.ruc ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [supplierSearch, suppliers]);

  const handleChangeItemUnitCost = (index: number, value: number) => {
    handleChangeItem(index, "unit_cost", value);
  };

  const productInfo = useMemo(() => {
    const first = items[0];
    if (!first) return { name: prefill?.selectionTitle ?? "Sin selección", image: "", stockActual: 0, stockMinimo: 0 };
    return {
      name: first.product_name ?? "Producto seleccionado",
      image: normalizeImageUrl(first.product_image),
      stockActual: items.reduce((acc, it) => acc + Number(it.stock ?? 0), 0),
      stockMinimo: items.reduce((acc, it) => acc + Number(it.minimum ?? 0), 0),
      unidadesReponer: totalUnits,
      ventasPromedio: Math.max(1, Math.round(totalUnits / 2)),
      variantes: items.length,
    };
  }, [items, totalUnits, prefill]);

  // --- HANDLERS ---
  const handleAddVariant = () => {
    setItems((prev) => [
      ...prev,
      {
        id_variant: `new-${Date.now()}`,
        isNew: true,
        quantity: 1,
        unit_cost: 0,
        size: "",
        color: "",
        sku_variant: "",
        // 👈 2. CORRECCIÓN DE UNDEFINED: Usa el encadenamiento opcional con corchetes
        product_id: items[0]?.product_id || prefill?.items?.[0]?.product_id || "",
        product_name: items[0]?.product_name || prefill?.items?.[0]?.product_name || "",
      },
    ]);
  };

  const handleChangeItem = (index: number, field: string, value: any) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  const handleCreate = async () => {
    if (!selectedSupplierIds.length) return toast.error("Selecciona al menos un proveedor para cotizar");
    if (!items.length) return toast.error("No hay variantes en la lista");
    if (!workerId && authState.role === "Administrador") return toast.error("Selecciona un trabajador responsable");
    
    setConfirmation(c => ({ ...c, open: true }));
  };

  const confirmAndSubmit = async () => {
  setLoading(true);
  try {
    const newVariants = items.filter(it => it.isNew);
    const finalizedItems = [...items];

    // Si hay variantes nuevas, primero las registramos en el catálogo
    if (newVariants.length > 0) {
      for (const variant of newVariants) {
        const createdVariant = await startCreateVariantQuickly({
          id_product: variant.product_id,
          size: variant.size,
          color: variant.color,
          sku_variant: variant.sku_variant || `${productInfo.name.substring(0,3)}-${variant.size}-${variant.color}`.toUpperCase(),
          physical_stock: 0
        });

        if (createdVariant) {
          const index = finalizedItems.findIndex(i => i.id_variant === variant.id_variant);
          if (index !== -1) {
            finalizedItems[index] = { ...variant, id_variant: createdVariant._id, isNew: false };
          }
        }
      }
    }

    // Enviamos la Pre-Orden final
    const payload = {
      id_worker: workerId || authId,
      supplier_ids: selectedSupplierIds,
      base_items: finalizedItems.map(it => ({
        id_variant: it.id_variant,
        quantity: Number(it.quantity),
        unit_cost: 0
      })),
      notes: confirmation.notes,
    };

    const ok = await startCreatePrePurchaseOrder(payload);
    if (ok) {
      toast.success("Solicitud enviada");
      router.push("/admin/storehouse/details");
    }
  } catch (error) {
    console.error("Error al enviar:", error);
    toast.error("Ocurrió un error inesperado al procesar la solicitud.");
  } finally {
    setLoading(false);
  }
};

  return {
    router, authRole: authState.role || "", prefill,
    selectedSupplierIds, toggleSupplier, // Antes supplierId, setSupplierId
    workerId, setWorkerId, workers, loadingWorkers,
    selectedWorkerLabel: workers.find(w => w._id === workerId)?._id || "Seleccionar",
    items, loading, supplierSearch, setSupplierSearch,
    imageError, setImageError, confirmation, setConfirmation,
    productInfo, filteredSuppliers, totalUnits,
    availableVariants, handleAddVariant, // Restaurado
    handleChangeItem, handleChangeItemUnitCost, // Restaurado
    handleCreate, closeConfirmation: () => setConfirmation(c => ({ ...c, open: false })), 
    confirmAndSubmit,
    handleRemoveItem: (index: number) => setItems(prev => prev.filter((_, i) => i !== index)),
  };
};