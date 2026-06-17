"use client";

import Image from "next/image";
import { Search, Star, MapPin, Trash2, Plus, Info, AlertCircle } from "lucide-react";
import { CTA } from "@/components/atoms";
import { WorkerSelector } from "./worker-selector";
import { ConfirmationModal } from "./confirmation-modal";
import { useStorehouseCreate, getToday, getMaxDate } from "./use-storehouse-create";
import { SIZES, COLORS } from "@/core/constants/variants";
import { useEffect } from "react";

export default function AdminStorehouseCreatePage() {
  const {
    router,
    authRole,
    prefill,
    selectedSupplierIds, toggleSupplier,
    workerId, setWorkerId,
    workers, loadingWorkers, selectedWorkerLabel,
    items, loading,
    supplierSearch, setSupplierSearch,
    imageError, setImageError,
    confirmation, setConfirmation,
    productInfo, filteredSuppliers, totalUnits,
    availableVariants, handleAddVariant,
    handleChangeItem, handleChangeItemUnitCost,
    handleCreate, closeConfirmation, confirmAndSubmit,
    handleRemoveItem,
  } = useStorehouseCreate();

  useEffect(() => {
  console.log("Datos del producto cargados:", productInfo);
  console.log("Items en la lista (Variantes):", items);
}, [productInfo, items]);

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-medium text-[#40202D] dark:text-white tracking-wide">
          Crear Orden de Pre-Compra
        </h1>
        <p className="text-sm font-medium text-[#8C6B79] dark:text-gray-300 mt-1">
          Gestión de reposición de inventario
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* COLUMNA IZQUIERDA: Información del Producto */}
        <aside className="space-y-6">
          <article className="overflow-hidden rounded-[32px] border border-[#EAE0E2] dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl shadow-sm">
            <div className="p-6 border-b border-[#EAE0E2] dark:border-white/10 bg-white/30 dark:bg-white/5">
               <h2 className="text-[13px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">
                 Información del Producto
               </h2>
            </div>
            
            <div className="p-6">
              <div className="relative h-56 w-full overflow-hidden rounded-[1.5rem] border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 shadow-inner">
                {productInfo.image && !imageError ? (
                  <Image
                    src={productInfo.image}
                    alt={productInfo.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Image src="/placeholder.png" alt="No image" width={100} height={100} className="opacity-50" />
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 mb-2">Producto Seleccionado</p>
                  <span className="inline-flex rounded-xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] px-4 py-1.5 text-[11px] font-medium tracking-widest text-white uppercase shadow-sm">
                    {productInfo.name || "Vestidos"}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-[#EAE0E2] dark:border-white/10 pb-3 text-[13px]">
                  <span className="font-bold text-[#8C6B79] dark:text-gray-400">Stock Actual</span>
                  <span className="flex items-center gap-1.5 font-medium text-[#D6405F] dark:text-[#F8BBD0]">
                    {productInfo.stockActual} <AlertCircle className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[#EAE0E2] dark:border-white/10 pb-3 text-[13px]">
                  <span className="font-bold text-[#8C6B79] dark:text-gray-400">Stock Mínimo</span>
                  <span className="font-medium text-[#40202D] dark:text-white">{productInfo.stockMinimo}</span>
                </div>

                {/* Sugerencia del Sistema */}
                <div className="rounded-2xl bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 p-5 shadow-inner">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-4 w-4 text-[#D6405F] dark:text-[#F8BBD0]" />
                    <p className="text-[11px] font-medium uppercase tracking-widest text-[#D6405F] dark:text-[#F8BBD0]">
                      Sugerencia del Sistema
                    </p>
                  </div>
                  <div className="space-y-3 text-[12px]">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#8C6B79] dark:text-gray-400">Unidades a Reponer</span>
                      <span className="font-medium text-[#40202D] dark:text-white">{productInfo.unidadesReponer}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#8C6B79] dark:text-gray-400">Ventas Promedio/Mes</span>
                      <span className="font-medium text-[#40202D] dark:text-white">{productInfo.ventasPromedio}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#8C6B79] dark:text-gray-400">Variantes Seleccionadas</span>
                      <span className="font-medium text-[#40202D] dark:text-white">{productInfo.variantes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
          
          <WorkerSelector
            workerId={workerId}
            onWorkerChange={setWorkerId}
            workers={workers}
            loadingWorkers={loadingWorkers}
            authRole={authRole}
            selectedWorkerLabel={selectedWorkerLabel}
          />
        </aside>

        {/* COLUMNA DERECHA: Proveedores y Variantes */}
        <main className="space-y-6">
          {/* Seleccionar Proveedor */}
          <article className="rounded-[32px] border border-[#EAE0E2] dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl p-6 md:p-8 shadow-sm transition-all">
            <header className="mb-6">
              <h2 className="text-[16px] font-medium text-[#40202D] dark:text-white tracking-wide">Seleccionar Proveedor</h2>
              <p className="text-[12px] font-medium text-[#8C6B79] dark:text-gray-400 mt-1">
                Elegir socio comercial más compatible para este pedido
              </p>
            </header>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C6B79] dark:text-gray-400" />
              <input
                type="text"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                placeholder="Buscar proveedor por nombre, ubicación o categoría..."
                className="h-14 w-full rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md pl-12 pr-4 text-[13px] font-medium text-[#40202D] dark:text-white placeholder:text-[#8C6B79] outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredSuppliers.map((s) => {
              const isSelected = selectedSupplierIds.includes(s._id);
              const rating = Math.max(1, Math.min(5, Math.round(Number(s.rating || 3))));
              
              return (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => toggleSupplier(s._id)}
                  className={`relative rounded-2xl border p-5 text-left transition-all shadow-sm group hover:scale-[1.02] ${
                    isSelected 
                      ? "border-[#D6405F] bg-white/80 dark:bg-white/10 ring-2 ring-[#D6405F]" 
                      : "border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md hover:border-[#8C6B79]/50"
                  }`}
                >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className={`text-[14px] font-medium tracking-wide ${isSelected ? "text-[#D6405F] dark:text-[#F8BBD0]" : "text-[#40202D] dark:text-white"}`}>{s.name_company}</p>
                        <span className="mt-1.5 inline-flex rounded-full bg-white/50 dark:bg-white/10 border border-[#EAE0E2] dark:border-white/10 px-3 py-1 text-[9px] font-medium text-[#8C6B79] dark:text-gray-400 uppercase tracking-widest shadow-sm">
                          {s.category?.name || "Ropa formal"}
                        </span>
                      </div>
                      <div className="flex gap-0.5 text-amber-400 bg-white/50 dark:bg-white/5 px-2 py-1 rounded-lg border border-[#EAE0E2] dark:border-white/10 shadow-inner">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < rating ? "fill-current" : "text-gray-300 dark:text-gray-600"}`} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-[11px] font-medium text-[#8C6B79] dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" /> {s.address || "San Isidro"}
                      </div>
                      <div className="flex justify-between items-center bg-white/30 dark:bg-white/5 p-2 rounded-xl border border-[#EAE0E2] dark:border-white/10">
                        <span>Último precio:</span>
                        <span className="font-medium text-[#40202D] dark:text-white">S/ {s.last_price || "42.50"}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/30 dark:bg-white/5 p-2 rounded-xl border border-[#EAE0E2] dark:border-white/10">
                        <span>Confiabilidad:</span>
                        <span className="font-medium text-emerald-500">Excelente</span>
                      </div>
                    </div>
                    <p className="mt-4 border-t border-[#EAE0E2] dark:border-white/10 pt-3 text-[11px] italic text-[#8C6B79] dark:text-gray-500">
                      "{s.description || "El mejor proveedor para vestidos"}"
                    </p>
                  </button>
                );
              })}
            </div>
          </article>

          {/* Variantes Solicitadas */}
          <article className="rounded-[32px] border border-[#EAE0E2] dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl p-6 md:p-8 shadow-sm">
            <h2 className="mb-6 text-[16px] font-medium text-[#40202D] dark:text-white tracking-wide">
              Variantes Solicitadas
            </h2>
            
            <div className="mb-4 grid grid-cols-12 gap-4 px-2 text-[10px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">
              <p className="col-span-4 lg:col-span-4">Talla</p>
              <p className="col-span-5 lg:col-span-5">Color</p>
              <p className="col-span-2 lg:col-span-2 text-center">Cant.</p>
            </div>

            <div className="space-y-4">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center gap-4 group">
                  <div className="col-span-4">
                    <select
                      value={it.size}
                      onChange={(e) => handleChangeItem(idx, "size", e.target.value)}
                      className="h-12 w-full rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all appearance-none"
                    >
                      {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-5">
                    <select
                      value={it.color}
                      onChange={(e) => handleChangeItem(idx, "color", e.target.value)}
                      className="h-12 w-full rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all appearance-none"
                    >
                      {COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={it.quantity}
                      onChange={(e) => handleChangeItem(idx, "quantity", Number(e.target.value))}
                      className="h-12 w-full rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-2 text-center text-[13px] font-medium text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(idx)}
                    className="col-span-1 flex justify-center text-[#8C6B79] hover:text-[#D6405F] dark:text-gray-500 dark:hover:text-[#F8BBD0] transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleAddVariant()}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#EAE0E2] dark:border-white/20 bg-white/30 dark:bg-white/5 text-[12px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 transition-all hover:bg-white/50 dark:hover:bg-white/10 hover:border-[#8C6B79] hover:text-[#40202D] dark:hover:text-white shadow-inner"
            >
              <Plus className="h-5 w-5" /> Agregar Variante (Sugerida)
            </button>

            <div className="mt-8 flex items-center justify-between rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 p-6 shadow-inner">
              <span className="text-[13px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">
                Total Solicitadas:
              </span>
              <span className="text-3xl font-medium text-[#40202D] dark:text-white">{totalUnits}</span>
            </div>

            <div className="mt-8 space-y-3">
              <label className="text-[10px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">
                Observaciones (opcional)
              </label>
              <textarea
                value={confirmation.notes}
                onChange={(e) => setConfirmation(c => ({ ...c, notes: e.target.value }))}
                placeholder="Notas adicionales sobre el pedido..."
                className="h-28 w-full resize-none rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md p-5 text-[13px] font-medium text-[#40202D] dark:text-white placeholder:text-[#8C6B79] outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all custom-scrollbar"
              />
            </div>

            <div className="mt-10 grid grid-cols-2 gap-5">
              <button
                onClick={() => router.push("/admin/storehouse")}
                className="h-14 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 text-[12px] font-medium uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#40202D] dark:hover:text-white shadow-sm"
              >
                Cancelar
              </button>
              <button
                disabled={loading || !items.length || selectedSupplierIds.length === 0}
                onClick={handleCreate}
                className="h-14 rounded-2xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-[12px] font-medium uppercase tracking-widest text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? "Procesando..." : "Crear Pre-Compra"}
              </button>
            </div>
          </article>
        </main>
      </div>

      <ConfirmationModal
        open={confirmation.open}
        onClose={closeConfirmation}
        title={prefill?.selectionTitle ? String(prefill.selectionTitle) : "Confirmar Orden de Pre-Compra"}
        items={items}
        confirmation={confirmation}
        onConfirmationChange={setConfirmation}
        onConfirm={confirmAndSubmit}
        loading={loading}
        totalUnits={totalUnits}
        onChangeItem={handleChangeItem}
        
        getToday={getToday}
      />
    </section>
  );
}
