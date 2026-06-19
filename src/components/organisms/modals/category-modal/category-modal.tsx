"use client";

import { useEffect, useState } from "react";
import { X, Save, PowerOff } from "lucide-react";
import { useCategoryStore } from "@/hooks";

interface CategoryModalProps {
  open: boolean;
  selectedCategory: any | null;
  onClose: () => void;
  onSaved: () => void;
}

// Deriva abreviatura de 4 letras desde el nombre (igual que el backend)
function deriveAbbr(name: string): string {
  const words = name.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0].slice(0, 2) + words[1].slice(0, 2)).padEnd(4, "X");
  return (words[0] ?? "PROD").slice(0, 4).padEnd(4, "X");
}

export function CategoryModal({ open, selectedCategory, onClose, onSaved }: CategoryModalProps) {
  const { startCreateCategory, startUpdateCategory, startDeactivateCategory, loading } = useCategoryStore();

  const [name, setName]             = useState("");
  const [abbr, setAbbr]             = useState("");
  const [abbrTouched, setAbbrTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      setName(selectedCategory.name ?? "");
      setAbbr(selectedCategory.abbr ?? deriveAbbr(selectedCategory.name ?? ""));
      setDescription(selectedCategory.description ?? "");
    } else {
      setName("");
      setAbbr("");
      setDescription("");
    }
    setAbbrTouched(false);
    setConfirmDeactivate(false);
  }, [selectedCategory, open]);

  // Auto-deriva la abreviatura mientras el usuario escribe el nombre,
  // a menos que ya haya editado la abreviatura a mano.
  const handleNameChange = (val: string) => {
    setName(val);
    if (!abbrTouched) setAbbr(deriveAbbr(val));
  };

  const handleAbbrChange = (val: string) => {
    setAbbr(val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4));
    setAbbrTouched(true);
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      abbr: abbr || deriveAbbr(name),
      description: description.trim(),
    };

    const success = selectedCategory?._id
      ? await startUpdateCategory(selectedCategory._id, payload)
      : await startCreateCategory(payload);

    if (success) { onSaved(); onClose(); }
  };

  const handleDeactivate = async () => {
    if (!selectedCategory?._id) return;
    const success = await startDeactivateCategory(selectedCategory._id);
    if (success) { onSaved(); onClose(); }
  };

  const inputClass = "w-full p-3.5 bg-white/50 dark:bg-black/40 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] focus:ring-2 focus:ring-[#D6405F]/20 dark:focus:ring-[#F8BBD0]/20 text-sm font-medium transition-all shadow-inner text-[#40202D] dark:text-white placeholder:text-[#8C6B79]/60 dark:placeholder:text-gray-500";
  const labelClass = "text-[11px] font-medium uppercase tracking-wider text-[#8C6B79] dark:text-gray-400 block mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl w-full max-w-md p-7 rounded-3xl shadow-2xl border border-[#EAE0E2] dark:border-white/10 text-[#40202D] dark:text-white relative animate-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#EAE0E2] dark:border-white/10 pb-4 mb-5">
          <h3 className="font-medium text-xl tracking-wide drop-shadow-sm">
            {selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-all text-[#8C6B79] dark:text-gray-300">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className={labelClass}>Nombre de Categoría *</label>
            <input
              type="text"
              required
              className={inputClass}
              placeholder="Ej: Vestidos, Polos, Blazers"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          {/* Abreviatura — auto-derivada, editable solo si el usuario quiere corregirla */}
          {abbr && (
            <div>
              <label className={labelClass}>
                Abreviatura SKU
                <span className="ml-2 normal-case text-[10px] opacity-60">(auto-generada — editala solo si no te convence)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  className={`${inputClass} uppercase tracking-[0.3em] font-bold`}
                  value={abbr}
                  onChange={(e) => handleAbbrChange(e.target.value)}
                />
                {!abbrTouched && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8C6B79]/60 dark:text-white/30 pointer-events-none">
                    auto
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className={labelClass}>Descripción</label>
            <textarea
              className={`${inputClass} h-24 resize-none custom-scrollbar`}
              placeholder="Breve descripción de las prendas agrupadas en esta categoría..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Botonera */}
          <div className="flex justify-between items-center gap-3 pt-4 border-t border-[#EAE0E2] dark:border-white/10 mt-2">

            {/* Desactivar — solo en edición */}
            {selectedCategory?._id && !confirmDeactivate && (
              <button
                type="button"
                onClick={() => setConfirmDeactivate(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <PowerOff size={14} /> Desactivar
              </button>
            )}

            {selectedCategory?._id && confirmDeactivate && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500 font-bold">¿Confirmar?</span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDeactivate}
                  className="text-xs font-bold px-3 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
                >
                  Sí, desactivar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeactivate(false)}
                  className="text-xs font-bold px-3 py-1.5 border border-[#EAE0E2] dark:border-white/10 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                >
                  No
                </button>
              </div>
            )}

            {!selectedCategory?._id && <span />}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold border border-[#EAE0E2] dark:border-white/10 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-[#8C6B79] dark:text-gray-300 transition-colors bg-white/30 dark:bg-black/30 backdrop-blur-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || abbr.length < 2}
                className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-[#D6405F] to-[#F23B69] hover:from-[#F23B69] hover:to-[#D6405F] dark:from-[#F8BBD0] dark:to-[#F48FB1] text-white dark:text-[#1A0B11] rounded-xl transition-all shadow-[0_5px_15px_rgba(214,64,95,0.3)] flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.02]"
              >
                <Save size={16} /> {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
