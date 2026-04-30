"use client";

import Image from "next/image";
import { CTA } from "@components";
import { WorkerSelector } from "./worker-selector";
import { ConfirmationModal } from "./confirmation-modal";
import { useStorehouseCreate, getToday, getMaxDate } from "./use-storehouse-create";
import { SIZES, COLORS } from "@/core/constants/variants";

export default function AdminStorehouseCreatePage() {
  const {
    router,
    authRole,
    prefill,
    supplierId, setSupplierId,
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
  } = useStorehouseCreate();

  return (
    <section className="space-y-4  ">
      <header className="rounded-2xl border border-[#f2b6c1]/60 bg-[#fffafb] p-4 shadow-sm max-w-[60%] mx-auto">
        <h1 className="font-(--font-vidaloka) text-3xl text-[#594246]">Crear Abastecimiento</h1>
        <p className="text-xs text-[#8f7a82]">Gestión de reposición de inventario</p>
      </header>

      <div className="grid gap-2 xl:grid-cols-1 max-w-[60%] mx-auto">
        {/* Product Info Card */}
        <article className="rounded-2xl border border-[#f2b6c1]/70 bg-white p-4">
          <p className="text-sm font-semibold text-[#594246]">Información del Producto</p>
          <div className="mt-3 overflow-hidden rounded-xl border border-[#f4d2d9] bg-[#fff6f8]">
            {productInfo.image && !imageError ? (
              <Image
                src={productInfo.image}
                alt={productInfo.name}
                width={500}
                height={128}
                className="h-32 w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="h-32 w-full bg-linear-to-r from-[#f4d9de] via-[#fbeef1] to-[#f4d9de]" />
            )}
            <div className="space-y-1 px-3 py-2 text-xs text-[#715f66]">
              <p className="font-medium text-[#594246]">{productInfo.name}</p>
              <p>Stock Actual <span className="float-right font-semibold text-[#d06d84]">{productInfo.stockActual}</span></p>
              <p>Stock Mínimo <span className="float-right font-semibold text-[#d06d84]">{productInfo.stockMinimo}</span></p>
              <div className="mt-2 rounded-md border border-[#f3c6d1] bg-[#fdeef2] p-2">
                <p className="text-[#d06d84]">Sugerencia del Sistema</p>
                <p>Unidades a Reponer <span className="float-right font-semibold text-[#d06d84]">{productInfo.unidadesReponer}</span></p>
                <p>Ventas Promedio/Mes <span className="float-right font-semibold text-[#d06d84]">{productInfo.ventasPromedio}</span></p>
                <p>Variantes Seleccionadas <span className="float-right font-semibold text-[#d06d84]">{productInfo.variantes}</span></p>
              </div>
            </div>
          </div>
        </article>

        {/* Supplier Selector Card */}
        <article className="rounded-2xl border border-[#f2b6c1]/70 bg-white p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#594246]">Seleccionar Proveedor</p>
              <p className="text-[11px] text-[#9e8a91]">Elegir socio comercial más compatible para este pedido</p>
            </div>
          </div>
          <div className="mt-3">
            <input
              type="text"
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              placeholder="Buscar proveedor por nombre, ubicación o categoría..."
              className="h-10 w-full rounded-lg border border-[#f2b6c1] px-3 text-sm text-[#594246] outline-none"
            />
          </div>
          <div className="mt-3 grid max-h-52 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {filteredSuppliers.map((s) => {
              const isSelected = supplierId === s._id;
              const stars = "*".repeat(Math.max(1, Math.min(5, Math.round(Number(s.rating || 3)))));
              return (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => setSupplierId(s._id)}
                  className={`rounded-lg border p-3 text-left transition ${isSelected ? "border-[#d35f80] bg-[#fff1f5]" : "border-[#f0d3da] bg-white hover:bg-[#fff7f9]"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[#594246]">{s.name_company}</p>
                    <p className="text-[10px] text-[#d06d84]">{stars}</p>
                  </div>
                  <p className="mt-2 inline-flex rounded-sm bg-[#f7ccd7] px-1.5 py-0.5 text-[10px] text-[#b54867]">
                    {s.contact_person || "Proveedor"}
                  </p>
                  <p className="mt-1 text-[11px] text-[#7c6770]">{s.address || "Sin dirección registrada"}</p>
                  <p className="mt-1 text-[10px] text-[#9a848d]">RUC: {s.ruc || "-"}</p>
                </button>
              );
            })}
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

        {/* Variants Requested Card */}
        <article className="rounded-2xl border border-[#f2b6c1]/70 bg-[#fff7f9] p-4">
          <p className="text-sm font-semibold text-[#594246]">Variantes Solicitadas</p>
          <div className="mt-3 grid grid-cols-12 gap-2 text-xs font-semibold text-[#8d7079]">
            <p className="col-span-4">Talla</p>
            <p className="col-span-4">Color general</p>
            <p className="col-span-4">Cantidad</p>
          </div>
          <div className="mt-2 space-y-2">
            {items.map((it, idx) => (
              <div key={`${it.id_variant}-${idx}`} className="grid grid-cols-12 gap-2">
                {/* SELECTOR DE TALLA */}
                <div className="col-span-4">
                  <select
                    value={it.size}
                    onChange={(e) => handleChangeItem(idx, "size", e.target.value)}
                    className="h-10 w-full rounded-lg border border-[#f2b6c1] bg-white px-3 text-sm text-[#594246] outline-none"
                  >
                    <option value="" disabled>Seleccionar...</option>
                    {SIZES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* SELECTOR DE COLOR */}
                <div className="col-span-4">
                  <select
                    value={it.color}
                    onChange={(e) => handleChangeItem(idx, "color", e.target.value)}
                    className="h-10 w-full rounded-lg border border-[#f2b6c1] bg-white px-3 text-sm text-[#594246] outline-none"
                  >
                    <option value="" disabled>Seleccionar...</option>
                    {COLORS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* INPUT DE CANTIDAD */}
                <div className="col-span-4">
                  <input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) => handleChangeItem(idx, "quantity", Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-[#f2b6c1] bg-white px-3 text-sm text-[#594246] outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* DESPLEGABLE Y BOTÓN PARA AGREGAR VARIANTES */}
          <div className="mt-4 flex flex-col gap-2 border-t border-[#f2b6c1]/50 pt-4">
            {availableVariants?.length > 0 && (
              <select
                className="h-10 w-full rounded-lg border border-[#d06d84] bg-white px-3 text-sm text-[#594246] outline-none"
                onChange={(e) => {
                  if (e.target.value) handleAddVariant(e.target.value);
                  e.target.value = ""; 
                }}
                defaultValue=""
              >
                <option value="" disabled>+ Agregar de las variantes registradas...</option>
                {availableVariants.map((v: { id_variant: string; size: string; color: string }) => (
                  <option key={v.id_variant} value={v.id_variant}>
                    Talla: {v.size || "-"} | Color: {v.color || "-"}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => handleAddVariant("NEW_VARIANT")}
              className="h-10 w-full rounded-lg border border-dashed border-[#d06d84] bg-[#fff0f4] px-3 text-sm font-medium text-[#d06d84] transition hover:bg-[#ffe3ea]"
            >
              + Añadir una nueva variante desde cero
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-[#f2b6c1] bg-white px-3 py-2 text-sm text-[#594246]">
            <p className="font-semibold">Total Unidades Solicitadas: <span className="float-right text-[#d06d84]">{totalUnits}</span></p>
          </div>

          {/* FECHA Y OBSERVACIONES */}
          <div className="mt-6 space-y-4 border-t border-[#f2b6c1]/50 pt-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8d7079]">Fecha Límite de Entrega (Máx 1 semana)</label>
              <input
                type="date"
                min={getToday()}
                max={getMaxDate()}
                value={confirmation.deliveryDate}
                onChange={(e) => setConfirmation(c => ({ ...c, deliveryDate: e.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-[#f2b6c1] bg-white px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8d7079]">
                Observaciones adicionales
              </label>
              <textarea
                value={confirmation.notes}
                onChange={(e) => setConfirmation(c => ({ ...c, notes: e.target.value }))}
                placeholder="Ej. El color azul que sea tipo jazmín, cuidado con las costuras..."
                className="mt-1 h-20 w-full resize-none rounded-lg border border-[#f2b6c1] bg-white p-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <CTA onClick={() => router.push("/admin/storehouse")} className="border border-[#f2b6c1] bg-white text-[#594246]">Cancelar</CTA>
            <CTA onClick={handleCreate} disabled={loading || !items.length || !supplierId}>{loading ? "Guardando..." : "Crear Abastecimiento"}</CTA>
          </div>
        </article>

        <ConfirmationModal
          open={confirmation.open}
          onClose={closeConfirmation}
          title={prefill?.selectionTitle ? String(prefill.selectionTitle) : "Confirmar Abastecimiento"}
          items={items}
          confirmation={confirmation}
          onConfirmationChange={setConfirmation}
          onConfirm={confirmAndSubmit}
          loading={loading}
          totalUnits={totalUnits}
          onChangeItem={handleChangeItem}
          onChangeItemUnitCost={handleChangeItemUnitCost}
          getToday={getToday}
        />
      </div>
    </section>
  );
}