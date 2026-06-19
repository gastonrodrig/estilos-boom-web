// @ts-nocheck
'use client';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useProductStore, useCategoryStore, useSupplyStore } from '@/hooks';
import Link from 'next/link';
import { Plus, X, Upload, Save, ArrowLeft, Palette, Ruler, Layers, Trash2, ChevronDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { CSS_COLORS_PALETTE, ColorObject } from '@/core/constants';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
type SizeKey = typeof SIZES[number];

// Estructura de la Ficha Técnica con soporte para insumos fijos y telas por talla
interface SupplyItemInput {
  id_supply: string;
  name: string;
  category: string;
  unit: string;
  by_size?: Partial<Record<SizeKey, number>>;
  quantity?: number;
  applies_to?: string;
  detail?: string;
}

export default function EditProductPage() {
  const { getProductById, updateProduct, loading: loadingProducts } = useProductStore();
  const { id } = useParams();
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
    season: '',
    id_category: '',
    origin_type: 'RETAIL', // 'RETAIL' o 'PRODUCCION'
    is_active: true,
    is_best_seller: false,
    is_new_in: false,
    is_discount: false,
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  // Imágenes ya guardadas (URL + color). Se conservan al actualizar salvo que el usuario las quite.
  const [existingImages, setExistingImages] = useState<{ url: string; color?: string | null }[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
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

  // 🧵 Estados de la Ficha Técnica con soporte por talla
  const [technicalSheet, setTechnicalSheet] = useState<SupplyItemInput[]>([]);
  const [selectedInsumoId, setSelectedInsumoId] = useState<string>('');
  const [insumoQuantity, setInsumoQuantity] = useState<number>(1);
  const [bySizeValues, setBySizeValues] = useState<Partial<Record<SizeKey, number>>>({
    XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0
  });
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const selectedSupply = useMemo(() =>
    supplies.find(s => (s._id || s.id) === selectedInsumoId), [supplies, selectedInsumoId]
  );
  const isFabric = selectedSupply?.category === 'Telas';

  const suppliesByCategory = useMemo(() => {
    const grouped: Record<string, typeof supplies> = {};
    supplies.filter(s => s.is_active).forEach(s => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });
    return grouped;
  }, [supplies]);

  // Estado de la tabla de variantes
  const [variants, setVariants] = useState<any[]>([]);
  // Mapeo de índice de imagen NUEVA → nombre de color
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
    // Reindexamos las etiquetas de color para mantenerlas alineadas con el array de archivos
    setImageColorTags((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const i = Number(k);
        if (i < index) next[i] = v;
        else if (i > index) next[i - 1] = v;
      });
      return next;
    });
  };

  // Cambia el color de una imagen ya guardada
  const setColorForExisting = (index: number, colorName: string) => {
    setExistingImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, color: colorName || null } : img)),
    );
  };

  // 🔄 Generador manual de variantes
  const generateVariants = useCallback(() => {
    if (selectedSizes.length === 0 || selectedColors.length === 0) {
      toast.error("Selecciona al menos una talla y un color para agregar variantes.");
      return;
    }

    const newVariants = selectedSizes.flatMap(size => 
      selectedColors.map(color => ({
        size,
        color, 
        stock: 0,
        sku_variant: `${formData.sku || 'SKU'}-${size}-${color.name.substring(0,3).toUpperCase().replace(/\s+/g, '')}`,
        min_stock_alert: 10
      }))
    );

    const variantsToAdd = newVariants.filter(nv => 
      !variants.some(v => v.size === nv.size && v.color.name === nv.color.name)
    );

    if (variantsToAdd.length === 0) {
      toast.error("Las variantes de esta combinación ya existen en la tabla.");
      return;
    }

    setVariants(prev => [...prev, ...variantsToAdd]);
    toast.success(`${variantsToAdd.length} variante(s) agregada(s).`);
  }, [formData.sku, selectedSizes, selectedColors, variants]);

  // Generar SKU base a partir de nombre, temporada y composición/material
  const generateBaseSKU = () => {
    if (!formData.name || !formData.season || !formData.composition) {
      toast.error("Por favor completa los campos: Nombre, Temporada y Material / Tela para poder generar el SKU.");
      return;
    }

    // Abreviatura del nombre (ej. VEST para Vestido Gala)
    const cleanName = formData.name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "");
    const nameWords = cleanName.split(/\s+/).filter(Boolean);
    let nameAbbr = "";
    if (nameWords.length >= 2) {
      nameAbbr = (nameWords[0].slice(0, 2) + nameWords[1].slice(0, 2)).padEnd(4, "X");
    } else if (nameWords.length === 1) {
      nameAbbr = nameWords[0].slice(0, 4).padEnd(4, "X");
    } else {
      nameAbbr = "PROD";
    }

    // Abreviatura de temporada (ej. PRIM26 para PRIMAVERA 2026)
    const cleanSeason = formData.season
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const seasonAbbr = cleanSeason.slice(0, 5).padEnd(4, "X");

    // Abreviatura de material/composición (ej. ALGO para Algodón)
    const cleanComp = formData.composition
      .trim()
      .toUpperCase()
      .replace(/[0-9%]/g, "")
      .replace(/[^A-Z0-9]/g, "");
    const compAbbr = cleanComp.slice(0, 4).padEnd(4, "X");

    const generatedSku = `${nameAbbr}-${seasonAbbr}-${compAbbr}`;
    setFormData(prev => ({ ...prev, sku: generatedSku }));
    toast.success(`SKU generado: ${generatedSku}`);
  };

  // Carga inicial de datos desde la API
  useEffect(() => {
    startLoadingCategories();
    startLoadingSupplies();
    
    const fetchProduct = async () => {
      if (id) {
        const product = await getProductById(id as string);
        if (product) {
          setFormData({
            name: product.name,
            description: product.description || '',
            sku: product.sku,
            base_price: product.base_price,
            gender: product.gender || 'MUJER',
            composition: product.composition || '',
            season: product.season || '',
            id_category: typeof product.id_category === 'object' ? (product.id_category as any)._id : product.id_category,
            origin_type: product.origin_type || 'RETAIL',
            is_active: product.is_active ?? true,
            is_best_seller: product.is_best_seller ?? false,
            is_new_in: product.is_new_in ?? false,
            is_discount: product.is_discount ?? false,
          });
          // Preferimos imagesWithColor (URL + color); si no existe, derivamos de images (legado).
          setExistingImages(
            product.imagesWithColor && product.imagesWithColor.length > 0
              ? product.imagesWithColor
              : (product.images || []).map((url: string) => ({ url, color: null })),
          );
          setVariants(product.variants || []);
          
          // Mapeamos los datos de la ficha técnica de la BD con los insumos locales para obtener name y unit
          const mappedSheet = (product.technical_sheet || []).map((item: any) => {
            const match = supplies.find(s => (s._id || s.id) === item.id_supply);
            return {
              id_supply: item.id_supply,
              name: match ? match.name : (item.id_supply?.name || 'Insumo Cargado'),
              category: match ? match.category : 'Otros',
              unit: match ? match.unit : 'unid',
              applies_to: item.applies_to || 'TODOS',
              detail: item.detail || '',
              ...(item.by_size ? { by_size: item.by_size } : { quantity: item.quantity }),
            };
          });
          setTechnicalSheet(mappedSheet);
          
          if (product.variants) {
             const sizes = Array.from(new Set(product.variants.map((v: any) => v.size)));
             setSelectedSizes(sizes as string[]);
             
             const colorsMap = new Map();
             product.variants.forEach((v: any) => {
               if (v.color && v.color.name && !colorsMap.has(v.color.name)) {
                 colorsMap.set(v.color.name, v.color);
               }
             });
             setSelectedColors(Array.from(colorsMap.values()));
          }
        }
        setInitialLoading(false);
      }
    };
    fetchProduct();
  }, [id, startLoadingCategories, startLoadingSupplies, getProductById]);

  useEffect(() => {
    if (initialLoading) return;
  }, [selectedSizes, selectedColors]);

  
  // 🧵 Gestión de Ficha Técnica con soporte de telas por talla
  const handleAddInsumo = () => {
    if (!selectedInsumoId) return toast.error('Selecciona un insumo válido.');
    const realSupply = supplies.find(s => (s._id || s.id) === selectedInsumoId);
    if (!realSupply) return toast.error('El insumo seleccionado no es válido.');
    const idStr = (realSupply._id || realSupply.id) as string;
    if (technicalSheet.some(item => item.id_supply === idStr)) {
      return toast.error('Este insumo ya está en la ficha técnica.');
    }

    if (realSupply.category === 'Telas') {
      const hasAny = SIZES.some(s => (bySizeValues[s] ?? 0) > 0);
      if (!hasAny) return toast.error('Ingresa al menos una cantidad por talla.');
      setTechnicalSheet([...technicalSheet, {
        id_supply: idStr,
        name: realSupply.name,
        category: realSupply.category,
        unit: realSupply.unit,
        by_size: { ...bySizeValues },
      }]);
      setBySizeValues({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
    } else {
      if (insumoQuantity <= 0) return toast.error('La cantidad debe ser mayor a 0.');
      setTechnicalSheet([...technicalSheet, {
        id_supply: idStr,
        name: realSupply.name,
        category: realSupply.category,
        unit: realSupply.unit,
        quantity: insumoQuantity,
      }]);
      setInsumoQuantity(1);
    }
    setSelectedInsumoId('');
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => {
        const next = prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size];
        return next;
    });
  };
  const handleSelectColor = (color: ColorObject) => {
    if (selectedColors.some(c => c.name.toLowerCase() === color.name.toLowerCase())) {
      return toast.error("Este color ya fue seleccionado.");
    }
    const next = [...selectedColors, color];
    setSelectedColors(next);
    setColorSearch('');
    setShowColorDropdown(false);
  };
  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return toast.error("Escribe el nombre del color.");
    const next = [...selectedColors, { name: customColorName.trim(), hex: customColorHex }];
    setSelectedColors(next);
    setCustomColorName('');
    setIsCreatingCustomColor(false);
  };
  
  const handleRemoveColor = (colorName: string) => {
    const next = selectedColors.filter(c => c.name !== colorName);
    setSelectedColors(next);
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
    if (selectedImages.length === 0 && existingImages.length === 0) {
      return toast.error("Debes subir o tener al menos una imagen");
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
    data.append("id_category", formData.id_category);
    data.append("season", formData.season);
    data.append("origin_type", formData.origin_type);
    data.append("is_active", String(formData.is_active));
    data.append("is_best_seller", String(formData.is_best_seller));
    data.append("is_new_in", String(formData.is_new_in));
    data.append("is_discount", String(formData.is_discount));
    data.append("variants", JSON.stringify(variants));

    // Ficha técnica: enviamos id_supply + quantity (fijo) o by_size (tela por talla)
    if (formData.origin_type === 'PRODUCCION') {
      const cleanSheet = technicalSheet.map(item => ({
        id_supply: item.id_supply,
        applies_to: item.applies_to || 'TODOS',
        detail: item.detail || '',
        ...(item.by_size ? { by_size: item.by_size } : { quantity: item.quantity }),
      }));
      data.append('technical_sheet', JSON.stringify(cleanSheet));
    }

    // Conservamos las imágenes existentes (con su color) que el usuario no eliminó.
    data.append("existing_images", JSON.stringify(existingImages));
    // Imágenes nuevas + su color etiquetado, alineado por índice.
    selectedImages.forEach((file) => data.append("files", file));
    data.append("image_colors", JSON.stringify(selectedImages.map((_, idx) => imageColorTags[idx] || null)));

    const result = await updateProduct(id as string, data);
    if (result) router.push("/admin/products");
  };

  const inputClass = "w-full bg-[#fdf8f9] dark:bg-[#1a0e14] border border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.1)] rounded-[10px] outline-none focus:border-[rgba(139,58,82,0.5)] dark:focus:border-[rgba(160,80,104,0.5)] transition-[background-color,border-color] duration-[600ms] text-[#2d1f25] dark:text-[#e8d8dc] placeholder-[#2d1f25]/30 dark:placeholder-white/30 p-[12px_16px] text-[0.85rem]";
  
  const sectionClass = "space-y-[16px] bg-white/70 backdrop-blur-2xl dark:bg-[#2e1d27] border border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[16px] p-[28px] transition-[background-color,border-color] duration-[600ms]";
  const titleClass = "text-[0.72rem] tracking-[0.15em] text-[#8B3A52] dark:text-[#a05068] uppercase font-semibold mb-[16px]";
  const labelClass = "text-[0.7rem] tracking-[0.1em] text-[#8B3A52] dark:text-[#a05068] uppercase mb-[6px] block font-medium";

  const getSelectableBtnClass = (isSelected: boolean, extraClasses: string = "p-4") => 
    `${extraClasses} text-center transition-all text-[0.82rem] font-medium border rounded-[8px] ${isSelected ? 'bg-[rgba(139,58,82,0.3)] border-[#8B3A52] text-white' : 'bg-transparent border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.1)] text-[#8B3A52]/60 dark:text-[#a08088] hover:text-[#8B3A52] dark:hover:text-white hover:border-[#8B3A52]/40 dark:hover:border-[rgba(255,255,255,0.2)]'}`;

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
        <div className="flex gap-3">
          <button 
            disabled={loadingProducts} 
            onClick={handleSubmit} 
            className="text-white flex items-center gap-2 disabled:opacity-50 transition-all font-medium"
            style={{ background: '#8B3A52', borderRadius: '10px', fontSize: '0.82rem', padding: '10px 24px', letterSpacing: '0.05em' }}
          >
            {loadingProducts ? 'Actualizando...' : <><Save size={18} /> Actualizar producto</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-[24px] max-w-5xl mx-auto">
        {/* COLUMNA IZQUIERDA: IMÁGENES */}
        <div className="md:col-span-4 flex flex-col gap-[24px]">
          <div className={sectionClass}>
            <h3 className={titleClass}>Imágenes ({selectedImages.length + existingImages.length}/5)</h3>
            <input type="file" id="file-upload" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            <label htmlFor="file-upload" className="border-[2px] border-dashed border-[rgba(139,58,82,0.2)] dark:border-[rgba(160,80,104,0.3)] rounded-[12px] p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group hover:border-[rgba(139,58,82,0.5)] dark:hover:border-[rgba(160,80,104,0.6)] hover:bg-[rgba(139,58,82,0.02)] dark:hover:bg-[rgba(160,80,104,0.05)]">
              <Upload className="text-[#8B3A52] dark:text-[#a05068] mb-2 group-hover:scale-110 transition-transform" size={32} />
              <p className="text-xs text-center opacity-60 group-hover:opacity-100 font-bold uppercase tracking-wider text-[#2d1f25] dark:text-[#e8d8dc]">Haz clic para subir fotos</p>
            </label>
            <div className="flex flex-col gap-3 mt-4">
              {existingImages.map((img, idx) => (
                <div key={`exist-${idx}`} className="flex items-center gap-3 bg-white/50 dark:bg-white/5 rounded-xl border border-[#EAE0E2] dark:border-white/10 p-2 shadow-sm">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-[#EAE0E2] dark:border-white/10">
                    <img src={img.url} className="object-cover w-full h-full" alt="preview" />
                    <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-white px-1 rounded-bl-lg text-[8px]">Actual</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <select
                      value={img.color ?? ''}
                      onChange={(e) => setColorForExisting(idx, e.target.value)}
                      className="w-full text-xs bg-transparent border border-[rgba(139,58,82,0.2)] dark:border-white/10 rounded-lg px-2 py-1.5 outline-none focus:border-[#8B3A52] dark:focus:border-[#a05068] text-[#2d1f25] dark:text-white"
                    >
                      <option value="">Sin color (general)</option>
                      {selectedColors.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))} className="flex-shrink-0 p-1.5 rounded-lg text-[#8C6B79] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {selectedImages.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/50 dark:bg-white/5 rounded-xl border border-[#EAE0E2] dark:border-white/10 p-2 shadow-sm">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-[#EAE0E2] dark:border-white/10">
                    <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="preview" />
                    <div className="absolute top-0 right-0 bg-[#8B3A52]/80 backdrop-blur-md text-white px-1 rounded-bl-lg text-[8px]">Nueva</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] opacity-50 truncate mb-1">{file.name}</p>
                    <select
                      value={imageColorTags[idx] || ''}
                      onChange={(e) => setTagForImage(idx, e.target.value)}
                      className="w-full text-xs bg-transparent border border-[rgba(139,58,82,0.2)] dark:border-white/10 rounded-lg px-2 py-1.5 outline-none focus:border-[#8B3A52] dark:focus:border-[#a05068] text-[#2d1f25] dark:text-white"
                    >
                      <option value="">Sin color (general)</option>
                      {selectedColors.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="button" onClick={() => removeImage(idx)} className="flex-shrink-0 p-1.5 rounded-lg text-[#8C6B79] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN */}
        <div className="md:col-span-8 flex flex-col gap-[24px]">
          
          {/* Selector de Origen */}
          <div className={sectionClass}>
            <h3 className={`${titleClass} flex items-center gap-2`}>
              <Layers size={16} /> Tipo de Origen de Prenda *
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOriginChange('RETAIL')}
                className={getSelectableBtnClass(formData.origin_type === 'RETAIL')}
              >
                Flujo Comercial (Retail)
              </button>
              <button
                type="button"
                onClick={() => handleOriginChange('PRODUCCION')}
                className={getSelectableBtnClass(formData.origin_type === 'PRODUCCION')}
              >
                Orden de Producción Propia
              </button>
            </div>
          </div>

          {/* Información General */}
          <div className={sectionClass}>
            <h3 className={titleClass}>Información general</h3>
            <div className="grid grid-cols-2 gap-[16px]">
              <div className="col-span-2">
                <label className={labelClass}>Nombre del producto *</label>
                <input type="text" className={inputClass} placeholder="Ej: Vestido Gala" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Precio Base (S/.) *</label>
                <input type="number" className={inputClass} placeholder="0.00" value={formData.base_price || ''} onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })} />
              </div>
              <div>
                <label className={labelClass}>Material / Tela</label>
                <input type="text" className={inputClass} placeholder="Ej: 95% Algodón, 5% Elastano" value={formData.composition} onChange={(e) => setFormData({ ...formData, composition: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <label className={labelClass}>Categoría *</label>
                <select className={inputClass} value={formData.id_category} onChange={(e) => setFormData({...formData, id_category: e.target.value})}>
                  <option value="" className="bg-[#fdf8f9] dark:bg-[#1a0e14]">Selecciona una categoría</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id} className="bg-[#fdf8f9] dark:bg-[#1a0e14]">{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Temporada</label>
                <select className={inputClass} value={formData.season} onChange={(e) => setFormData({...formData, season: e.target.value})}>
                  <option value="" className="bg-[#fdf8f9] dark:bg-[#1a0e14]">Selecciona temporada</option>
                  <option value="PRIMAVERA 2026" className="bg-[#fdf8f9] dark:bg-[#1a0e14]">Primavera 2026</option>
                  <option value="VERANO 2026" className="bg-[#fdf8f9] dark:bg-[#1a0e14]">Verano 2026</option>
                  <option value="OTOÑO / INVIERNO" className="bg-[#fdf8f9] dark:bg-[#1a0e14]">Otoño / Invierno</option>
                  <option value="TODO EL AÑO" className="bg-[#fdf8f9] dark:bg-[#1a0e14]">Todo el año</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <label className={labelClass}>SKU Base *</label>
                <div className="flex gap-2">
                  <input type="text" className={`${inputClass} flex-1`} placeholder="Ej: VEST-GALA-01" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })} />
                  <button
                    type="button"
                    onClick={generateBaseSKU}
                    className="px-4 bg-[#8B3A52] hover:bg-[#a05068] text-white text-xs font-bold rounded-[10px] hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 flex items-center justify-center uppercase tracking-wider"
                  >
                    Generar SKU
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Género *</label>
                <div className="flex gap-[16px]">
                  {['MUJER', 'HOMBRE', 'UNISEX'].map((g) => (
                    <button key={g} type="button" onClick={() => setFormData({...formData, gender: g})} className={getSelectableBtnClass(formData.gender === g, "flex-1 py-2")}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea className={`${inputClass} h-[80px]`} placeholder="Describe el producto..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            </div>
          </div>

          {/* Estados y Promoción */}
          <div className={sectionClass}>
            <h3 className={titleClass}>Estados y Promoción</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-[#8B3A52] focus:ring-[#8B3A52] border-gray-300 dark:border-white/20 accent-[#8B3A52] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[0.75rem] font-bold tracking-wide uppercase text-[#40202D] dark:text-white group-hover:text-[#8B3A52] transition-colors">Activo</span>
                  <span className="text-[0.65rem] opacity-60">Visible en tienda</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.is_best_seller}
                  onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-[#8B3A52] focus:ring-[#8B3A52] border-gray-300 dark:border-white/20 accent-[#8B3A52] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[0.75rem] font-bold tracking-wide uppercase text-[#40202D] dark:text-white group-hover:text-[#8B3A52] transition-colors">Best Seller</span>
                  <span className="text-[0.65rem] opacity-60">Destacar como más vendido</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.is_new_in}
                  onChange={(e) => setFormData({ ...formData, is_new_in: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-[#8B3A52] focus:ring-[#8B3A52] border-gray-300 dark:border-white/20 accent-[#8B3A52] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[0.75rem] font-bold tracking-wide uppercase text-[#40202D] dark:text-white group-hover:text-[#8B3A52] transition-colors">New In</span>
                  <span className="text-[0.65rem] opacity-60">Etiqueta de novedad</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.is_discount}
                  onChange={(e) => setFormData({ ...formData, is_discount: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-[#8B3A52] focus:ring-[#8B3A52] border-gray-300 dark:border-white/20 accent-[#8B3A52] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[0.75rem] font-bold tracking-wide uppercase text-[#40202D] dark:text-white group-hover:text-[#8B3A52] transition-colors">50% Menos</span>
                  <span className="text-[0.65rem] opacity-60">Etiqueta de descuento</span>
                </div>
              </label>
            </div>
          </div>

          {/* 🧵 FICHA TÉCNICA — Acordeón por categoría + tabla por talla para telas */}
          {formData.origin_type === 'PRODUCCION' && (
            <div className={sectionClass}>
              <h3 className={`${titleClass} flex items-center gap-2`}>Ficha técnica de insumos</h3>

              <div className="space-y-2">
                {Object.entries(suppliesByCategory).map(([category, items]) => (
                  <div key={category} className="border border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#fdf8f9] dark:bg-[#1a0e14] text-left text-xs font-bold uppercase tracking-widest text-[#8B3A52] dark:text-[#a05068] hover:bg-[rgba(139,58,82,0.05)] transition-colors"
                    >
                      <span>{category} <span className="font-normal opacity-50">({items.length})</span></span>
                      <ChevronDown size={14} className={`transition-transform ${openCategories[category] ? 'rotate-180' : ''}`} />
                    </button>
                    {openCategories[category] && (
                      <div className="divide-y divide-[#EAE0E2] dark:divide-white/10 bg-white/50 dark:bg-black/20">
                        {items.map(ins => {
                          const insId = ins._id || ins.id;
                          const isSelected = selectedInsumoId === insId;
                          const alreadyAdded = technicalSheet.some(t => t.id_supply === insId);
                          return (
                            <button
                              key={insId}
                              type="button"
                              disabled={alreadyAdded}
                              onClick={() => { setSelectedInsumoId(insId); setBySizeValues({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }); setInsumoQuantity(1); }}
                              className={`w-full flex items-center justify-between px-5 py-2.5 text-sm transition-colors text-left ${
                                alreadyAdded ? 'opacity-40 cursor-not-allowed' :
                                isSelected ? 'bg-[rgba(139,58,82,0.12)] dark:bg-[rgba(139,58,82,0.2)] text-[#8B3A52] dark:text-[#F8BBD0] font-semibold' :
                                'hover:bg-[rgba(139,58,82,0.04)] text-[#40202D] dark:text-[#e8d8dc]'
                              }`}
                            >
                              <span>{ins.name}</span>
                              <span className="text-[10px] uppercase opacity-50 font-mono">{ins.unit} {alreadyAdded && '· ya agregado'}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedInsumoId && (
                <div className="bg-[#fdf8f9] dark:bg-[#1a0e14] border border-[rgba(139,58,82,0.2)] dark:border-[rgba(255,255,255,0.08)] rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8B3A52] dark:text-[#a05068]">
                    {selectedSupply?.name} · <span className="font-normal opacity-70">{selectedSupply?.unit}</span>
                  </p>
                  {isFabric ? (
                    <div>
                      <p className="text-[10px] opacity-50 uppercase font-bold tracking-widest mb-2">Metros por talla</p>
                      <div className="grid grid-cols-5 gap-2">
                        {SIZES.map(size => (
                          <div key={size} className="flex flex-col items-center gap-1">
                            <label className="text-[10px] font-bold text-[#8B3A52] dark:text-[#a05068] uppercase">{size}</label>
                            <input
                              type="number" min={0} step={0.01}
                              className={`${inputClass} text-center font-bold text-sm`}
                              value={bySizeValues[size] ?? ''}
                              onChange={e => setBySizeValues(prev => ({ ...prev, [size]: parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className={labelClass}>Cantidad fija por prenda</label>
                        <input
                          type="number" min={0.01} step={0.01}
                          className={`${inputClass} font-bold`}
                          value={insumoQuantity}
                          onChange={e => setInsumoQuantity(Math.max(0.01, Number(e.target.value)))}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setSelectedInsumoId('')} className="px-4 py-2 text-xs border border-[#EAE0E2] dark:border-white/20 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors font-bold uppercase tracking-wider">Cancelar</button>
                    <button type="button" onClick={handleAddInsumo} className="px-5 py-2 bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] text-xs font-bold rounded-xl shadow-md hover:scale-105 transition-all flex items-center gap-1.5 uppercase tracking-wider">
                      <Plus size={14} /> Agregar a ficha
                    </button>
                  </div>
                </div>
              )}

              {technicalSheet.length > 0 ? (
                <div className="border border-[rgba(212,175,55,0.25)] bg-white/70 dark:bg-[#2e1d27] rounded-2xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] text-[10px] font-bold uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc]">
                        <th className="p-4 border-b border-[rgba(139,58,82,0.06)] dark:border-[rgba(212,175,55,0.15)]">Insumo</th>
                        <th className="p-4 border-b border-[rgba(139,58,82,0.06)] dark:border-[rgba(212,175,55,0.15)]">Unidad</th>
                        <th className="p-4 border-b border-[rgba(139,58,82,0.06)] dark:border-[rgba(212,175,55,0.15)]">Cantidad</th>
                        <th className="p-4 border-b border-[rgba(139,58,82,0.06)] dark:border-[rgba(212,175,55,0.15)]">Aplica a</th>
                        <th className="p-4 text-center border-b border-[rgba(139,58,82,0.06)] dark:border-[rgba(212,175,55,0.15)]">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
                      {technicalSheet.map((item, index) => (
                        <tr key={index} className={`transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-[#2e1d27]' : 'bg-[#fdf8f9] dark:bg-[#321f2b]'} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                          <td className="p-4 font-bold text-[#40202D] dark:text-white">
                            {item.name}
                            {item.category === 'Telas' && <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">por talla</span>}
                          </td>
                          <td className="p-4 text-xs opacity-70 uppercase font-mono">{item.unit}</td>
                          <td className="p-4 text-sm font-medium text-[#D6405F] dark:text-[#F8BBD0]">
                            {item.by_size
                              ? SIZES.map(s => `${s}:${item.by_size![s] ?? 0}`).join(' · ')
                              : item.quantity
                            }
                          </td>
                          <td className="p-4">
                            <select
                              value={item.applies_to || 'TODOS'}
                              onChange={e => setTechnicalSheet(prev => prev.map((it, i) => i === index ? { ...it, applies_to: e.target.value } : it))}
                              className="text-[11px] font-semibold bg-[#fdf8f9] dark:bg-[#1a0e14] border border-[rgba(139,58,82,0.2)] dark:border-white/10 rounded-lg px-2 py-1.5 text-[#40202D] dark:text-white outline-none focus:border-[#D6405F] cursor-pointer"
                            >
                              <option value="TODOS">Todos</option>
                              <option value="MISMO_COLOR">Mismo color</option>
                              <option value="POR_TALLA">Por talla</option>
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <button type="button" onClick={() => setTechnicalSheet(prev => prev.filter((_, i) => i !== index))} className="p-2 text-[#8C6B79] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-white/30 dark:bg-black/30 rounded-2xl border-2 border-dashed border-[#EAE0E2] dark:border-white/20">
                  <p className="text-xs opacity-60 font-bold uppercase tracking-widest">Selecciona insumos del catálogo de arriba</p>
                </div>
              )}
            </div>
          )}

          {/* Variantes: Tallas y Colores */}
          <div className={sectionClass}>
            {/* SECCIÓN TALLAS */}
            <div>
              <h3 className={`${titleClass} flex items-center gap-2`}><Ruler size={18} /> Tallas *</h3>
              <div className="flex flex-wrap gap-[16px]">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button key={size} type="button" onClick={() => toggleSize(size)} 
                      className={`transition-all flex items-center justify-center font-medium cursor-pointer
                        ${isSelected ? 'bg-[rgba(139,58,82,0.3)] border-[#8B3A52] text-white' : 'bg-transparent border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.15)] text-[#8B3A52]/70 dark:text-[#c4a0ae] hover:border-[#8B3A52]/50'}`}
                      style={{ 
                        width: '40px', height: '40px', borderRadius: '8px',
                        borderWidth: '1px', fontSize: '0.82rem'
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN COLORES */}
            <div className="space-y-4">
              <h3 className={`${titleClass} flex items-center gap-2`}>
                <Palette size={18} /> Colores *
              </h3>
              
              <div className="relative">
                {!isCreatingCustomColor ? (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        className={`${inputClass} pl-10`}
                        placeholder="Buscar color en español o inglés... (ej: azul, rosa, blue)"
                        value={colorSearch}
                        onFocus={() => setShowColorDropdown(true)}
                        onChange={(e) => setColorSearch(e.target.value)}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#D6405F] dark:bg-[#F8BBD0]"></div>
                    </div>
                    
                    {showColorDropdown && (
                      <div className="absolute left-0 right-0 z-50 mt-2 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-[#EAE0E2] dark:divide-white/10">
                        {loadingColors ? (
                          <div className="p-4 text-center text-xs opacity-50">Consultando paleta CSS...</div>
                        ) : apiColors.length > 0 ? (
                          apiColors.map((color, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
                              onClick={() => handleSelectColor(color)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border border-gray-100 dark:border-gray-800 shadow-inner" style={{ backgroundColor: color.hex }} />
                                <span className="text-sm font-bold text-[#40202D] dark:text-white">{color.name}</span>
                              </div>
                              <span className="text-xs font-mono opacity-40">{color.hex}</span>
                            </div>
                          ))
                        ) : (
                          colorSearch.trim().length >= 2 && (
                            <div className="p-4 text-center text-xs opacity-50 italic text-gray-400">
                              No se encontraron coincidencias exactas.
                            </div>
                          )
                        )}
                        <div 
                          className="p-3 text-center text-xs font-bold text-[#D6405F] dark:text-[#F8BBD0] bg-rose-50/20 dark:bg-white/5 cursor-pointer hover:bg-rose-50/40 dark:hover:bg-white/10 transition-colors border-t border-[#EAE0E2] dark:border-white/10 rounded-b-2xl"
                          onClick={() => {
                            setIsCreatingCustomColor(true);
                            setShowColorDropdown(false);
                          }}
                        >
                          + Crear color personalizado ({colorSearch || 'Nuevo'})
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 bg-rose-50/10 dark:bg-white/5 backdrop-blur-md border border-[#D6405F]/30 dark:border-[#F8BBD0]/30 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#D6405F] dark:text-[#F8BBD0]">✨ Nuevo color personalizado</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input 
                        type="text" 
                        placeholder="Nombre del color (ej: Palo Rosa)" 
                        className="flex-1 p-2.5 bg-white/80 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl text-sm outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0]"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                      />
                      <div className="flex items-center bg-white/80 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 p-1.5 rounded-xl gap-2">
                        <input 
                          type="color" 
                          className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent"
                          value={customColorHex}
                          onChange={(e) => setCustomColorHex(e.target.value)}
                        />
                        <input 
                          type="text" 
                          className="w-20 text-xs font-mono outline-none uppercase text-center bg-transparent" 
                          value={customColorHex} 
                          onChange={(e) => setCustomColorHex(e.target.value)}
                        />
                      </div>
                      <button type="button" onClick={handleAddCustomColor} className="px-4 py-2.5 bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] text-sm font-bold rounded-xl shadow-md hover:scale-105 transition-all">
                        Agregar
                      </button>
                      <button type="button" onClick={() => setIsCreatingCustomColor(false)} className="px-4 py-2.5 border border-[#EAE0E2] dark:border-white/20 text-sm font-bold rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                
                {showColorDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowColorDropdown(false)} />}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {selectedColors.map((color) => (
                  <div key={color.name} className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-black/50 backdrop-blur-md text-[#40202D] dark:text-white rounded-full text-xs font-bold border border-[#EAE0E2] dark:border-white/10 shadow-sm animate-in zoom-in-75 duration-150">
                    <div className="w-3 h-3 rounded-full border border-black/5 dark:border-white/10 shadow-inner" style={{ backgroundColor: color.hex }} />
                    {color.name}
                    <X size={14} className="cursor-pointer text-[#8C6B79] dark:text-gray-400 hover:text-[#D6405F] dark:hover:text-[#F8BBD0] transition-colors" onClick={() => handleRemoveColor(color.name)} />
                  </div>
                ))}
                {selectedColors.length === 0 && (
                  <p className="text-xs opacity-40 italic mt-1 font-medium">No hay colores seleccionados</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={generateVariants}
                  className="px-4 py-2.5 bg-[#8B3A52] text-white rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-[#a05068] transition-colors shadow-sm"
                >
                  <Plus size={16} /> Agregar Combinación a la Tabla
                </button>
              </div>
            </div>

            {/* TABLA MATRIZ DE VARIANTES */}
            {variants.length > 0 && (
              <div className="border border-[#EAE0E2] dark:border-white/10 rounded-2xl overflow-hidden animate-in fade-in duration-300 shadow-sm bg-white/30 dark:bg-white/5 backdrop-blur-md">
                <div className="bg-white/50 dark:bg-black/30 p-4 border-b border-[#EAE0E2] dark:border-white/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#D6405F] dark:text-[#F8BBD0]">Matriz de Variantes Generadas ({variants.length})</p>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/50 dark:bg-black/30 sticky top-0 text-xs font-bold uppercase tracking-wider text-[#D6405F] dark:text-[#F8BBD0] border-b border-[#EAE0E2] dark:border-white/10 z-10">
                      <tr>
                        <th className="p-4">Talla</th>
                        <th className="p-4">Color</th>
                        <th className="p-4">SKU Variante</th>
                        <th className="p-4 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
                      {variants.map((v, i) => (
                        <tr key={i} className={`transition-colors group/row ${i % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                          <td className="p-4 font-medium text-[#40202D] dark:text-white">{v.size}</td>
                          <td className="p-4 font-bold text-[#40202D] dark:text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10 shadow-inner" style={{ backgroundColor: v.color.hex }} />
                              {v.color.name}
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs opacity-70 uppercase">{v.sku_variant}</td>
                          <td className="p-4 text-center">
                            <button type="button" onClick={() => {
                              const updated = variants.filter((_, idx) => idx !== i);
                              setVariants(updated);
                            }} className="p-2 text-[#8C6B79] dark:text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
                              <Trash2 size={16} />
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
    </div>
  );
}
