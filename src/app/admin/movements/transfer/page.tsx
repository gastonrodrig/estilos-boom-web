"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStorehouseStore } from "@/hooks";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import toast from "react-hot-toast";

// IDs reales de los almacenes — deben coincidir con los sembrados en /inventory/warehouses/seed
const ALMACEN_CENTRAL_CODE = "ALM-CEN";
const TIENDA_PRINCIPAL_CODE = "TND-PRI";

export default function CreateTransferWizard() {
  const router = useRouter();
  const { startCreateWarehouseDocument, startLoadingWarehouses, loading } = useStorehouseStore();

  const [itemsToProcess, setItemsToProcess] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [warehouses, setWarehouses] = useState<any[]>([]);

  // Cargar almacenes al montar para obtener sus IDs reales
  useEffect(() => {
    const loadWarehouses = async () => {
      const data = await startLoadingWarehouses();
      if (Array.isArray(data)) setWarehouses(data);
    };
    void loadWarehouses();
  }, [startLoadingWarehouses]);

  useEffect(() => {
    const raw = localStorage.getItem("estilos_boom_pending_transfer");
    if (!raw) {
      toast.error("No hay productos seleccionados para mover.");
      router.push("/admin/movements/stock");
      return;
    }
    setItemsToProcess(Object.values(JSON.parse(raw)));
  }, [router]);

  if (itemsToProcess.length === 0) return null;

  const currentProduct = itemsToProcess[currentIndex];

  const handleUpdateQty = (variantId: string, value: number, isRelative = false) => {
    setQuantities((prev) => {
      const currentQty = prev[variantId] || 0;
      const targetQty = isRelative ? currentQty + value : value;
      return { ...prev, [variantId]: Math.max(0, targetQty) };
    });
  };

  const handleFinalizeTransfer = async () => {
    // Estructura de items según CreateWarehouseDocumentDto
    const transferItems = itemsToProcess
      .flatMap((prod) =>
        prod.variants.map((v: any) => ({
          id_variant: v._id,
          quantity_expected: quantities[v._id] || 0,
        }))
      )
      .filter((item) => item.quantity_expected > 0);

    if (transferItems.length === 0) {
      toast.error("Debes asignar al menos una cantidad mayor a 0 para trasladar.");
      return;
    }

    // Buscar IDs reales de almacenes desde los datos cargados
    const sourceWarehouse = warehouses.find((w) => w.code === ALMACEN_CENTRAL_CODE);
    const targetWarehouse = warehouses.find((w) => w.code === TIENDA_PRINCIPAL_CODE);

    if (!sourceWarehouse || !targetWarehouse) {
      toast.error(
        "No se encontraron los almacenes. Verifica que estén sembrados en /inventory/warehouses/seed."
      );
      return;
    }

    // ID del trabajador — en producción leer del estado de auth
    const senderId =
      (typeof window !== "undefined"
        ? localStorage.getItem("worker_id") ?? ""
        : "") || "000000000000000000000001";

    const docNumber = `TR-${Date.now().toString().slice(-8)}`;

    const created = await startCreateWarehouseDocument({
      document_number: docNumber,
      type: "TRANSFERENCIA",
      id_source_warehouse: sourceWarehouse._id,
      id_target_warehouse: targetWarehouse._id,
      id_sender_worker: senderId,
      notes: "Transferencia de almacén central a tienda generada desde el SGI.",
      items: transferItems,
    });

    if (created) {
      localStorage.removeItem("estilos_boom_pending_transfer");
      router.push("/admin/movements");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 text-[#594246] flex flex-col justify-between">
      {/* HEADER WIZARD */}
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-xs opacity-50 font-bold"
          >
            <ArrowLeft size={14} /> Volver
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

      {/* CUERPO */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 items-start my-auto">
        {/* Ficha del producto */}
        <div className="md:col-span-5 bg-white border border-[#EBEAE8] p-6 rounded-2xl shadow-sm text-center">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 border mb-4">
            <img src={currentProduct.image} className="w-full h-full object-cover" alt={currentProduct.name} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-800">{currentProduct.name}</h2>
          <span className="inline-block mt-1 px-3 py-1 bg-rose-50 text-[#F2778D] rounded-full text-xs font-bold">
            {currentProduct.category}
          </span>
        </div>

        {/* Variantes con cantidades */}
        <div className="md:col-span-7 bg-white border border-[#EBEAE8] p-6 rounded-2xl shadow-sm space-y-6 max-h-[500px] overflow-y-auto">
          <h3 className="font-bold text-sm uppercase opacity-40 tracking-wider">Variantes del producto</h3>

          {currentProduct.variants?.map((v: any) => {
            // El stock disponible real viene de WarehouseStock (cargado por el Stock page).
            // El wizard recibe los datos del localStorage donde se guardó max_available.
            const stockDisponible = v.max_available ?? v.stock ?? 0;

            return (
              <div key={v._id} className="border-b pb-4 last:border-none space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: v.color?.hex }}
                  />
                  <span>
                    {v.size} • {v.color?.name}
                  </span>
                  <span className="text-[11px] font-mono opacity-30 ml-auto">
                    ({v.sku_variant})
                  </span>
                </div>
                <p className="text-xs text-gray-400 italic font-medium">
                  Disponible:{" "}
                  <span className="font-bold text-[#594246]">{stockDisponible}</span> en almacén
                </p>
                <div className="flex gap-2 items-center pt-1">
                  <input
                    type="number"
                    className="w-full p-2.5 bg-[#FAF9F6] border rounded-lg text-sm text-center font-bold outline-none focus:border-[#F2B6C1]"
                    placeholder="Cantidad"
                    min={0}
                    max={stockDisponible}
                    value={quantities[v._id] || ""}
                    onChange={(e) => {
                      const val = Math.min(stockDisponible, Math.max(0, Number(e.target.value)));
                      handleUpdateQty(v._id, val, false);
                    }}
                  />
                  {[1, 5, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        handleUpdateQty(
                          v._id,
                          Math.min(n, stockDisponible - (quantities[v._id] || 0)),
                          true
                        )
                      }
                      className="px-3 py-2 bg-[#FAF9F6] text-xs font-bold rounded-lg border hover:bg-white"
                    >
                      +{n}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER WIZARD */}
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center border-t pt-4 mt-6">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          className="px-5 py-2 text-sm font-bold border rounded-xl hover:bg-white disabled:opacity-20 transition-all flex items-center gap-1"
        >
          🡨 Anterior
        </button>

        {currentIndex < itemsToProcess.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            className="px-6 py-2 bg-[#594246] hover:bg-black text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-1 shadow-md"
          >
            Siguiente producto <ArrowRight size={16} />
          </button>
        ) : (
          <button
            disabled={loading}
            onClick={handleFinalizeTransfer}
            className="px-8 py-2.5 bg-[#F2778D] hover:bg-[#d65c72] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-rose-100"
          >
            <Save size={16} />{" "}
            {loading ? "Procesando envío..." : "Finalizar y crear documento de traslado"}
          </button>
        )}
      </div>
    </div>
  );
}
