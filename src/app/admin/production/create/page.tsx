"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Search, CheckCircle2, MapPin,
  ArrowLeft, Info, Package2,
  TrendingUp, Clock, AlertCircle,
  Plus, Trash2, Calendar, MessageSquare,
  ChevronRight, ChevronDown, Scissors, Star, Calculator, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useProductionStore } from "@/hooks/production";
import { workshopApi } from "@api";
import { Modal, CTA } from "@/components/atoms";
import { Workshop } from "@/components/organisms/modals/workshop-modal/workshop-modal.types";

type VariantQuantity = {
  id: string;
  size: string;
  color: string;
  quantity: number;
};

type SupplyItem = {
  id: string;
  name: string;
  unitConsumption: number; // Consumo por prenda
  totalQuantity: number;    // Cantidad total (calculada + merma)
  theoreticalQuantity: number; // Cantidad teórica mínima
  unit: string;
};

export default function AdminPreProductionCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkshopIds, setSelectedWorkshopIds] = useState<string[]>([]);
  const [filterSpecialty, setFilterSpecialty] = useState("TODAS");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  const [prefillData, setPrefillData] = useState<any>(null);
  const [variants, setVariants] = useState<VariantQuantity[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessResult, setShowSuccessResult] = useState(false);
  const [requiredDate, setRequiredDate] = useState("");
  const [observations, setObservations] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const { startCreateProductionOrder } = useProductionStore();

  const totalQuantity = useMemo(() => variants.reduce((acc, v) => acc + v.quantity, 0), [variants]);

  // Motor de Ficha Técnica (BOM) por Categoría
  const categoryBOMs: Record<string, { name: string; unitConsumption: number; unit: string }[]> = useMemo(() => ({
    "POLOS": [
      { name: "Tela Jersey 30/1", unitConsumption: 1.2, unit: "metros" },
      { name: "Hilo de Costura", unitConsumption: 0.05, unit: "conos" },
      { name: "Etiqueta de Marca", unitConsumption: 1, unit: "unidades" },
      { name: "Bolsa de Empaque", unitConsumption: 1, unit: "unidades" },
    ],
    "PANTALONES": [
      { name: "Tela Drill / Denim", unitConsumption: 1.5, unit: "metros" },
      { name: "Cierre Metálico", unitConsumption: 1, unit: "unidades" },
      { name: "Botón de Metal", unitConsumption: 1, unit: "unidades" },
      { name: "Remaches", unitConsumption: 4, unit: "unidades" },
    ],
    "BLUSAS": [
      { name: "Tela Chalís", unitConsumption: 1.1, unit: "metros" },
      { name: "Botones Nacarados", unitConsumption: 6, unit: "unidades" },
      { name: "Entretela", unitConsumption: 0.2, unit: "metros" },
    ],
    "VESTIDOS": [
      { name: "Tela Seda / Viscosa", unitConsumption: 2.2, unit: "metros" },
      { name: "Cierre Invisible", unitConsumption: 1, unit: "unidades" },
      { name: "Forro", unitConsumption: 1.5, unit: "metros" },
    ],
    "DEFAULT": [
      { name: "Tela Principal", unitConsumption: 1.2, unit: "metros" },
      { name: "Cierre / Botones", unitConsumption: 1, unit: "unidades" },
      { name: "Hilo de Costura", unitConsumption: 0.05, unit: "conos" },
      { name: "Etiquetas", unitConsumption: 2, unit: "unidades" },
    ]
  }), []);

  useEffect(() => {
    const stored = localStorage.getItem("produccion_prefill");
    if (stored) {
      const parsed = JSON.parse(stored);
      setPrefillData(parsed);
      if (parsed.items) {
        setVariants(parsed.items.map((item: any) => ({
          id: item.id_variant,
          size: item.variant_label.split("/")[0].trim(),
          color: item.variant_label.split("/")[1].trim(),
          quantity: item.quantity
        })));
      }
    }

    const loadWorkshops = async () => {
      try {
        const { data } = await workshopApi.get("/", { params: { status: true } });
        setWorkshops(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading workshops", error);
      } finally {
        setLoading(false);
      }
    };
    void loadWorkshops();
  }, []);

  // Cargar ficha técnica real del producto desde la API
  useEffect(() => {
    const productId = prefillData?.items?.[0]?.product_id;
    if (!productId || totalQuantity === 0) return;

    import("@/api/product/product-api").then(({ productApi }) => {
      productApi.get(`/${productId}`).then(({ data }) => {
        const sheet = data.technical_sheet;
        if (!sheet || sheet.length === 0) {
          // Fallback a BOM por categoría si no hay ficha técnica
          const categoryRaw = (prefillData?.items?.[0]?.category_name || "DEFAULT").toUpperCase();
          const categoryKey = Object.keys(categoryBOMs).find(key => categoryRaw.includes(key)) || "DEFAULT";
          const bomToUse = categoryBOMs[categoryKey];
          setSupplies(bomToUse.map((item, idx) => {
            const theoretical = parseFloat((item.unitConsumption * totalQuantity).toFixed(2));
            return { id: idx.toString(), name: item.name, unitConsumption: item.unitConsumption, theoreticalQuantity: theoretical, totalQuantity: theoretical, unit: item.unit };
          }));
          return;
        }

        setSupplies(sheet.map((item: any, idx: number) => {
          const supply = item.id_supply;
          const name = supply?.name ?? "Insumo";
          const unit = supply?.unit ?? "unidades";
          const unitConsumption = item.quantity ?? 1;
          const theoretical = parseFloat((unitConsumption * totalQuantity).toFixed(3));
          return {
            id: idx.toString(),
            name,
            unitConsumption,
            theoreticalQuantity: theoretical,
            totalQuantity: theoretical,
            unit,
          };
        }));
      }).catch(() => {});
    });
  }, [totalQuantity, prefillData]);

  const specialties = useMemo(() => {
    const set = new Set(workshops.map(w => w.specialty).filter(Boolean));
    return ["TODAS", ...Array.from(set)];
  }, [workshops]);

  const filteredWorkshops = workshops.filter(ws => {
    const matchesSearch = ws.name_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === "TODAS" || ws.specialty === filterSpecialty;
    const matchesStatus = filterStatus === "TODOS" || ws.operating_status === filterStatus;
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const toggleWorkshop = (id: string) => {
    setSelectedWorkshopIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const handleNextStep = () => {
    if (selectedWorkshopIds.length > 0) setStep(2);
  };

  const handleConfirmOrder = () => {
    if (!requiredDate) {
      toast.error("Por favor, selecciona una fecha requerida.");
      return;
    }
    setShowConfirmModal(true);
  };

  const submitOrder = async () => {
    setShowConfirmModal(false);

    // Pequeño delay para dejar que el primer modal cierre bien
    setTimeout(async () => {
      setIsProcessing(true);

      const product = prefillData?.items?.[0];
      const payload = {
        workshop_ids: selectedWorkshopIds,
        id_worker: "665f1c2a8f1b2c0012345678", // Default temporal hasta integrar auth
        base_items: variants.map(v => ({
          id_variant: v.id, // Aquí el ID de variante real. Como es un mock por ahora, pasamos un ID dummy o de la DB.
          quantity: v.quantity
        })),
        supplies: supplies,
        observations: observations,
        delivery_date_estimated: requiredDate ? new Date(requiredDate).toISOString() : new Date().toISOString()
      };

      const result = await startCreateProductionOrder(payload);

      setIsProcessing(false);

      if (result.ok) {
        setShowSuccessResult(true);
        toast.success(`Orden de producción registrada correctamente.`);
        localStorage.removeItem("produccion_prefill");
      } else {
        toast.error(result.message || "Hubo un error al crear la orden.");
      }

      /* 
      // === LOGICA MOCK COMENTADA A PETICION ===
      // Simulación de procesamiento e inteligencia de stock
      setTimeout(() => {
        setIsProcessing(false);

        // Crear orden mockeada para flujo local
        const baseItems = variants.map(v => ({
          id_variant: {
            size: v.size,
            color: v.color,
            id_product: {
              name: product?.product_name || "Nuevo Producto",
              images: [product?.product_image || ""]
            }
          },
          quantity: v.quantity
        }));

        const mockOrder = {
          _id: "mock-" + Date.now(),
          pre_order_number: "OPP-M-2026-" + Math.floor(Math.random() * 1000),
          status: "SOLICITANDO",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          estimated_delivery_date: requiredDate ? new Date(requiredDate).toISOString() : new Date().toISOString(),
          base_items: baseItems,
          quotes: selectedWorkshopIds.map(id => {
            const taller = workshops.find(w => w._id === id);
            return {
              id_agent: {
                _id: id,
                name_company: taller?.name_company || "Taller Seleccionado"
              },
              quote_status: "COTIZADO",
              total_amount: null
            };
          })
        };

        const existingStr = localStorage.getItem("mocked_created_orders");
        const existing = existingStr ? JSON.parse(existingStr) : [];
        existing.push(mockOrder);
        localStorage.setItem("mocked_created_orders", JSON.stringify(existing));

        setShowSuccessResult(true);
        toast.success(`Orden de producción registrada correctamente.`);
        localStorage.removeItem("produccion_prefill");
      }, 2500);
      */
    }, 150);
  };

  const handleReorderRemaining = () => {
    setShowSuccessResult(false);
    setStep(1);
    setSelectedWorkshopIds([]);
    // Aquí se mantendría la data del producto pero para la cantidad faltante
    toast("Iniciando nueva orden para el saldo faltante", { icon: "🔄" });
  };

  const product = prefillData?.items?.[0];

  const addVariant = () => setVariants([...variants, { id: Math.random().toString(), size: "M", color: "Nuevo", quantity: 1 }]);
  const removeVariant = (id: string) => setVariants(variants.filter(v => v.id !== id));
  const updateVariant = (id: string, field: keyof VariantQuantity, value: any) =>
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));

  const addSupply = () => {
    const newSupply: SupplyItem = {
      id: Math.random().toString(),
      name: "",
      unitConsumption: 0,
      theoreticalQuantity: 0,
      totalQuantity: 0,
      unit: "unidades"
    };
    setSupplies([...supplies, newSupply]);
  };

  const removeSupply = (id: string) => setSupplies(supplies.filter(s => s.id !== id));
  const updateSupply = (id: string, field: keyof SupplyItem, value: any) => {
    setSupplies(supplies.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        // Validación de merma: no puede ser menor al teórico
        if (field === "totalQuantity" && value < s.theoreticalQuantity) {
          updated.totalQuantity = s.theoreticalQuantity;
        }
        return updated;
      }
      return s;
    }));
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 space-y-8 min-h-screen transition-colors duration-500">
      <header className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-end justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8C6B79] dark:text-white/30 mb-2">
            <span onClick={() => router.push("/admin/pre-production")} className="hover:text-[#D6405F] dark:hover:text-white/50 cursor-pointer transition-colors">Inventario</span>
            <span>/</span>
            <span onClick={() => setStep(1)} className={`cursor-pointer transition-colors ${step === 1 ? 'text-[#D6405F] dark:text-white/50' : 'hover:text-[#D6405F] dark:hover:text-white/50'}`}>Planificar Producción</span>
            {step === 2 && <><span>/</span><span className="text-[#D6405F] dark:text-white/50">Detalles Producción</span></>}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
            <h1 className="text-[#40202D] dark:text-white leading-none mb-2" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2rem', fontWeight: 300 }}>
              {step === 1 ? "Planificar Producción" : "Detalles de Producción"}
            </h1>
          </div>
          <p className="text-[#8C6B79] dark:text-white tracking-[0.03em] mt-3" style={{ fontSize: '0.78rem', opacity: 0.45 }}>
            {step === 1 ? "Selecciona uno o más talleres" : "Define cantidades e insumos automáticos"}
          </p>
        </div>
        <button onClick={() => step === 1 ? router.back() : setStep(1)} className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-[#8C6B79] dark:text-white/50 hover:text-[#40202D] dark:hover:text-white bg-white/50 dark:bg-white/5 rounded-full border border-[#EAE0E2] dark:border-white/10 transition-colors shadow-sm">
          <ArrowLeft className="h-3.5 w-3.5" /> {step === 1 ? "Volver al Tablero" : "Cambiar Talleres"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-[32px] border border-[#EAE0E2] dark:border-white/10 p-6 shadow-sm overflow-hidden flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 group shadow-inner">
              {product?.product_image ? (
                <Image src={product.product_image} alt={product.product_name} fill className="object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center"><Package2 className="h-16 w-16 text-[#EAE0E2] dark:text-white/20" /></div>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold text-[#40202D] dark:text-white leading-tight">{product?.product_name || "Cargando..."}</p>
              <div className="inline-block px-2 py-1 bg-[#D6405F]/10 dark:bg-[#F8BBD0]/10 text-[#D6405F] dark:text-[#F8BBD0] w-max text-xs font-medium rounded-md uppercase tracking-wider">{product?.category_name || "Prenda de Vestir"}</div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#8C6B79] dark:text-gray-400 font-normal">Stock Actual</span>
                <div className="flex items-center gap-1.5 font-medium text-[#40202D] dark:text-white"><span>{product?.stock || 0}</span></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#8C6B79] dark:text-gray-400 font-normal">Stock Mínimo</span>
                <span className="font-medium text-[#40202D] dark:text-white">{product?.minimum || 0}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#EAE0E2] dark:border-white/10">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#D6405F]/10 to-[#F23B69]/5 dark:from-[#F8BBD0]/10 dark:to-[#F48FB1]/5 border border-[#D6405F]/20 dark:border-[#F8BBD0]/20 relative overflow-hidden backdrop-blur-md">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2"><Info className="h-4 w-4 text-[#D6405F] dark:text-[#F8BBD0]" /><span className="text-xs font-bold text-[#D6405F] dark:text-[#F8BBD0] uppercase tracking-wider">Sugerencia del Sistema</span></div>
                  <div className="flex justify-between items-baseline"><span className="text-sm text-[#40202D] dark:text-white font-medium">Unidades a Producir</span><span className="text-3xl font-bold text-[#D6405F] dark:text-[#F8BBD0] drop-shadow-sm">{totalQuantity}</span></div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 dark:opacity-20"><TrendingUp className="h-24 w-24 text-[#D6405F] dark:text-[#F8BBD0]" /></div>
              </div>
            </div>
          </div>
          {step === 2 && (
            <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-[32px] border border-[#EAE0E2] dark:border-white/10 p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#D6405F] dark:text-[#F8BBD0] mb-5">Talleres Asignados</h3>
              <div className="space-y-3">
                {selectedWorkshopIds.map(id => {
                  const ws = workshops.find(w => w._id === id);
                  return ws ? (
                    <div key={id} className="flex items-center gap-3 bg-white/50 dark:bg-white/5 p-3.5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 shadow-sm transition-colors hover:bg-white/80 dark:hover:bg-white/10">
                      <Scissors className="h-4 w-4 text-[#D6405F] dark:text-[#F8BBD0]" />
                      <span className="text-sm font-medium text-[#40202D] dark:text-white truncate">{ws.name_company}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="bg-[#40202D] dark:bg-[#1A0B11] text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D6405F] dark:text-[#F8BBD0] mb-6 relative z-10">Configuración de Orden</h2>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-300 font-medium">Total a producir:</span>
                <span className="text-2xl font-bold text-white">{totalQuantity} unid.</span>
              </div>
              <div className="h-px bg-white/10 w-full" />
            </div>
          </div>
        </aside>

        <main className="lg:col-span-8">
          <div key={step} style={{ animation: "fadeIn 0.3s ease-out" }} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-[32px] border border-[#EAE0E2] dark:border-white/10 p-8 shadow-sm">
                  <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative w-full lg:w-96 shrink-0">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8C6B79] dark:text-gray-400" />
                      <input type="text" placeholder="Buscar taller..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-14 pl-12 pr-6 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md outline-none focus:ring-2 focus:ring-[#D6405F]/20 dark:focus:ring-[#F8BBD0]/20 transition-all text-[#40202D] dark:text-white placeholder:text-[#8C6B79] dark:placeholder:text-gray-500 shadow-inner" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <div className="relative w-full sm:w-auto">
                        <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)} className="h-14 pl-6 pr-12 rounded-2xl border border-white/40 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-xl text-xs font-bold text-[#40202D] dark:text-white outline-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all appearance-none cursor-pointer">
                          {specialties.map(s => <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-[#40202D] dark:text-zinc-100 font-medium">{s}</option>)}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C6B79] dark:text-gray-400 pointer-events-none rotate-90" />
                      </div>
                      <div className="relative w-full sm:w-auto">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full h-14 pl-6 pr-12 rounded-2xl border border-white/40 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-xl text-xs font-bold text-[#40202D] dark:text-white outline-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all appearance-none cursor-pointer">
                          <option value="TODOS" className="bg-white dark:bg-zinc-900 text-[#40202D] dark:text-zinc-100 font-medium">TODOS LOS ESTADOS</option>
                          <option value="AVAILABLE" className="bg-white dark:bg-zinc-900 text-[#40202D] dark:text-zinc-100 font-medium">DISPONIBLE</option>
                          <option value="LIMITED" className="bg-white dark:bg-zinc-900 text-[#40202D] dark:text-zinc-100 font-medium">LIMITADO</option>
                          <option value="SATURATED" className="bg-white dark:bg-zinc-900 text-[#40202D] dark:text-zinc-100 font-medium">SATURADO</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C6B79] dark:text-gray-400 pointer-events-none rotate-90" />
                      </div>
                    </div>
                  </div>
                  {loading ? (<div className="py-20 text-center"><div className="h-10 w-10 border-4 border-[#F2778D] border-t-transparent rounded-full animate-spin mx-auto" /></div>) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredWorkshops.map((ws) => (<WorkshopCard key={ws._id} workshop={ws} isSelected={selectedWorkshopIds.includes(ws._id as string)} onSelect={() => toggleWorkshop(ws._id as string)} />))}
                    </div>
                  )}
                  {/* BOTON MOVIDO AQUI (STEP 1) */}
                  <div className="flex justify-end pt-4 mt-6 border-t border-[#EAE0E2] dark:border-white/10">
                    <button
                      disabled={selectedWorkshopIds.length === 0}
                      onClick={handleNextStep}
                      className="px-8 py-3.5 bg-gradient-to-r from-[#D6405F] to-[#F23B69] hover:from-[#F23B69] hover:to-[#D6405F] dark:from-[#F8BBD0] dark:to-[#F48FB1] dark:hover:from-[#F48FB1] dark:hover:to-[#F8BBD0] dark:text-[#1A0B11] text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(214,64,95,0.3)] dark:shadow-[0_4px_14px_rgba(248,187,208,0.3)] hover:scale-[1.02] flex items-center gap-2 uppercase tracking-wide disabled:from-[#EAE0E2] disabled:to-[#EAE0E2] dark:disabled:from-white/10 dark:disabled:to-white/10 disabled:text-[#8C6B79] dark:disabled:text-white/40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 border border-transparent disabled:border-[#EAE0E2] dark:disabled:border-white/10"
                    >
                      Siguiente: Detalles <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-[32px] border border-[#EAE0E2] dark:border-white/10 p-8 shadow-sm flex flex-col gap-10">
                  
                  {/* VARIANTES Y CANTIDADES */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-[#40202D] dark:text-white">Variantes y Cantidades</h2>
                      <button onClick={addVariant} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D6405F]/10 dark:bg-[#F8BBD0]/10 text-xs font-bold text-[#D6405F] dark:text-[#F8BBD0] hover:bg-[#D6405F]/20 dark:hover:bg-[#F8BBD0]/20 transition-all hover:scale-105">
                        <Plus className="h-4 w-4" /> Agregar Variante
                      </button>
                    </div>
                    {/* Aplicar cantidad a todas */}
                    <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-[#D6405F]/5 dark:bg-[#F8BBD0]/5 border border-[#D6405F]/15 dark:border-[#F8BBD0]/15">
                      <span className="text-xs font-medium text-[#8C6B79] dark:text-gray-400 whitespace-nowrap">Aplicar a todas:</span>
                      <BulkQuantityInput onApply={(qty) => setVariants(v => v.map(item => ({ ...item, quantity: qty })))} />
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-4 px-3 pb-1 text-xs font-medium text-[#8C6B79] dark:text-gray-400 uppercase">
                        <div className="col-span-4 px-4">Talla</div><div className="col-span-4 px-4">Color</div><div className="col-span-3 text-center">Cantidad</div><div className="col-span-1"></div>
                      </div>
                      {variants.map(v => (
                        <div key={v.id} className="grid grid-cols-12 gap-4 items-center bg-white/50 dark:bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-[#EAE0E2] dark:border-white/10 shadow-sm hover:border-[#D6405F]/30 dark:hover:border-[#F8BBD0]/30 transition-all group">
                          <input className="col-span-4 bg-white/60 dark:bg-black/40 border border-[#EAE0E2]/50 dark:border-white/5 focus:border-[#D6405F]/50 dark:focus:border-[#F8BBD0]/50 rounded-xl px-4 py-2.5 text-sm font-normal text-[#40202D] dark:text-white outline-none transition-all" type="text" value={v.size} onChange={(e) => updateVariant(v.id, "size", e.target.value)} placeholder="Ej. M, L, XL" />
                          <input className="col-span-4 bg-white/60 dark:bg-black/40 border border-[#EAE0E2]/50 dark:border-white/5 focus:border-[#D6405F]/50 dark:focus:border-[#F8BBD0]/50 rounded-xl px-4 py-2.5 text-sm font-normal text-[#40202D] dark:text-white outline-none transition-all" type="text" value={v.color} onChange={(e) => updateVariant(v.id, "color", e.target.value)} placeholder="Ej. Negro" />
                          <div className="col-span-3 flex items-center justify-between bg-white/60 dark:bg-black/40 border border-[#EAE0E2]/50 dark:border-white/5 rounded-xl p-1.5">
                            <button onClick={() => updateVariant(v.id, "quantity", Math.max(1, v.quantity - 1))} className="h-8 w-8 rounded-lg bg-white dark:bg-zinc-800 text-[#D6405F] dark:text-[#F8BBD0] flex items-center justify-center font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)]">-</button>
                            <span className="flex-1 text-center text-sm font-normal text-[#40202D] dark:text-white">{v.quantity}</span>
                            <button onClick={() => updateVariant(v.id, "quantity", v.quantity + 1)} className="h-8 w-8 rounded-lg bg-white dark:bg-zinc-800 text-[#D6405F] dark:text-[#F8BBD0] flex items-center justify-center font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)]">+</button>
                          </div>
                          <button onClick={() => removeVariant(v.id)} className="col-span-1 text-[#8C6B79] dark:text-[#F8BBD0] transition-colors opacity-30 dark:opacity-40 hover:opacity-100 hover:text-[#D6405F] dark:hover:text-[#F8BBD0] flex justify-center"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* INSUMOS POR PRE-PRODUCCIÓN */}
                  <div className="pt-10 border-t border-[#EAE0E2] dark:border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-sm font-semibold text-[#40202D] dark:text-white">Insumos por Pre-producción</h2>
                        <p className="text-xs text-[#8C6B79] dark:text-gray-400 mt-1 font-normal">Cálculo automático basado en ficha técnica</p>
                      </div>
                      <button onClick={addSupply} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D6405F]/10 dark:bg-[#F8BBD0]/10 text-xs font-bold text-[#D6405F] dark:text-[#F8BBD0] hover:bg-[#D6405F]/20 dark:hover:bg-[#F8BBD0]/20 transition-all hover:scale-105">
                        <Plus className="h-4 w-4" /> Agregar Insumo
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-4 px-3 pb-1 text-xs font-medium text-[#8C6B79] dark:text-gray-400 uppercase">
                        <div className="col-span-5 px-3">Insumo / Consumo Unit.</div>
                        <div className="col-span-4 px-4">Cantidad (Calculada + Adicional)</div>
                        <div className="col-span-2 px-4">Unidad</div>
                        <div className="col-span-1"></div>
                      </div>
                      {supplies.map((s, index) => (
                        <div 
                          key={s.id} 
                          className="grid grid-cols-12 gap-4 items-center bg-white/50 dark:bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-[#EAE0E2] dark:border-white/10 group shadow-sm hover:border-[#D6405F]/30 dark:hover:border-[#F8BBD0]/30 transition-all relative"
                          style={{ zIndex: openDropdownId === s.id ? 50 : supplies.length - index }}
                        >
                          <div className="col-span-5 flex flex-col px-3 py-2 bg-white/60 dark:bg-black/40 border border-[#EAE0E2]/50 dark:border-white/5 rounded-xl">
                            <input className="bg-transparent border-none p-0 text-sm font-medium text-[#40202D] dark:text-white outline-none placeholder:text-[#8C6B79]" type="text" value={s.name} onChange={(e) => updateSupply(s.id, "name", e.target.value)} placeholder="Insumo..." />
                            <span className="text-xs text-[#8C6B79] dark:text-gray-400 font-normal mt-0.5">Consumo: {s.unitConsumption} {s.unit} / prenda</span>
                          </div>
                          <div className="col-span-4 relative">
                            <input
                              className="w-full bg-white/60 dark:bg-black/40 border border-[#EAE0E2]/50 dark:border-white/5 focus:border-[#D6405F]/50 dark:focus:border-[#F8BBD0]/50 rounded-xl px-4 py-3.5 text-sm font-normal text-[#40202D] dark:text-white outline-none transition-all"
                              type="number"
                              step="0.01"
                              min={s.theoreticalQuantity}
                              value={s.totalQuantity}
                              onChange={(e) => updateSupply(s.id, "totalQuantity", parseFloat(e.target.value))}
                            />
                            {s.totalQuantity > s.theoreticalQuantity && (
                              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-bounce">
                                +{(s.totalQuantity - s.theoreticalQuantity).toFixed(2)} Adicional
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 relative">
                            <div 
                              onClick={() => setOpenDropdownId(openDropdownId === s.id ? null : s.id)}
                              className="w-full bg-white/60 dark:bg-black/40 border border-[#EAE0E2]/50 dark:border-white/5 focus:border-[#D6405F]/50 dark:focus:border-[#F8BBD0]/50 rounded-xl px-4 py-3.5 text-sm font-normal text-[#8C6B79] dark:text-gray-300 uppercase cursor-pointer flex justify-between items-center transition-all hover:border-[#D6405F]/30 dark:hover:border-[#F8BBD0]/30"
                            >
                              {s.unit}
                              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdownId === s.id ? "rotate-180 text-[#D6405F] dark:text-[#F8BBD0]" : ""}`} />
                            </div>
                            {openDropdownId === s.id && (
                              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] z-50 overflow-hidden py-1">
                                {["metros", "unidades", "conos"].map(unit => (
                                  <div 
                                    key={unit} 
                                    onClick={() => { updateSupply(s.id, "unit", unit); setOpenDropdownId(null); }}
                                    className="px-4 py-3 text-sm font-normal text-[#40202D] dark:text-white/80 uppercase hover:bg-[#D6405F]/10 dark:hover:bg-[#F8BBD0]/10 hover:text-[#D6405F] dark:hover:text-[#F8BBD0] cursor-pointer transition-colors"
                                  >
                                    {unit}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button onClick={() => removeSupply(s.id)} className="col-span-1 text-[#8C6B79] dark:text-[#F8BBD0] transition-colors flex justify-center opacity-30 dark:opacity-40 hover:opacity-100 hover:text-[#D6405F] dark:hover:text-[#F8BBD0]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                      <div className="mt-4 p-4 bg-gradient-to-r from-[#D6405F]/5 to-transparent dark:from-[#F8BBD0]/5 rounded-2xl flex items-start gap-3 border border-dashed border-[#D6405F]/20 dark:border-[#F8BBD0]/20">
                        <Calculator className="h-5 w-5 text-[#D6405F] dark:text-[#F8BBD0] shrink-0 mt-0.5" />
                        <p className="text-[11px] text-[#8C6B79] dark:text-gray-300 leading-relaxed font-normal">
                          Los valores se calculan automáticamente multiplicando el consumo unitario por el total de <span className="font-bold text-[#D6405F] dark:text-[#F8BBD0]">{totalQuantity} unidades</span>.
                          Puedes aumentar la cantidad para incluir material adicional, pero el sistema no permitirá reducirlo por debajo del mínimo teórico necesario.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-[32px] border border-[#EAE0E2] dark:border-white/10 p-8 shadow-sm">
                    <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-[#40202D] dark:text-white"><Calendar className="h-4 w-4 text-[#D6405F] dark:text-[#F8BBD0]" /> Fecha Requerida</h2>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                      className="w-full bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-normal text-[#40202D] dark:text-white outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] shadow-inner"
                    />
                    <p className="mt-3 text-xs text-[#8C6B79] dark:text-gray-400 flex items-center gap-1.5 font-normal"><Info className="h-3.5 w-3.5 text-[#D6405F] dark:text-[#F8BBD0]" /> Máximo 7 días desde hoy para producción express</p>
                  </div>
                  <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-[32px] border border-[#EAE0E2] dark:border-white/10 p-8 shadow-sm">
                    <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-[#40202D] dark:text-white"><MessageSquare className="h-4 w-4 text-[#D6405F] dark:text-[#F8BBD0]" /> Observaciones</h2>
                    <textarea value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Instrucciones especiales para el taller..." className="w-full bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-normal text-[#40202D] dark:text-white outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] min-h-[120px] resize-none shadow-inner custom-scrollbar" />
                  </div>
                </div>
                {/* BOTON MOVIDO AQUI (STEP 2) */}
                <div className="flex justify-end pt-4 mt-6 border-t border-[#EAE0E2] dark:border-white/10 gap-4">
                  <button onClick={() => setStep(1)} className="px-8 py-3.5 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-[#EAE0E2] dark:border-white/10 text-[#8C6B79] dark:text-gray-300 text-sm font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:scale-[1.02] flex items-center gap-2 uppercase tracking-wide">
                    Atrás
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#D6405F] to-[#F23B69] hover:from-[#F23B69] hover:to-[#D6405F] dark:from-[#F8BBD0] dark:to-[#F48FB1] dark:hover:from-[#F48FB1] dark:hover:to-[#F8BBD0] dark:text-[#1A0B11] text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(214,64,95,0.3)] dark:shadow-[0_4px_14px_rgba(248,187,208,0.3)] hover:scale-[1.02] flex items-center gap-2 uppercase tracking-wide"
                  >
                    Crear Orden de Producción <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        panelClassName="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-[32px] shadow-2xl dark:shadow-[0_16px_40px_rgb(0,0,0,0.5)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-8 pt-8 pb-6 border-b border-rose-50 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[#594246] dark:text-white font-(--font-vidaloka)">
              Contactar con {selectedWorkshopIds.length > 1 ? "Talleres" : "Taller"}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-sm font-semibold text-[#9b8088] dark:text-gray-400">{product?.product_name}</span>
              <span className="text-[#F2D0D3] dark:text-white/20">•</span>
              {selectedWorkshopIds.map(id => {
                const ws = workshops.find(w => w._id === id);
                return (
                  <span key={id} className="bg-rose-50 dark:bg-[#F8BBD0]/10 text-[#F2778D] dark:text-[#F8BBD0] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-rose-100 dark:border-[#F8BBD0]/20">
                    {ws?.name_company}
                  </span>
                );
              })}
            </div>
          </div>
          <button onClick={() => setShowConfirmModal(false)} className="p-2 hover:bg-rose-50 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="h-6 w-6 text-[#b79ca5] dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="bg-[#FFF0F2] dark:bg-[#D6405F]/10 rounded-2xl p-6 flex items-center justify-between border border-transparent dark:border-[#D6405F]/20">
            <span className="text-sm font-bold text-[#594246] dark:text-white/80 uppercase tracking-wider">Total solicitado:</span>
            <span className="text-2xl font-bold text-[#F2778D] dark:text-[#F8BBD0]">{totalQuantity} unid.</span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#594246] dark:text-white/80 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Scissors className="h-4 w-4 text-[#F2778D] dark:text-[#F8BBD0]" /> Ficha Tecnica de Insumos
            </h4>
            <div className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-white/70 backdrop-blur-2xl dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-2xl overflow-hidden transition-[background-color,border-color] duration-[600ms]">
              <table className="w-full text-left border-collapse">
                <thead className="relative transition-[background-color,border-color] duration-[600ms]">
                  <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-medium uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                    <th className="px-6 py-3 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Insumo</th>
                    <th className="px-6 py-3 text-right border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Cantidad</th>
                    <th className="px-6 py-3 text-right border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Unidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {supplies.map((s, idx) => (
                    <tr key={s.id} className={`text-sm text-[#594246] dark:text-gray-300 transition-colors group/row ${idx % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                      <td className="px-6 py-4 font-medium">{s.name}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#D6405F] dark:text-[#F8BBD0]">{s.totalQuantity.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-[#9b8088]">{s.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-[#594246] dark:text-white/80 uppercase tracking-widest mb-3">Fecha</h4>
              <div className="bg-[#FCFBFB] dark:bg-white/5 border border-rose-50 dark:border-white/10 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-[#b79ca5] dark:text-gray-400 uppercase mb-1">Fecha Límite Solicitada</p>
                <p className="text-sm font-bold text-[#594246] dark:text-white">{requiredDate}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#594246] dark:text-white/80 uppercase tracking-widest mb-3">Observaciones</h4>
              <div className="bg-[#FCFBFB] dark:bg-white/5 border border-rose-50 dark:border-white/10 rounded-2xl p-4 min-h-[80px]">
                <p className="text-sm text-[#9b8088] dark:text-gray-300 leading-relaxed italic">
                  {observations || "Sin observaciones adicionales."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-rose-50/30 dark:bg-black/20 border-t border-rose-50 dark:border-white/10 flex gap-4">
          <CTA
            onClick={() => setShowConfirmModal(false)}
            className="flex-1 !bg-white dark:!bg-white/5 border-2 border-[#F2778D] dark:border-[#F8BBD0]/50 !text-[#F2778D] dark:!text-[#F8BBD0] hover:!bg-rose-50 dark:hover:!bg-white/10"
          >
            Rechazar
          </CTA>
          <CTA
            onClick={submitOrder}
            className="flex-[2] !bg-[#F2778D] dark:!bg-gradient-to-r dark:!from-[#D6405F] dark:!to-[#F23B69] !text-white shadow-lg shadow-rose-200 dark:shadow-none hover:!bg-[#d9657a] dark:hover:!from-[#F23B69] dark:hover:!to-[#D6405F]"
          >
            Confirmar Orden con Taller
          </CTA>
        </div>
      </Modal>

      {/* MODAL DE PROCESAMIENTO */}
      <Modal
        open={isProcessing}
        onClose={() => { }}
        panelClassName="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-[32px] shadow-2xl w-full max-w-sm p-12 flex flex-col items-center text-center space-y-6"
      >
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 border-4 border-rose-50 dark:border-white/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-[#F2778D] dark:border-[#F8BBD0] rounded-full border-t-transparent animate-spin" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[#594246] dark:text-white font-(--font-vidaloka)">Procesando orden de producción</h3>
          <p className="text-sm text-[#9b8088] dark:text-gray-400 mt-3 leading-relaxed">
            Estamos registrando la orden con el taller. Por favor espera unos segundos.
          </p>
          <p className="text-xs font-bold text-[#F2778D] dark:text-[#F8BBD0] mt-4 uppercase tracking-widest">No cierres esta ventana</p>
        </div>
      </Modal>

      {/* MODAL DE INTELIGENCIA DE ABASTECIMIENTO (RESULTADO) */}
      <Modal
        open={showSuccessResult}
        onClose={() => setShowSuccessResult(false)}
        panelClassName="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg dark:shadow-[0_16px_40px_rgb(0,0,0,0.5)] w-full max-w-lg p-6 space-y-6"
      >
        <div className="flex items-center gap-4 border-b border-rose-50 dark:border-white/10 pb-4">
          <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#594246] dark:text-white">Orden registrada</h3>
            <p className="text-xs text-[#9b8088] dark:text-gray-400">La orden de pre-producción se creó exitosamente.</p>
          </div>
        </div>

        <div className="bg-rose-50/50 dark:bg-white/5 rounded-xl p-4 flex justify-between items-center border border-rose-100 dark:border-white/10">
          <div>
            <p className="text-[10px] font-bold text-[#b79ca5] dark:text-gray-400 uppercase">N° Orden</p>
            <p className="text-sm font-bold text-[#594246] dark:text-white">OP-{Math.floor(Math.random() * 900000 + 100000)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-[#b79ca5] dark:text-gray-400 uppercase">Estado</p>
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-500/20 uppercase">
              Contacto inicial
            </span>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          <div>
            <h4 className="text-xs font-bold text-[#594246] dark:text-white/80 uppercase tracking-wider mb-3">Información clave</h4>
            <div className="bg-rose-50/20 dark:bg-white/5 rounded-xl border border-rose-50 dark:border-white/10 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088] dark:text-gray-400">Producto</span>
                <span className="font-bold text-[#594246] dark:text-white">{product?.product_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088] dark:text-gray-400">{selectedWorkshopIds.length > 1 ? "Talleres" : "Taller"}</span>
                <span className="font-bold text-[#594246] dark:text-white text-right max-w-[200px]">
                  {selectedWorkshopIds.map(id => workshops.find(w => w._id === id)?.name_company).join(", ")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088] dark:text-gray-400">Cantidad total</span>
                <span className="font-bold text-[#594246] dark:text-white">{totalQuantity} unidades</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088] dark:text-gray-400">Fecha de creación</span>
                <span className="font-bold text-[#594246] dark:text-white">
                  {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-rose-50 dark:bg-white/10" />

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#594246] dark:text-white/80 uppercase tracking-wider">Resumen de Stock</h4>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088] dark:text-gray-400">Stock actual</span>
                <span className="font-bold text-[#594246] dark:text-white">{product?.stock || 0} unidades</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088] dark:text-gray-400">Stock mínimo</span>
                <span className="font-bold text-[#594246] dark:text-white">{product?.minimum || 0} unidades</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#F2778D] dark:text-[#F8BBD0] font-medium">Cantidad solicitada</span>
                <span className="font-bold text-[#F2778D] dark:text-[#F8BBD0]">{totalQuantity} unidades</span>
              </div>

              <div className="pt-3 border-t border-rose-100 dark:border-white/10 flex justify-between items-center">
                <span className="text-sm font-bold text-[#594246] dark:text-white">Diferencia faltante</span>
                <span className="text-lg font-bold text-rose-500 dark:text-rose-400">
                  {Math.max(0, (product?.minimum || 0) - ((product?.stock || 0) + totalQuantity))} unidades
                </span>
              </div>
            </div>

            {(product?.minimum || 0) > ((product?.stock || 0) + totalQuantity) && (
              <div className="bg-rose-50 dark:bg-rose-500/10 rounded-lg p-3 flex items-start gap-3 border border-rose-100 dark:border-rose-500/20">
                <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-600 dark:text-rose-300 leading-tight">
                  Aún faltan <strong>{(product?.minimum || 0) - ((product?.stock || 0) + totalQuantity)} unidades</strong> para alcanzar el stock mínimo. ¿Deseas planificar el resto ahora?
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {(product?.minimum || 0) > ((product?.stock || 0) + totalQuantity) ? (
            <>
              <CTA
                onClick={handleReorderRemaining}
                className="w-full !bg-white dark:!bg-white/5 border border-[#f2b6c1] dark:border-[#F8BBD0]/50 !text-[#594246] dark:!text-[#F8BBD0]"
              >
                Cubrir faltantes
              </CTA>
              <CTA
                onClick={() => router.push("/admin/production")}
                className="w-full"
              >
                Finalizar por ahora
              </CTA>
            </>
          ) : (
            <CTA
              onClick={() => router.push("/admin/production")}
              className="w-full"
            >
              Volver al Dashboard
            </CTA>
          )}
        </div>
      </Modal>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F2D0D3; border-radius: 10px; }
      `}</style>
    </section>
  );
}

function BulkQuantityInput({ onApply }: { onApply: (qty: number) => void }) {
  const [value, setValue] = useState(5);
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex items-center bg-white/60 dark:bg-black/40 border border-[#EAE0E2]/50 dark:border-white/5 rounded-xl p-1">
        <button onClick={() => setValue(v => Math.max(1, v - 1))} className="h-7 w-7 rounded-lg bg-white dark:bg-zinc-800 text-[#D6405F] dark:text-[#F8BBD0] flex items-center justify-center font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-sm">-</button>
        <input
          type="number" min={1} value={value}
          onChange={e => setValue(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-12 text-center bg-transparent text-sm font-medium text-[#40202D] dark:text-white outline-none"
        />
        <button onClick={() => setValue(v => v + 1)} className="h-7 w-7 rounded-lg bg-white dark:bg-zinc-800 text-[#D6405F] dark:text-[#F8BBD0] flex items-center justify-center font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-sm">+</button>
      </div>
      <button
        onClick={() => onApply(value)}
        className="px-4 py-2 rounded-xl bg-[#D6405F] text-white text-xs font-bold hover:bg-[#F23B69] transition-all hover:scale-105 shadow-sm"
      >
        Aplicar
      </button>
    </div>
  );
}

function WorkshopCard({ workshop, isSelected, onSelect }: { workshop: Workshop; isSelected: boolean; onSelect: () => void }) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { label: 'Capacidad Disponible', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
      case 'LIMITED': return { label: 'Capacidad Limitada', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' };
      case 'SATURATED': return { label: 'Saturado', color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' };
      default: return { label: 'Inactivo', color: 'text-gray-400 dark:text-gray-500', bg: 'bg-gray-50 dark:bg-gray-500/10' };
    }
  };
  const status = getStatusInfo(workshop.operating_status || 'AVAILABLE');
  const orderCount = 0; // Número fijo por ahora ya que el sistema es nuevo
  return (
    <div onClick={onSelect} className={`relative p-5 rounded-2xl border transition-all cursor-pointer group ${isSelected ? "border-[#D6405F] dark:border-[#F8BBD0] bg-[#D6405F]/5 dark:bg-[#F8BBD0]/10 shadow-md backdrop-blur-md" : "border-[#EAE0E2] dark:border-[rgba(255,255,255,0.1)] bg-white/50 dark:bg-[rgba(255,255,255,0.03)] hover:border-[#D6405F] dark:hover:border-[#F8BBD0] hover:bg-white/80 dark:hover:bg-[rgba(255,255,255,0.08)] backdrop-blur-md hover:shadow-sm"}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-[#40202D] dark:text-[#e8d8dc] group-hover:text-[#D6405F] dark:group-hover:text-[#F8BBD0] transition-colors">{workshop.name_company}</h4>
          <span className="px-2 py-0.5 bg-[#FFF0F2] dark:bg-[#F8BBD0]/10 text-[#D6405F] dark:text-[#F8BBD0] text-[9px] font-medium rounded-md uppercase tracking-wider">{workshop.specialty}</span>
        </div>
        {isSelected && <div className="h-6 w-6 bg-[#D6405F] dark:bg-[#F8BBD0] rounded-full flex items-center justify-center text-white dark:text-[#1A0B11] shadow-sm"><CheckCircle2 className="h-4 w-4" /></div>}
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#8C6B79] dark:text-white/70"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{workshop.address}</span></div>
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#EAE0E2] dark:border-[rgba(255,255,255,0.1)]">
          <div>
            <span className="text-[9px] font-medium text-[#8C6B79] dark:text-white/60 uppercase tracking-tighter">Órdenes Realizadas</span>
            <p className="text-sm font-semibold text-[#40202D] dark:text-[#e8d8dc]">{orderCount} {Number(orderCount) === 1 ? 'pedido' : 'pedidos'}</p>
          </div>
          <div className="flex flex-col items-end"><span className="text-[9px] font-medium text-[#8C6B79] dark:text-white/60 uppercase tracking-tighter">Historial</span><button onClick={(e) => { e.stopPropagation(); alert("Historial..."); }} className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#D6405F] dark:text-[#F8BBD0] hover:text-[#F23B69] dark:hover:text-[#F48FB1] transition-colors"><MessageSquare className="h-3.5 w-3.5" /> Ver notas</button></div>
        </div>
        <div className={`mt-2 py-2 px-3 rounded-xl ${status.bg} flex items-center justify-between border border-[rgba(255,255,255,0.05)] shadow-inner`}>
          <div className="flex items-center gap-1.5"><Clock className={`h-3 w-3 ${status.color}`} /><span className={`text-[10px] font-medium uppercase tracking-tight ${status.color}`}>{status.label}</span></div>
          <span className="text-[10px] font-medium text-[#8C6B79] dark:text-gray-400">{workshop.weekly_capacity} prendas / sem</span>
        </div>
      </div>
    </div>
  );
}
