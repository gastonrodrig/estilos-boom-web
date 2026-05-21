"use client";

import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { useCategoryStore } from "@/hooks";

interface CategoryModalProps {
  open: boolean;
  selectedCategory: any | null; // Cambiar por tu modelo exacto de Category si tienes la interfaz
  onClose: () => void;
  onSaved: () => void;
}

export function CategoryModal({ open, selectedCategory, onClose, onSaved }: CategoryModalProps) {
  const { startCreateCategory, startUpdateCategory, loading } = useCategoryStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Control de reinicio o precarga de estados basados en la selección de la tabla
  useEffect(() => {
    if (selectedCategory) {
      setName(selectedCategory.name || "");
      setDescription(selectedCategory.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [selectedCategory, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = { name: name.trim(), description: description.trim() };
    let success = false;

    if (selectedCategory?._id) {
      success = await startUpdateCategory(selectedCategory._id, payload);
    } else {
      success = await startCreateCategory(payload);
    }

    if (success) {
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-100 text-[#594246] relative animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
          <h3 className="font-serif font-bold text-lg">
            {selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 opacity-60 hover:opacity-100 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase opacity-50 block mb-1">Nombre de Categoría *</label>
            <input 
              type="text" 
              required
              className="w-full p-3 bg-[#FAF9F6] border border-transparent rounded-xl outline-none focus:border-[#F2B6C1] text-sm transition-all" 
              placeholder="Ej: Vestidos, Polos, Blazers"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase opacity-50 block mb-1">Descripción</label>
            <textarea 
              className="w-full p-3 bg-[#FAF9F6] border border-transparent rounded-xl outline-none focus:border-[#F2B6C1] text-sm transition-all h-24 resize-none" 
              placeholder="Escribe una breve descripción de las prendas agrupadas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Botonera */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-50 mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-bold border border-[#EBEAE8] rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || !name.trim()}
              className="px-5 py-2 text-sm font-bold bg-[#F2778D] text-white rounded-xl hover:bg-[#d65c72] transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <Save size={16}/> {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}