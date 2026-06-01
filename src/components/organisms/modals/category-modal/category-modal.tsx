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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl w-full max-w-md p-7 rounded-3xl shadow-2xl border border-[#EAE0E2] dark:border-white/10 text-[#40202D] dark:text-white relative animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#EAE0E2] dark:border-white/10 pb-4 mb-5">
          <h3 className="font-black text-xl tracking-wide drop-shadow-sm">
            {selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-all text-[#8C6B79] dark:text-gray-300">
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-[#8C6B79] dark:text-gray-400 block mb-2">Nombre de Categoría *</label>
            <input 
              type="text" 
              required
              className="w-full p-3.5 bg-white/50 dark:bg-black/40 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] focus:ring-2 focus:ring-[#D6405F]/20 dark:focus:ring-[#F8BBD0]/20 text-sm font-bold transition-all shadow-inner text-[#40202D] dark:text-white placeholder:text-[#8C6B79] dark:placeholder:text-gray-500" 
              placeholder="Ej: Vestidos, Polos, Blazers"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-[#8C6B79] dark:text-gray-400 block mb-2">Descripción</label>
            <textarea 
              className="w-full p-3.5 bg-white/50 dark:bg-black/40 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] focus:ring-2 focus:ring-[#D6405F]/20 dark:focus:ring-[#F8BBD0]/20 text-sm font-medium transition-all h-28 resize-none shadow-inner custom-scrollbar text-[#40202D] dark:text-white placeholder:text-[#8C6B79] dark:placeholder:text-gray-500" 
              placeholder="Escribe una breve descripción de las prendas agrupadas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Botonera */}
          <div className="flex justify-end gap-3 pt-5 border-t border-[#EAE0E2] dark:border-white/10 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-sm font-bold border border-[#EAE0E2] dark:border-white/10 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-[#8C6B79] dark:text-gray-300 transition-colors bg-white/30 dark:bg-black/30 backdrop-blur-md"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || !name.trim()}
              className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-[#D6405F] to-[#F23B69] hover:from-[#F23B69] hover:to-[#D6405F] dark:from-[#F8BBD0] dark:to-[#F48FB1] dark:hover:from-[#F48FB1] dark:hover:to-[#F8BBD0] text-white dark:text-[#1A0B11] rounded-xl transition-all shadow-[0_5px_15px_rgba(214,64,95,0.3)] dark:shadow-[0_5px_15px_rgba(248,187,208,0.3)] flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.02]"
            >
              <Save size={16}/> {loading ? "Guardando..." : "Guardar Categoría"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}