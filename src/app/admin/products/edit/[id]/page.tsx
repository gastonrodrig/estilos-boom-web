'use client';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useProductStore, useCategoryStore, useSupplyStore } from '@/hooks'; // 🚀 Inyectamos useSupplyStore
import Link from 'next/link';
import { Plus, X, Upload, Save, ArrowLeft, Palette, Ruler, Layers, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { CSS_COLORS_PALETTE, ColorObject } from '@/core/constants';

// Estructura de la Ficha Técnica alineada al Backend de Mongoose
interface SupplyItemInput {
  id_supply: string;  // 🔗 Cambiado de text a ID de MongoDB
  name: string;       // Mantener para visualización ágil en la tabla del Front
  quantity: number;
  unit: string;
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
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
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

  // 🧵 Estados de la Ficha Técnica Conectada a la Base de Datos
  const [technicalSheet, setTechnicalSheet] = useState<SupplyItemInput[]>([]);
  const [selectedInsumoId, setSelectedInsumoId] = useState<string>(''); // 👈 Almacena el _id seleccionado
  const [insumoQuantity, setInsumoQuantity] = useState<number>(1);

  // Estado de la tabla de variantes
  const [variants, setVariants] = useState<any[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔄 Generador automático de variantes
  const generateVariants = useCallback((sizes: string[], colors: ColorObject[]) => {
    if (sizes.length === 0 || colors.length === 0) {
      setVariants([]);
      return;
    }

    const newVariants = sizes.flatMap(size => 
      colors.map(color => ({
        size,
        color, 
        stock: 0,
        sku_variant: `${formData.sku || 'SKU'}-${size}-${color.name.substring(0,3).toUpperCase().replace(/\s+/g, '')}`,
        min_stock_alert: 10
      }))
    );

    setVariants(newVariants);
  }, [formData.sku]);

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
            id_category: typeof product.id_category === 'object' ? product.id_category._id : product.id_category,
            origin_type: product.origin_type || 'RETAIL'
          });
          setExistingImages(product.images || []);
          setVariants(product.variants || []);
          setTechnicalSheet(product.technical_sheet || []);
          
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

  
  // 🧵 Gestión de Ficha Técnica vinculando IDs reales de MongoDB
  const handleAddInsumo = () => {
    if (!selectedInsumoId) return toast.error("Selecciona un insumo válido.");
    
    // Buscamos el insumo real dentro del store de Redux para capturar su unidad y nombre
    const realSupply = supplies.find(s => (s._id || s.id) === selectedInsumoId);
    if (!realSupply) return toast.error("El insumo seleccionado no es válido.");

    const idInsumoString = (realSupply._id || realSupply.id) as string;

    if (technicalSheet.some(item => item.id_supply === idInsumoString)) {
      return toast.error("Este insumo ya está agregado a la ficha técnica.");
    }

    setTechnicalSheet([
      ...technicalSheet, 
      { 
        id_supply: idInsumoString, 
        name: realSupply.name, 
        quantity: insumoQuantity, 
        unit: realSupply.unit 
      }
    ]);
    setSelectedInsumoId('');
    setInsumoQuantity(1);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => {
        const next = prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size];
        generateVariants(next, selectedColors);
        return next;
    });
  };
  const handleSelectColor = (color: ColorObject) => {
    if (selectedColors.some(c => c.name.toLowerCase() === color.name.toLowerCase())) {
      return toast.error("Este color ya fue seleccionado.");
    }
    const next = [...selectedColors, color];
    setSelectedColors(next);
    generateVariants(selectedSizes, next);
    setColorSearch('');
    setShowColorDropdown(false);
  };
  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return toast.error("Escribe el nombre del color.");
    const next = [...selectedColors, { name: customColorName.trim(), hex: customColorHex }];
    setSelectedColors(next);
    generateVariants(selectedSizes, next);
    setCustomColorName('');
    setIsCreatingCustomColor(false);
  };
  
  const handleRemoveColor = (colorName: string) => {
    const next = selectedColors.filter(c => c.name !== colorName);
    setSelectedColors(next);
    generateVariants(selectedSizes, next);
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
    data.append("variants", JSON.stringify(variants));

    // Si es producción propia, limpiamos el objeto antes de enviarlo
    // Enviamos solo id_supply y quantity para que calce con tu esquema estricto de Mongoose
    if (formData.origin_type === 'PRODUCCION') {
      const cleanSheet = technicalSheet.map(item => ({
        id_supply: item.id_supply,
        quantity: item.quantity
      }));
      data.append("technical_sheet", JSON.stringify(cleanSheet));
    }

    selectedImages.forEach((file) => data.append("files", file));
    // Nota: si no se envían nuevas imágenes, el backend conserva las actuales automáticamente.

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
            <div className="grid grid-cols-3 gap-2 mt-4">
              {existingImages.map((img, idx) => (
                <div key={`exist-${idx}`} className="relative aspect-square bg-white/50 dark:bg-white/10 rounded-xl overflow-hidden group border border-[#EAE0E2] dark:border-white/10 shadow-sm">
                  <img src={img} className="object-cover w-full h-full" alt="preview" />
                  <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-white p-1 rounded-bl-xl text-[10px]">Actual</div>
                  <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {selectedImages.map((file, idx) => (
                <div key={idx} className="relative aspect-square bg-white/50 dark:bg-white/10 rounded-xl overflow-hidden group border border-[#EAE0E2] dark:border-white/10 shadow-sm">
                  <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="preview" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500">
                    <X size={12} />
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
                <input type="text" className={inputClass} placeholder="Ej: VEST-GALA-01" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })} />
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

          {/* 🧵 FICHA TÉCNICA DE INSUMOS DINÁMICA CONECTADA A TU BASE DE DATOS */}
          {formData.origin_type === 'PRODUCCION' && (
            <div className={sectionClass}>
              <h3 className={`${titleClass} flex items-center gap-2`}>
                Ficha técnica de insumos
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-end gap-[16px] bg-[#fdf8f9] dark:bg-[#1a0e14] border border-[rgba(139,58,82,0.15)] dark:border-[rgba(255,255,255,0.08)] p-4 rounded-2xl shadow-inner">
                <div className="flex-1">
                  <label className={labelClass}>Seleccionar Insumo Real</label>
                  <select 
                    className={inputClass}
                    value={selectedInsumoId}
                    onChange={(e) => setSelectedInsumoId(e.target.value)}
                  >
                    <option value="" className="bg-[#fdf8f9] dark:bg-[#1a0e14]">Selecciona materia prima del catálogo...</option>
                    {/* Filtramos para renderizar solo los insumos que estén ACTIVOS */}
                    {supplies.filter(s => s.is_active).map((ins) => (
                      <option key={ins._id || ins.id} value={ins._id || ins.id} className="bg-[#fdf8f9] dark:bg-[#1a0e14]">
                        {ins.name} ({ins.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-28">
                  <label className={labelClass}>Cantidad</label>
                  <input 
                    type="number" 
                    min={1} 
                    className={`${inputClass} text-center font-bold`}
                    value={insumoQuantity}
                    onChange={(e) => setInsumoQuantity(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddInsumo}
                  className="px-5 py-2.5 bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] text-sm font-bold rounded-xl shadow-md hover:scale-105 transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={16}/> Agregar
                </button>
              </div>

              {technicalSheet.length > 0 ? (
                <div className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-white/70 backdrop-blur-2xl dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-2xl overflow-hidden transition-[background-color,border-color] duration-[600ms]">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="relative transition-[background-color,border-color] duration-[600ms]">
                      <tr className="relative bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.3)] dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[10px] font-medium uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] transition-[background-color,border-color] duration-[600ms]">
                        <th className="p-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Insumo</th>
                        <th className="p-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Unidad</th>
                        <th className="p-4 border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Cantidad</th>
                        <th className="p-4 text-center border-b border-[rgba(139,58,82,0.06)] dark:border-b dark:border-[rgba(212,175,55,0.15)]">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
                      {technicalSheet.map((item, index) => (
                        <tr key={index} className={`transition-colors group/row ${index % 2 === 0 ? "bg-[#ffffff] dark:bg-[#2e1d27]" : "bg-[#fdf8f9] dark:bg-[#321f2b]"} hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}>
                          <td className="p-4 font-bold text-[#40202D] dark:text-white">{item.name}</td>
                          <td className="p-4 text-xs opacity-70 uppercase">{item.unit}</td>
                          <td className="p-4 font-medium text-[#D6405F] dark:text-[#F8BBD0]">{item.quantity}</td>
                          <td className="p-4 text-center">
                            <button type="button" onClick={() => handleRemoveInsumo(index)} className="p-2 text-[#8C6B79] dark:text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
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
                  <p className="text-xs opacity-60 font-bold uppercase tracking-widest">Aún no has agregado insumos del catálogo</p>
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
                        <th className="p-4 text-right">Stock Inicial</th>
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
                          <td className="p-4 font-mono text-xs opacity-70">{v.sku_variant}</td>
                          <td className="p-4 text-right">
                            <input 
                              type="number" 
                              className="w-16 p-1 text-right bg-transparent border-b border-[#EAE0E2] dark:border-white/20 outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] font-medium text-[#D6405F] dark:text-[#F8BBD0] transition-colors" 
                              value={v.stock} 
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[i].stock = Number(e.target.value);
                                setVariants(updated);
                              }} 
                            />
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
