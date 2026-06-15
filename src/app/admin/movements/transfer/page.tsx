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
  // Dirección leída del localStorage (guardada por el Stock page)
  const [direction, setDirection] = useState<"to-store" | "to-warehouse">("to-store");

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
    // Leer dirección guardada por el Stock page
    const dir = localStorage.getItem("estilos_boom_transfer_direction");
    if (dir === "to-warehouse") setDirection("to-warehouse");
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
    const almacenCentral = warehouses.find((w) => w.code === ALMACEN_CENTRAL_CODE);
    const tiendaPrincipal = warehouses.find((w) => w.code === TIENDA_PRINCIPAL_CODE);

    if (!almacenCentral || !tiendaPrincipal) {
      toast.error(
        "No se encontraron los almacenes. Verifica que estén sembrados en /inventory/warehouses/seed."
      );
      return;
    }

    // Dirección: quién es origen y quién es destino
    const sourceWarehouse = direction === "to-store" ? almacenCentral : tiendaPrincipal;
    const targetWarehouse = direction === "to-store" ? tiendaPrincipal : almacenCentral;
    const dirLabel = direction === "to-store" ? "Almacén Central → Tienda Principal" : "Tienda Principal → Almacén Central";

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
      notes: `Transferencia ${dirLabel} generada desde el SGI.`,
      items: transferItems,
    });

    if (created) {
      localStorage.removeItem("estilos_boom_pending_transfer");
      localStorage.removeItem("estilos_boom_transfer_direction");
      router.push("/admin/movements");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 text-[#594246] flex flex-col justify-between">
      {/* HEADER WIZARD */}
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center mb-8 bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-xs opacity-50 font-bold"
          >
            <ArrowLeft size={14} /> Volver
          </button>
          <h1 className="text-3xl font-medium mt-3 tracking-wide drop-shadow-sm">Crear orden de movimiento</h1>
          <p className="text-xs text-[#D6405F] dark:text-[#F8BBD0] font-medium mt-2 uppercase tracking-widest bg-[#D6405F]/10 dark:bg-[#F8BBD0]/10 px-3 py-1 rounded-full w-fit border border-[#D6405F]/20 dark:border-[#F8BBD0]/20">
            Producto {currentIndex + 1} de {itemsToProcess.length}
          </p>
        </div>
        <span className="px-4 py-2 bg-rose-50 text-[#F2778D] font-medium text-xs rounded-full uppercase tracking-wider">
          {direction === "to-store" ? "Almacén → Tienda" : "Tienda → Almacén"}
        </span>
      </div>

      {/* CUERPO */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 items-start my-auto">
        {/* Ficha del producto */}
        <div className="md:col-span-5 bg-white dark:bg-zinc-900 border border-[#EBEAE8] p-6 rounded-2xl shadow-sm text-center">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-800 border mb-4">
            <img src={currentProduct.image} className="w-full h-full object-cover" alt={currentProduct.name} />
          </div>
          <h2 className="text-2xl font-medium text-[#40202D] dark:text-white tracking-wide">{currentProduct.name}</h2>
          <span className="inline-block mt-3 px-4 py-1.5 bg-white/50 dark:bg-white/10 text-[#D6405F] dark:text-[#F8BBD0] rounded-full text-xs font-bold uppercase tracking-wider border border-[#EAE0E2] dark:border-white/20 shadow-sm">
            {currentProduct.category}
          </span>
        </div>

        {/* Variantes con cantidades */}
        <div className="md:col-span-7 bg-white dark:bg-zinc-900 border border-[#EBEAE8] p-6 rounded-2xl shadow-sm space-y-6 max-h-[500px] overflow-y-auto">
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
          <ArrowLeft size={16}/> Anterior
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
            className="px-8 py-3 bg-gradient-to-r from-[#D6405F] to-[#F23B69] hover:from-[#F23B69] hover:to-[#D6405F] dark:from-[#F8BBD0] dark:to-[#F48FB1] dark:hover:from-[#F48FB1] dark:hover:to-[#F8BBD0] text-white dark:text-[#1A0B11] text-sm font-bold rounded-2xl transition-all flex items-center gap-2 shadow-[0_8px_20px_rgba(214,64,95,0.3)] dark:shadow-[0_8px_20px_rgba(248,187,208,0.3)] hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
          >
            <Save size={16} />{" "}
            {loading ? "Procesando envío..." : "Finalizar y crear documento de traslado"}
          </button>
        )}
      </div>
    </div>
  );
}
