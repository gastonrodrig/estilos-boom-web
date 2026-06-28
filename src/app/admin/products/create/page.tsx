'use client';
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useProductStore, useCategoryStore, useSupplyStore } from '@/hooks';
import Link from 'next/link';
import { Plus, X, Upload, Save, ArrowLeft, Palette, Ruler, Layers, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { CSS_COLORS_PALETTE, ColorObject } from '@/core/constants';

// ── Tipo de insumo para campos contextuales ──────────────────────────────────
type SupplyType = 'TELA' | 'HILO' | 'BOTON' | 'CIERRE' | 'ELASTICO' | 'ETIQUETA' | 'OTRO';
function getSupplyType(name: string): SupplyType {
  const n = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (n.includes('tela') || n.includes('entretela')) return 'TELA';
  if (n.includes('hilo'))                            return 'HILO';
  if (n.includes('boton') || n.includes('broche'))   return 'BOTON';
  if (n.includes('cierre') || n.includes('cremallera')) return 'CIERRE';
  if (n.includes('elastico'))                        return 'ELASTICO';
  if (n.includes('etiqueta'))                        return 'ETIQUETA';
  return 'OTRO';
}

// ── Catálogo de fibras textiles ──────────────────────────────────────────────
interface Fiber { name: string; type: 'Natural' | 'Sintético' | 'Semi-sintético' | 'Elástico' | 'Especial' }
const FIBERS: Fiber[] = [
  // Naturales
  { name: 'Algodón',        type: 'Natural' },
  { name: 'Lino',           type: 'Natural' },
  { name: 'Seda',           type: 'Natural' },
  { name: 'Lana',           type: 'Natural' },
  { name: 'Cáñamo',         type: 'Natural' },
  { name: 'Yute',           type: 'Natural' },
  { name: 'Bambú',          type: 'Natural' },
  { name: 'Alpaca',         type: 'Natural' },
  { name: 'Cachemira',      type: 'Natural' },
  { name: 'Angora',         type: 'Natural' },
  // Semi-sintéticos
  { name: 'Viscosa',        type: 'Semi-sintético' },
  { name: 'Rayón',          type: 'Semi-sintético' },
  { name: 'Modal',          type: 'Semi-sintético' },
  { name: 'Lyocell',        type: 'Semi-sintético' },
  { name: 'Tencel',         type: 'Semi-sintético' },
  { name: 'Acetato',        type: 'Semi-sintético' },
  { name: 'Cupro',          type: 'Semi-sintético' },
  // Sintéticos
  { name: 'Poliéster',      type: 'Sintético' },
  { name: 'Nylon',          type: 'Sintético' },
  { name: 'Acrílico',       type: 'Sintético' },
  { name: 'Polipropileno',  type: 'Sintético' },
  { name: 'Kevlar',         type: 'Sintético' },
  { name: 'Spandex',        type: 'Sintético' },
  // Elásticos (siempre en mezcla)
  { name: 'Elastano',       type: 'Elástico' },
  { name: 'Lycra',          type: 'Elástico' },
  // Especiales / tejidos
  { name: 'Denim',          type: 'Especial' },
  { name: 'Tul',            type: 'Especial' },
  { name: 'Terciopelo',     type: 'Especial' },
  { name: 'Satén',          type: 'Especial' },
  { name: 'Organza',        type: 'Especial' },
  { name: 'Encaje',         type: 'Especial' },
  { name: 'Chiffon',        type: 'Especial' },
  { name: 'Crepé',          type: 'Especial' },
  { name: 'Tweed',          type: 'Especial' },
  { name: 'Twill',          type: 'Especial' },
  { name: 'Gabardina',      type: 'Especial' },
  { name: 'Jersey',         type: 'Especial' },
  { name: 'Piqué',          type: 'Especial' },
  { name: 'Fleece',         type: 'Especial' },
  { name: 'Oxford',         type: 'Especial' },
  { name: 'Popelín',        type: 'Especial' },
  { name: 'Muselina',       type: 'Especial' },
];

const TYPE_COLORS: Record<string, string> = {
  'Natural':       'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  'Sintético':     'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  'Semi-sintético':'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'Elástico':      'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  'Especial':      'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
};

// Deriva el tipo de composición a partir de las fibras seleccionadas
function deriveCompositionType(fibers: { fiber: Fiber; pct: number }[]): string {
  if (fibers.length === 0) return '';
  const types = new Set(fibers.map(f => f.fiber.type));
  if (types.has('Especial') && fibers.length === 1) return 'Especial';
  if (types.has('Elástico') || fibers.length > 1) return 'Mezcla';
  const t = fibers[0].fiber.type;
  return t === 'Semi-sintético' ? 'Semi-sintético' : t;
}

// Construye el string "95% Algodón, 5% Elastano"
function buildCompositionString(fibers: { fiber: Fiber; pct: number }[]): string {
  return fibers.map(f => `${f.pct}% ${f.fiber.name}`).join(', ');
}

// Estructura de la Ficha Técnica alineada al Backend de Mongoose
interface SupplyItemInput {
  id_supply:  string;
  name:       string;
  unit:       string;
  detail:     string;   // ej: "Blanco 12mm redondo"
  quantity:   number;
  applies_to: string;   // 'TODOS' o nombre de color
}

export default function CreateProductPage() {
  const { createProduct, loading: loadingProducts } = useProductStore();
  const { categories, startLoadingCategories } = useCategoryStore();
  
  // 🚀 Cargamos la infraestructura de insumos reales de la base de datos
  const { supplies, startLoadingSupplies } = useSupplyStore();
  
  const router = useRouter();

  // 1. Estado del Formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    base_price: 0,
    gender: 'MUJER',
    composition: '',
    fabric_print: 'LISO',
    print_pattern: '',
    season: '',
    id_category: '',
    origin_type: 'RETAIL', // 'RETAIL' o 'PRODUCCION'
    is_active: true,
    is_best_seller: false,
    is_new_in: true,
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  
  // 🎨 Estados del Módulo de Colores Avanzado
  const [apiColors, setApiColors] = useState<ColorObject[]>([]);
  const [loadingColors, setLoadingColors] = useState(false);
  const [selectedColors, setSelectedColors] = useState<ColorObject[]>([]);
  const [colorSearch, setColorSearch] = useState('');
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [isCreatingCustomColor, setIsCreatingCustomColor] = useState(false);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#F2778D');

  // Estados del buscador de composición de tela
  const [fiberSearch, setFiberSearch]               = useState('');
  const [showFiberDropdown, setShowFiberDropdown]   = useState(false);
  const [fiberComposition, setFiberComposition]     = useState<{ fiber: Fiber; pct: number }[]>([]);
  const fiberInputRef = useRef<HTMLInputElement>(null);

  // Estados de la Ficha Técnica
  const [technicalSheet, setTechnicalSheet] = useState<SupplyItemInput[]>([]);
  const [selectedInsumoId, setSelectedInsumoId] = useState<string>('');
  const [insumoDetail, setInsumoDetail]       = useState<string>('');
  const [insumoQuantity, setInsumoQuantity]   = useState<number>(1);
  const [insumoAppliesTo, setInsumoAppliesTo] = useState<string>('TODOS');
  // Campos contextuales por tipo de insumo
  const [insumoGrosor, setInsumoGrosor]       = useState<string>('');
  const [insumoColor, setInsumoColor]         = useState<ColorObject | null>(null);
  const [insumoColorSearch, setInsumoColorSearch]               = useState('');
  const [insumoApiColors, setInsumoApiColors]                   = useState<ColorObject[]>([]);
  const [showInsumoColorDropdown, setShowInsumoColorDropdown]   = useState(false);
  const [insumoBtnMaterial, setInsumoBtnMaterial] = useState<string>('');
  const [insumoBtnSize, setInsumoBtnSize]         = useState<string>('');
  const [insumoCierreTipo, setInsumoCierreTipo]   = useState<string>('');
  const [insumoCierreLargo, setInsumoCierreLargo] = useState<string>('');
  const [insumoElasticoAncho, setInsumoElasticoAncho] = useState<string>('');
  const [insumoTelaAncho, setInsumoTelaAncho]             = useState<string>('');
  const [insumoHiloMetros, setInsumoHiloMetros]           = useState<string>('');
  const [isCreatingInsumoColor, setIsCreatingInsumoColor] = useState(false);
  const [customInsumoColorName, setCustomInsumoColorName] = useState('');
  const [customInsumoColorHex, setCustomInsumoColorHex]   = useState('#F2778D');

  // Estado de la tabla de variantes
  const [variants, setVariants] = useState<any[]>([]);
  // Mapeo de índice de imagen → nombre de color
  const [imageColorTags, setImageColorTags] = useState<Record<number, string>>({});

  const setTagForImage = (index: number, colorName: string) => {
    setImageColorTags(prev => ({ ...prev, [index]: colorName }));
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Sincroniza fiberComposition → formData.composition automáticamente
  useEffect(() => {
    const str = buildCompositionString(fiberComposition);
    setFormData(prev => ({ ...prev, composition: str }));
  }, [fiberComposition]);

  const filteredFibers = useMemo(() => {
    const q = fiberSearch.toLowerCase().trim();
    const already = new Set(fiberComposition.map(f => f.fiber.name));
    return FIBERS.filter(f => !already.has(f.name) && (q === '' || f.name.toLowerCase().includes(q)));
  }, [fiberSearch, fiberComposition]);

  const addFiber = (fiber: Fiber) => {
    const remaining = 100 - fiberComposition.reduce((s, f) => s + f.pct, 0);
    setFiberComposition(prev => [...prev, { fiber, pct: Math.max(1, remaining) }]);
    setFiberSearch('');
    setShowFiberDropdown(false);
    fiberInputRef.current?.focus();
  };

  const updateFiberPct = (idx: number, pct: number) => {
    setFiberComposition(prev => prev.map((f, i) => i === idx ? { ...f, pct } : f));
  };

  const removeFiber = (idx: number) => {
    setFiberComposition(prev => prev.filter((_, i) => i !== idx));
  };

  // 🔄 Generador de variantes (manual: se ejecuta al hacer clic en el botón).
  // El stock inicial siempre es 0; el inventario se carga luego desde el módulo de almacén.
  const generateVariants = useCallback(() => {
    if (selectedSizes.length === 0 || selectedColors.length === 0) {
      return toast.error("Selecciona al menos una talla y un color.");
    }

    const newVariants = selectedSizes.flatMap(size =>
      selectedColors.map(color => ({
        size,
        color,
        stock: 0,
        sku_variant: `${formData.sku || 'SKU'}-${size}-${color.name.substring(0, 3).toUpperCase().replace(/\s+/g, '')}`,
        min_stock_alert: 10,
      })),
    );
    setVariants(newVariants);
    toast.success("Variantes generadas.");
  }, [selectedSizes, selectedColors, formData.sku]);

  const [skuLoading, setSkuLoading] = useState(false);

  // Se dispara automáticamente cuando cambian los tres campos que definen el SKU.
  // Solo corre si los tres están completos y la categoría tiene abbr.
  useEffect(() => {
    const category = categories.find(c => c._id === formData.id_category);
    if (!formData.id_category || !formData.gender || !formData.season || !category?.abbr) return;

    let cancelled = false;
    setSkuLoading(true);

    import('@/api').then(({ productApi }) =>
      productApi.get('/next-sku', {
        params: { abbr: category.abbr, gender: formData.gender, season: formData.season },
      })
    ).then(({ data }) => {
      if (!cancelled) setFormData(prev => ({ ...prev, sku: data.sku }));
    }).catch(() => {
      if (!cancelled) toast.error("No se pudo calcular el SKU automáticamente.");
    }).finally(() => {
      if (!cancelled) setSkuLoading(false);
    });

    return () => { cancelled = true; };
  }, [formData.id_category, formData.gender, formData.season, categories]);

  // Carga inicial de datos desde la API
  useEffect(() => {
    startLoadingCategories();
    startLoadingSupplies(); // 🚀 Trae los insumos activos registrados en el sistema
  }, [startLoadingCategories, startLoadingSupplies]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleSelectColor = (color: ColorObject) => {
    if (selectedColors.some(c => c.name.toLowerCase() === color.name.toLowerCase())) {
      return toast.error("Este color ya fue seleccionado.");
    }
    setSelectedColors([...selectedColors, color]);
    setColorSearch('');
    setShowColorDropdown(false);
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return toast.error("Escribe el nombre del color.");
    setSelectedColors([...selectedColors, { name: customColorName.trim(), hex: customColorHex }]);
    setCustomColorName('');
    setIsCreatingCustomColor(false);
  };

  const handleRemoveColor = (colorName: string) => {
    setSelectedColors(selectedColors.filter(c => c.name !== colorName));
  };

  const resetInsumoContextual = () => {
    setInsumoDetail('');
    setInsumoGrosor('');
    setInsumoColor(null);
    setInsumoColorSearch('');
    setInsumoBtnMaterial('');
    setInsumoBtnSize('');
    setInsumoCierreTipo('');
    setInsumoCierreLargo('');
    setInsumoElasticoAncho('');
    setInsumoTelaAncho('');
    setIsCreatingInsumoColor(false);
    setCustomInsumoColorName('');
    setCustomInsumoColorHex('#F2778D');
    setInsumoHiloMetros('');
  };

  const handleInsumoSelect = (id: string) => {
    setSelectedInsumoId(id);
    resetInsumoContextual();
    const supply = supplies.find(s => (s._id || s.id) === id);
    if (!supply) return;
    const type = getSupplyType(supply.name);
    if (type === 'TELA' && fiberComposition.length > 0) {
      const comp    = buildCompositionString(fiberComposition);
      const acabado = formData.fabric_print !== 'LISO' ? ` · ${formData.fabric_print}` : '';
      const pattern = formData.print_pattern ? ` (${formData.print_pattern})` : '';
      setInsumoDetail(`${comp}${acabado}${pattern}`);
    }
    if (type === 'ETIQUETA' && selectedSizes.length > 0) {
      setInsumoDetail(selectedSizes.join(', '));
    }
  };

  // Busca colores para insumos — misma lógica que variantes (con traducciones ES→EN)
  useEffect(() => {
    if (insumoColorSearch.trim().length < 2) { setInsumoApiColors([]); return; }
    const translations: Record<string, string> = {
      azul: 'blue', celeste: 'skyblue', rojo: 'red', verde: 'green',
      rosado: 'pink', rosa: 'pink', amarillo: 'yellow', gris: 'gray',
      blanco: 'white', negro: 'black', marron: 'brown', marrón: 'brown',
      purpura: 'purple', púrpura: 'purple', tomate: 'tomato', oro: 'gold',
      naranja: 'orange', violeta: 'violet', turquesa: 'turquoise', beige: 'beige',
    };
    const t = setTimeout(() => {
      const q = insumoColorSearch.toLowerCase().trim();
      const target = translations[q] || q;
      const filtered = CSS_COLORS_PALETTE.filter((c: ColorObject) =>
        c.name.toLowerCase().includes(target) || c.name.toLowerCase().includes(q)
      );
      setInsumoApiColors(filtered.slice(0, 8));
    }, 200);
    return () => clearTimeout(t);
  }, [insumoColorSearch]);

  // Construye el detalle según tipo de insumo seleccionado
  const buildInsumoDetail = (): string => {
    const supply = supplies.find(s => (s._id || s.id) === selectedInsumoId);
    if (!supply) return insumoDetail;
    const type = getSupplyType(supply.name);
    const colorStr = insumoColor ? insumoColor.name : '';
    switch (type) {
      case 'TELA': {
        const parts = [insumoDetail, insumoGrosor, insumoTelaAncho].filter(Boolean);
        return parts.join(' · ');
      }
      case 'HILO':    return colorStr;
      case 'BOTON': {
        const parts = [colorStr, insumoBtnMaterial, insumoBtnSize ? `${insumoBtnSize}mm` : ''].filter(Boolean);
        return parts.join(' · ');
      }
      case 'CIERRE':  return [colorStr, insumoCierreTipo, insumoCierreLargo ? `${insumoCierreLargo}cm` : ''].filter(Boolean).join(' · ');
      case 'ELASTICO': return [colorStr, insumoElasticoAncho ? `${insumoElasticoAncho}cm ancho` : ''].filter(Boolean).join(' · ');
      case 'ETIQUETA': return insumoDetail;
      default:        return insumoDetail;
    }
  };

  const handleAddInsumo = () => {
    if (!selectedInsumoId) return toast.error("Selecciona un insumo válido.");
    const realSupply = supplies.find(s => (s._id || s.id) === selectedInsumoId);
    if (!realSupply) return toast.error("El insumo seleccionado no es válido.");
    const idInsumoString = (realSupply._id || realSupply.id) as string;

    // Permitir el mismo insumo en distintos colores, pero no duplicar misma combinación
    const isDuplicate = technicalSheet.some(
      item => item.id_supply === idInsumoString && item.applies_to === insumoAppliesTo
    );
    if (isDuplicate) return toast.error(`${realSupply.name} ya está agregado para "${insumoAppliesTo}".`);

    setTechnicalSheet([...technicalSheet, {
      id_supply:  idInsumoString,
      name:       realSupply.name,
      unit:       realSupply.unit,
      detail:     buildInsumoDetail().trim(),
      quantity:   insumoQuantity,
      applies_to: insumoAppliesTo,
    }]);
    setSelectedInsumoId('');
    resetInsumoContextual();
    setInsumoQuantity(1);
    setInsumoAppliesTo('TODOS');
  };

  const handleRemoveInsumo = (index: number) => {
    setTechnicalSheet(technicalSheet.filter((_, i) => i !== index));
  };

  // Buscador Predictivo de Colores Local
  useEffect(() => {
    if (colorSearch.trim().length < 2) {
      setApiColors([]);
      return;
    }

    const filterColorsLocally = () => {
      setLoadingColors(true);
      const translations: Record<string, string> = {
        azul: 'blue', celeste: 'skyblue', rojo: 'red', verde: 'green',
        rosado: 'pink', rosa: 'pink', amarillo: 'yellow', gris: 'gray',
        blanco: 'white', negro: 'black', marron: 'brown', marrón: 'brown',
        purpura: 'purple', púrpura: 'purple', tomate: 'tomato', oro: 'gold'
      };

      const searchTerm = colorSearch.toLowerCase().trim();
      const targetSearch = translations[searchTerm] || searchTerm;

      const filtered = CSS_COLORS_PALETTE.filter((c: ColorObject) =>
        c.name.toLowerCase().includes(targetSearch) || 
        c.name.toLowerCase().includes(searchTerm)
      );
      
      setApiColors(filtered.slice(0, 8));
      setLoadingColors(false);
    };

    const delayDebounceFn = setTimeout(() => {
      filterColorsLocally();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [colorSearch]);

  const handleOriginChange = (type: 'RETAIL' | 'PRODUCCION') => {
    setFormData({ ...formData, origin_type: type });
    if (type === 'RETAIL') {
      setTechnicalSheet([]); 
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.sku || !formData.id_category) {
      return toast.error("Por favor completa los campos obligatorios (*)");
    }
    if (selectedImages.length === 0) {
      return toast.error("Debes subir al menos una imagen");
    }
    if (variants.length === 0) {
      return toast.error("Debes seleccionar al menos una talla y un color.");
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("sku", formData.sku);
    data.append("base_price", formData.base_price.toString());
    data.append("gender", formData.gender);
    data.append("composition", formData.composition);
    data.append("fabric_print", formData.fabric_print);
    if (formData.print_pattern) data.append("print_pattern", formData.print_pattern);
    data.append("id_category", formData.id_category);
    data.append("season", formData.season);
    data.append("origin_type", formData.origin_type);
    data.append("is_active", formData.is_active.toString());
    data.append("is_best_seller", formData.is_best_seller.toString());
    data.append("is_new_in", formData.is_new_in.toString());
    data.append("variants", JSON.stringify(variants));

    // Si es producción propia, limpiamos el objeto antes de enviarlo
    // Enviamos solo id_supply y quantity para que calce con tu esquema estricto de Mongoose
    if (formData.origin_type === 'PRODUCCION') {
      const cleanSheet = technicalSheet.map(item => ({
        id_supply:  item.id_supply,
        detail:     item.detail || '',
        quantity:   item.quantity,
        applies_to: item.applies_to,
      }));
      data.append("technical_sheet", JSON.stringify(cleanSheet));
    }

    // Enviamos los archivos en orden y, en paralelo, el color de cada uno alineado por índice.
    // El backend empareja files[i] con image_colors[i] y guarda { url, color }.
    selectedImages.forEach((file) => data.append("files", file));
    const imageColors = selectedImages.map((_, idx) => imageColorTags[idx] || null);
    data.append("image_colors", JSON.stringify(imageColors));

    const result = await createProduct(data);
    if (result) router.push("/admin/products");
  };

  const inputClass = "w-full bg-[#fdf8f9] dark:bg-[#1a0e14] border border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.1)] rounded-[10px] outline-none focus:border-[rgba(139,58,82,0.5)] dark:focus:border-[rgba(160,80,104,0.5)] transition-[background-color,border-color] duration-[600ms] text-[#2d1f25] dark:text-[#e8d8dc] placeholder-[#2d1f25]/30 dark:placeholder-white/30 p-[12px_16px] text-[0.85rem]";
  // Mismas dimensiones que inputClass pero sin la flecha nativa (la dibujamos nosotros) para que los <select> queden simétricos con los inputs
  const selectClass = `${inputClass} appearance-none pr-10 cursor-pointer`;

  const sectionClass = "space-y-[16px] bg-white/70 backdrop-blur-2xl dark:bg-[#2e1d27] border border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[16px] p-[28px] transition-[background-color,border-color] duration-[600ms]";
  const titleClass = "text-[0.72rem] tracking-[0.15em] text-[#8B3A52] dark:text-[#a05068] uppercase font-semibold mb-[16px]";
  const labelClass = "text-[0.7rem] tracking-[0.1em] text-[#8B3A52] dark:text-[#a05068] uppercase mb-[6px] block font-medium";

  const getSelectableBtnClass = (isSelected: boolean, extraClasses: string = "p-4") => 
    `${extraClasses} text-center transition-all text-[0.82rem] font-medium border rounded-[8px] ${isSelected ? 'bg-[rgba(139,58,82,0.3)] border-[#8B3A52] text-white' : 'bg-transparent border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.1)] text-[#8B3A52]/60 dark:text-[#a08088] hover:text-[#8B3A52] dark:hover:text-white hover:border-[#8B3A52]/40 dark:hover:border-[rgba(255,255,255,0.2)]'}`;

  // ── Helpers para reusar bloques de JSX ──────────────────────────────────────
  const fiberComposerJSX = (
    <div>
      <label className={labelClass}>Composición de Tela</label>
      <div className="relative mb-2">
        <input
          ref={fiberInputRef}
          type="text"
          className={inputClass}
          placeholder="Buscar fibra: algodón, poliéster, viscosa..."
          value={fiberSearch}
          onChange={(e) => { setFiberSearch(e.target.value); setShowFiberDropdown(true); }}
          onFocus={() => setShowFiberDropdown(true)}
          onBlur={() => setTimeout(() => setShowFiberDropdown(false), 150)}
        />
        {showFiberDropdown && filteredFibers.length > 0 && (
          <ul className="absolute z-30 w-full mt-1 bg-white dark:bg-[#2a1520] border border-[rgba(139,58,82,0.2)] dark:border-[rgba(255,255,255,0.08)] rounded-xl shadow-xl max-h-52 overflow-y-auto">
            {filteredFibers.map(f => (
              <li key={f.name} onMouseDown={() => addFiber(f)}
                className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[rgba(139,58,82,0.06)] dark:hover:bg-[rgba(139,58,82,0.15)] transition-colors">
                <span className="text-sm font-medium text-[#40202D] dark:text-white">{f.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[f.type]}`}>{f.type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {fiberComposition.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {fiberComposition.map((item, idx) => {
            const total = fiberComposition.reduce((s, f) => s + f.pct, 0);
            const over  = total > 100;
            return (
              <div key={item.fiber.name} className="flex items-center gap-2 bg-[#fdf8f9] dark:bg-[#1e1018] border border-[rgba(139,58,82,0.12)] rounded-xl px-3 py-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[item.fiber.type]}`}>{item.fiber.type}</span>
                <span className="text-sm font-semibold text-[#40202D] dark:text-white flex-1">{item.fiber.name}</span>
                <div className="flex items-center gap-1">
                  <input type="number" min={1} max={100} value={item.pct}
                    onChange={(e) => updateFiberPct(idx, Math.min(100, Math.max(1, Number(e.target.value))))}
                    className={`w-16 text-center text-sm font-bold rounded-lg border px-2 py-1 bg-white dark:bg-[#2a1520] outline-none transition-colors
                      ${over ? 'border-rose-400 text-rose-500' : 'border-[rgba(139,58,82,0.2)] dark:border-[rgba(255,255,255,0.1)] text-[#D6405F] dark:text-[#F8BBD0]'}`} />
                  <span className="text-xs text-[#8C6B79]">%</span>
                </div>
                <button type="button" onClick={() => removeFiber(idx)}
                  className="p-1 text-[#8C6B79] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
                  <X size={14} />
                </button>
              </div>
            );
          })}
          <div className="flex items-center justify-between px-1 pt-1">
            {(() => {
              const total = fiberComposition.reduce((s, f) => s + f.pct, 0);
              const type  = deriveCompositionType(fiberComposition);
              return (
                <>
                  <span className={`text-xs font-bold ${total === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    Total: {total}% {total === 100 ? '✓' : `(faltan ${100 - total}%)`}
                  </span>
                  {type && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[type] ?? TYPE_COLORS['Especial']}`}>{type}</span>}
                </>
              );
            })()}
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#8C6B79] opacity-60 mt-1">Buscá y seleccioná las fibras para construir la composición.</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-8 text-[#2d1f25] dark:text-[#e8d8dc] bg-[#f5efe8] dark:bg-[#1e1018] relative z-10 transition-[background-color,border-color] duration-[600ms]">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center py-4">
        <Link href="/admin/products" className="flex items-center gap-2 font-medium opacity-60 hover:opacity-100 transition-opacity uppercase" style={{ fontSize: '0.78rem', letterSpacing: '0.08em' }}>
          <ArrowLeft size={16} /> Volver a Productos
        </Link>
        <button
          disabled={loadingProducts}
          onClick={handleSubmit}
          className="text-white flex items-center gap-2 disabled:opacity-50 transition-all font-medium"
          style={{ background: '#8B3A52', borderRadius: '10px', fontSize: '0.82rem', padding: '10px 24px', letterSpacing: '0.05em' }}
        >
          {loadingProducts ? 'Guardando...' : <><Save size={18} /> Guardar producto</>}
        </button>
      </div>

      <div className="flex flex-col gap-6 max-w-5xl mx-auto">

        {/* ── 1. TIPO DE ORIGEN ─────────────────────────────────────────────── */}
        <div className={sectionClass}>
          <h3 className={`${titleClass} flex items-center gap-2`}><Layers size={16} /> Tipo de Origen de Prenda *</h3>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => handleOriginChange('RETAIL')} className={getSelectableBtnClass(formData.origin_type === 'RETAIL')}>
              Flujo Comercial (Retail)
            </button>
            <button type="button" onClick={() => handleOriginChange('PRODUCCION')} className={getSelectableBtnClass(formData.origin_type === 'PRODUCCION')}>
              Orden de Producción Propia
            </button>
          </div>
        </div>

        {/* ── 2. IDENTIFICACIÓN DEL PRODUCTO ───────────────────────────────── */}
        <div className={sectionClass}>
          <h3 className={titleClass}>Identificación del producto</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="col-span-2">
              <label className={labelClass}>Nombre del producto *</label>
              <input type="text" className={inputClass} placeholder="Ej: Vestido Gala" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            {/* Categoría */}
            <div>
              <label className={labelClass}>Categoría *</label>
              <div className="relative">
                <select className={selectClass} value={formData.id_category} onChange={(e) => setFormData({...formData, id_category: e.target.value})}>
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B3A52]/60 dark:text-[#a05068]" />
              </div>
            </div>
            {/* Temporada */}
            <div>
              <label className={labelClass}>Temporada</label>
              <div className="relative">
                <select className={selectClass} value={formData.season} onChange={(e) => setFormData({...formData, season: e.target.value})}>
                  <option value="">Selecciona temporada</option>
                  <option value="PRIMAVERA 2026">Primavera 2026</option>
                  <option value="VERANO 2026">Verano 2026</option>
                  <option value="OTOÑO / INVIERNO">Otoño / Invierno</option>
                  <option value="TODO EL AÑO">Todo el año</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B3A52]/60 dark:text-[#a05068]" />
              </div>
            </div>
            {/* Género */}
            <div>
              <label className={labelClass}>Género *</label>
              <div className="flex gap-3">
                {['MUJER', 'HOMBRE', 'UNISEX'].map((g) => (
                  <button key={g} type="button" onClick={() => setFormData({...formData, gender: g})}
                    className={getSelectableBtnClass(formData.gender === g, "flex-1 py-2 text-xs")}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {/* SKU */}
            <div>
              <label className={labelClass}>
                SKU Base *
                {skuLoading && <span className="ml-2 normal-case text-[10px] opacity-50 animate-pulse">calculando…</span>}
              </label>
              <input type="text" className={`${inputClass} font-mono tracking-widest`}
                placeholder="Auto al elegir categoría, género y temporada"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })} />
              <p className="text-[10px] text-[#8B3A52]/50 dark:text-[#a05068]/60 mt-1">
                {!formData.id_category || !formData.gender || !formData.season
                  ? 'Selecciona categoría, género y temporada para generarlo.'
                  : 'Podés editarlo manualmente si necesitás un código especial.'}
              </p>
            </div>
            {/* Descripción */}
            <div className="col-span-2">
              <label className={labelClass}>Descripción</label>
              <textarea className={`${inputClass} h-[72px] resize-none`} placeholder="Describe el producto..."
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
        </div>

        {/* ── 3. MATERIAL ───────────────────────────────────────────────────── */}
        <div className={sectionClass}>
          <h3 className={titleClass}>Material</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Composición — ocupa toda la fila */}
            <div className="col-span-2">{fiberComposerJSX}</div>
            {/* Acabado */}
            <div>
              <label className={labelClass}>Acabado de Tela</label>
              <div className="flex gap-3 flex-wrap">
                {(['LISO', 'ESTAMPADO', 'BORDADO', 'TEXTURIZADO'] as const).map((opt) => (
                  <button key={opt} type="button"
                    onClick={() => setFormData({ ...formData, fabric_print: opt, print_pattern: opt !== 'ESTAMPADO' ? '' : formData.print_pattern })}
                    className={getSelectableBtnClass(formData.fabric_print === opt, "px-4 py-2 text-xs")}>
                    {opt}
                  </button>
                ))}
              </div>
              {formData.fabric_print === 'ESTAMPADO' && (
                <input type="text" className={`${inputClass} mt-3`}
                  placeholder="Describe el estampado: flores, rayas, geométrico, animal print..."
                  value={formData.print_pattern}
                  onChange={(e) => setFormData({ ...formData, print_pattern: e.target.value })} />
              )}
            </div>
          </div>
        </div>

        {/* ── 4. VARIANTES ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-6">
          {/* Imágenes */}
          <div className="col-span-4">
            <div className={sectionClass}>
              <h3 className={titleClass}>Imágenes ({selectedImages.length}/5)</h3>
              <input type="file" id="file-upload" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              <label htmlFor="file-upload" className="border-[2px] border-dashed border-[rgba(139,58,82,0.2)] dark:border-[rgba(160,80,104,0.3)] rounded-[12px] p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group hover:border-[rgba(139,58,82,0.5)] dark:hover:border-[rgba(160,80,104,0.6)] hover:bg-[rgba(139,58,82,0.02)] dark:hover:bg-[rgba(160,80,104,0.05)]">
                <Upload className="text-[#8B3A52] dark:text-[#a05068] mb-2 group-hover:scale-110 transition-transform" size={32} />
                <p className="text-xs text-center opacity-60 group-hover:opacity-100 font-bold uppercase tracking-wider text-[#2d1f25] dark:text-[#e8d8dc]">Haz clic para subir fotos</p>
              </label>
              <div className="flex flex-col gap-3 mt-4">
                {selectedImages.map((file, idx) => {
                  const taggedColor = selectedColors.find(c => c.name === imageColorTags[idx]);
                  return (
                    <div key={idx} className="flex items-center gap-3 bg-white/50 dark:bg-white/5 rounded-xl border border-[#EAE0E2] dark:border-white/10 p-2 shadow-sm">
                      {/* Miniatura */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#EAE0E2] dark:border-white/10">
                        <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="preview" />
                      </div>
                      {/* Nombre + selector */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <p className="text-[10px] opacity-40 truncate font-medium">{file.name}</p>
                        <div className="relative">
                          {/* Dot de color del tag elegido */}
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-black/10 dark:border-white/10 transition-colors"
                            style={{ backgroundColor: taggedColor ? taggedColor.hex : 'transparent', border: taggedColor ? undefined : '1.5px dashed #8B3A52' }} />
                          <select
                            value={imageColorTags[idx] || ''}
                            onChange={(e) => setTagForImage(idx, e.target.value)}
                            className={`${selectClass} pl-7 text-xs py-2`}>
                            <option value="">Sin color (general)</option>
                            {selectedColors.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B3A52]/60" />
                        </div>
                      </div>
                      {/* Eliminar */}
                      <button type="button" onClick={() => removeImage(idx)}
                        className="flex-shrink-0 p-1.5 rounded-lg text-[#8C6B79] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tallas + Colores + Variantes */}
          <div className="col-span-8">
            <div className={sectionClass}>
              {/* Tallas */}
              <div>
                <h3 className={`${titleClass} flex items-center gap-2`}><Ruler size={16} /> Tallas *</h3>
                <div className="flex flex-wrap gap-3">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button key={size} type="button" onClick={() => toggleSize(size)}
                        className={`w-10 h-10 flex items-center justify-center font-medium text-[0.82rem] rounded-lg border transition-all
                          ${isSelected ? 'bg-[rgba(139,58,82,0.3)] border-[#8B3A52] text-white' : 'bg-transparent border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.15)] text-[#8B3A52]/70 dark:text-[#c4a0ae] hover:border-[#8B3A52]/50'}`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colores */}
              <div className="space-y-3">
                <h3 className={`${titleClass} flex items-center gap-2`}><Palette size={16} /> Colores *</h3>
                <div className="relative">
                  {!isCreatingCustomColor ? (
                    <>
                      <div className="relative">
                        <input type="text" className={`${inputClass} pl-10`}
                          placeholder="Buscar color en español o inglés... (ej: azul, rosa, blue)"
                          value={colorSearch}
                          onFocus={() => setShowColorDropdown(true)}
                          onChange={(e) => setColorSearch(e.target.value)} />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#D6405F] dark:bg-[#F8BBD0]" />
                      </div>
                      {showColorDropdown && (
                        <div className="absolute left-0 right-0 z-50 mt-2 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-[#EAE0E2] dark:divide-white/10">
                          {loadingColors ? (
                            <div className="p-4 text-center text-xs opacity-50">Consultando paleta CSS...</div>
                          ) : apiColors.length > 0 ? (
                            apiColors.map((color, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-colors" onClick={() => handleSelectColor(color)}>
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-full border border-gray-100 dark:border-gray-800 shadow-inner" style={{ backgroundColor: color.hex }} />
                                  <span className="text-sm font-bold text-[#40202D] dark:text-white">{color.name}</span>
                                </div>
                                <span className="text-xs font-mono opacity-40">{color.hex}</span>
                              </div>
                            ))
                          ) : colorSearch.trim().length >= 2 ? (
                            <div className="p-4 text-center text-xs opacity-50 italic text-gray-400">No se encontraron coincidencias exactas.</div>
                          ) : null}
                          <div className="p-3 text-center text-xs font-bold text-[#D6405F] dark:text-[#F8BBD0] bg-rose-50/20 dark:bg-white/5 cursor-pointer hover:bg-rose-50/40 dark:hover:bg-white/10 transition-colors border-t border-[#EAE0E2] dark:border-white/10 rounded-b-2xl"
                            onClick={() => { setIsCreatingCustomColor(true); setShowColorDropdown(false); }}>
                            + Crear color personalizado ({colorSearch || 'Nuevo'})
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-rose-50/10 dark:bg-white/5 border border-[#D6405F]/30 dark:border-[#F8BBD0]/30 rounded-2xl space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#D6405F] dark:text-[#F8BBD0]">✨ Nuevo color personalizado</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input type="text" placeholder="Nombre del color (ej: Palo Rosa)"
                          className="flex-1 p-2.5 bg-white/80 dark:bg-black/50 border border-[#EAE0E2] dark:border-white/10 rounded-xl text-sm outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0]"
                          value={customColorName} onChange={(e) => setCustomColorName(e.target.value)} />
                        <div className="flex items-center bg-white/80 dark:bg-black/50 border border-[#EAE0E2] dark:border-white/10 p-1.5 rounded-xl gap-2">
                          <input type="color" className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent" value={customColorHex} onChange={(e) => setCustomColorHex(e.target.value)} />
                          <input type="text" className="w-20 text-xs font-mono outline-none uppercase text-center bg-transparent" value={customColorHex} onChange={(e) => setCustomColorHex(e.target.value)} />
                        </div>
                        <button type="button" onClick={handleAddCustomColor} className="px-4 py-2.5 bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] text-sm font-bold rounded-xl shadow-md hover:scale-105 transition-all">Agregar</button>
                        <button type="button" onClick={() => setIsCreatingCustomColor(false)} className="px-4 py-2.5 border border-[#EAE0E2] dark:border-white/20 text-sm font-bold rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors">Cancelar</button>
                      </div>
                    </div>
                  )}
                  {showColorDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowColorDropdown(false)} />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedColors.map((color) => (
                    <div key={color.name} className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-black/50 text-[#40202D] dark:text-white rounded-full text-xs font-bold border border-[#EAE0E2] dark:border-white/10 shadow-sm">
                      <div className="w-3 h-3 rounded-full border border-black/5 dark:border-white/10" style={{ backgroundColor: color.hex }} />
                      {color.name}
                      <X size={14} className="cursor-pointer text-[#8C6B79] hover:text-[#D6405F] transition-colors" onClick={() => handleRemoveColor(color.name)} />
                    </div>
                  ))}
                  {selectedColors.length === 0 && <p className="text-xs opacity-40 italic font-medium">No hay colores seleccionados</p>}
                </div>
              </div>

              {/* Botón generar */}
              <button type="button" onClick={generateVariants}
                disabled={selectedSizes.length === 0 || selectedColors.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#8B3A52] hover:bg-[#a05068] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-md hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-wider">
                <Layers size={16} /> Generar variantes ({selectedSizes.length} tallas × {selectedColors.length} colores)
              </button>

              {/* Tabla de variantes */}
              {variants.length > 0 && (
                <div className="border border-[#EAE0E2] dark:border-white/10 rounded-2xl overflow-hidden shadow-sm bg-white/30 dark:bg-white/5">
                  <div className="bg-white/50 dark:bg-black/30 p-4 border-b border-[#EAE0E2] dark:border-white/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#D6405F] dark:text-[#F8BBD0]">Variantes generadas ({variants.length})</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/50 dark:bg-black/30 sticky top-0 text-xs font-bold uppercase tracking-wider text-[#D6405F] dark:text-[#F8BBD0] border-b border-[#EAE0E2] dark:border-white/10">
                        <tr>
                          <th className="p-4">Talla</th>
                          <th className="p-4">Color</th>
                          <th className="p-4">SKU Variante</th>
                          <th className="p-4 text-right">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
                        {variants.map((v, i) => (
                          <tr key={i} className={`transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-[#2e1d27]' : 'bg-[#fdf8f9] dark:bg-[#321f2b]'} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                            <td className="p-4 font-medium">{v.size}</td>
                            <td className="p-4 font-bold">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: v.color.hex }} />
                                {v.color.name}
                              </div>
                            </td>
                            <td className="p-4 font-mono text-xs opacity-70">{v.sku_variant}</td>
                            <td className="p-4 text-right text-[#40202D]/40 dark:text-white/40 font-medium">0</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 5. PRECIO Y VISIBILIDAD ───────────────────────────────────────── */}
        <div className={sectionClass}>
          <h3 className={titleClass}>Precio y visibilidad</h3>
          <div className="grid grid-cols-2 gap-6 items-start">
            <div>
              <label className={labelClass}>Precio Base (S/.) *</label>
              <input type="number" className={inputClass} placeholder="0.00" value={formData.base_price || ''}
                onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })} />
            </div>
            <div className="flex flex-col gap-4 pt-1">
              {[
                { key: 'is_active',     label: 'Producto Activo',       desc: 'Visible en catálogo y compras.' },
                { key: 'is_best_seller',label: 'Best Seller',           desc: 'Destacado como más vendido.' },
                { key: 'is_new_in',     label: 'Nuevo Ingreso (New In)',desc: 'Etiquetado como novedad.' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={(formData as any)[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#8B3A52] cursor-pointer" />
                  <div>
                    <span className="text-sm font-bold text-[#40202D] dark:text-white group-hover:text-[#8B3A52] transition-colors">{label}</span>
                    <p className="text-[10px] text-gray-400 font-medium">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── 6. FICHA TÉCNICA (solo producción propia) ─────────────────────── */}
        {formData.origin_type === 'PRODUCCION' && (
          <div className={sectionClass}>
            <h3 className={`${titleClass} flex items-center gap-2`}>Ficha Técnica de Insumos</h3>
            <div className="flex flex-col gap-3 bg-[#fdf8f9] dark:bg-[#1a0e14] border border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.08)] p-4 rounded-2xl shadow-inner">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Insumo</label>
                  <select className={inputClass} value={selectedInsumoId} onChange={(e) => handleInsumoSelect(e.target.value)}>
                    <option value="">Selecciona materia prima...</option>
                    {supplies.filter(s => s.is_active).map((ins) => (
                      <option key={ins._id || ins.id} value={ins._id || ins.id}>{ins.name} ({ins.unit})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Aplica a</label>
                  <select className={inputClass} value={insumoAppliesTo} onChange={(e) => setInsumoAppliesTo(e.target.value)}>
                    <option value="TODOS">Todos los colores</option>
                    <option value="MISMO_COLOR">Mismo color que la variante</option>
                    <option value="POR_TALLA">Por talla (ej: etiquetas)</option>
                    {selectedColors.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              {/* Campos contextuales según tipo de insumo */}
              {(() => {
                const supply = supplies.find(s => (s._id || s.id) === selectedInsumoId);
                const type   = supply ? getSupplyType(supply.name) : 'OTRO';

                const colorPickerJSX = (
                  <div className="relative">
                    <label className={labelClass}>Color</label>
                    {isCreatingInsumoColor ? (
                      <div className="p-3 bg-rose-50/10 dark:bg-white/5 border border-[#D6405F]/30 dark:border-[#F8BBD0]/30 rounded-xl space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#D6405F] dark:text-[#F8BBD0]">✨ Color personalizado</p>
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="Nombre (ej: Palo Rosa)"
                            className="flex-1 p-2 bg-white/80 dark:bg-black/50 border border-[#EAE0E2] dark:border-white/10 rounded-lg text-sm outline-none focus:border-[#D6405F]"
                            value={customInsumoColorName}
                            onChange={(e) => setCustomInsumoColorName(e.target.value)} />
                          <div className="flex items-center bg-white/80 dark:bg-black/50 border border-[#EAE0E2] dark:border-white/10 p-1 rounded-lg gap-1.5">
                            <input type="color" className="w-7 h-7 rounded border-none cursor-pointer p-0 bg-transparent"
                              value={customInsumoColorHex} onChange={(e) => setCustomInsumoColorHex(e.target.value)} />
                            <input type="text" className="w-16 text-xs font-mono outline-none uppercase text-center bg-transparent"
                              value={customInsumoColorHex} onChange={(e) => setCustomInsumoColorHex(e.target.value)} />
                          </div>
                          <button type="button"
                            onClick={() => {
                              if (!customInsumoColorName.trim()) return;
                              setInsumoColor({ name: customInsumoColorName.trim(), hex: customInsumoColorHex });
                              setCustomInsumoColorName('');
                              setCustomInsumoColorHex('#F2778D');
                              setIsCreatingInsumoColor(false);
                            }}
                            className="px-3 py-2 bg-[#D6405F] text-white text-xs font-bold rounded-lg hover:scale-105 transition-all">
                            Agregar
                          </button>
                          <button type="button" onClick={() => setIsCreatingInsumoColor(false)}
                            className="px-3 py-2 border border-[#EAE0E2] dark:border-white/20 text-xs font-bold rounded-lg hover:bg-white/50 transition-colors">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          className={`${inputClass} pl-10`}
                          placeholder="Buscar color: blanco, negro, rojo..."
                          value={insumoColor ? insumoColor.name : insumoColorSearch}
                          readOnly={!!insumoColor}
                          onChange={(e) => { setInsumoColorSearch(e.target.value); setShowInsumoColorDropdown(true); }}
                          onFocus={() => { if (!insumoColor) setShowInsumoColorDropdown(true); }}
                          onBlur={() => setTimeout(() => setShowInsumoColorDropdown(false), 150)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-black/10 dark:border-white/10 shadow-inner"
                          style={{ backgroundColor: insumoColor ? insumoColor.hex : '#D6405F' }} />
                        {insumoColor && (
                          <button type="button" onClick={() => { setInsumoColor(null); setInsumoColorSearch(''); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6B79] hover:text-rose-500 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                        {showInsumoColorDropdown && !insumoColor && (
                          <div className="absolute z-30 w-full mt-1 bg-white dark:bg-[#2a1520] border border-[rgba(139,58,82,0.2)] rounded-xl shadow-xl overflow-hidden">
                            {insumoApiColors.length > 0 && (
                              <ul className="max-h-44 overflow-y-auto">
                                {insumoApiColors.map((c, i) => (
                                  <li key={i} onMouseDown={() => { setInsumoColor(c); setInsumoColorSearch(''); setShowInsumoColorDropdown(false); }}
                                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[rgba(139,58,82,0.06)] dark:hover:bg-[rgba(139,58,82,0.15)] transition-colors">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: c.hex }} />
                                      <span className="text-sm font-medium text-[#40202D] dark:text-white">{c.name}</span>
                                    </div>
                                    <span className="text-xs font-mono opacity-40">{c.hex}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <div onMouseDown={() => { setIsCreatingInsumoColor(true); setShowInsumoColorDropdown(false); }}
                              className="px-4 py-2.5 text-xs font-bold text-[#D6405F] dark:text-[#F8BBD0] bg-rose-50/20 dark:bg-white/5 cursor-pointer hover:bg-rose-50/40 transition-colors border-t border-[rgba(139,58,82,0.1)]">
                              + Crear color personalizado ({insumoColorSearch || 'Nuevo'})
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );

                return (
                  <div className="grid grid-cols-3 gap-3">
                    {/* TELA */}
                    {type === 'TELA' && <>
                      {/* Composición — fila completa con badge "auto" */}
                      <div className="col-span-3">
                        <label className={labelClass}>
                          Composición
                          <span className="ml-2 normal-case text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-semibold">auto</span>
                        </label>
                        <div className="relative">
                          <input type="text" className={`${inputClass} pr-10 text-[#8C6B79] dark:text-[#c4a0ae]`}
                            value={insumoDetail} onChange={(e) => setInsumoDetail(e.target.value)}
                            placeholder="Se jala de la sección Material arriba..." />
                          {insumoDetail && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-bold">✓</span>
                          )}
                        </div>
                      </div>
                      {/* Grosor + Ancho en misma fila que Cantidad */}
                      <div>
                        <label className={labelClass}>Grosor</label>
                        <select className={inputClass} value={insumoGrosor} onChange={(e) => setInsumoGrosor(e.target.value)}>
                          <option value="">—</option>
                          <option value="Liviano (<100 g/m²)">Liviano — &lt;100 g/m²</option>
                          <option value="Medio (100–200 g/m²)">Medio — 100–200 g/m²</option>
                          <option value="Semipesado (200–300 g/m²)">Semipesado — 200–300 g/m²</option>
                          <option value="Pesado (>300 g/m²)">Pesado — &gt;300 g/m²</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Ancho del rollo</label>
                        <select className={inputClass} value={insumoTelaAncho} onChange={(e) => setInsumoTelaAncho(e.target.value)}>
                          <option value="">—</option>
                          {['90', '110', '115', '140', '150', '160', '180'].map(w =>
                            <option key={w} value={`${w}cm`}>{w} cm</option>)}
                        </select>
                      </div>
                    </>}

                    {/* BOTÓN */}
                    {type === 'BOTON' && <>
                      <div className={isCreatingInsumoColor ? 'col-span-3' : 'col-span-1'}>{colorPickerJSX}</div>
                      {!isCreatingInsumoColor && <>
                        <div>
                          <label className={labelClass}>Material</label>
                          <select className={inputClass} value={insumoBtnMaterial} onChange={(e) => setInsumoBtnMaterial(e.target.value)}>
                            <option value="">Selecciona...</option>
                            {['Plástico', 'Metal', 'Madera', 'Nácar', 'Resina'].map(m =>
                              <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Tamaño (mm)</label>
                          <input type="number" min={1} className={inputClass} placeholder="12"
                            value={insumoBtnSize} onChange={(e) => setInsumoBtnSize(e.target.value)} />
                        </div>
                      </>}
                    </>}

                    {/* CIERRE */}
                    {type === 'CIERRE' && <>
                      <div className={isCreatingInsumoColor ? 'col-span-3' : 'col-span-1'}>{colorPickerJSX}</div>
                      {!isCreatingInsumoColor && (
                        <>
                          <div className="col-span-1">
                            <label className={labelClass}>Tipo</label>
                            <div className="flex gap-2 flex-wrap">
                              {['Invisible', 'Metálico', 'Nylon', 'Plástico'].map(t => (
                                <button key={t} type="button"
                                  onClick={() => setInsumoCierreTipo(t)}
                                  className={getSelectableBtnClass(insumoCierreTipo === t, "px-3 py-1.5 text-xs")}>
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <label className={labelClass}>Largo (cm)</label>
                            <input type="number" min={1} className={inputClass} placeholder="Ej: 25"
                              value={insumoCierreLargo} onChange={e => setInsumoCierreLargo(e.target.value)} />
                          </div>
                        </>
                      )}
                    </>}

                    {/* ELÁSTICO */}
                    {type === 'ELASTICO' && <>
                      <div className={isCreatingInsumoColor ? 'col-span-3' : 'col-span-1'}>{colorPickerJSX}</div>
                      {!isCreatingInsumoColor && (
                        <div>
                          <label className={labelClass}>Ancho (cm)</label>
                          <input type="number" min={1} className={inputClass} placeholder="2"
                            value={insumoElasticoAncho} onChange={(e) => setInsumoElasticoAncho(e.target.value)} />
                        </div>
                      )}
                    </>}

                    {/* HILO */}
                    {type === 'HILO' && (
                      <div className={isCreatingInsumoColor ? 'col-span-2' : 'col-span-2'}>{colorPickerJSX}</div>
                    )}

                    {/* ETIQUETA */}
                    {type === 'ETIQUETA' && (
                      <div className="col-span-2">
                        <label className={labelClass}>Tallas (auto)</label>
                        <input type="text" className={`${inputClass} opacity-70`} value={insumoDetail}
                          onChange={(e) => setInsumoDetail(e.target.value)}
                          placeholder="Se jalan de las tallas seleccionadas..." />
                      </div>
                    )}

                    {/* OTRO — campo libre */}
                    {type === 'OTRO' && (
                      <div className="col-span-2">
                        <label className={labelClass}>Detalle</label>
                        <input type="text" className={inputClass} placeholder="Describe el insumo..."
                          value={insumoDetail} onChange={(e) => setInsumoDetail(e.target.value)} />
                      </div>
                    )}

                    {/* Cantidad */}
                    <div>
                      <label className={labelClass}>
                        {type === 'TELA' || type === 'ELASTICO' ? 'Metros por prenda' : 'Cantidad'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={type === 'TELA' || type === 'HILO' || type === 'ELASTICO' ? 0.01 : 1}
                        className={`${inputClass} text-center font-bold`}
                        value={insumoQuantity}
                        onChange={(e) => setInsumoQuantity(Number(e.target.value))}
                      />
                      {type === 'HILO' && (
                        <p className="text-[10px] text-[#8B3A52]/50 mt-1">
                          Medido en conos de 5,000m. Ej: 0.5 = medio cono por prenda.
                        </p>
                      )}
                      {type === 'TELA' && (
                        <p className="text-[10px] text-[#8B3A52]/50 mt-1">Ej: 1.5 = metro y medio por prenda</p>
                      )}
                    </div>
                  </div>
                );
              })()}
              <button type="button" onClick={handleAddInsumo}
                className="w-full py-2.5 bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] text-sm font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all flex items-center justify-center gap-1">
                <Plus size={16}/> Agregar a ficha técnica
              </button>
            </div>

            {technicalSheet.length > 0 ? (() => {
              const groups  = Array.from(new Set(technicalSheet.map(i => i.applies_to)));
              const ordered = ['TODOS', ...groups.filter(g => g !== 'TODOS')];
              return (
                <div className="flex flex-col gap-3">
                  {ordered.filter(g => technicalSheet.some(i => i.applies_to === g)).map(group => (
                    <div key={group} className="border border-[rgba(212,175,55,0.25)] bg-white/70 dark:bg-[#2e1d27] dark:border-[rgba(212,175,55,0.15)] rounded-2xl overflow-hidden">
                      <div className="px-4 py-2 bg-[rgba(139,58,82,0.05)] dark:bg-[rgba(139,58,82,0.15)] border-b border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.06)]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc]">
                          {group === 'TODOS' ? '🧵 Todos los colores' : group === 'MISMO_COLOR' ? '🎨 Mismo color que la variante' : group === 'POR_TALLA' ? '📏 Por talla' : `🎨 Color: ${group}`}
                        </span>
                      </div>
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/5">
                          {technicalSheet.map((item, index) => item.applies_to !== group ? null : (
                            <tr key={index} className="hover:bg-[rgba(139,58,82,0.03)] dark:hover:bg-[rgba(139,58,82,0.1)] transition-colors">
                              <td className="px-4 py-3 font-bold text-[#40202D] dark:text-white w-36">{item.name}</td>
                              <td className="px-4 py-3 text-[#8C6B79] dark:text-[#c4a0ae] text-xs flex-1">
                                {item.detail || <span className="opacity-40 italic">Sin detalle</span>}
                              </td>
                              <td className="px-4 py-3 text-xs uppercase opacity-60 w-20">{item.unit}</td>
                              <td className="px-4 py-3 font-bold text-[#D6405F] dark:text-[#F8BBD0] w-16 text-right">{item.quantity}</td>
                              <td className="px-4 py-3 text-right w-12">
                                <button type="button" onClick={() => handleRemoveInsumo(index)}
                                  className="p-1.5 text-[#8C6B79] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              );
            })() : (
              <div className="text-center py-8 bg-white/30 dark:bg-black/30 rounded-2xl border-2 border-dashed border-[#EAE0E2] dark:border-white/20">
                <p className="text-xs opacity-60 font-bold uppercase tracking-widest">Aún no has agregado insumos del catálogo</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
