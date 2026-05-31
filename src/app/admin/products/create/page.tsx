'use client';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useProductStore, useCategoryStore, useSupplyStore } from '@/hooks'; // 🚀 Inyectamos useSupplyStore
import Link from 'next/link';
import { Plus, X, Upload, Save, ArrowLeft, Palette, Ruler, Layers, Trash2 } from 'lucide-react';
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
    season: '',
    id_category: '',
    origin_type: 'RETAIL', // 'RETAIL' o 'PRODUCCION'
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
    startLoadingSupplies(); // 🚀 Trae los insumos activos registrados en el sistema
  }, [startLoadingCategories, startLoadingSupplies]);

  useEffect(() => {
    generateVariants(selectedSizes, selectedColors);
  }, [selectedSizes, selectedColors, generateVariants]);

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

    const result = await createProduct(data);
    if (result) router.push("/admin/products");
  };

  return (
    <div className="min-h-screen p-8 text-[#40202D] dark:text-white transition-colors duration-500">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-4 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <Link href="/admin/products" className="flex items-center gap-2 text-sm font-bold opacity-70 hover:opacity-100 transition-opacity uppercase tracking-wider">
          <ArrowLeft size={16} /> Volver a Productos
        </Link>
        <div className="flex gap-3">
          <button 
            disabled={loadingProducts} 
            onClick={handleSubmit} 
            className="px-6 py-2.5 bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] rounded-xl flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] shadow-lg transition-all font-bold tracking-wide"
          >
            {loadingProducts ? 'Guardando...' : <><Save size={18} /> Guardar producto</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-5xl mx-auto">
        {/* COLUMNA IZQUIERDA: IMÁGENES */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl p-6 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
            <h3 className="font-black mb-4 tracking-wide uppercase text-sm">Imágenes ({selectedImages.length}/5)</h3>
            <input type="file" id="file-upload" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            <label htmlFor="file-upload" className="border-2 border-dashed border-[#EAE0E2] dark:border-white/20 hover:border-[#D6405F] dark:hover:border-[#F8BBD0] rounded-2xl p-8 flex flex-col items-center justify-center bg-white/50 dark:bg-white/5 cursor-pointer transition-colors group">
              <Upload className="text-[#D6405F] dark:text-[#F8BBD0] mb-2 group-hover:scale-110 transition-transform" size={32} />
              <p className="text-xs text-center opacity-60 group-hover:opacity-100 font-bold uppercase tracking-wider">Haz clic para subir fotos</p>
            </label>
            <div className="grid grid-cols-3 gap-2 mt-4">
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
        <div className="md:col-span-8 space-y-6">
          
          {/* Selector de Origen */}
          <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl p-6 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider opacity-70">
              <Layers size={16} className="text-[#D6405F] dark:text-[#F8BBD0]"/> Tipo de Origen de Prenda *
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOriginChange('RETAIL')}
                className={`p-4 rounded-xl border text-center transition-all text-sm ${formData.origin_type === 'RETAIL' ? 'border-[#D6405F] dark:border-[#F8BBD0] bg-white/80 dark:bg-white/10 font-bold text-[#D6405F] dark:text-[#F8BBD0] shadow-sm' : 'border-[#EAE0E2] dark:border-white/10 bg-white/30 dark:bg-black/30 opacity-60 hover:opacity-100'}`}
              >
                Flujo Comercial (Retail)
              </button>
              <button
                type="button"
                onClick={() => handleOriginChange('PRODUCCION')}
                className={`p-4 rounded-xl border text-center transition-all text-sm ${formData.origin_type === 'PRODUCCION' ? 'border-[#D6405F] dark:border-[#F8BBD0] bg-white/80 dark:bg-white/10 font-bold text-[#D6405F] dark:text-[#F8BBD0] shadow-sm' : 'border-[#EAE0E2] dark:border-white/10 bg-white/30 dark:bg-black/30 opacity-60 hover:opacity-100'}`}
              >
                Orden de Producción Propia
              </button>
            </div>
          </div>

          {/* Información General */}
          <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl p-8 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm space-y-4">
            <h3 className="font-bold text-lg border-b border-[#EAE0E2] dark:border-white/10 pb-2">Información general</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase opacity-50">Nombre del producto *</label>
                <input type="text" className="w-full p-3 mt-1 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors shadow-sm" placeholder="Ej: Vestido Gala" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-50">Precio Base (S/.) *</label>
                <input type="number" className="w-full p-3 mt-1 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors shadow-sm" placeholder="0.00" value={formData.base_price || ''} onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-50">Material / Tela</label>
                <input type="text" className="w-full p-3 mt-1 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors shadow-sm" placeholder="Ej: 95% Algodón, 5% Elastano" value={formData.composition} onChange={(e) => setFormData({ ...formData, composition: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-50">Categoría *</label>
                <select className="w-full p-3 mt-1 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors shadow-sm" value={formData.id_category} onChange={(e) => setFormData({...formData, id_category: e.target.value})}>
                  <option value="" className="dark:bg-[#1A0B11]">Selecciona una categoría</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id} className="dark:bg-[#1A0B11]">{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-50">Temporada</label>
                <select className="w-full p-3 mt-1 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors shadow-sm" value={formData.season} onChange={(e) => setFormData({...formData, season: e.target.value})}>
                  <option value="" className="dark:bg-[#1A0B11]">Selecciona temporada</option>
                  <option value="PRIMAVERA 2026" className="dark:bg-[#1A0B11]">Primavera 2026</option>
                  <option value="VERANO 2026" className="dark:bg-[#1A0B11]">Verano 2026</option>
                  <option value="OTOÑO / INVIERNO" className="dark:bg-[#1A0B11]">Otoño / Invierno</option>
                  <option value="TODO EL AÑO" className="dark:bg-[#1A0B11]">Todo el año</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-50">SKU Base *</label>
                <input type="text" className="w-full p-3 mt-1 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors shadow-sm" placeholder="Ej: VEST-GALA-01" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-50">Género *</label>
                <div className="flex p-1 bg-white/30 dark:bg-black/30 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl mt-1 shadow-inner">
                  {['MUJER', 'HOMBRE', 'UNISEX'].map((g) => (
                    <button key={g} type="button" onClick={() => setFormData({...formData, gender: g})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.gender === g ? 'bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] shadow-sm' : 'opacity-40 hover:opacity-100'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase opacity-50">Descripción</label>
              <textarea className="w-full p-3 mt-1 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl h-20 outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors shadow-sm" placeholder="Describe el producto..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            </div>
          </div>

          {/* 🧵 FICHA TÉCNICA DE INSUMOS DINÁMICA CONECTADA A TU BASE DE DATOS */}
          {formData.origin_type === 'PRODUCCION' && (
            <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl p-8 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="font-bold text-lg border-b border-[#EAE0E2] dark:border-white/10 pb-2 flex items-center gap-2">
                Ficha técnica de insumos
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-white/50 dark:bg-black/30 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 p-4 rounded-2xl shadow-inner">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase opacity-50">Seleccionar Insumo Real</label>
                  <select 
                    className="w-full p-2.5 mt-1 bg-white/80 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl text-sm outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] font-medium shadow-sm"
                    value={selectedInsumoId}
                    onChange={(e) => setSelectedInsumoId(e.target.value)}
                  >
                    <option value="" className="dark:bg-[#1A0B11]">Selecciona materia prima del catálogo...</option>
                    {/* Filtramos para renderizar solo los insumos que estén ACTIVOS */}
                    {supplies.filter(s => s.is_active).map((ins) => (
                      <option key={ins._id || ins.id} value={ins._id || ins.id} className="dark:bg-[#1A0B11]">
                        {ins.name} ({ins.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-28">
                  <label className="text-[10px] font-bold uppercase opacity-50">Cantidad</label>
                  <input 
                    type="number" 
                    min={1} 
                    className="w-full p-2.5 mt-1 bg-white/80 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl text-sm text-center outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] font-bold shadow-sm"
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
                <div className="border rounded-2xl overflow-hidden border-[#EAE0E2] dark:border-white/10 shadow-sm bg-white/30 dark:bg-white/5 backdrop-blur-md">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white/50 dark:bg-black/30 border-b border-[#EAE0E2] dark:border-white/10 text-xs font-bold uppercase tracking-wider text-[#D6405F] dark:text-[#F8BBD0]">
                      <tr>
                        <th className="p-4">Insumo</th>
                        <th className="p-4">Unidad</th>
                        <th className="p-4">Cantidad</th>
                        <th className="p-4 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE0E2] dark:divide-white/10">
                      {technicalSheet.map((item, index) => (
                        <tr key={index} className="hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
                          <td className="p-4 font-bold text-[#40202D] dark:text-white">{item.name}</td>
                          <td className="p-4 text-xs opacity-70 uppercase">{item.unit}</td>
                          <td className="p-4 font-black text-[#D6405F] dark:text-[#F8BBD0]">{item.quantity}</td>
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
          <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl p-8 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm space-y-6">
            {/* SECCIÓN TALLAS */}
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2"><Ruler size={18} /> Tallas *</h3>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button key={size} type="button" onClick={() => toggleSize(size)} className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-[#D6405F] dark:bg-[#F8BBD0] text-white dark:text-[#40202D] border-[#D6405F] dark:border-[#F8BBD0] shadow-md scale-110' : 'border-[#EAE0E2] dark:border-white/20 bg-white/50 dark:bg-black/50 hover:bg-[#D6405F]/10 dark:hover:bg-[#F8BBD0]/10 text-[#40202D] dark:text-white'}`}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN COLORES */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Palette size={18} /> Colores *
              </h3>
              
              <div className="relative">
                {!isCreatingCustomColor ? (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full p-3 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl pl-10 text-sm outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-all shadow-sm"
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
                    <X size={14} className="cursor-pointer text-[#8C6B79] dark:text-gray-400 hover:text-[#D6405F] dark:hover:text-[#F8BBD0] transition-colors" onClick={() => setSelectedColors(selectedColors.filter(c => c.name !== color.name))} />
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
                        <tr key={i} className="hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
                          <td className="p-4 font-black text-[#40202D] dark:text-white">{v.size}</td>
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
                              className="w-16 p-1 text-right bg-transparent border-b border-[#EAE0E2] dark:border-white/20 outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] font-black text-[#D6405F] dark:text-[#F8BBD0] transition-colors" 
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