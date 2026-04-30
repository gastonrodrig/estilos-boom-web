"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supplierApi } from "@api";
import { ArrowLeft } from "lucide-react";
import { CTA } from "@/components/atoms";

type SupplierDetailResponse = {
  supplier: {
    _id: string;
    name_company: string;
    contact_person: string;
    email: string;
    phone: string;
    ruc: string;
    status: boolean;
    rating?: number;
    on_time_delivery_rate?: number;
  };
  orders: Array<Record<string, unknown>>;
  incidences: Array<Record<string, unknown>>;
};

export default function SupplierDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [detail, setDetail] = useState<SupplierDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data } = await supplierApi.get(`/${id}/ficha`);
        setDetail(data);
      } catch (error) {
        console.error("Error loading supplier detail", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-500">
        {loading ? "Cargando ficha de proveedor..." : "Proveedor no encontrado"}
      </div>
    );
  }

  const { supplier, orders, incidences } = detail;
  const orderCount = orders?.length ?? 0;
  const incidencesCount = incidences?.length ?? 0;

  return (
    <main className="min-h-screen bg-[#FAF9F6] py-6">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Ficha detallada</p>
            <h1 className="text-2xl font-semibold text-slate-900">{supplier.name_company}</h1>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Datos generales</p>
                <h2 className="text-xl font-semibold text-slate-900">Proveedor</h2>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${supplier.status ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {supplier.status ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-[#fcf2f5] p-4">
                <p className="text-sm text-gray-500">Contacto principal</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{supplier.contact_person}</p>
              </div>
              <div className="rounded-3xl bg-[#f6f5ff] p-4">
                <p className="text-sm text-gray-500">RUC</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{supplier.ruc}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Correo</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{supplier.email}</p>
              </div>
              <div className="rounded-3xl border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{supplier.phone}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-[#fdefec] p-4">
                <p className="text-sm text-gray-500">Rating</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{supplier.rating ?? "-"}</p>
              </div>
              <div className="rounded-3xl bg-[#f2f7ff] p-4">
                <p className="text-sm text-gray-500">Entrega a tiempo</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{supplier.on_time_delivery_rate ?? "-"}%</p>
              </div>
              <div className="rounded-3xl border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Órdenes registradas</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{orderCount}</p>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Resumen rápido</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-3xl bg-[#fef6f4] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Órdenes</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{orderCount}</p>
                </div>
                <div className="rounded-3xl bg-[#f4faf7] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Incidencias</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{incidencesCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Acciones</p>
              <div className="mt-4 space-y-3">
                <CTA onClick={() => router.back()}>Volver a proveedores</CTA>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Historial de órdenes</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">Órdenes recientes</h2>
              </div>
              <span className="text-xs text-gray-400">{orderCount} ordenes</span>
            </div>

            <div className="mt-5 space-y-4">
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <div key={index} className="rounded-3xl border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Orden #{String(order["_id"] ?? order["id"] ?? index + 1)}</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{String(order["status"] ?? "Pendiente")}</p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{`Total: S/ ${String(order["total"] ?? order["amount"] ?? "-" )}`}</p>
                      <p>{`Fecha: ${String(order["createdAt"] ?? order["date"] ?? "-" )}`}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  No hay órdenes registradas para este proveedor.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Incidencias</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">Seguimiento</h2>
              </div>
              <span className="text-xs text-gray-400">{incidencesCount} registros</span>
            </div>

            <div className="mt-5 space-y-4">
              {incidences.length > 0 ? (
                incidences.map((incidence, index) => (
                  <div key={index} className="rounded-3xl border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-slate-900">{String(incidence["title"] ?? `Incidencia ${index + 1}`)}</p>
                    <p className="mt-2 text-sm text-gray-600">{String(incidence["description"] ?? "Sin descripción")}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  No se encontraron incidencias para este proveedor.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
