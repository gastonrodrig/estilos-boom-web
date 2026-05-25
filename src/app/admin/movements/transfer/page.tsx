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
    <div className="min-h-screen bg-[#FAF9F6] p-8 text-[#594246] flex flex-col justify-between">
      
      {/* HEADER WIZARD */}
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center mb-6">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-xs opacity-50 font-bold">
            <ArrowLeft size={14}/> Volver
          </button>
          <h1 className="text-3xl font-serif font-bold mt-2">Crear orden de movimiento</h1>
          <p className="text-xs text-[#F2778D] font-bold mt-1 uppercase tracking-wider">
            Producto {currentIndex + 1} de {itemsToProcess.length}
          </p>
        </div>

        <span className="px-4 py-2 bg-rose-50 text-[#F2778D] font-black text-xs rounded-full uppercase tracking-wider">
          Transferencia a tienda
        </span>
      </div>

      {/* CORE CUERPO DISPLAY (Imagen 3) */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 items-start my-auto">
        
        {/* Ficha Izquierda del Producto Fijo */}
        <div className="md:col-span-5 bg-white border border-[#EBEAE8] p-6 rounded-2xl shadow-sm text-center">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 border mb-4">
            <img src={currentProduct.image} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-800">{currentProduct.name}</h2>
          <span className="inline-block mt-1 px-3 py-1 bg-rose-50 text-[#F2778D] rounded-full text-xs font-bold">
            {currentProduct.category}
          </span>
        </div>

        {/* Lista de Variantes e Inputs con Atajos Rápidos */}
        <div className="md:col-span-7 bg-white border border-[#EBEAE8] p-6 rounded-2xl shadow-sm space-y-6 max-h-[500px] overflow-y-auto">
          <h3 className="font-bold text-sm uppercase opacity-40 tracking-wider">Variantes del producto</h3>
          
          {currentProduct.variants?.map((v: any) => {
  // 🚀 BUSCAMOS EL STOCK REAL: Intentamos sacar el valor que vino en la variante
  // Usamos el stock dinámico si tu hook ya lo cruzó, o lo inicializamos en 0 si no hay registro en ese almacén.
  const stockDisponibleReal = v.stock !== undefined ? v.stock : 0;

  return (
    <div key={v._id} className="border-b pb-4 last:border-none space-y-2">
      <div className="flex items-center gap-2 text-sm font-bold">
        <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: v.color?.hex }} />
        <span>{v.size} • {v.color?.name}</span>
        <span className="text-[11px] font-mono opacity-30 ml-auto">({v.sku_variant})</span>
      </div>
      
      {/* ✅ SOLUCIÓN: Cambiamos el "35" quemado por la variable real de la BD */}
      <p className="text-xs text-gray-400 italic font-medium">
        Disponible: <span className="font-bold text-[#594246]">{stockDisponibleReal}</span> en almacén
      </p>
      
      {/* Contenedor Flex del Input e Incrementadores */}
      <div className="flex gap-2 items-center pt-1">
        <input 
          type="number" 
          className="w-full p-2.5 bg-[#FAF9F6] border rounded-lg text-sm text-center font-bold outline-none focus:border-[#F2B6C1]"
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
        <button type="button" onClick={() => handleUpdateQty(v._id, Math.min(1, stockDisponibleReal - (quantities[v._id] || 0)), true)} className="px-3 py-2 bg-[#FAF9F6] text-xs font-bold rounded-lg border hover:bg-white">+1</button>
        <button type="button" onClick={() => handleUpdateQty(v._id, Math.min(5, stockDisponibleReal - (quantities[v._id] || 0)), true)} className="px-3 py-2 bg-[#FAF9F6] text-xs font-bold rounded-lg border hover:bg-white">+5</button>
        <button type="button" onClick={() => handleUpdateQty(v._id, Math.min(10, stockDisponibleReal - (quantities[v._id] || 0)), true)} className="px-3 py-2 bg-[#FAF9F6] text-xs font-bold rounded-lg border hover:bg-white">+10</button>
      </div>
    </div>
  );
})}
        </div>
      </div>

      {/* FOOTER WIZARD CONTROLS */}
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center border-t pt-4 mt-6">
        <button 
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="px-5 py-2 text-sm font-bold border rounded-xl hover:bg-white disabled:opacity-20 transition-all flex items-center gap-1"
        >
          🡨 Anterior
        </button>

        {currentIndex < itemsToProcess.length - 1 ? (
          <button 
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="px-6 py-2 bg-[#594246] hover:bg-black text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-1 shadow-md"
          >
            Siguiente producto <ArrowRight size={16}/>
          </button>
        ) : (
          <button 
            disabled={loading}
            onClick={handleFinalizeTransfer}
            className="px-8 py-2.5 bg-[#F2778D] hover:bg-[#d65c72] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-rose-100"
          >
            <Save size={16}/> {loading ? "Procesando envío..." : "Finalizar y transferir stock"}
          </button>
        )}
      </div>

    </div>
  );
}