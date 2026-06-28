'use client';
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useProductStore, useCategoryStore, useSupplyStore } from '@/hooks';
import Link from 'next/link';
import { Plus, X, Upload, Save, ArrowLeft, Palette, Ruler, Layers, Trash2, ChevronDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { CSS_COLORS_PALETTE, ColorObject } from '@/core/constants';

// ── Tipo de insumo para campos contextuales ──────────────────────────────────
type SupplyType = 'TELA' | 'HILO' | 'BOTON' | 'CIERRE' | 'ELASTICO' | 'ETIQUETA' | 'OTRO';
function getSupplyType(name: string): SupplyType {
  const n = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (n.includes('tela') || n.includes('entretela')) return 'TELA';
  if (n.includes('hilo'))                             return 'HILO';
  if (n.includes('boton') || n.includes('broche'))    return 'BOTON';
  if (n.includes('cierre') || n.includes('cremallera')) return 'CIERRE';
  if (n.includes('elastico'))                         return 'ELASTICO';
  if (n.includes('etiqueta'))                         return 'ETIQUETA';
  return 'OTRO';
}

// ── Catálogo de fibras textiles ──────────────────────────────────────────────
interface Fiber { name: string; type: 'Natural' | 'Sintético' | 'Semi-sintético' | 'Elástico' | 'Especial' }
const FIBERS: Fiber[] = [
  { name: 'Algodón',       type: 'Natural' },
  { name: 'Lino',          type: 'Natural' },
  { name: 'Seda',          type: 'Natural' },
  { name: 'Lana',          type: 'Natural' },
  { name: 'Cáñamo',        type: 'Natural' },
  { name: 'Bambú',         type: 'Natural' },
  { name: 'Alpaca',        type: 'Natural' },
  { name: 'Cachemira',     type: 'Natural' },
  { name: 'Viscosa',       type: 'Semi-sintético' },
  { name: 'Rayón',         type: 'Semi-sintético' },
  { name: 'Modal',         type: 'Semi-sintético' },
  { name: 'Lyocell',       type: 'Semi-sintético' },
  { name: 'Tencel',        type: 'Semi-sintético' },
  { name: 'Poliéster',     type: 'Sintético' },
  { name: 'Nylon',         type: 'Sintético' },
  { name: 'Acrílico',      type: 'Sintético' },
  { name: 'Spandex',       type: 'Sintético' },
  { name: 'Elastano',      type: 'Elástico' },
  { name: 'Lycra',         type: 'Elástico' },
  { name: 'Denim',         type: 'Especial' },
  { name: 'Tul',           type: 'Especial' },
  { name: 'Terciopelo',    type: 'Especial' },
  { name: 'Satén',         type: 'Especial' },
  { name: 'Organza',       type: 'Especial' },
  { name: 'Encaje',        type: 'Especial' },
  { name: 'Chiffon',       type: 'Especial' },
  { name: 'Crepé',         type: 'Especial' },
  { name: 'Gabardina',     type: 'Especial' },
  { name: 'Jersey',        type: 'Especial' },
  { name: 'Fleece',        type: 'Especial' },
  { name: 'Popelín',       type: 'Especial' },
];

const TYPE_COLORS: Record<string, string> = {
  'Natural':        'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  'Sintético':      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  'Semi-sintético': 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'Elástico':       'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  'Especial':       'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
};

function buildCompositionString(fibers: { fiber: Fiber; pct: number }[]): string {
  return fibers.map(f => `${f.pct}% ${f.fiber.name}`).join(', ');
}

function deriveCompositionType(fibers: { fiber: Fiber; pct: number }[]): string {
  if (fibers.length === 0) return '';
  const types = new Set(fibers.map(f => f.fiber.type));
  if (types.has('Especial') && fibers.length === 1) return 'Especial';
  if (types.has('Elástico') || fibers.length > 1) return 'Mezcla';
  const t = fibers[0].fiber.type;
  return t === 'Semi-sintético' ? 'Semi-sintético' : t;
}

interface SupplyItemInput {
  id_supply:  string;
  name:       string;
  unit:       string;
  detail:     string;
  quantity:   number;
  applies_to: string;
}

export default function EditProductPage() {
  const { getProductById, updateProduct, loading: loadingProducts } = useProductStore();
  const { id } = useParams();
  const { categories, startLoadingCategories } = useCategoryStore();
  const { supplies, startLoadingSupplies } = useSupplyStore();
  const router = useRouter();

  const [initialLoading, setInitialLoading] = useState(true);

  // ── Formulario ─────────────────────────────────────────────────────────────
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
    origin_type: 'RETAIL',
    is_active: true,
    is_best_seller: false,
    is_new_in: false,
    is_discount: false,
  });

  // ── Imágenes ───────────────────────────────────────────────────────────────
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string; color?: string | null }[]>([]);
  const [imageColorTags, setImageColorTags] = useState<Record<number, string>>({});

  // ── Colores ────────────────────────────────────────────────────────────────
  const [apiColors, setApiColors] = useState<ColorObject[]>([]);
  const [loadingColors, setLoadingColors] = useState(false);
  const [selectedColors, setSelectedColors] = useState<ColorObject[]>([]);
  const [colorSearch, setColorSearch] = useState('');
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [isCreatingCustomColor, setIsCreatingCustomColor] = useState(false);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#F2778D');

  // ── Fiber composer ─────────────────────────────────────────────────────────
  const [fiberSearch, setFiberSearch]             = useState('');
  const [showFiberDropdown, setShowFiberDropdown] = useState(false);
  const [fiberComposition, setFiberComposition]   = useState<{ fiber: Fiber; pct: number }[]>([]);
  const fiberInputRef = useRef<HTMLInputElement>(null);

  // ── Ficha técnica ──────────────────────────────────────────────────────────
  const [technicalSheet, setTechnicalSheet]     = useState<SupplyItemInput[]>([]);
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [insumoDetail, setInsumoDetail]         = useState('');
  const [insumoQuantity, setInsumoQuantity]     = useState(1);
  const [insumoAppliesTo, setInsumoAppliesTo]   = useState('TODOS');
  const [insumoGrosor, setInsumoGrosor]         = useState('');
  const [insumoColor, setInsumoColor]           = useState<ColorObject | null>(null);
  const [insumoColorSearch, setInsumoColorSearch]               = useState('');
  const [insumoApiColors, setInsumoApiColors]                   = useState<ColorObject[]>([]);
  const [showInsumoColorDropdown, setShowInsumoColorDropdown]   = useState(false);
  const [insumoBtnMaterial, setInsumoBtnMaterial] = useState('');
  const [insumoBtnSize, setInsumoBtnSize]         = useState('');
  const [insumoCierreTipo, setInsumoCierreTipo]   = useState('');
  const [insumoCierreLargo, setInsumoCierreLargo] = useState('');
  const [insumoElasticoAncho, setInsumoElasticoAncho] = useState('');
  const [insumoTelaAncho, setInsumoTelaAncho]     = useState('');
  const [insumoHiloMetros, setInsumoHiloMetros]   = useState('');
  const [isCreatingInsumoColor, setIsCreatingInsumoColor] = useState(false);
  const [customInsumoColorName, setCustomInsumoColorName] = useState('');
  const [customInsumoColorHex, setCustomInsumoColorHex]   = useState('#F2778D');

  // ── Variantes ──────────────────────────────────────────────────────────────
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [variants, setVariants]           = useState<any[]>([]);

  // ── Sync fiber composer → composition (solo cuando el composer tiene fibras) ─
  useEffect(() => {
    if (fiberComposition.length > 0) {
      setFormData(prev => ({ ...prev, composition: buildCompositionString(fiberComposition) }));
    }
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

  // ── Carga inicial del producto ─────────────────────────────────────────────
  useEffect(() => {
    startLoadingCategories();
    startLoadingSupplies();

    const fetchProduct = async () => {
      if (!id) return;
      const product = await getProductById(id as string);
      if (product) {
        setFormData({
          name:          product.name,
          description:   product.description || '',
          sku:           product.sku,
          base_price:    product.base_price,
          gender:        (product as any).gender || 'MUJER',
          composition:   (product as any).composition || '',
          fabric_print:  (product as any).fabric_print || 'LISO',
          print_pattern: (product as any).print_pattern || '',
          season:        (product as any).season || '',
          id_category:   typeof product.id_category === 'object' ? (product.id_category as any)._id : (product.id_category as string) || '',
          origin_type:   (product as any).origin_type || 'RETAIL',
          is_active:     product.is_active ?? true,
          is_best_seller: product.is_best_seller ?? false,
          is_new_in:     product.is_new_in ?? false,
          is_discount:   (product as any).is_discount ?? false,
        });

        setExistingImages(
          product.imagesWithColor && product.imagesWithColor.length > 0
            ? product.imagesWithColor
            : (product.images || []).map((url: string) => ({ url, color: null })),
        );

        setVariants(product.variants || []);

        if (product.variants) {
          setSelectedSizes(Array.from(new Set(product.variants.map((v: any) => v.size))) as string[]);
          const colorsMap = new Map();
          product.variants.forEach((v: any) => {
            if (v.color?.name && !colorsMap.has(v.color.name)) colorsMap.set(v.color.name, v.color);
          });
          setSelectedColors(Array.from(colorsMap.values()));
        }

        const mappedSheet = ((product as any).technical_sheet || []).map((item: any) => {
          const match = supplies.find(s => (s._id || s.id) === item.id_supply);
          return {
            id_supply:  item.id_supply,
            name:       match ? match.name : 'Insumo',
            unit:       match ? match.unit : 'unid',
            detail:     item.detail || '',
            quantity:   item.quantity ?? 1,
            applies_to: item.applies_to || 'TODOS',
          };
        });
        setTechnicalSheet(mappedSheet);
      }
      setInitialLoading(false);
    };
    fetchProduct();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Buscador de colores ────────────────────────────────────────────────────
  useEffect(() => {
    if (colorSearch.trim().length < 2) { setApiColors([]); return; }
    const translations: Record<string, string> = {
      azul: 'blue', celeste: 'skyblue', rojo: 'red', verde: 'green',
      rosado: 'pink', rosa: 'pink', amarillo: 'yellow', gris: 'gray',
      blanco: 'white', negro: 'black', marron: 'brown', marrón: 'brown',
      purpura: 'purple', púrpura: 'purple', tomate: 'tomato', oro: 'gold',
    };
    const t = setTimeout(() => {
      setLoadingColors(true);
      const q = colorSearch.toLowerCase().trim();
      const target = translations[q] || q;
      setApiColors(CSS_COLORS_PALETTE.filter((c: ColorObject) =>
        c.name.toLowerCase().includes(target) || c.name.toLowerCase().includes(q)
      ).slice(0, 8));
      setLoadingColors(false);
    }, 200);
    return () => clearTimeout(t);
  }, [colorSearch]);

  // Buscador de colores para insumos
  useEffect(() => {
    if (insumoColorSearch.trim().length < 2) { setInsumoApiColors([]); return; }
    const translations: Record<string, string> = {
      azul: 'blue', celeste: 'skyblue', rojo: 'red', verde: 'green',
      rosado: 'pink', rosa: 'pink', amarillo: 'yellow', gris: 'gray',
      blanco: 'white', negro: 'black', marron: 'brown', marrón: 'brown',
      purpura: 'purple', púrpura: 'purple', tomate: 'tomato', oro: 'gold',
    };
    const t = setTimeout(() => {
      const q = insumoColorSearch.toLowerCase().trim();
      const target = translations[q] || q;
      setInsumoApiColors(CSS_COLORS_PALETTE.filter((c: ColorObject) =>
        c.name.toLowerCase().includes(target) || c.name.toLowerCase().includes(q)
      ).slice(0, 8));
    }, 200);
    return () => clearTimeout(t);
  }, [insumoColorSearch]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const setTagForImage = (index: number, colorName: string) =>
    setImageColorTags(prev => ({ ...prev, [index]: colorName }));

  const setColorForExisting = (index: number, colorName: string) =>
    setExistingImages(prev => prev.map((img, i) => i === index ? { ...img, color: colorName || null } : img));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedImages(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageColorTags(prev => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const i = Number(k);
        if (i < index) next[i] = v;
        else if (i > index) next[i - 1] = v;
      });
      return next;
    });
  };

  const toggleSize = (size: string) =>
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);

  const handleSelectColor = (color: ColorObject) => {
    if (selectedColors.some(c => c.name.toLowerCase() === color.name.toLowerCase()))
      return toast.error('Este color ya fue seleccionado.');
    setSelectedColors(prev => [...prev, color]);
    setColorSearch('');
    setShowColorDropdown(false);
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return toast.error('Escribe el nombre del color.');
    setSelectedColors(prev => [...prev, { name: customColorName.trim(), hex: customColorHex }]);
    setCustomColorName('');
    setIsCreatingCustomColor(false);
  };

  const handleRemoveColor = (colorName: string) =>
    setSelectedColors(prev => prev.filter(c => c.name !== colorName));

  const generateVariants = useCallback(() => {
    if (selectedSizes.length === 0 || selectedColors.length === 0)
      return toast.error('Selecciona al menos una talla y un color.');
    const newVariants = selectedSizes.flatMap(size =>
      selectedColors.map(color => ({
        size, color, stock: 0,
        sku_variant: `${formData.sku || 'SKU'}-${size}-${color.name.substring(0, 3).toUpperCase().replace(/\s+/g, '')}`,
        min_stock_alert: 10,
      }))
    );
    const toAdd = newVariants.filter(nv => !variants.some(v => v.size === nv.size && v.color.name === nv.color.name));
    if (toAdd.length === 0) return toast.error('Estas variantes ya existen en la tabla.');
    setVariants(prev => [...prev, ...toAdd]);
    toast.success(`${toAdd.length} variante(s) agregada(s).`);
  }, [selectedSizes, selectedColors, formData.sku, variants]);

  const handleOriginChange = (type: 'RETAIL' | 'PRODUCCION') => {
    setFormData(prev => ({ ...prev, origin_type: type }));
    if (type === 'RETAIL') setTechnicalSheet([]);
  };

  const resetInsumoContextual = () => {
    setInsumoDetail(''); setInsumoGrosor(''); setInsumoColor(null); setInsumoColorSearch('');
    setInsumoBtnMaterial(''); setInsumoBtnSize(''); setInsumoCierreTipo(''); setInsumoCierreLargo('');
    setInsumoElasticoAncho(''); setInsumoTelaAncho(''); setInsumoHiloMetros('');
    setIsCreatingInsumoColor(false); setCustomInsumoColorName(''); setCustomInsumoColorHex('#F2778D');
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
    if (type === 'ETIQUETA' && selectedSizes.length > 0) setInsumoDetail(selectedSizes.join(', '));
  };

  const buildInsumoDetail = (): string => {
    const supply = supplies.find(s => (s._id || s.id) === selectedInsumoId);
    if (!supply) return insumoDetail;
    const type = getSupplyType(supply.name);
    const colorStr = insumoColor ? insumoColor.name : '';
    switch (type) {
      case 'TELA':    return [insumoDetail, insumoGrosor, insumoTelaAncho].filter(Boolean).join(' · ');
      case 'HILO':    return colorStr;
      case 'BOTON':   return [colorStr, insumoBtnMaterial, insumoBtnSize ? `${insumoBtnSize}mm` : ''].filter(Boolean).join(' · ');
      case 'CIERRE':  return [colorStr, insumoCierreTipo, insumoCierreLargo ? `${insumoCierreLargo}cm` : ''].filter(Boolean).join(' · ');
      case 'ELASTICO': return [colorStr, insumoElasticoAncho ? `${insumoElasticoAncho}cm ancho` : ''].filter(Boolean).join(' · ');
      default:        return insumoDetail;
    }
  };

  const handleAddInsumo = () => {
    if (!selectedInsumoId) return toast.error('Selecciona un insumo válido.');
    const realSupply = supplies.find(s => (s._id || s.id) === selectedInsumoId);
    if (!realSupply) return toast.error('El insumo seleccionado no es válido.');
    const idStr = (realSupply._id || realSupply.id) as string;
    const isDuplicate = technicalSheet.some(i => i.id_supply === idStr && i.applies_to === insumoAppliesTo);
    if (isDuplicate) return toast.error(`${realSupply.name} ya está agregado para "${insumoAppliesTo}".`);
    setTechnicalSheet(prev => [...prev, {
      id_supply: idStr, name: realSupply.name, unit: realSupply.unit,
      detail: buildInsumoDetail().trim(), quantity: insumoQuantity, applies_to: insumoAppliesTo,
    }]);
    setSelectedInsumoId('');
    resetInsumoContextual();
    setInsumoQuantity(1);
    setInsumoAppliesTo('TODOS');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.sku || !formData.id_category)
      return toast.error('Completa los campos obligatorios (*)');
    if (selectedImages.length === 0 && existingImages.length === 0)
      return toast.error('Debes tener al menos una imagen');
    if (variants.length === 0)
      return toast.error('Debes tener al menos una variante.');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('sku', formData.sku);
    data.append('base_price', formData.base_price.toString());
    data.append('gender', formData.gender);
    data.append('composition', formData.composition);
    data.append('fabric_print', formData.fabric_print);
    if (formData.print_pattern) data.append('print_pattern', formData.print_pattern);
    data.append('id_category', formData.id_category);
    data.append('season', formData.season);
    data.append('origin_type', formData.origin_type);
    data.append('is_active', String(formData.is_active));
    data.append('is_best_seller', String(formData.is_best_seller));
    data.append('is_new_in', String(formData.is_new_in));
    data.append('is_discount', String(formData.is_discount));
    data.append('variants', JSON.stringify(variants));

    if (formData.origin_type === 'PRODUCCION') {
      const cleanSheet = technicalSheet.map(item => ({
        id_supply: item.id_supply, detail: item.detail || '',
        quantity: item.quantity, applies_to: item.applies_to,
      }));
      data.append('technical_sheet', JSON.stringify(cleanSheet));
    }

    data.append('existing_images', JSON.stringify(existingImages));
    selectedImages.forEach(f => data.append('files', f));
    data.append('image_colors', JSON.stringify(selectedImages.map((_, idx) => imageColorTags[idx] || null)));

    const result = await updateProduct(id as string, data);
    if (result) router.push('/admin/products');
  };

  // ── Clases reutilizables ───────────────────────────────────────────────────
  const inputClass = "w-full bg-[#fdf8f9] dark:bg-[#1a0e14] border border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.1)] rounded-[10px] outline-none focus:border-[rgba(139,58,82,0.5)] dark:focus:border-[rgba(160,80,104,0.5)] transition-[background-color,border-color] duration-[600ms] text-[#2d1f25] dark:text-[#e8d8dc] placeholder-[#2d1f25]/30 dark:placeholder-white/30 p-[12px_16px] text-[0.85rem]";
  const selectClass = `${inputClass} appearance-none pr-10 cursor-pointer`;
  const sectionClass = "space-y-[16px] bg-white/70 backdrop-blur-2xl dark:bg-[#2e1d27] border border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[16px] p-[28px] transition-[background-color,border-color] duration-[600ms]";
  const titleClass = "text-[0.72rem] tracking-[0.15em] text-[#8B3A52] dark:text-[#a05068] uppercase font-semibold mb-[16px]";
  const labelClass = "text-[0.7rem] tracking-[0.1em] text-[#8B3A52] dark:text-[#a05068] uppercase mb-[6px] block font-medium";
  const getSelectableBtnClass = (isSelected: boolean, extraClasses = 'p-4') =>
    `${extraClasses} text-center transition-all text-[0.82rem] font-medium border rounded-[8px] ${isSelected
      ? 'bg-[rgba(139,58,82,0.3)] border-[#8B3A52] text-white'
      : 'bg-transparent border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.1)] text-[#8B3A52]/60 dark:text-[#a08088] hover:text-[#8B3A52] dark:hover:text-white hover:border-[#8B3A52]/40 dark:hover:border-[rgba(255,255,255,0.2)]'}`;

  // ── Fiber composer JSX ─────────────────────────────────────────────────────
  const fiberComposerJSX = (
    <div>
      <label className={labelClass}>Composición de Tela</label>
      <div className="relative mb-2">
        <input ref={fiberInputRef} type="text" className={inputClass}
          placeholder="Buscar fibra: algodón, poliéster, viscosa..."
          value={fiberSearch}
          onChange={e => { setFiberSearch(e.target.value); setShowFiberDropdown(true); }}
          onFocus={() => setShowFiberDropdown(true)}
          onBlur={() => setTimeout(() => setShowFiberDropdown(false), 150)} />
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
                    onChange={e => setFiberComposition(prev => prev.map((f, i) => i === idx ? { ...f, pct: Math.min(100, Math.max(1, Number(e.target.value))) } : f))}
                    className={`w-16 text-center text-sm font-bold rounded-lg border px-2 py-1 bg-white dark:bg-[#2a1520] outline-none transition-colors ${over ? 'border-rose-400 text-rose-500' : 'border-[rgba(139,58,82,0.2)] dark:border-[rgba(255,255,255,0.1)] text-[#D6405F] dark:text-[#F8BBD0]'}`} />
                  <span className="text-xs text-[#8C6B79]">%</span>
                </div>
                <button type="button" onClick={() => setFiberComposition(prev => prev.filter((_, i) => i !== idx))}
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
        <div className="space-y-1">
          <p className="text-xs text-[#8C6B79]/60 mt-1">
            Usa el buscador para construir la composición, o edita el texto directamente abajo:
          </p>
          <input type="text" className={inputClass}
            placeholder="Ej: 95% Algodón, 5% Elastano"
            value={formData.composition}
            onChange={e => setFormData(prev => ({ ...prev, composition: e.target.value }))} />
        </div>
      )}
    </div>
  );

  // ── Color picker para insumos ──────────────────────────────────────────────
  const colorPickerJSX = (
    <div className="relative">
      <label className={labelClass}>Color</label>
      {isCreatingInsumoColor ? (
        <div className="p-3 bg-rose-50/10 dark:bg-white/5 border border-[#D6405F]/30 rounded-xl space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#D6405F]">✨ Color personalizado</p>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Nombre"
              className="flex-1 p-2 bg-white/80 dark:bg-black/50 border border-[#EAE0E2] dark:border-white/10 rounded-lg text-sm outline-none"
              value={customInsumoColorName} onChange={e => setCustomInsumoColorName(e.target.value)} />
            <div className="flex items-center bg-white/80 dark:bg-black/50 border border-[#EAE0E2] dark:border-white/10 p-1 rounded-lg gap-1.5">
              <input type="color" className="w-7 h-7 rounded border-none cursor-pointer p-0 bg-transparent"
                value={customInsumoColorHex} onChange={e => setCustomInsumoColorHex(e.target.value)} />
              <input type="text" className="w-16 text-xs font-mono outline-none uppercase text-center bg-transparent"
                value={customInsumoColorHex} onChange={e => setCustomInsumoColorHex(e.target.value)} />
            </div>
            <button type="button"
              onClick={() => { if (!customInsumoColorName.trim()) return; setInsumoColor({ name: customInsumoColorName.trim(), hex: customInsumoColorHex }); setIsCreatingInsumoColor(false); }}
              className="px-3 py-2 bg-[#D6405F] text-white text-xs font-bold rounded-lg hover:scale-105 transition-all">Agregar</button>
            <button type="button" onClick={() => setIsCreatingInsumoColor(false)}
              className="px-3 py-2 border border-[#EAE0E2] dark:border-white/20 text-xs font-bold rounded-lg hover:bg-white/50 transition-colors">Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input type="text" className={`${inputClass} pl-10`} placeholder="Buscar color: blanco, negro, rojo..."
            value={insumoColor ? insumoColor.name : insumoColorSearch}
            readOnly={!!insumoColor}
            onChange={e => { setInsumoColorSearch(e.target.value); setShowInsumoColorDropdown(true); }}
            onFocus={() => { if (!insumoColor) setShowInsumoColorDropdown(true); }}
            onBlur={() => setTimeout(() => setShowInsumoColorDropdown(false), 150)} />
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
                + Crear color personalizado
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5efe8] dark:bg-[#1e1018]">
        <div className="animate-pulse text-[#8B3A52] dark:text-[#F8BBD0] font-medium text-xl">Cargando producto...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 text-[#2d1f25] dark:text-[#e8d8dc] bg-[#f5efe8] dark:bg-[#1e1018] relative z-10 transition-[background-color,border-color] duration-[600ms]">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center py-4">
        <Link href="/admin/products" className="flex items-center gap-2 font-medium opacity-60 hover:opacity-100 transition-opacity uppercase" style={{ fontSize: '0.78rem', letterSpacing: '0.08em' }}>
          <ArrowLeft size={16} /> Volver a Productos
        </Link>
        <button disabled={loadingProducts} onClick={handleSubmit}
          className="text-white flex items-center gap-2 disabled:opacity-50 transition-all font-medium"
          style={{ background: '#8B3A52', borderRadius: '10px', fontSize: '0.82rem', padding: '10px 24px', letterSpacing: '0.05em' }}>
          {loadingProducts ? 'Actualizando...' : <><Save size={18} /> Actualizar producto</>}
        </button>
      </div>

      <div className="flex flex-col gap-6 max-w-5xl mx-auto">

        {/* ── 1. TIPO DE ORIGEN ───────────────────────────────────────────── */}
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

        {/* ── 2. IDENTIFICACIÓN ───────────────────────────────────────────── */}
        <div className={sectionClass}>
          <h3 className={titleClass}>Identificación del producto</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Nombre del producto *</label>
              <input type="text" className={inputClass} placeholder="Ej: Vestido Gala" value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Categoría *</label>
              <div className="relative">
                <select className={selectClass} value={formData.id_category} onChange={e => setFormData(prev => ({ ...prev, id_category: e.target.value }))}>
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B3A52]/60" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Temporada</label>
              <div className="relative">
                <select className={selectClass} value={formData.season} onChange={e => setFormData(prev => ({ ...prev, season: e.target.value }))}>
                  <option value="">Selecciona temporada</option>
                  <option value="PRIMAVERA 2026">Primavera 2026</option>
                  <option value="VERANO 2026">Verano 2026</option>
                  <option value="OTOÑO / INVIERNO">Otoño / Invierno</option>
                  <option value="TODO EL AÑO">Todo el año</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B3A52]/60" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Género *</label>
              <div className="flex gap-3">
                {['MUJER', 'HOMBRE', 'UNISEX'].map(g => (
                  <button key={g} type="button" onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                    className={getSelectableBtnClass(formData.gender === g, 'flex-1 py-2 text-xs')}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>SKU Base</label>
              <input type="text" readOnly
                className={`${inputClass} font-mono tracking-widest opacity-50 cursor-not-allowed`}
                value={formData.sku} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Descripción</label>
              <textarea className={`${inputClass} h-[72px] resize-none`} placeholder="Describe el producto..."
                value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* ── 3. MATERIAL ─────────────────────────────────────────────────── */}
        <div className={sectionClass}>
          <h3 className={titleClass}>Material</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">{fiberComposerJSX}</div>
            <div>
              <label className={labelClass}>Acabado de Tela</label>
              <div className="flex gap-3 flex-wrap">
                {(['LISO', 'ESTAMPADO', 'BORDADO', 'TEXTURIZADO'] as const).map(opt => (
                  <button key={opt} type="button"
                    onClick={() => setFormData(prev => ({ ...prev, fabric_print: opt, print_pattern: opt !== 'ESTAMPADO' ? '' : prev.print_pattern }))}
                    className={getSelectableBtnClass(formData.fabric_print === opt, 'px-4 py-2 text-xs')}>
                    {opt}
                  </button>
                ))}
              </div>
              {formData.fabric_print === 'ESTAMPADO' && (
                <input type="text" className={`${inputClass} mt-3`}
                  placeholder="Describe el estampado: flores, rayas, geométrico..."
                  value={formData.print_pattern}
                  onChange={e => setFormData(prev => ({ ...prev, print_pattern: e.target.value }))} />
              )}
            </div>
          </div>
        </div>

        {/* ── 4. IMÁGENES + VARIANTES ─────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-6">
          {/* Imágenes */}
          <div className="col-span-4">
            <div className={sectionClass}>
              <h3 className={titleClass}>Imágenes ({selectedImages.length + existingImages.length}/5)</h3>
              <input type="file" id="file-upload" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              <label htmlFor="file-upload" className="border-[2px] border-dashed border-[rgba(139,58,82,0.2)] dark:border-[rgba(160,80,104,0.3)] rounded-[12px] p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group hover:border-[rgba(139,58,82,0.5)] dark:hover:border-[rgba(160,80,104,0.6)] hover:bg-[rgba(139,58,82,0.02)] dark:hover:bg-[rgba(160,80,104,0.05)]">
                <Upload className="text-[#8B3A52] dark:text-[#a05068] mb-2 group-hover:scale-110 transition-transform" size={32} />
                <p className="text-xs text-center opacity-60 group-hover:opacity-100 font-bold uppercase tracking-wider">Haz clic para subir fotos</p>
              </label>
              <div className="flex flex-col gap-3 mt-4">
                {/* Imágenes existentes */}
                {existingImages.map((img, idx) => (
                  <div key={`exist-${idx}`} className="flex items-center gap-3 bg-white/50 dark:bg-white/5 rounded-xl border border-[#EAE0E2] dark:border-white/10 p-2 shadow-sm">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#EAE0E2] dark:border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} className="object-cover w-full h-full" alt="preview" />
                      <div className="absolute top-0 right-0 bg-black/60 text-white px-1 rounded-bl-lg text-[8px]">Actual</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="relative">
                        <select value={img.color ?? ''} onChange={e => setColorForExisting(idx, e.target.value)}
                          className={`${selectClass} text-xs py-2`}>
                          <option value="">Sin color (general)</option>
                          {selectedColors.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B3A52]/60" />
                      </div>
                    </div>
                    <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                      className="flex-shrink-0 p-1.5 rounded-lg text-[#8C6B79] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {/* Imágenes nuevas */}
                {selectedImages.map((file, idx) => {
                  const taggedColor = selectedColors.find(c => c.name === imageColorTags[idx]);
                  return (
                    <div key={idx} className="flex items-center gap-3 bg-white/50 dark:bg-white/5 rounded-xl border border-[#EAE0E2] dark:border-white/10 p-2 shadow-sm">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#EAE0E2] dark:border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="preview" />
                        <div className="absolute top-0 right-0 bg-[#8B3A52]/80 text-white px-1 rounded-bl-lg text-[8px]">Nueva</div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <p className="text-[10px] opacity-40 truncate font-medium">{file.name}</p>
                        <div className="relative">
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-black/10 dark:border-white/10 transition-colors"
                            style={{ backgroundColor: taggedColor ? taggedColor.hex : 'transparent', border: taggedColor ? undefined : '1.5px dashed #8B3A52' }} />
                          <select value={imageColorTags[idx] || ''} onChange={e => setTagForImage(idx, e.target.value)}
                            className={`${selectClass} pl-7 text-xs py-2`}>
                            <option value="">Sin color (general)</option>
                            {selectedColors.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B3A52]/60" />
                        </div>
                      </div>
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
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button key={size} type="button" onClick={() => toggleSize(size)}
                      className={`w-10 h-10 flex items-center justify-center font-medium text-[0.82rem] rounded-lg border transition-all
                        ${selectedSizes.includes(size) ? 'bg-[rgba(139,58,82,0.3)] border-[#8B3A52] text-white' : 'bg-transparent border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.15)] text-[#8B3A52]/70 dark:text-[#c4a0ae] hover:border-[#8B3A52]/50'}`}>
                      {size}
                    </button>
                  ))}
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
                          placeholder="Buscar color en español o inglés..."
                          value={colorSearch} onFocus={() => setShowColorDropdown(true)}
                          onChange={e => setColorSearch(e.target.value)} />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#D6405F] dark:bg-[#F8BBD0]" />
                      </div>
                      {showColorDropdown && (
                        <div className="absolute left-0 right-0 z-50 mt-2 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-[#EAE0E2] dark:divide-white/10">
                          {loadingColors ? (
                            <div className="p-4 text-center text-xs opacity-50">Buscando...</div>
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
                            <div className="p-4 text-center text-xs opacity-50 italic text-gray-400">No se encontraron coincidencias.</div>
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
                          className="flex-1 p-2.5 bg-white/80 dark:bg-black/50 border border-[#EAE0E2] dark:border-white/10 rounded-xl text-sm outline-none focus:border-[#D6405F]"
                          value={customColorName} onChange={e => setCustomColorName(e.target.value)} />
                        <div className="flex items-center bg-white/80 dark:bg-black/50 border border-[#EAE0E2] dark:border-white/10 p-1.5 rounded-xl gap-2">
                          <input type="color" className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent" value={customColorHex} onChange={e => setCustomColorHex(e.target.value)} />
                          <input type="text" className="w-20 text-xs font-mono outline-none uppercase text-center bg-transparent" value={customColorHex} onChange={e => setCustomColorHex(e.target.value)} />
                        </div>
                        <button type="button" onClick={handleAddCustomColor} className="px-4 py-2.5 bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] text-sm font-bold rounded-xl shadow-md hover:scale-105 transition-all">Agregar</button>
                        <button type="button" onClick={() => setIsCreatingCustomColor(false)} className="px-4 py-2.5 border border-[#EAE0E2] dark:border-white/20 text-sm font-bold rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors">Cancelar</button>
                      </div>
                    </div>
                  )}
                  {showColorDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowColorDropdown(false)} />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedColors.map(color => (
                    <div key={color.name} className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-black/50 text-[#40202D] dark:text-white rounded-full text-xs font-bold border border-[#EAE0E2] dark:border-white/10 shadow-sm">
                      <div className="w-3 h-3 rounded-full border border-black/5 dark:border-white/10" style={{ backgroundColor: color.hex }} />
                      {color.name}
                      <X size={14} className="cursor-pointer text-[#8C6B79] hover:text-[#D6405F] transition-colors" onClick={() => handleRemoveColor(color.name)} />
                    </div>
                  ))}
                  {selectedColors.length === 0 && <p className="text-xs opacity-40 italic font-medium">No hay colores seleccionados</p>}
                </div>
              </div>

              {/* Botón agregar variantes */}
              <button type="button" onClick={generateVariants}
                disabled={selectedSizes.length === 0 || selectedColors.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#8B3A52] hover:bg-[#a05068] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-md hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-wider">
                <Plus size={16} /> Agregar combinación ({selectedSizes.length} tallas × {selectedColors.length} colores)
              </button>

              {/* Tabla de variantes */}
              {variants.length > 0 && (
                <div className="border border-[#EAE0E2] dark:border-white/10 rounded-2xl overflow-hidden shadow-sm bg-white/30 dark:bg-white/5">
                  <div className="bg-white/50 dark:bg-black/30 p-4 border-b border-[#EAE0E2] dark:border-white/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#D6405F] dark:text-[#F8BBD0]">Variantes ({variants.length})</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/50 dark:bg-black/30 sticky top-0 text-xs font-bold uppercase tracking-wider text-[#D6405F] dark:text-[#F8BBD0] border-b border-[#EAE0E2] dark:border-white/10">
                        <tr>
                          <th className="p-4">Talla</th>
                          <th className="p-4">Color</th>
                          <th className="p-4">SKU Variante</th>
                          <th className="p-4 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
                        {variants.map((v, i) => (
                          <tr key={i} className={`transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-[#2e1d27]' : 'bg-[#fdf8f9] dark:bg-[#321f2b]'} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                            <td className="p-4 font-medium">{v.size}</td>
                            <td className="p-4 font-bold">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: v.color?.hex }} />
                                {v.color?.name}
                              </div>
                            </td>
                            <td className="p-4 font-mono text-xs opacity-70">{v.sku_variant}</td>
                            <td className="p-4 text-center">
                              <button type="button" onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))}
                                className="p-1.5 text-[#8C6B79] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
                                <Trash2 size={15} />
                              </button>
                            </td>
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

        {/* ── 5. PRECIO Y VISIBILIDAD ─────────────────────────────────────── */}
        <div className={sectionClass}>
          <h3 className={titleClass}>Precio y visibilidad</h3>
          <div className="grid grid-cols-2 gap-6 items-start">
            <div>
              <label className={labelClass}>Precio Base (S/.) *</label>
              <input type="number" className={inputClass} placeholder="0.00" value={formData.base_price || ''}
                onChange={e => setFormData(prev => ({ ...prev, base_price: Number(e.target.value) }))} />
            </div>
            <div className="flex flex-col gap-4 pt-1">
              {[
                { key: 'is_active',      label: 'Producto Activo',        desc: 'Visible en catálogo y compras.' },
                { key: 'is_best_seller', label: 'Best Seller',            desc: 'Destacado como más vendido.' },
                { key: 'is_new_in',      label: 'Nuevo Ingreso (New In)', desc: 'Etiquetado como novedad.' },
                { key: 'is_discount',    label: '50% Menos',              desc: 'Etiqueta de descuento.' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={(formData as any)[key]}
                    onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
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

        {/* ── 6. FICHA TÉCNICA (solo producción) ─────────────────────────── */}
        {formData.origin_type === 'PRODUCCION' && (
          <div className={sectionClass}>
            <h3 className={`${titleClass} flex items-center gap-2`}>Ficha Técnica de Insumos</h3>
            <div className="flex flex-col gap-3 bg-[#fdf8f9] dark:bg-[#1a0e14] border border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.08)] p-4 rounded-2xl shadow-inner">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Insumo</label>
                  <select className={inputClass} value={selectedInsumoId} onChange={e => handleInsumoSelect(e.target.value)}>
                    <option value="">Selecciona materia prima...</option>
                    {supplies.filter(s => s.is_active).map(ins => (
                      <option key={ins._id || ins.id} value={ins._id || ins.id}>{ins.name} ({ins.unit})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Aplica a</label>
                  <select className={inputClass} value={insumoAppliesTo} onChange={e => setInsumoAppliesTo(e.target.value)}>
                    <option value="TODOS">Todos los colores</option>
                    <option value="MISMO_COLOR">Mismo color que la variante</option>
                    <option value="POR_TALLA">Por talla (ej: etiquetas)</option>
                    {selectedColors.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Campos contextuales */}
              {(() => {
                const supply = supplies.find(s => (s._id || s.id) === selectedInsumoId);
                const type   = supply ? getSupplyType(supply.name) : 'OTRO';
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {type === 'TELA' && <>
                      <div className="col-span-3">
                        <label className={labelClass}>Composición <span className="ml-2 normal-case text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-semibold">auto</span></label>
                        <input type="text" className={`${inputClass} text-[#8C6B79] dark:text-[#c4a0ae]`}
                          value={insumoDetail} onChange={e => setInsumoDetail(e.target.value)}
                          placeholder="Se jala de la sección Material arriba..." />
                      </div>
                      <div>
                        <label className={labelClass}>Grosor</label>
                        <select className={inputClass} value={insumoGrosor} onChange={e => setInsumoGrosor(e.target.value)}>
                          <option value="">—</option>
                          <option value="Liviano (<100 g/m²)">Liviano — &lt;100 g/m²</option>
                          <option value="Medio (100–200 g/m²)">Medio — 100–200 g/m²</option>
                          <option value="Semipesado (200–300 g/m²)">Semipesado — 200–300 g/m²</option>
                          <option value="Pesado (>300 g/m²)">Pesado — &gt;300 g/m²</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Ancho del rollo</label>
                        <select className={inputClass} value={insumoTelaAncho} onChange={e => setInsumoTelaAncho(e.target.value)}>
                          <option value="">—</option>
                          {['90', '110', '115', '140', '150', '160', '180'].map(w =>
                            <option key={w} value={`${w}cm`}>{w} cm</option>)}
                        </select>
                      </div>
                    </>}
                    {type === 'BOTON' && <>
                      <div className={isCreatingInsumoColor ? 'col-span-3' : 'col-span-1'}>{colorPickerJSX}</div>
                      {!isCreatingInsumoColor && <>
                        <div>
                          <label className={labelClass}>Material</label>
                          <select className={inputClass} value={insumoBtnMaterial} onChange={e => setInsumoBtnMaterial(e.target.value)}>
                            <option value="">Selecciona...</option>
                            {['Plástico', 'Metal', 'Madera', 'Nácar', 'Resina'].map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Tamaño (mm)</label>
                          <input type="number" min={1} className={inputClass} placeholder="12"
                            value={insumoBtnSize} onChange={e => setInsumoBtnSize(e.target.value)} />
                        </div>
                      </>}
                    </>}
                    {type === 'CIERRE' && <>
                      <div className={isCreatingInsumoColor ? 'col-span-3' : 'col-span-1'}>{colorPickerJSX}</div>
                      {!isCreatingInsumoColor && (
                        <>
                          <div className="col-span-1">
                            <label className={labelClass}>Tipo</label>
                            <div className="flex gap-2 flex-wrap">
                              {['Invisible', 'Metálico', 'Nylon', 'Plástico'].map(t => (
                                <button key={t} type="button" onClick={() => setInsumoCierreTipo(t)}
                                  className={getSelectableBtnClass(insumoCierreTipo === t, 'px-3 py-1.5 text-xs')}>{t}</button>
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
                    {type === 'ELASTICO' && <>
                      <div className={isCreatingInsumoColor ? 'col-span-3' : 'col-span-1'}>{colorPickerJSX}</div>
                      {!isCreatingInsumoColor && (
                        <div>
                          <label className={labelClass}>Ancho (cm)</label>
                          <input type="number" min={1} className={inputClass} placeholder="2"
                            value={insumoElasticoAncho} onChange={e => setInsumoElasticoAncho(e.target.value)} />
                        </div>
                      )}
                    </>}
                    {type === 'HILO' && <div className="col-span-2">{colorPickerJSX}</div>}
                    {type === 'ETIQUETA' && (
                      <div className="col-span-2">
                        <label className={labelClass}>Tallas (auto)</label>
                        <input type="text" className={`${inputClass} opacity-70`} value={insumoDetail}
                          onChange={e => setInsumoDetail(e.target.value)} placeholder="Se jalan de las tallas seleccionadas..." />
                      </div>
                    )}
                    {type === 'OTRO' && (
                      <div className="col-span-2">
                        <label className={labelClass}>Detalle</label>
                        <input type="text" className={inputClass} placeholder="Describe el insumo..."
                          value={insumoDetail} onChange={e => setInsumoDetail(e.target.value)} />
                      </div>
                    )}
                    <div>
                      <label className={labelClass}>{type === 'TELA' || type === 'ELASTICO' ? 'Metros por prenda' : 'Cantidad'}</label>
                      <input type="number" min={0} step={type === 'TELA' || type === 'HILO' || type === 'ELASTICO' ? 0.01 : 1}
                        className={`${inputClass} text-center font-bold`}
                        value={insumoQuantity} onChange={e => setInsumoQuantity(Number(e.target.value))} />
                    </div>
                  </div>
                );
              })()}
              <button type="button" onClick={handleAddInsumo}
                className="w-full py-2.5 bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] text-sm font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all flex items-center justify-center gap-1">
                <Plus size={16} /> Agregar a ficha técnica
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
                            <tr key={index} className={`transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-[#2e1d27]' : 'bg-[#fdf8f9] dark:bg-[#321f2b]'} hover:bg-[rgba(139,58,82,0.03)] dark:hover:bg-[rgba(139,58,82,0.1)]`}>
                              <td className="px-4 py-3 font-bold text-[#40202D] dark:text-white w-36">{item.name}</td>
                              <td className="px-4 py-3 text-[#8C6B79] dark:text-[#c4a0ae] text-xs flex-1">
                                {item.detail || <span className="opacity-40 italic">Sin detalle</span>}
                              </td>
                              <td className="px-4 py-3 text-xs uppercase opacity-60 w-20">{item.unit}</td>
                              <td className="px-4 py-3 font-bold text-[#D6405F] dark:text-[#F8BBD0] w-16 text-right">{item.quantity}</td>
                              <td className="px-4 py-3 text-right w-12">
                                <button type="button" onClick={() => setTechnicalSheet(prev => prev.filter((_, i) => i !== index))}
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
                <p className="text-xs opacity-60 font-bold uppercase tracking-widest">Aún no has agregado insumos</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
