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
    <main className="min-h-screen bg-[#fafaf9] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Ficha detallada</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{supplier.name_company}</h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <section className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between gap-4 mb-6">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-600">Datos generales</p>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${supplier.status ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                {supplier.status ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 mb-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Contacto principal</p>
                <p className="text-base font-semibold text-slate-900">{supplier.contact_person}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">RUC</p>
                <p className="text-base font-semibold text-slate-900">{supplier.ruc}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Correo</p>
                <p className="text-base font-semibold text-slate-900">{supplier.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Teléfono</p>
                <p className="text-base font-semibold text-slate-900">{supplier.phone}</p>
              </div>
            </div>
          </section>

          <aside className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-600 mb-5">Resumen rápido</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Órdenes</p>
                <p className="text-3xl font-semibold text-slate-900">{orderCount}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Incidencias</p>
                <p className="text-3xl font-semibold text-slate-900">{incidencesCount}</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Historial de órdenes</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">Órdenes recientes</h2>
              </div>
              <span className="text-xs text-gray-400">{orderCount} órdenes</span>
            </div>

            <div className="space-y-3">
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Orden #{String(order["_id"] ?? order["id"] ?? index + 1)}</p>
                        <p className="mt-1 text-xs text-gray-500">{String(order["status"] ?? "Pendiente")} artículos</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{`S/ ${String(order["total"] ?? order["amount"] ?? "-")}`}</p>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">{`Fecha: ${String(order["createdAt"] ?? order["date"] ?? "-")}`}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  No hay órdenes registradas para este proveedor.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Incidencias</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">Seguimiento</h2>
              </div>
              <span className="text-xs text-gray-400">{incidencesCount} registros</span>
            </div>

            <div className="space-y-3">
              {incidences.length > 0 ? (
                incidences.map((incidence, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{String(incidence["title"] ?? `Incidencia ${index + 1}`)}</p>
                        <p className="mt-1 text-sm text-gray-600">{String(incidence["description"] ?? "Sin descripción")}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
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
