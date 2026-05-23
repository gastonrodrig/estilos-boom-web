"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Search, CheckCircle2, MapPin,
  ArrowLeft, Info, Package2,
  TrendingUp, Clock, AlertCircle,
  Plus, Trash2, Calendar, MessageSquare,
  ChevronRight, Scissors, Star, Calculator, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
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

  // Recalcular insumos automáticamente cuando cambie la cantidad total o el producto
  useEffect(() => {
    if (totalQuantity > 0) {
      const categoryRaw = (prefillData?.items?.[0]?.category_name || "DEFAULT").toUpperCase();
      // Búsqueda inteligente: si la categoría real contiene alguna de nuestras claves
      const categoryKey = Object.keys(categoryBOMs).find(key => categoryRaw.includes(key)) || "DEFAULT";
      const bomToUse = categoryBOMs[categoryKey];

      setSupplies(bomToUse.map((item, idx) => {
        const theoretical = parseFloat((item.unitConsumption * totalQuantity).toFixed(2));
        return {
          id: idx.toString(),
          name: item.name,
          unitConsumption: item.unitConsumption,
          theoreticalQuantity: theoretical,
          totalQuantity: theoretical,
          unit: item.unit
        };
      }));
    }
  }, [totalQuantity, prefillData, categoryBOMs]);

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

  const submitOrder = () => {
    setShowConfirmModal(false);

    // Pequeño delay para dejar que el primer modal cierre bien
    setTimeout(() => {
      setIsProcessing(true);

      // Simulación de procesamiento e inteligencia de stock
      setTimeout(() => {
        setIsProcessing(false);

        // Crear orden mockeada para flujo local
        const product = prefillData?.items?.[0];
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
    <section className="mx-auto max-w-7xl px-4 py-8 space-y-8 min-h-screen bg-[#FDFCFB]">
      <nav className="flex items-center gap-2 text-sm text-[#9b8088] mb-2">
        <span onClick={() => router.push("/admin/pre-production")} className="hover:text-[#F2778D] cursor-pointer">Inventario</span>
        <span className="text-rose-200">/</span>
        <span onClick={() => setStep(1)} className={`cursor-pointer ${step === 1 ? 'font-semibold text-[#594246]' : 'hover:text-[#F2778D]'}`}>Planificar Producción</span>
        {step === 2 && <><span className="text-rose-200">/</span><span className="font-semibold text-[#594246]">Detalles Producción</span></>}
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-(--font-vidaloka) text-4xl text-[#594246]">{step === 1 ? "Planificar Producción" : "Detalles de Producción"}</h1>
          <p className="text-[#9b8088] text-sm mt-1">{step === 1 ? "Selecciona uno o más talleres" : "Define cantidades e insumos automáticos"}</p>
        </div>
        <button onClick={() => step === 1 ? router.back() : setStep(1)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#b79ca5] hover:text-[#594246]">
          <ArrowLeft className="h-4 w-4" /> {step === 1 ? "Volver al Tablero" : "Cambiar Talleres"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[32px] border border-rose-100 p-6 shadow-sm overflow-hidden">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#b79ca5] mb-5">Información del Producto</h2>
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 mb-6 group">
              {product?.product_image ? (
                <Image src={product.product_image} alt={product.product_name} fill className="object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center"><Package2 className="h-16 w-16 text-rose-200" /></div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#b79ca5] uppercase tracking-wider">Producto Seleccionado</span>
                <p className="text-xl font-medium text-[#594246] uppercase leading-tight mt-0.5">{product?.product_name || "Cargando..."}</p>
                <div className="mt-2 inline-block px-2 py-0.5 bg-[#F2778D] text-white text-[10px] font-bold rounded-md uppercase">{product?.category_name || "Prenda de Vestir"}</div>
              </div>
              <div className="pt-4 border-t border-rose-50 space-y-3">
                <div className="flex justify-between items-center text-sm"><span className="text-[#9b8088]">Stock Actual</span><div className="flex items-center gap-1.5 font-bold text-[#F2778D]"><span>{product?.stock || 0}</span><AlertCircle className="h-3.5 w-3.5" /></div></div>
                <div className="flex justify-between items-center text-sm"><span className="text-[#9b8088]">Stock Mínimo</span><span className="font-bold text-[#594246]">{product?.minimum || 0}</span></div>
              </div>
              <div className="mt-6 p-5 rounded-2xl bg-[#FFF5F6] border border-rose-100 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2"><Info className="h-4 w-4 text-[#F2778D]" /><span className="text-[10px] font-bold text-[#F2778D] uppercase tracking-wider">Sugerencia del Sistema</span></div>
                  <div className="flex justify-between items-baseline"><span className="text-sm text-[#594246] font-medium">Unidades a Producir</span><span className="text-2xl font-bold text-[#F2778D]">{totalQuantity}</span></div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5"><TrendingUp className="h-20 w-20 text-[#F2778D]" /></div>
              </div>
            </div>
          </div>
          {step === 2 && (
            <div className="bg-rose-50 rounded-[32px] border border-rose-100 p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#F2778D] mb-4">Talleres Asignados</h3>
              <div className="space-y-3">
                {selectedWorkshopIds.map(id => {
                  const ws = workshops.find(w => w._id === id);
                  return ws ? (
                    <div key={id} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-rose-100">
                      <Scissors className="h-4 w-4 text-[#F2778D]" />
                      <span className="text-sm font-bold text-[#594246] truncate">{ws.name_company}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="bg-[#594246] text-white rounded-[32px] p-8 shadow-xl shadow-rose-200/40 mt-auto">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-200/60 mb-6 font-sans">Configuración de Orden</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-rose-100/80 font-medium">Total a producir:</span>
                <span className="text-xl font-bold text-white">{totalQuantity} unidades</span>
              </div>
              <div className="h-px bg-white/10 w-full" />
              <button
                disabled={step === 1 && selectedWorkshopIds.length === 0}
                onClick={step === 1 ? handleNextStep : handleConfirmOrder}
                className="w-full py-5 bg-[#F2778D] hover:bg-[#d9667a] disabled:bg-[#7a6a6d] text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-rose-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {step === 1 ? (
                  <>Siguiente: Detalles <ChevronRight className="h-4 w-4" /></>
                ) : (
                  "Crear Orden de Producción"
                )}
              </button>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-8">
          <div key={step} style={{ animation: "fadeIn 0.3s ease-out" }} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="bg-white rounded-[32px] border border-rose-100 p-8 shadow-sm">
                  <div className="flex flex-col xl:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#b79ca5]" />
                      <input type="text" placeholder="Buscar taller..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-14 pl-12 pr-6 rounded-2xl border border-rose-50 bg-[#FCFBFB] outline-none focus:ring-2 focus:ring-[#F2778D]/20 transition-all" />
                    </div>
                    <div className="flex gap-4">
                      <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)} className="h-14 px-6 rounded-2xl border border-rose-50 bg-[#FCFBFB] text-xs font-bold text-[#594246] outline-none">
                        {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-14 px-6 rounded-2xl border border-rose-50 bg-[#FCFBFB] text-xs font-bold text-[#594246] outline-none">
                        <option value="TODOS">TODOS LOS ESTADOS</option>
                        <option value="AVAILABLE">DISPONIBLE</option>
                        <option value="LIMITED">LIMITADO</option>
                        <option value="SATURATED">SATURADO</option>
                      </select>
                    </div>
                  </div>
                  {loading ? (<div className="py-20 text-center"><div className="h-10 w-10 border-4 border-[#F2778D] border-t-transparent rounded-full animate-spin mx-auto" /></div>) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredWorkshops.map((ws) => (<WorkshopCard key={ws._id} workshop={ws} isSelected={selectedWorkshopIds.includes(ws._id as string)} onSelect={() => toggleWorkshop(ws._id as string)} />))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-[32px] border border-rose-100 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-normal text-[#594246] font-(--font-vidaloka)">Variantes y Cantidades</h2><button onClick={addVariant} className="flex items-center gap-1.5 text-xs font-bold text-[#F2778D]"><Plus className="h-4 w-4" /> Agregar Variante</button></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-bold uppercase tracking-widest text-[#b79ca5]">
                      <div className="col-span-4">Talla</div><div className="col-span-4">Color</div><div className="col-span-3">Cantidad</div><div className="col-span-1"></div>
                    </div>
                    {variants.map(v => (
                      <div key={v.id} className="grid grid-cols-12 gap-4 items-center bg-[#FCFBFB] p-2 rounded-2xl border border-rose-50">
                        <input className="col-span-4 bg-white border border-rose-50 rounded-xl px-4 py-2 text-sm text-[#594246] outline-none" type="text" value={v.size} onChange={(e) => updateVariant(v.id, "size", e.target.value)} />
                        <input className="col-span-4 bg-white border border-rose-50 rounded-xl px-4 py-2 text-sm text-[#594246] outline-none" type="text" value={v.color} onChange={(e) => updateVariant(v.id, "color", e.target.value)} />
                        <div className="col-span-3 flex items-center gap-2">
                          <button onClick={() => updateVariant(v.id, "quantity", Math.max(1, v.quantity - 1))} className="h-8 w-8 rounded-lg bg-rose-100 text-[#F2778D] flex items-center justify-center font-bold">-</button>
                          <span className="w-8 text-center text-sm font-bold text-[#594246]">{v.quantity}</span>
                          <button onClick={() => updateVariant(v.id, "quantity", v.quantity + 1)} className="h-8 w-8 rounded-lg bg-rose-100 text-[#F2778D] flex items-center justify-center font-bold">+</button>
                        </div>
                        <button onClick={() => removeVariant(v.id)} className="col-span-1 text-rose-200 hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[32px] border border-rose-100 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-normal text-[#594246] font-(--font-vidaloka)">Insumos por Pre-producción</h2>
                      <p className="text-[10px] text-[#9b8088] mt-1 uppercase font-bold tracking-widest">Cálculo automático basado en ficha técnica</p>
                    </div>
                    <button onClick={addSupply} className="flex items-center gap-1.5 text-xs font-bold text-[#F2778D]"><Plus className="h-4 w-4" /> Agregar Insumo</button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-bold uppercase tracking-widest text-[#b79ca5]">
                      <div className="col-span-5">Insumo / Consumo Unit.</div>
                      <div className="col-span-4">Cantidad (Calculada + Adicional)</div>
                      <div className="col-span-2">Unidad</div>
                      <div className="col-span-1"></div>
                    </div>
                    {supplies.map(s => (
                      <div key={s.id} className="grid grid-cols-12 gap-4 items-center bg-[#FCFBFB] p-2 rounded-2xl border border-rose-50 group">
                        <div className="col-span-5 flex flex-col px-4">
                          <input className="bg-transparent border-none p-0 text-sm font-bold text-[#594246] outline-none" type="text" value={s.name} onChange={(e) => updateSupply(s.id, "name", e.target.value)} placeholder="Insumo..." />
                          <span className="text-[9px] text-[#F2778D] font-bold uppercase">Consumo: {s.unitConsumption} {s.unit} / prenda</span>
                        </div>
                        <div className="col-span-4 relative">
                          <input
                            className="w-full bg-white border border-rose-100 rounded-xl px-4 py-2 text-sm font-bold text-[#594246] outline-none focus:border-[#F2778D]"
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
                        <div className="col-span-2">
                          <select className="w-full bg-transparent text-xs font-bold text-[#b79ca5] uppercase outline-none" value={s.unit} onChange={(e) => updateSupply(s.id, "unit", e.target.value)}>
                            <option value="metros">metros</option><option value="unidades">unidades</option><option value="conos">conos</option>
                          </select>
                        </div>
                        <button onClick={() => removeSupply(s.id)} className="col-span-1 text-rose-100 hover:text-rose-500 transition-colors flex justify-center"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                    <div className="mt-4 p-4 bg-rose-50/50 rounded-2xl flex items-start gap-3 border border-dashed border-rose-200">
                      <Calculator className="h-5 w-5 text-[#F2778D] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#9b8088] leading-relaxed">
                        Los valores se calculan automáticamente multiplicando el consumo unitario por el total de <span className="font-bold text-[#F2778D]">{totalQuantity} unidades</span>.
                        Puedes aumentar la cantidad para incluir material adicional, pero el sistema no permitirá reducirlo por debajo del mínimo teórico necesario.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-[32px] border border-rose-100 p-8 shadow-sm">
                    <h2 className="text-xl font-normal mb-4 flex items-center gap-2 text-[#594246] font-(--font-vidaloka)"><Calendar className="h-5 w-5 text-[#F2778D]" /> Fecha Requerida</h2>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                      className="w-full bg-[#FCFBFB] border border-rose-50 rounded-2xl px-6 py-4 text-sm font-bold text-[#594246] outline-none focus:ring-2 focus:ring-[#F2778D]/20"
                    />
                    <p className="mt-3 text-[11px] text-[#9b8088] flex items-center gap-1.5 font-medium uppercase tracking-wider"><Info className="h-3.5 w-3.5 text-[#F2778D]" /> Máximo 7 días desde hoy para producción express</p>
                  </div>
                  <div className="bg-white rounded-[32px] border border-rose-100 p-8 shadow-sm">
                    <h2 className="text-xl font-normal mb-4 flex items-center gap-2 text-[#594246] font-(--font-vidaloka)"><MessageSquare className="h-5 w-5 text-[#F2778D]" /> Observaciones</h2>
                    <textarea value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Instrucciones especiales para el taller..." className="w-full bg-[#FCFBFB] border border-rose-50 rounded-2xl px-6 py-4 text-sm text-[#594246] outline-none focus:ring-2 focus:ring-[#F2778D]/20 min-h-[120px] resize-none" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        panelClassName="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-8 pt-8 pb-6 border-b border-rose-50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[#594246] font-(--font-vidaloka)">
              Contactar con {selectedWorkshopIds.length > 1 ? "Talleres" : "Taller"}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-sm font-semibold text-[#9b8088]">{product?.product_name}</span>
              <span className="text-[#F2D0D3]">•</span>
              {selectedWorkshopIds.map(id => {
                const ws = workshops.find(w => w._id === id);
                return (
                  <span key={id} className="bg-rose-50 text-[#F2778D] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-rose-100">
                    {ws?.name_company}
                  </span>
                );
              })}
            </div>
          </div>
          <button onClick={() => setShowConfirmModal(false)} className="p-2 hover:bg-rose-50 rounded-full transition-colors">
            <X className="h-6 w-6 text-[#b79ca5]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="bg-[#FFF0F2] rounded-2xl p-6 flex items-center justify-between">
            <span className="text-sm font-bold text-[#594246] uppercase tracking-wider">Total solicitado:</span>
            <span className="text-2xl font-bold text-[#F2778D]">{totalQuantity} unid.</span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#594246] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Scissors className="h-4 w-4 text-[#F2778D]" /> Ficha Tecnica de Insumos
            </h4>
            <div className="bg-[#FCFBFB] border border-rose-50 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-rose-50/50">
                  <tr className="text-[10px] font-bold text-[#b79ca5] uppercase tracking-[0.2em]">
                    <th className="px-6 py-3">Insumo</th>
                    <th className="px-6 py-3 text-right">Cantidad</th>
                    <th className="px-6 py-3 text-right">Unidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {supplies.map((s) => (
                    <tr key={s.id} className="text-sm text-[#594246]">
                      <td className="px-6 py-4 font-medium">{s.name}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#F2778D]">{s.totalQuantity.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-[#9b8088]">{s.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-[#594246] uppercase tracking-widest mb-3">Fecha</h4>
              <div className="bg-[#FCFBFB] border border-rose-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-[#b79ca5] uppercase mb-1">Fecha Límite Solicitada</p>
                <p className="text-sm font-bold text-[#594246]">{requiredDate}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#594246] uppercase tracking-widest mb-3">Observaciones</h4>
              <div className="bg-[#FCFBFB] border border-rose-50 rounded-2xl p-4 min-h-[80px]">
                <p className="text-sm text-[#9b8088] leading-relaxed italic">
                  {observations || "Sin observaciones adicionales."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-rose-50/30 border-t border-rose-50 flex gap-4">
          <CTA
            onClick={() => setShowConfirmModal(false)}
            className="flex-1 !bg-white border-2 border-[#F2778D] !text-[#F2778D] hover:!bg-rose-50"
          >
            Rechazar
          </CTA>
          <CTA
            onClick={submitOrder}
            className="flex-[2] !bg-[#F2778D] !text-white shadow-lg shadow-rose-200 hover:!bg-[#d9657a]"
          >
            Confirmar Orden con Taller
          </CTA>
        </div>
      </Modal>

      {/* MODAL DE PROCESAMIENTO */}
      <Modal
        open={isProcessing}
        onClose={() => { }}
        panelClassName="relative bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-12 flex flex-col items-center text-center space-y-6"
      >
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 border-4 border-rose-50 rounded-full" />
          <div className="absolute inset-0 border-4 border-[#F2778D] rounded-full border-t-transparent animate-spin" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[#594246] font-(--font-vidaloka)">Procesando orden de producción</h3>
          <p className="text-sm text-[#9b8088] mt-3 leading-relaxed">
            Estamos registrando la orden con el taller. Por favor espera unos segundos.
          </p>
          <p className="text-xs font-bold text-[#F2778D] mt-4 uppercase tracking-widest">No cierres esta ventana</p>
        </div>
      </Modal>

      {/* MODAL DE INTELIGENCIA DE ABASTECIMIENTO (RESULTADO) */}
      <Modal
        open={showSuccessResult}
        onClose={() => setShowSuccessResult(false)}
        panelClassName="relative bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-6"
      >
        <div className="flex items-center gap-4 border-b border-rose-50 pb-4">
          <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#594246]">Orden registrada</h3>
            <p className="text-xs text-[#9b8088]">La orden de pre-producción se creó exitosamente.</p>
          </div>
        </div>

        <div className="bg-rose-50/50 rounded-xl p-4 flex justify-between items-center border border-rose-100">
          <div>
            <p className="text-[10px] font-bold text-[#b79ca5] uppercase">N° Orden</p>
            <p className="text-sm font-bold text-[#594246]">OP-{Math.floor(Math.random() * 900000 + 100000)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Estado</p>
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
              Contacto inicial
            </span>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          <div>
            <h4 className="text-xs font-bold text-[#594246] uppercase tracking-wider mb-3">Información clave</h4>
            <div className="bg-rose-50/20 rounded-xl border border-rose-50 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088]">Producto</span>
                <span className="font-bold text-[#594246]">{product?.product_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088]">{selectedWorkshopIds.length > 1 ? "Talleres" : "Taller"}</span>
                <span className="font-bold text-[#594246] text-right max-w-[200px]">
                  {selectedWorkshopIds.map(id => workshops.find(w => w._id === id)?.name_company).join(", ")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088]">Cantidad total</span>
                <span className="font-bold text-[#594246]">{totalQuantity} unidades</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088]">Fecha de creación</span>
                <span className="font-bold text-[#594246]">
                  {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-rose-50" />

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#594246] uppercase tracking-wider">Resumen de Stock</h4>

            <div className="bg-white border border-rose-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088]">Stock actual</span>
                <span className="font-bold text-[#594246]">{product?.stock || 0} unidades</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9b8088]">Stock mínimo</span>
                <span className="font-bold text-[#594246]">{product?.minimum || 0} unidades</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#F2778D] font-medium">Cantidad solicitada</span>
                <span className="font-bold text-[#F2778D]">{totalQuantity} unidades</span>
              </div>

              <div className="pt-3 border-t border-rose-100 flex justify-between items-center">
                <span className="text-sm font-bold text-[#594246]">Diferencia faltante</span>
                <span className="text-lg font-bold text-rose-500">
                  {Math.max(0, (product?.minimum || 0) - ((product?.stock || 0) + totalQuantity))} unidades
                </span>
              </div>
            </div>

            {(product?.minimum || 0) > ((product?.stock || 0) + totalQuantity) && (
              <div className="bg-rose-50 rounded-lg p-3 flex items-start gap-3 border border-rose-100">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-600 leading-tight">
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
                className="w-full !bg-white border border-[#f2b6c1] !text-[#594246]"
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

function WorkshopCard({ workshop, isSelected, onSelect }: { workshop: Workshop; isSelected: boolean; onSelect: () => void }) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { label: 'Capacidad Disponible', color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'LIMITED': return { label: 'Capacidad Limitada', color: 'text-amber-500', bg: 'bg-amber-50' };
      case 'SATURATED': return { label: 'Saturado', color: 'text-rose-500', bg: 'bg-rose-50' };
      default: return { label: 'Inactivo', color: 'text-gray-400', bg: 'bg-gray-50' };
    }
  };
  const status = getStatusInfo(workshop.operating_status || 'AVAILABLE');
  const orderCount = 0; // Número fijo por ahora ya que el sistema es nuevo
  return (
    <div onClick={onSelect} className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer group ${isSelected ? "border-[#F2778D] bg-rose-50/30 shadow-md" : "border-rose-50 bg-white hover:border-rose-200 hover:shadow-sm"}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-[#594246] group-hover:text-[#F2778D] transition-colors">{workshop.name_company}</h4>
          <span className="px-2 py-0.5 bg-[#FFF0F2] text-[#F2778D] text-[9px] font-bold rounded-md uppercase tracking-wider">{workshop.specialty}</span>
        </div>
        {isSelected && <div className="h-6 w-6 bg-[#F2778D] rounded-full flex items-center justify-center text-white shadow-sm"><CheckCircle2 className="h-4 w-4" /></div>}
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#9b8088]"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{workshop.address}</span></div>
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-rose-50">
          <div>
            <span className="text-[9px] font-bold text-[#b79ca5] uppercase tracking-tighter">Órdenes Realizadas</span>
            <p className="text-sm font-bold text-[#594246]">{orderCount} {Number(orderCount) === 1 ? 'pedido' : 'pedidos'}</p>
          </div>
          <div className="flex flex-col items-end"><span className="text-[9px] font-bold text-[#b79ca5] uppercase tracking-tighter">Historial</span><button onClick={(e) => { e.stopPropagation(); alert("Historial..."); }} className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-[#F2778D] hover:text-[#d9667a] transition-colors"><MessageSquare className="h-3.5 w-3.5" /> Ver notas</button></div>
        </div>
        <div className={`mt-2 py-2 px-3 rounded-xl ${status.bg} flex items-center justify-between`}>
          <div className="flex items-center gap-1.5"><Clock className={`h-3 w-3 ${status.color}`} /><span className={`text-[10px] font-bold uppercase tracking-tight ${status.color}`}>{status.label}</span></div>
          <span className="text-[10px] font-bold text-[#b79ca5]">{workshop.weekly_capacity} prendas / sem</span>
        </div>
      </div>
    </div>
  );
}
