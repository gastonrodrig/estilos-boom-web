import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { storehouseApi } from "@api";
import { useProductStore, useStorehouseStore, useUsersStore } from "@hooks";
import { useAppSelector } from "@store";
import { CreatePurchaseOrderModelInput } from "@/core/models"; 
import { SupplyDraftItem, ConfirmationState, WorkerOption, PrefillData } from "./types";

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

export const useStorehouseCreate = () => {
  const router = useRouter();
  const authId = useAppSelector((state) => state.auth.id);
  const authState = useAppSelector((state) => state.auth);
  
  const { startLoadingUserDocument } = useUsersStore();
  const { startLoadingSuppliers, suppliers, startCreatePurchaseOrder, startLoadingPurchaseOrderById, selectedOrder } = useStorehouseStore();
  const { products, startLoadingProducts } = useProductStore();

  const [prefill, setPrefill] = useState<PrefillData | null>(null);
  const [supplierId, setSupplierId] = useState("");
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

    const raw = localStorage.getItem("abastecimiento_prefill");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      setPrefill(data);
      if (data.orderId) void startLoadingPurchaseOrderById(data.orderId);
      if (data.workerId) setWorkerId(String(data.workerId));
      if (Array.isArray(data.items)) {
        const singleProductItems = sanitizeItemsToSingleProduct(data.items);
        setItems(
          singleProductItems.map((it: SupplyDraftItem) => {
            const parsed = parseVariant(it.variant_label);
            return {
              ...it,
              id_variant: String(it.id_variant ?? ""),
              quantity: Number(it.quantity ?? 1),
              unit_cost: Number(it.unit_cost ?? 0),
              product_image: normalizeImageUrl(it.product_image),
              size: parsed.size,
              color: parsed.color,
            };
          })
        );
      }
    } catch (e) { console.warn(e); }
  }, [startLoadingSuppliers, startLoadingPurchaseOrderById, startLoadingProducts]);

  useEffect(() => {
    if (selectedOrder && !items.length && prefill?.items) {
      const mapped = sanitizeItemsToSingleProduct(prefill.items).map((it: SupplyDraftItem) => {
        const found = (selectedOrder.items || []).find(
          (i: { id_variant: string; variant_label?: string; unit_cost?: number }) => String(i.id_variant) === String(it.id_variant)
        );
        const parsed = parseVariant(found?.variant_label ?? it.variant_label);
        return {
          ...it,
          quantity: Number(it.quantity ?? 1),
          unit_cost: it.unit_cost ?? found?.unit_cost ?? 0,
          variant_label: found?.variant_label ?? it.variant_label,
          product_image: normalizeImageUrl(it.product_image),
          size: parsed.size,
          color: parsed.color,
        };
      });
      setItems(mapped);
    }
  }, [selectedOrder, items.length, prefill]);

  useEffect(() => {
    if (selectedOrder && !supplierId) {
      const sid = typeof selectedOrder.id_supplier === "object" 
        ? (selectedOrder.id_supplier as { _id: string })._id 
        : selectedOrder.id_supplier;
      if (sid) setSupplierId(String(sid));
    }
  }, [selectedOrder, supplierId]);

  useEffect(() => {
    if (authState.role !== "Administrador" && authId && !workerId) setWorkerId(String(authId));
  }, [authId, authState.role, workerId]);

  const selectedWorker = useMemo(() => workers.find((w) => w._id === workerId) ?? null, [workerId, workers]);
  
  const selectedWorkerLabel = useMemo(() => {
    if (!selectedWorker) return "Selecciona un trabajador";
    const user = selectedWorker.id_user;
    const name = user && typeof user === "object" ? [user.first_name, user.last_name].filter(Boolean).join(" ") : "";
    return name || (typeof user === "object" && user ? user.email ?? selectedWorker._id : selectedWorker._id);
  }, [selectedWorker]);

  const totalUnits = useMemo(() => items.reduce((acc, it) => acc + Number(it.quantity || 0), 0), [items]);

  const availableVariants = useMemo(() => {
    const productId = items[0]?.product_id;
    if (!productId) return [];
    const product = products.find(p => p.id_product === productId);
    if (!product || !product.variants) return [];
    return product.variants.filter(v => !items.some(i => i.id_variant === v.id_variant));
  }, [products, items]);

  // CORRECCIÓN 1: Manejar "NEW_VARIANT"
  const handleAddVariant = (variantId: string) => {
    if (variantId === "NEW_VARIANT") {
      setItems(prev => [...prev, {
        id_variant: `temp-${Date.now()}`,
        quantity: 1,
        unit_cost: 0,
        size: "",
        color: "",
        product_id: items[0]?.product_id || "",
        product_name: items[0]?.product_name || "",
        product_image: items[0]?.product_image || ""
      }]);
      return;
    }

    const variant = availableVariants.find(v => v.id_variant === variantId);
    if (!variant || !items[0]) return;
    setItems(prev => [...prev, {
      id_variant: variant.id_variant,
      quantity: 1,
      unit_cost: 0,
      size: variant.size,
      color: variant.color,
      product_id: items[0].product_id,
      product_name: items[0].product_name,
      product_image: items[0].product_image
    }]);
  };

  const productInfo = useMemo(() => {
    const first = items[0];
    if (!first) return { name: prefill?.selectionTitle ?? "Sin seleccion", stockActual: 0, stockMinimo: 0, unidadesReponer: 0, ventasPromedio: 0, variantes: 0, image: "" };
    const stockActual = items.reduce((acc, it) => acc + Number(it.stock ?? 0), 0);
    const stockMinimo = items.reduce((acc, it) => acc + Number(it.minimum ?? 0), 0);
    const fromCatalog = products.find((p) => p.id_product === first.product_id || p.name === first.product_name)?.images?.[0] ?? "";
    return {
      name: first.product_name ?? prefill?.selectionTitle ?? "Producto seleccionado",
      stockActual,
      stockMinimo,
      unidadesReponer: totalUnits,
      ventasPromedio: Math.max(1, Math.round(totalUnits / 2)),
      variantes: items.length,
      image: normalizeImageUrl(first.product_image) || normalizeImageUrl(fromCatalog),
    };
  }, [items, prefill, totalUnits, products]);

  useEffect(() => { setImageError(false); }, [productInfo.image]);
  
  const filteredSuppliers = useMemo(() => {
    const q = supplierSearch.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) => [s.name_company, s.address ?? "", s.contact_person ?? "", s.ruc ?? ""].join(" ").toLowerCase().includes(q));
  }, [supplierSearch, suppliers]);

  // CORRECCIÓN 2: Aceptar field y value dinámico
  const handleChangeItem = (index: number, field: string, value: string | number) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const handleChangeItemUnitCost = (index: number, value: number) => setItems((prev) => prev.map((it, i) => (i === index ? { ...it, unit_cost: value } : it)));

  const handleCreate = async () => {
    if (!supplierId) { toast.error("Selecciona un proveedor"); return; }
    if (authState.role === "Administrador" && !workerId) { toast.error("Selecciona el trabajador que registrará la orden."); return; }
    if (!authId && authState.role !== "Administrador") { toast.error("No se pudo obtener tu ID de usuario."); return; }
    if (!items.length) { toast.error("No hay variantes seleccionadas"); return; }
    if (items.some((it) => !it.id_variant)) { toast.error("Hay variantes sin identificador valido."); return; }
    if (items.some((it) => Number(it.quantity) <= 0)) { toast.error("La cantidad debe ser mayor a cero en todas las variantes."); return; }
    
    setConfirmation((c) => ({ ...c, open: true, deliveryDate: c.deliveryDate || getToday() }));
  };

  const closeConfirmation = () => setConfirmation((c) => ({ ...c, open: false }));

  const confirmAndSubmit = async () => {
    if (items.some((it) => !it.unit_cost || Number(it.unit_cost) <= 0)) { toast.error("Completa los precios unitarios para todas las variantes."); return; }
    if (items.some((it) => Number(it.quantity) <= 0)) { toast.error("La cantidad debe ser mayor a cero en todas las variantes."); return; }

    let resolvedWorkerId = workerId || authId || "";
    if (!resolvedWorkerId && authState.role === "Administrador") { toast.error("Selecciona el trabajador que registrará la orden."); return; }
    
    if (!resolvedWorkerId) {
      if (authState.documentNumber && authState.documentType) {
        const userDoc = await startLoadingUserDocument(String(authState.documentNumber), String(authState.documentType), String(authState.clientType ?? ""));
        const resolvedId = userDoc?._id ?? userDoc?.id ?? null;
        if (resolvedId) {
          resolvedWorkerId = String(resolvedId);
          setWorkerId(String(resolvedId));
        } else { toast.error("No se pudo obtener tu ID de usuario."); return; }
      } else { toast.error("No se pudo obtener tu ID de usuario."); return; }
    }
    
    if (!confirmation.deliveryDate) { toast.error("Selecciona una fecha de confirmación."); return; }

    setLoading(true);
    const payload: CreatePurchaseOrderModelInput = {
      order_number: `OC-${Date.now().toString().slice(-6)}`,
      id_supplier: supplierId,
      id_worker: String(resolvedWorkerId),
      items: items.map((it) => ({ id_variant: it.id_variant, quantity: Number(it.quantity), unit_cost: Number(it.unit_cost) })),
      total_amount: items.reduce((acc, it) => acc + Number(it.quantity || 0) * Number(it.unit_cost || 0), 0),
      notes: confirmation.notes.trim() || undefined,
      delivery_date_estimated: confirmation.deliveryDate,
    };

    const ok = await startCreatePurchaseOrder(payload);
    setLoading(false);
    closeConfirmation();
    
    if (ok) {
      localStorage.removeItem("abastecimiento_prefill");
      toast.success("Abastecimiento creado correctamente");
      setTimeout(() => router.push("/admin/storehouse/supply-orders"), 800);
    }
  };

  return {
    router,
    authRole: authState.role || "",
    prefill,
    supplierId, setSupplierId,
    workerId, setWorkerId,
    workers, loadingWorkers, selectedWorkerLabel,
    items, loading,
    supplierSearch, setSupplierSearch,
    imageError, setImageError,
    confirmation, setConfirmation,
    productInfo, filteredSuppliers, totalUnits,
    availableVariants, handleAddVariant,
    handleChangeItem, handleChangeItemUnitCost,
    handleCreate, closeConfirmation, confirmAndSubmit,
  };
};