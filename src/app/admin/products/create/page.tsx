'use client';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useProductStore, useCategoryStore } from '@/hooks';
import Link from 'next/link';
import { Plus, X, Upload, Save, ArrowLeft, Palette, Ruler, Layers, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { CSS_COLORS_PALETTE, ColorObject } from '@/core/constants';

// Insumos cargados para la Ficha Técnica
const INSUMOS_MOCK = [
  { name: 'Botón metálico 12mm', unit: 'unidades' },
  { name: 'Cierre invisible 20cm', unit: 'unidades' },
  { name: 'Hilo poliéster', unit: 'metros' },
  { name: 'Etiqueta tejida', unit: 'unidades' },
  { name: 'Entretela fusionable', unit: 'metros' },
  { name: 'Elástico 2cm', unit: 'metros' },
  { name: 'Broche magnético', unit: 'unidades' },
  { name: 'Forro satinado', unit: 'metros' }
];

interface SupplyItem {
  name: string;
  quantity: number;
  unit: string;
}

export default function CreateProductPage() {
  const { createProduct, loading: loadingProducts } = useProductStore();
  const { categories, startLoadingCategories } = useCategoryStore();
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

  // 🧵 Estados de la Ficha Técnica (Insumos)
  const [technicalSheet, setTechnicalSheet] = useState<SupplyItem[]>([]);
  const [selectedInsumoIndex, setSelectedInsumoIndex] = useState<number | string>('');
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

  // 🔄 Generador automático adaptado para el nuevo Color estructurado (Objeto)
  const generateVariants = useCallback((sizes: string[], colors: ColorObject[]) => {
    if (sizes.length === 0 || colors.length === 0) {
      setVariants([]);
      return;
    }

    const newVariants = sizes.flatMap(size => 
      colors.map(color => ({
        size,
        color, // Se pasa el objeto { name, hex } completo
        stock: 0,
        sku_variant: `${formData.sku || 'SKU'}-${size}-${color.name.substring(0,3).toUpperCase().replace(/\s+/g, '')}`,
        min_stock_alert: 10
      }))
    );

    setVariants(newVariants);
  }, [formData.sku]);

  useEffect(() => {
    startLoadingCategories();
  }, [startLoadingCategories]);

  useEffect(() => {
    generateVariants(selectedSizes, selectedColors);
  }, [selectedSizes, selectedColors, generateVariants]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Manejo de Selección de Color desde el Dropdown
  const handleSelectColor = (color: ColorObject) => {
    if (selectedColors.some(c => c.name.toLowerCase() === color.name.toLowerCase())) {
      return toast.error("Este color ya fue seleccionado.");
    }
    setSelectedColors([...selectedColors, color]);
    setColorSearch('');
    setShowColorDropdown(false);
  };

  // Manejo de creación de Color Personalizado
  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return toast.error("Escribe el nombre del color.");
    setSelectedColors([...selectedColors, { name: customColorName.trim(), hex: customColorHex }]);
    setCustomColorName('');
    setIsCreatingCustomColor(false);
  };

  // Gestión de Ficha Técnica
  const handleAddInsumo = () => {
    if (selectedInsumoIndex === '') return toast.error("Selecciona un insumo válido.");
    const template = INSUMOS_MOCK[Number(selectedInsumoIndex)];

    if (technicalSheet.some(item => item.name === template.name)) {
      return toast.error("Este insumo ya está agregado.");
    }

    setTechnicalSheet([...technicalSheet, { name: template.name, quantity: insumoQuantity, unit: template.unit }]);
    setSelectedInsumoIndex('');
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

  // Cambiar origen y limpiar estados dependientes para evitar inconsistencias de datos
  const handleOriginChange = (type: 'RETAIL' | 'PRODUCCION') => {
    setFormData({ ...formData, origin_type: type });
    if (type === 'RETAIL') {
      setTechnicalSheet([]); // Si vuelve a Retail, la ficha técnica se vacía por completo
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
    
    // Matriz de variantes stringizada con el nuevo formato de color objeto {name, hex}
    data.append("variants", JSON.stringify(variants));

    // Si es producción propia, inyectamos la ficha técnica armada al FormData
    if (formData.origin_type === 'PRODUCCION') {
      data.append("technical_sheet", JSON.stringify(technicalSheet));
    }

    selectedImages.forEach((file) => data.append("files", file));

    const result = await createProduct(data);
    if (result) router.push("/admin/products");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 text-[#594246]">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <Link href="/admin/products" className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100">
          <ArrowLeft size={16} /> Volver a Productos
        </Link>
        <div className="flex gap-3">
          <button 
            disabled={loadingProducts} 
            onClick={handleSubmit} 
            className="px-6 py-2 bg-[#F2778D] text-white rounded-md flex items-center gap-2 disabled:opacity-50 hover:bg-[#d65c72] transition-colors"
          >
            {loadingProducts ? 'Guardando...' : <><Save size={18} /> Guardar producto</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-5xl mx-auto">
        {/* COLUMNA IZQUIERDA: IMÁGENES */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-[#EBEAE8]">
            <h3 className="font-bold mb-4">Imágenes ({selectedImages.length}/5)</h3>
            <input type="file" id="file-upload" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            <label htmlFor="file-upload" className="border-2 border-dashed border-[#F2B6C1] rounded-lg p-8 flex flex-col items-center justify-center bg-[#FAF9F6] cursor-pointer">
              <Upload className="text-[#F2778D] mb-2" size={32} />
              <p className="text-xs text-center opacity-60">Haz clic para subir fotos</p>
            </label>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {selectedImages.map((file, idx) => (
                <div key={idx} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden group">
                  <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="preview" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="bg-white p-6 rounded-xl border border-[#EBEAE8] shadow-sm">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider opacity-70">
              <Layers size={16} className="text-[#F2778D]"/> Tipo de Origen de Prenda *
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOriginChange('RETAIL')}
                className={`p-4 rounded-xl border text-center transition-all text-sm ${formData.origin_type === 'RETAIL' ? 'border-[#F2778D] bg-rose-50/30 font-bold text-[#F2778D]' : 'border-[#EBEAE8] opacity-60'}`}
              >
                Flujo Comercial (Retail)
              </button>
              <button
                type="button"
                onClick={() => handleOriginChange('PRODUCCION')}
                className={`p-4 rounded-xl border text-center transition-all text-sm ${formData.origin_type === 'PRODUCCION' ? 'border-[#F2778D] bg-rose-50/30 font-bold text-[#F2778D]' : 'border-[#EBEAE8] opacity-60'}`}
              >
                Orden de Producción Propia
              </button>
            </div>
          </div>

          {/* Información General */}
          <div className="bg-white p-8 rounded-xl border border-[#EBEAE8] shadow-sm space-y-4">
            <h3 className="font-bold text-lg border-b border-[#FAF9F6] pb-2">Información general</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase opacity-50">Nombre del producto *</label>
                <input type="text" className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md outline-none" placeholder="Ej: Vestido Gala" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-50">Precio Base (S/.) *</label>
                <input type="number" className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md outline-none" placeholder="0.00" value={formData.base_price || ''} onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-50">Material / Tela</label>
                <input type="text" className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md outline-none" placeholder="Ej: 95% Algodón, 5% Elastano" value={formData.composition} onChange={(e) => setFormData({ ...formData, composition: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-50">Categoría *</label>
                <select className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md outline-none" value={formData.id_category} onChange={(e) => setFormData({...formData, id_category: e.target.value})}>
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-50">Temporada</label>
                <select className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md outline-none" value={formData.season} onChange={(e) => setFormData({...formData, season: e.target.value})}>
                  <option value="">Selecciona temporada</option>
                  <option value="PRIMAVERA 2026">Primavera 2026</option>
                  <option value="VERANO 2026">Verano 2026</option>
                  <option value="OTOÑO / INVIERNO">Otoño / Invierno</option>
                  <option value="TODO EL AÑO">Todo el año</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-50">SKU Base *</label>
                <input type="text" className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md outline-none" placeholder="Ej: VEST-GALA-01" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-50">Género *</label>
                <div className="flex p-1 bg-[#FAF9F6] rounded-lg mt-1">
                  {['MUJER', 'HOMBRE', 'UNISEX'].map((g) => (
                    <button key={g} type="button" onClick={() => setFormData({...formData, gender: g})} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${formData.gender === g ? 'bg-[#F2778D] text-white shadow-sm' : 'opacity-40'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase opacity-50">Descripción</label>
              <textarea className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md h-20 outline-none" placeholder="Describe el producto..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            </div>
          </div>

          {/* 🧵 FICHA TÉCNICA DE INSUMOS (Aparece únicamente si origin_type === 'PRODUCCION') */}
          {formData.origin_type === 'PRODUCCION' && (
            <div className="bg-white p-8 rounded-xl border border-[#EBEAE8] shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="font-bold text-lg border-b border-[#FAF9F6] pb-2 flex items-center gap-2">
                Ficha técnica de insumos
              </h3>
              <div className="flex items-end gap-3 bg-[#FAF9F6] p-4 rounded-xl">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase opacity-50">Seleccionar Insumo</label>
                  <select 
                    className="w-full p-2.5 mt-1 bg-white border border-[#EBEAE8] rounded-md text-sm outline-none"
                    value={selectedInsumoIndex}
                    onChange={(e) => setSelectedInsumoIndex(e.target.value)}
                  >
                    <option value="">Seleccionar insumo</option>
                    {INSUMOS_MOCK.map((ins, idx) => (
                      <option key={idx} value={idx}>{ins.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-28">
                  <label className="text-[10px] font-bold uppercase opacity-50">Cantidad</label>
                  <input 
                    type="number" 
                    min={1} 
                    className="w-full p-2.5 mt-1 bg-white border border-[#EBEAE8] rounded-md text-sm text-center outline-none"
                    value={insumoQuantity}
                    onChange={(e) => setInsumoQuantity(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddInsumo}
                  className="px-5 py-2.5 bg-[#F2778D] text-white text-sm font-bold rounded-md hover:bg-[#d65c72] transition-colors flex items-center gap-1"
                >
                  <Plus size={16}/> Agregar
                </button>
              </div>

              {technicalSheet.length > 0 ? (
                <div className="border rounded-lg overflow-hidden border-[#EBEAE8]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#FAF9F6] text-xs font-bold uppercase opacity-60">
                      <tr>
                        <th className="p-3">Insumo</th>
                        <th className="p-3">Unidad</th>
                        <th className="p-3">Cantidad</th>
                        <th className="p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF9F6]">
                      {technicalSheet.map((item, index) => (
                        <tr key={index} className="hover:bg-[#FAF9F6]/30">
                          <td className="p-3 font-medium">{item.name}</td>
                          <td className="p-3 text-xs opacity-60">{item.unit}</td>
                          <td className="p-3 font-bold">{item.quantity}</td>
                          <td className="p-3 text-center">
                            <button type="button" onClick={() => handleRemoveInsumo(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-[#FAF9F6]/40 rounded-xl border border-dashed border-[#EBEAE8]">
                  <p className="text-xs opacity-50 italic">Aún no has agregado insumos</p>
                </div>
              )}
            </div>
          )}

          {/* Variantes: Tallas y Colores */}
          <div className="bg-white p-8 rounded-xl border border-[#EBEAE8] shadow-sm space-y-6">
            {/* SECCIÓN TALLAS */}
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2"><Ruler size={18} /> Tallas *</h3>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button key={size} type="button" onClick={() => toggleSize(size)} className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-[#F2778D] text-white border-[#F2778D] shadow-md' : 'border-[#EBEAE8] hover:bg-[#F2D0D3] text-[#594246]'}`}>
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
                        className="w-full p-3 bg-[#FAF9F6] border border-transparent rounded-xl pl-10 text-sm outline-none focus:border-[#F2B6C1] transition-all shadow-sm"
                        placeholder="Buscar color en español o inglés... (ej: azul, rosa, blue)"
                        value={colorSearch}
                        onFocus={() => setShowColorDropdown(true)}
                        onChange={(e) => setColorSearch(e.target.value)}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#F2B6C1]"></div>
                    </div>
                    
                    {showColorDropdown && (
                      <div className="absolute left-0 right-0 z-50 mt-2 bg-white border border-[#EBEAE8] rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-50">
                        {loadingColors ? (
                          <div className="p-4 text-center text-xs opacity-50">Consultando paleta CSS...</div>
                        ) : apiColors.length > 0 ? (
                          apiColors.map((color, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#FAF9F6] transition-colors"
                              onClick={() => handleSelectColor(color)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border border-gray-100 shadow-inner" style={{ backgroundColor: color.hex }} />
                                <span className="text-sm font-medium text-[#594246]">{color.name}</span>
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
                          className="p-3 text-center text-xs font-bold text-[#F2778D] bg-rose-50/20 cursor-pointer hover:bg-rose-50/40 transition-colors border-t rounded-b-xl"
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
                  <div className="p-4 bg-rose-50/10 border border-[#F2B6C1] rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#F2778D]">✨ Nuevo color personalizado</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        placeholder="Nombre del color (ej: Palo Rosa)" 
                        className="flex-1 p-2.5 bg-white border border-[#EBEAE8] rounded-md text-sm outline-none"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                      />
                      <div className="flex items-center bg-white border border-[#EBEAE8] p-1.5 rounded-md gap-2">
                        <input 
                          type="color" 
                          className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent"
                          value={customColorHex}
                          onChange={(e) => setCustomColorHex(e.target.value)}
                        />
                        <input 
                          type="text" 
                          className="w-20 text-xs font-mono outline-none uppercase text-center" 
                          value={customColorHex} 
                          onChange={(e) => setCustomColorHex(e.target.value)}
                        />
                      </div>
                      <button type="button" onClick={handleAddCustomColor} className="px-4 py-2 bg-[#F2778D] text-white text-sm font-bold rounded-md">
                        Agregar
                      </button>
                      <button type="button" onClick={() => setIsCreatingCustomColor(false)} className="px-3 py-2 border border-[#EBEAE8] text-sm rounded-md hover:bg-white">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                
                {showColorDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowColorDropdown(false)} />}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {selectedColors.map((color) => (
                  <div key={color.name} className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#594246] rounded-full text-xs font-bold border border-[#EBEAE8] shadow-sm animate-in zoom-in-75 duration-150">
                    <div className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: color.hex }} />
                    {color.name}
                    <X size={14} className="cursor-pointer text-gray-400 hover:text-[#F2778D]" onClick={() => setSelectedColors(selectedColors.filter(c => c.name !== color.name))} />
                  </div>
                ))}
                {selectedColors.length === 0 && (
                  <p className="text-xs opacity-40 italic mt-1">No hay colores seleccionados</p>
                )}
              </div>
            </div>

            {/* TABLA MATRIZ DE VARIANTES */}
            {variants.length > 0 && (
              <div className="border border-[#EBEAE8] rounded-xl overflow-hidden animate-in fade-in duration-300">
                <div className="bg-[#FAF9F6] p-3 border-b border-[#EBEAE8]">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">Matriz de Variantes Generadas ({variants.length})</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAF9F6]/60 sticky top-0 text-xs uppercase opacity-50 border-b">
                      <tr>
                        <th className="p-3">Talla</th>
                        <th className="p-3">Color</th>
                        <th className="p-3">SKU Variante</th>
                        <th className="p-3 text-right">Stock Inicial</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {variants.map((v, i) => (
                        <tr key={i} className="hover:bg-[#FAF9F6]/20">
                          <td className="p-3 font-bold">{v.size}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: v.color.hex }} />
                              {v.color.name}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-xs opacity-60">{v.sku_variant}</td>
                          <td className="p-3 text-right">
                            <input 
                              type="number" 
                              className="w-16 p-1 text-right bg-transparent border-b border-[#EBEAE8] outline-none font-bold text-[#F2778D]" 
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