"use client";

import { useEffect, useState } from "react";
import { X, Save, Ruler, Box, Disc } from "lucide-react";
import { useSupplyStore } from "@/hooks";
import { Supply } from "@/store";

interface SupplySidebarProps {
  open: boolean;
  selectedSupply: Supply | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES_OPTIONS = [
  "Telas",
  "Hilos",
  "Cierres y Cremalleras",
  "Elásticos",
  "Botones y Broches",
  "Entretelas",
  "Acabados",
  "Otros"
];

export function SupplySidebar({ open, selectedSupply, onClose, onSaved }: SupplySidebarProps) {
  const { startCreateSupply, startUpdateSupply, loading } = useSupplyStore();
  
  // Estados locales enlazados a las imágenes de tu diseño
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<'metros' | 'unidades' | 'rollos'>("metros");
  const [category, setCategory] = useState("Otros");
  const [notes, setNotes] = useState("");
  const [retornable, setRetornable] = useState(true);

  useEffect(() => {
    if (selectedSupply) {
      setName(selectedSupply.name || "");
      setUnit((selectedSupply.unit as any) || "metros");
      setCategory((selectedSupply as any).category || "Otros");
      setNotes((selectedSupply as any).notes || "");
      setRetornable((selectedSupply as any).retornable !== false);
    } else {
      setName("");
      setUnit("metros");
      setCategory("Otros");
      setNotes("");
      setRetornable(true);
    }
  }, [selectedSupply, open]);

  // Auto-sugerir retornable=false cuando categoría es Telas
  useEffect(() => {
    if (category === "Telas") setRetornable(false);
    else setRetornable(true);
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      unit,
      category,
      notes: notes.trim(),
      retornable,
    };

    let success = false;
    if (selectedSupply?._id || selectedSupply?.id) {
      const targetId = (selectedSupply._id || selectedSupply.id) as string;
      success = await startUpdateSupply(targetId, payload as any);
    } else {
      success = await startCreateSupply(payload as any);
    }

    if (success) {
      onSaved();
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 border-l border-gray-100 text-[#594246] flex flex-col shadow-2xl transition-transform duration-300 ease-out transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabecera */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h3 className="font-serif font-bold text-xl text-gray-800">
              {selectedSupply ? "Editar Insumo" : "Nuevo Insumo"}
            </h3>
            {selectedSupply && (
              <p className="text-xs text-[#F2778D] font-medium mt-0.5">{selectedSupply.name}</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 opacity-60 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            
            {/* Campo: Nombre del Insumo */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Nombre del Insumo</label>
              <input 
                type="text" 
                required
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#F2B6C1] text-sm text-gray-800" 
                placeholder="Ej: Tela Viscosa Estampada"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Campo: Unidad de Medida (Tarjetas idénticas a la imagen) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Unidad de Medida</label>
              <div className="grid grid-cols-3 gap-2.5">
                {/* Opción Metros */}
                <button
                  type="button"
                  onClick={() => setUnit("metros")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all min-h-[105px] ${
                    unit === "metros" 
                      ? "border-[#F2778D] ring-1 ring-[#F2778D] bg-white" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <Ruler size={20} className={`mb-2 ${unit === "metros" ? "text-[#F2778D]" : "text-gray-400"}`} />
                  <span className="text-xs font-bold block text-gray-800">Metros</span>
                  <span className="text-[10px] text-gray-400 leading-tight mt-0.5 block">longitud de tela</span>
                </button>

                {/* Opción Unidades */}
                <button
                  type="button"
                  onClick={() => setUnit("unidades")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all min-h-[105px] ${
                    unit === "unidades" 
                      ? "border-[#F2778D] ring-1 ring-[#F2778D] bg-white" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <Box size={20} className={`mb-2 ${unit === "unidades" ? "text-[#F2778D]" : "text-gray-400"}`} />
                  <span className="text-xs font-bold block text-gray-800">Unidades</span>
                  <span className="text-[10px] text-gray-400 leading-tight mt-0.5 block">piezas sueltas</span>
                </button>

                {/* Opción Rollos */}
                <button
                  type="button"
                  onClick={() => setUnit("rollos")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all min-h-[105px] ${
                    unit === "rollos" 
                      ? "border-[#F2778D] ring-1 ring-[#F2778D] bg-white" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <Disc size={20} className={`mb-2 ${unit === "rollos" ? "text-[#F2778D]" : "text-gray-400"}`} />
                  <span className="text-xs font-bold block text-gray-800">Rollos</span>
                  <span className="text-[10px] text-gray-400 leading-tight mt-0.5 block">carretes o conos</span>
                </button>
              </div>
            </div>

            {/* Campo: Categoría Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Categoría</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-[#F2B6C1] text-sm text-gray-700"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Campo: Retornable */}
            <div className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl">
              <div>
                <p className="text-xs font-bold text-gray-700">Retornable al almacén</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {retornable ? "Los sobrantes vuelven al inventario" : "Los sobrantes no se devuelven (ej: tela)"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRetornable(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${retornable ? 'bg-[#F2778D]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${retornable ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Campo: Notas Internas */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Notas Internas</label>
              <textarea
                className="w-full p-3.5 border border-gray-200 rounded-xl outline-none focus:border-[#F2B6C1] text-sm text-gray-700 h-24 resize-none"
                placeholder="Notas internas para el equipo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Fijo */}
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-center"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || !name.trim()}
              className="flex-1 py-3 text-sm font-bold bg-[#F2778D] text-white rounded-xl hover:bg-[#d65c72] transition-colors disabled:opacity-40 text-center shadow-md shadow-rose-100"
            >
              {loading ? "Guardando..." : "Guardar Insumo"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}