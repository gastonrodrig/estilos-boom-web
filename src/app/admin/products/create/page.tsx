'use client';
import React, { useEffect, useState } from 'react';
import { useProductStore,useCategoryStore } from '@/hooks';
import { Plus, X, Upload, Save, ArrowLeft, Palette, Ruler, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/dist/client/components/navigation';


export default function CreateProductPage() {
  const { createProduct } = useProductStore();
  const { categories,startLoadingCategories,loading: loadingCategories } = useCategoryStore(); // Asumiendo que existe
  const router = useRouter();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
    }
  };

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
  const generateVariants = (sizes: string[], colors: string[]) => {
    const newVariants = [];
    for (const size of sizes) {
      for (const color of colors) {
        newVariants.push({
          size,
          color,
          stock: 0,
          sku_variant: `${formData.sku}-${size}-${color.substring(0,3)}`.toUpperCase(),
          min_stock_alert: 10
        });
      }
    }
    setVariants(newVariants);
  };
  useEffect(() => {
    startLoadingCategories(); // Carga categorías para el dropdown
    console.log("Categorías cargadas:", categories);
}, [startLoadingCategories]);
  useEffect(() => {
    
    generateVariants(selectedSizes, selectedColors);
}, [selectedSizes, selectedColors, formData.sku]);

  const toggleSize = (size: string) => {
  const newSizes = selectedSizes.includes(size)
    ? selectedSizes.filter((s) => s !== size) // La quita si ya está
    : [...selectedSizes, size]; // La agrega si no está

  setSelectedSizes(newSizes);
  
  // Opcional: Generar variantes automáticamente al cambiar tallas
  generateVariants(newSizes, selectedColors);
};

const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.name || !formData.sku || !formData.id_category) {
      return toast.error("Por favor completa los campos obligatorios (*)");
    }
    if (selectedImages.length === 0) {
      return toast.error("Debes subir al menos una imagen");
    }

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
  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 text-[#594246]">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <Link href="/admin/products" className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100">
          <ArrowLeft size={16} /> Volver a Productos
        </Link>
        <div className="flex gap-3">
          <button onClick={handleSubmit} className="px-6 py-2 bg-[#F2778D] text-white rounded-md flex items-center gap-2">
            <Save size={18} /> Guardar producto
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
                    <option key={cat.id_category} value={cat.id_category}>
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
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2"><Ruler size={18}/> Tallas</h3>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    
                    return (
                  <button
                    key={size}
                    type="button" // Evita que el formulario se envíe por error
                    onClick={() => toggleSize(size)}
                    className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center text-xs font-bold 
                        ${isSelected 
                        ? 'bg-[#F2778D] text-white border-[#F2778D] shadow-md' 
                        : 'border-[#EBEAE8] hover:bg-[#F2D0D3] text-[#594246]'
                        }`}
                    >
                    {size}
                    </button>
                )})}
                <button className="text-[#F2778D] text-sm font-bold ml-2">+ Agregar talla</button>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2"><Palette size={18}/> Colores</h3>
              <div className="relative">
                <input type="text" className="w-full p-3 bg-[#FAF9F6] border-none rounded-md pl-10 text-sm" placeholder="Buscar color... Ej: Palo Rosa" />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#F2B6C1]"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
