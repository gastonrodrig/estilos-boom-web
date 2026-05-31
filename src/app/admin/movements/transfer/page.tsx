"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStorehouseStore } from "@/hooks";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateTransferWizard() {
  const router = useRouter();
  const { startCreateTransfer, loading } = useStorehouseStore();
  
  const [itemsToProcess, setItemsToProcess] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Para iterar: "Producto 1 de 3"
  const [quantities, setQuantities] = useState<Record<string, number>>({}); // { variantId: cantidad }

  useEffect(() => {
    const raw = localStorage.getItem("estilos_boom_pending_transfer");
    if (!raw) {
      toast.error("No hay productos seleccionados para mover.");
      router.push("/admin/inventory/stock");
      return;
    }
    setItemsToProcess(Object.values(JSON.parse(raw)));
  }, []);

  if (itemsToProcess.length === 0) return null;

  const currentProduct = itemsToProcess[currentIndex];

  const handleUpdateQty = (variantId: string, value: number, isRelative = false) => {
    setQuantities(prev => {
      const currentQty = prev[variantId] || 0;
      const targetQty = isRelative ? currentQty + value : value;
      return { ...prev, [variantId]: Math.max(0, targetQty) };
    });
  };

  const handleFinalizeTransfer = async () => {
    // 1. Estructuramos los items comprimidos tal como los pide tu DTO de NestJS
    const transferItems = itemsToProcess.flatMap(prod => 
      prod.variants.map((v: any) => ({
        id_variant: v._id,
        quantity: quantities[v._id] || 0
      }))
    ).filter(item => item.quantity > 0);

    if (transferItems.length === 0) {
      return toast.error("Debes asignar al menos una cantidad mayor a 0 para trasladar.");
    }

    const payload = {
      code: `TR-${Date.now().toString().slice(-6)}`, // Código correlativo autogenerado
      id_source_warehouse: "65f1c2b3e4b0123456789aaa", // ID Almacén Central de tu BD
      id_target_warehouse: "65f1c2b3e4b0123456789bbb", // ID Tienda Principal de tu BD
      id_sender_worker: "65f1c2b3e4b0123456789abc", // Trabajador logueado
      items: transferItems
    };

    const success = await startCreateTransfer(payload);
    if (success) {
      localStorage.removeItem("estilos_boom_pending_transfer");
      router.push("/admin/movements"); // Redirige a tu tabla de tránsitos
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-6 md:p-8 text-[#40202D] dark:text-white flex flex-col justify-between transition-colors duration-500">
      
      {/* HEADER WIZARD */}
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center mb-8 bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold opacity-70 hover:opacity-100 transition-opacity uppercase tracking-wider text-[#8C6B79] dark:text-gray-400">
            <ArrowLeft size={16}/> Volver
          </button>
          <h1 className="text-3xl font-black mt-3 tracking-wide drop-shadow-sm">Crear orden de movimiento</h1>
          <p className="text-xs text-[#D6405F] dark:text-[#F8BBD0] font-black mt-2 uppercase tracking-widest bg-[#D6405F]/10 dark:bg-[#F8BBD0]/10 px-3 py-1 rounded-full w-fit border border-[#D6405F]/20 dark:border-[#F8BBD0]/20">
            Producto {currentIndex + 1} de {itemsToProcess.length}
          </p>
        </div>

        <span className="px-5 py-2.5 bg-white/50 dark:bg-white/10 text-[#D6405F] dark:text-[#F8BBD0] font-black text-[11px] rounded-full uppercase tracking-widest border border-[#EAE0E2] dark:border-white/20 shadow-sm">
          Transferencia a tienda
        </span>
      </div>

      {/* CORE CUERPO DISPLAY (Imagen 3) */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 items-start my-auto">
        
        {/* Ficha Izquierda del Producto Fijo */}
        <div className="md:col-span-5 bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 p-6 rounded-3xl shadow-sm text-center flex flex-col items-center">
          <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 mb-5 p-2 shadow-inner">
            <img src={currentProduct.image} className="w-full h-full object-cover rounded-xl" />
          </div>
          <h2 className="text-2xl font-black text-[#40202D] dark:text-white tracking-wide">{currentProduct.name}</h2>
          <span className="inline-block mt-3 px-4 py-1.5 bg-white/50 dark:bg-white/10 text-[#D6405F] dark:text-[#F8BBD0] rounded-full text-xs font-bold uppercase tracking-wider border border-[#EAE0E2] dark:border-white/20 shadow-sm">
            {currentProduct.category}
          </span>
        </div>

        {/* Lista de Variantes e Inputs con Atajos Rápidos */}
        <div className="md:col-span-7 bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 p-6 rounded-3xl shadow-sm space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
          <h3 className="font-bold text-sm uppercase text-[#8C6B79] dark:text-gray-400 tracking-wider">Variantes del producto</h3>
          
          {currentProduct.variants?.map((v: any) => {
  // 🚀 BUSCAMOS EL STOCK REAL: Intentamos sacar el valor que vino en la variante
  // Usamos el stock dinámico si tu hook ya lo cruzó, o lo inicializamos en 0 si no hay registro en ese almacén.
  const stockDisponibleReal = v.stock !== undefined ? v.stock : 0;

  return (
    <div key={v._id} className="border-b border-[#EAE0E2] dark:border-white/10 pb-5 last:border-none space-y-3 bg-white/30 dark:bg-white/5 p-4 rounded-2xl transition-colors hover:bg-white/50 dark:hover:bg-white/10">
      <div className="flex items-center gap-3 text-sm font-bold text-[#40202D] dark:text-white">
        <div className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 shadow-inner" style={{ backgroundColor: v.color?.hex }} />
        <span className="tracking-wide">{v.size} • {v.color?.name}</span>
        <span className="text-[11px] font-mono text-[#8C6B79] dark:text-gray-400 bg-white/50 dark:bg-black/30 px-2 py-0.5 rounded ml-auto">({v.sku_variant})</span>
      </div>
      
      {/* ✅ SOLUCIÓN: Cambiamos el "35" quemado por la variable real de la BD */}
      <p className="text-xs text-[#8C6B79] dark:text-gray-400 font-medium flex items-center gap-1">
        Disponible: <span className="font-black text-[#D6405F] dark:text-[#F8BBD0] text-sm bg-[#D6405F]/10 dark:bg-[#F8BBD0]/10 px-2 py-0.5 rounded-md">{stockDisponibleReal}</span> en almacén
      </p>
      
      {/* Contenedor Flex del Input e Incrementadores */}
      <div className="flex gap-2 items-center pt-2">
        <input 
          type="number" 
          className="w-full p-2.5 bg-white/50 dark:bg-black/30 border border-[#EAE0E2] dark:border-white/10 rounded-xl text-sm text-center font-black text-[#40202D] dark:text-white outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors shadow-inner"
          placeholder="Cantidad"
          // Evitamos que el usuario intente transferir más de lo que realmente existe en Almacén Central
          max={stockDisponibleReal}
          value={quantities[v._id] || ""}
          onChange={(e) => {
            const val = Number(e.target.value);
            // Validación defensiva para que no digiten números negativos ni superen el stock disponible
            const contolatedVal = Math.min(stockDisponibleReal, Math.max(0, val));
            handleUpdateQty(v._id, contolatedVal, false);
          }}
        />
        {/* Modificamos los atajos para que tampoco puedan inflar el número más allá del stock real */}
        <button type="button" onClick={() => handleUpdateQty(v._id, Math.min(1, stockDisponibleReal - (quantities[v._id] || 0)), true)} className="px-4 py-2.5 bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-300 text-xs font-bold rounded-xl border border-[#EAE0E2] dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:text-[#D6405F] dark:hover:text-[#F8BBD0] transition-colors shadow-sm">+1</button>
        <button type="button" onClick={() => handleUpdateQty(v._id, Math.min(5, stockDisponibleReal - (quantities[v._id] || 0)), true)} className="px-4 py-2.5 bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-300 text-xs font-bold rounded-xl border border-[#EAE0E2] dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:text-[#D6405F] dark:hover:text-[#F8BBD0] transition-colors shadow-sm">+5</button>
        <button type="button" onClick={() => handleUpdateQty(v._id, Math.min(10, stockDisponibleReal - (quantities[v._id] || 0)), true)} className="px-4 py-2.5 bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-300 text-xs font-bold rounded-xl border border-[#EAE0E2] dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:text-[#D6405F] dark:hover:text-[#F8BBD0] transition-colors shadow-sm">+10</button>
      </div>
    </div>
  );
})}
        </div>
      </div>

      {/* FOOTER WIZARD CONTROLS */}
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center border-t border-[#EAE0E2] dark:border-white/10 pt-6 mt-8">
        <button 
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="px-6 py-3 text-sm font-bold border border-[#EAE0E2] dark:border-white/10 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 disabled:opacity-20 disabled:pointer-events-none transition-all flex items-center gap-2 text-[#8C6B79] dark:text-gray-300 bg-white/30 dark:bg-black/30 backdrop-blur-md"
        >
          <ArrowLeft size={16}/> Anterior
        </button>

        {currentIndex < itemsToProcess.length - 1 ? (
          <button 
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="px-8 py-3 bg-[#40202D] hover:bg-[#5B283A] dark:bg-[#F2778D] dark:hover:bg-[#F8BBD0] text-white dark:text-[#1A0B11] text-sm font-bold rounded-2xl transition-all flex items-center gap-2 shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_15px_rgba(242,119,141,0.2)] hover:scale-[1.02]"
          >
            Siguiente producto <ArrowRight size={16}/>
          </button>
        ) : (
          <button 
            disabled={loading}
            onClick={handleFinalizeTransfer}
            className="px-8 py-3 bg-gradient-to-r from-[#D6405F] to-[#F23B69] hover:from-[#F23B69] hover:to-[#D6405F] dark:from-[#F8BBD0] dark:to-[#F48FB1] dark:hover:from-[#F48FB1] dark:hover:to-[#F8BBD0] text-white dark:text-[#1A0B11] text-sm font-bold rounded-2xl transition-all flex items-center gap-2 shadow-[0_8px_20px_rgba(214,64,95,0.3)] dark:shadow-[0_8px_20px_rgba(248,187,208,0.3)] hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
          >
            <Save size={18}/> {loading ? "Procesando envío..." : "Finalizar y transferir stock"}
          </button>
        )}
      </div>

    </div>
  );
}