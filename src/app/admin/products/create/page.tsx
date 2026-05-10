'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useProductStore,useCategoryStore } from '@/hooks';
import Link from 'next/link';
import { Plus, X, Upload, Save, ArrowLeft, Palette, Ruler } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/dist/client/components/navigation';


export default function CreateProductPage() {
  const { createProduct,loading: loadingProducts } = useProductStore();
  const { categories,startLoadingCategories,loading: loadingCategories } = useCategoryStore(); // Asumiendo que existe
  const router = useRouter();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
    }
  };
  useEffect(() => {
  if (categories.length > 0) {
    console.log("Estructura de la primera categoría:", categories[0]);
  }
}, [categories]);

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };
  // Estado del Formulario alineado al Back-end
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    base_price: 0,
    gender: 'MUJER', // Default del modelo
    composition: '', // Lo que en la imagen es "Material"
    season: '',
    id_category: '',
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  // Estado para la tabla de variantes (Stock y SKU por combinación)
  const [variants, setVariants] = useState<any[]>([]);

  // Lógica para generar combinaciones de variantes automáticamente
  const generateVariants = useCallback((sizes: string[], colors: string[]) => {
  // Si no hay tallas O no hay colores, no podemos crear combinaciones
  if (sizes.length === 0 || colors.length === 0) {
    setVariants([]);
    return;
  }

  const newVariants = sizes.flatMap(size => 
    colors.map(color => ({
      size,
      color,
      stock: 0,
      sku_variant: `${formData.sku || 'SKU'}-${size}-${color.substring(0,3)}`.toUpperCase(),
      min_stock_alert: 10
    }))
  );

  console.log("🛠️ Variantes generadas localmente:", newVariants);
  setVariants(newVariants);
}, [formData.sku]);


  useEffect(() => {
    startLoadingCategories(); // Carga categorías para el dropdown
    console.log("Categorías cargadas:", categories);
}, [startLoadingCategories]);


  useEffect(() => {
  generateVariants(selectedSizes, selectedColors);
}, [selectedSizes, selectedColors, generateVariants]);

  const toggleSize = (size: string) => {
  setSelectedSizes(prev => 
    prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
  );
};

const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.name || !formData.sku || !formData.id_category) {
      return toast.error("Por favor completa los campos obligatorios (*)");
    }
    if (selectedImages.length === 0) {
      return toast.error("Debes subir al menos una imagen");
    }
    console.log("📦 Datos listos para enviar:", {
    sku: formData.sku,
    sizes: selectedSizes,
    colors: selectedColors,
    variantsCount: variants.length
  });

    const data = new FormData();
    
    // Campos básicos
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("sku", formData.sku);
    data.append("base_price", formData.base_price.toString());
    data.append("gender", formData.gender);
    data.append("composition", formData.composition);
    data.append("id_category", formData.id_category);
    
    // Variantes (Se envían como string JSON porque NestJS las parsea así en el Controller)
    data.append("variants", JSON.stringify(variants));

    // Imágenes (El backend las busca en el campo 'files')
    selectedImages.forEach((file) => {
      data.append("files", file);
    });

    

    const result = await createProduct(data);
    if (result) router.push("/admin/products");
  };

  const addColor = (colorName: string) => {
  if (!colorName.trim()) return;
  if (selectedColors.includes(colorName)) return; // No duplicar

  const newColors = [...selectedColors, colorName];
  setSelectedColors(newColors);
  // generateVariants se disparará solo gracias al useEffect que pusimos antes
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
          disabled={loadingProducts} // Usa el loading de tu useProductStore
          onClick={handleSubmit} className="px-6 py-2 bg-[#F2778D] text-white rounded-md flex items-center gap-2">
                    {loadingProducts ? 'Guardando...' : <><Save size={18} /> Guardar producto</>}
        </button>
        </div>
      </div>
 
        {/* COLUMNA IZQUIERDA: IMÁGENES */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-5xl mx-auto">
        {/* SECCIÓN DE IMÁGENES ACTUALIZADA */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-[#EBEAE8]">
            <h3 className="font-bold mb-4">Imágenes ({selectedImages.length}/5)</h3>
            <input 
              type="file" 
              id="file-upload" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange} 
            />
            <label 
              htmlFor="file-upload"
              className="border-2 border-dashed border-[#F2B6C1] rounded-lg p-8 flex flex-col items-center justify-center bg-[#FAF9F6] cursor-pointer"
            >
              <Upload className="text-[#F2778D] mb-2" size={32} />
              <p className="text-xs text-center opacity-60">Haz clic para subir fotos</p>
            </label>

            {/* Preview de imágenes seleccionadas */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {selectedImages.map((file, idx) => (
                <div key={idx} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden group">
                  <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Información General */}
          <div className="bg-white p-8 rounded-xl border border-[#EBEAE8] shadow-sm space-y-4">
            <h3 className="font-bold text-lg border-b border-[#FAF9F6] pb-2">Información general</h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                <label className="text-xs font-bold uppercase opacity-50">Nombre del producto *</label>
                <input 
                    type="text" 
                    className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md focus:ring-1 focus:ring-[#F2778D] outline-none" 
                    placeholder="Ej: Blazer Oversize Milán" 
                    // 🔗 Conexión al estado:
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                </div>

                <div>
                <label className="text-xs font-bold uppercase opacity-50">Precio Base (S/.) *</label>
                <input 
                    type="number" 
                    className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md focus:ring-1 focus:ring-[#F2778D] outline-none" 
                    placeholder="0.00" 
                    // 🔗 Conexión al estado:
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                />
                </div>

                <div>
                <label className="text-xs font-bold uppercase opacity-50">Material / Tela</label>
                <input 
                    type="text" 
                    className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md focus:ring-1 focus:ring-[#F2778D] outline-none" 
                    placeholder="Ej: 95% Algodón" 
                    // 🔗 Conexión al estado:
                    value={formData.composition}
                    onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                />
                </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold uppercase opacity-50">Categoría *</label>
              <select 
                className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md"
                value={formData.id_category}
                onChange={(e) => setFormData({...formData, id_category: e.target.value})}
                >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                    // IMPORTANTE: El value DEBE ser cat._id, NO cat.name ni cat.id_category
                    <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
                </select>
            </div>

            <div>
                <label className="text-xs font-bold uppercase opacity-50">Descripción</label>
                <textarea 
                className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md h-24 focus:ring-1 focus:ring-[#F2778D] outline-none" 
                placeholder="Describe el producto..."
                // 🔗 Conexión al estado:
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
            </div>
            <div>
            <label className="text-xs font-bold uppercase opacity-50">SKU Base *</label>
            <input 
                type="text" 
                className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md outline-none focus:ring-1 focus:ring-[#F2778D]" 
                placeholder="Ej: POLO-BARCA-001" 
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
            />
            </div>
            <div>
            <label className="text-xs font-bold uppercase opacity-50">Temporada</label>
            <select 
              className="w-full p-3 mt-1 bg-[#FAF9F6] border-none rounded-md outline-none"
              value={formData.season}
              onChange={(e) => setFormData({...formData, season: e.target.value})}
            >
              <option value="">Selecciona temporada</option>
              <option value="PRIMAVERA 2026">Primavera 2026</option>
              <option value="VERANO 2026">Verano 2026</option>
              <option value="OTOÑO / INVIERNO">Otoño / Invierno</option>
              <option value="TODO EL AÑO">Todo el año</option>
            </select>
          </div>
            </div>

          {/* Género (Sustituye a Tipo de Prenda) */}
          <div className="bg-white p-8 rounded-xl border border-[#EBEAE8] shadow-sm">
            <h3 className="font-bold mb-4">Género *</h3>
            <div className="flex p-1 bg-[#FAF9F6] rounded-lg">
              {['MUJER', 'HOMBRE', 'UNISEX'].map((g) => (
                <button 
                  key={g}
                  onClick={() => setFormData({...formData, gender: g})}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formData.gender === g ? 'bg-[#F2778D] text-white shadow-md' : 'opacity-40'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Variantes: Tallas y Colores */}
          <div className="bg-white p-8 rounded-xl border border-[#EBEAE8] shadow-sm space-y-6">
          {/* SECCIÓN TALLAS */}
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Ruler size={18} /> Tallas
            </h3>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center text-xs font-bold 
                      ${isSelected 
                        ? 'bg-[#F2778D] text-white border-[#F2778D] shadow-md' 
                        : 'border-[#EBEAE8] hover:bg-[#F2D0D3] text-[#594246]'
                      }`}
                  >
                    {size}
                  </button>
                );
              })}
              <button className="text-[#F2778D] text-sm font-bold ml-2 hover:underline">
                + Agregar talla
              </button>
            </div>
          </div>

          {/* SECCIÓN COLORES */}
          <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Palette size={18} /> Colores
              </h3>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  className="w-full p-3 bg-[#FAF9F6] border-none rounded-md pl-10 text-sm outline-none focus:ring-1 focus:ring-[#F2778D]"
                  placeholder="Escribe un color (ej: Rojo) y presiona Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Evita que se envíe el formulario
                      const valor = e.currentTarget.value.trim();
                      if (valor) {
                        addColor(valor); // Llama a la función que creamos
                        e.currentTarget.value = ''; // Limpia la caja de texto
                      }
                    }
                  }}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#F2B6C1]"></div>
              </div>

              {/* Visualización de Colores Seleccionados */}
              <div className="flex flex-wrap gap-2">
                {selectedColors.map((color) => (
                  <div 
                    key={color} 
                    className="flex items-center gap-2 px-3 py-1 bg-[#F2D0D3] text-[#594246] rounded-full text-xs font-bold border border-[#F2B6C1]"
                  >
                    {color}
                    <X 
                      size={14} 
                      className="cursor-pointer hover:text-[#F2778D]" 
                      onClick={() => setSelectedColors(selectedColors.filter(c => c !== color))}
                    />
                  </div>
                ))}
                {selectedColors.length === 0 && (
                  <p className="text-xs opacity-40 italic">No hay colores seleccionados</p>
                )}
              </div>
              {variants.length > 0 && (
                <div className="bg-white p-8 rounded-xl border border-[#EBEAE8] shadow-sm animate-in fade-in duration-500">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-[#F2778D]" /> Variantes a crear ({variants.length})
                  </h3>
                  <div className="max-h-60 overflow-y-auto border rounded-lg border-[#FAF9F6]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FAF9F6] sticky top-0">
                        <tr>
                          <th className="p-3">Talla</th>
                          <th className="p-3">Color</th>
                          <th className="p-3">SKU Variante</th>
                          <th className="p-3 text-right">Stock Inicial</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FAF9F6]">
                        {variants.map((v, i) => (
                          <tr key={i} className="hover:bg-[#FAF9F6]/50">
                            <td className="p-3 font-bold">{v.size}</td>
                            <td className="p-3">{v.color}</td>
                            <td className="p-3 text-xs opacity-60">{v.sku_variant}</td>
                            <td className="p-3 text-right">
                              <input 
                                type="number"
                                className="w-16 p-1 text-right bg-transparent border-b border-[#EBEAE8] focus:border-[#F2778D] outline-none"
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
    </div>
  );
};
