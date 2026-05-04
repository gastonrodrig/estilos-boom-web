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

  useEffect
  (() => {
    console.log("Prefill data:", filteredSuppliers);
  }, [filteredSuppliers]);

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <header>
        <h1 className="font-(--font-vidaloka) text-3xl text-[#594246]">Crear Orden de Pre-Compra</h1>
        <p className="text-sm text-[#9b8088]">Gestión de reposición de inventario</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* COLUMNA IZQUIERDA: Información del Producto */}
        <aside className="space-y-6">
          <article className="overflow-hidden rounded-2xl border border-[#f2b6c1]/70 bg-white shadow-sm">
            <div className="p-4 border-b border-rose-50">
               <h2 className="text-sm font-bold text-[#594246]">Información del Producto</h2>
            </div>
            
            <div className="p-4">
              <div className="relative h-48 w-full overflow-hidden rounded-xl bg-rose-50">
                {productInfo.image && !imageError ? (
                  <Image
                    src={productInfo.image}
                    alt={productInfo.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-rose-100">
                    <Image src="/placeholder.png" alt="No image" width={100} height={100} />
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#b79ca5]">Producto Seleccionado</p>
                  <span className="mt-1 inline-block rounded-md bg-[#F2778D] px-2 py-0.5 text-xs font-bold text-white uppercase">
                    {productInfo.name || "Vestidos"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-rose-50 pb-2 text-sm">
                  <span className="text-[#9b8088]">Stock Actual</span>
                  <span className="flex items-center gap-1 font-bold text-[#F2778D]">
                    {productInfo.stockActual} <AlertCircle className="h-3 w-3" />
                  </span>
                </div>
                <div className="flex justify-between border-b border-rose-50 pb-2 text-sm">
                  <span className="text-[#9b8088]">Stock Mínimo</span>
                  <span className="font-bold text-[#594246]">{productInfo.stockMinimo}</span>
                </div>

                {/* Sugerencia del Sistema */}
                <div className="rounded-xl bg-[#F2D0D3]/40 p-4">
                  <div className="flex items-center gap-2 text-[#d06d84]">
                    <Info className="h-4 w-4" />
                    <p className="text-xs font-bold uppercase tracking-tight">Sugerencia del Sistema</p>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8d7079]">Unidades a Reponer</span>
                      <span className="font-bold text-[#F2778D]">{productInfo.unidadesReponer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8d7079]">Ventas Promedio/Mes</span>
                      <span className="font-bold text-[#F2778D]">{productInfo.ventasPromedio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8d7079]">Variantes Seleccionadas</span>
                      <span className="font-bold text-[#F2778D]">{productInfo.variantes}</span>
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
          <article className="rounded-2xl border border-[#f2b6c1]/70 bg-white p-6 shadow-sm">
            <header className="mb-4">
              <h2 className="text-base font-bold text-[#594246]">Seleccionar Proveedor</h2>
              <p className="text-xs text-[#9e8a91]">Elegir socio comercial más compatible para este pedido</p>
            </header>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b79ca5]" />
              <input
                type="text"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                placeholder="Buscar proveedor por nombre, ubicación o categoría..."
                className="h-11 w-full rounded-xl border border-rose-100 bg-rose-50/30 pl-10 pr-4 text-sm outline-none ring-[#F2778D] focus:ring-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredSuppliers.map((s) => {
              // Ahora verificamos si el ID está en la lista de seleccionados
              const isSelected = selectedSupplierIds.includes(s._id);
              const rating = Math.max(1, Math.min(5, Math.round(Number(s.rating || 3))));
              
              return (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => toggleSupplier(s._id)} // toggle en lugar de set fijo
                  className={`relative rounded-2xl border p-4 text-left transition-all ${
                    isSelected 
                      ? "border-[#F2778D] bg-rose-50 ring-1 ring-[#F2778D]" 
                      : "border-rose-100 bg-white hover:border-rose-300"
                  }`}
                >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#594246]">{s.name_company}</p>
                        <span className="mt-1 inline-block rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-[#F2778D] uppercase">
                          {s.category?.name || "Ropa formal"}
                        </span>
                      </div>
                      <div className="flex gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < rating ? "fill-current" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-1 text-[#9b8088]">
                        <MapPin className="h-3 w-3" /> {s.address || "San Isidro"}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9b8088]">Último precio:</span>
                        <span className="font-bold text-[#F2778D]">S/ {s.last_price || "42.50"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9b8088]">Confiabilidad:</span>
                        <span className="font-bold text-emerald-500">Excelente</span>
                      </div>
                    </div>
                    <p className="mt-3 border-t border-rose-50 pt-2 text-[11px] italic text-[#9e8a91]">
                      "{s.description || "El mejor proveedor para vestidos"}"
                    </p>
                  </button>
                );
              })}
            </div>
          </article>

          {/* Variantes Solicitadas */}
          <article className="rounded-2xl border border-[#f2b6c1]/70 bg-[#F2D0D3]/20 p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#594246]">Variantes Solicitadas</h2>
            
            <div className="mb-3 grid grid-cols-12 gap-4 px-2 text-[10px] font-bold uppercase tracking-wider text-[#9b8088]">
              <p className="col-span-4 lg:col-span-4">Talla</p>
              <p className="col-span-5 lg:col-span-5">Color</p>
              <p className="col-span-2 lg:col-span-2">Cantidad</p>
            </div>

            <div className="space-y-3">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-4">
                    <select
                      value={it.size}
                      onChange={(e) => handleChangeItem(idx, "size", e.target.value)}
                      className="h-11 w-full rounded-xl border border-rose-100 bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-[#F2778D]"
                    >
                      {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-5">
                    <select
                      value={it.color}
                      onChange={(e) => handleChangeItem(idx, "color", e.target.value)}
                      className="h-11 w-full rounded-xl border border-rose-100 bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-[#F2778D]"
                    >
                      {COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={it.quantity}
                      onChange={(e) => handleChangeItem(idx, "quantity", Number(e.target.value))}
                      className="h-11 w-full rounded-xl border border-rose-100 bg-white px-3 text-center text-sm font-bold outline-none focus:ring-1 focus:ring-[#F2778D]"
                    />
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(idx)}
                    className="col-span-1 flex justify-center text-rose-300 hover:text-rose-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleAddVariant()}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#F2778D]/30 bg-white/50 text-sm font-bold text-[#F2778D] transition-all hover:bg-white"
            >
              <Plus className="h-4 w-4" /> Agregar Variante (Sugerida automáticamente)
            </button>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-[#F2778D]/30 bg-white p-4">
              <span className="text-sm font-bold text-[#594246]">Total Unidades Solicitadas:</span>
              <span className="text-2xl font-black text-[#F2778D]">{totalUnits}</span>
            </div>

            <div className="mt-6 space-y-2">
              <label className="text-xs font-bold text-[#594246]">Observaciones (opcional)</label>
              <textarea
                value={confirmation.notes}
                onChange={(e) => setConfirmation(c => ({ ...c, notes: e.target.value }))}
                placeholder="Notas adicionales sobre el pedido..."
                className="h-24 w-full resize-none rounded-xl border border-rose-100 bg-white p-4 text-sm outline-none focus:ring-1 focus:ring-[#F2778D]"
              />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/admin/storehouse")}
                className="h-12 rounded-xl border border-[#F2778D] bg-rose-50 font-bold text-[#F2778D] transition-colors hover:bg-rose-100"
              >
                Cancelar
              </button>
              <button
                disabled={loading || !items.length || selectedSupplierIds.length === 0}
                onClick={handleCreate}
                className="h-12 rounded-xl bg-[#F2778D] font-bold text-white shadow-lg disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Crear Orden de Pre-Compra"}
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