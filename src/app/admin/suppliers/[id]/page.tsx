"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supplierApi } from "@api";
import { ArrowLeft, User, Phone, Mail, Building, MapPin, Truck, AlertTriangle } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center text-[#D6405F] dark:text-[#F8BBD0]">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#D6405F] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[13px] font-black uppercase tracking-widest text-[#8C6B79]">Cargando Ficha...</p>
          </div>
        ) : (
          "Proveedor no encontrado"
        )}
      </div>
    );
  }

  const { supplier, orders, incidences } = detail;
  const orderCount = orders?.length ?? 0;
  const incidencesCount = incidences?.length ?? 0;

  return (
    <main className="min-h-[calc(100vh-100px)] py-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#8C6B79] hover:text-[#D6405F] dark:text-gray-400 dark:hover:text-[#F8BBD0] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Regresar al Listado
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D6405F] to-[#F23B69] flex items-center justify-center text-white text-xl font-black shadow-inner">
                {supplier.name_company.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-wide text-[#40202D] dark:text-white">{supplier.name_company}</h1>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#8C6B79] dark:text-gray-400 mt-1">Ficha de Proveedor</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${supplier.status ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>
                {supplier.status ? "Activo" : "Inactivo"}
             </span>
             <CTA>Generar Reporte</CTA>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          
          {/* Card: Datos Generales */}
          <section className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-[#EAE0E2] dark:border-white/10 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#D6405F]/5 dark:bg-[#D6405F]/10 rounded-bl-[100px] -z-10" />
            <h2 className="text-[13px] font-black uppercase tracking-widest text-[#D6405F] dark:text-[#F8BBD0] flex items-center gap-2 mb-6">
              <Building className="w-5 h-5" /> Información de Contacto
            </h2>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-1 group">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Representante
                </p>
                <p className="text-[15px] font-bold text-[#40202D] dark:text-white">{supplier.contact_person}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> RUC Oficial
                </p>
                <p className="text-[15px] font-bold text-[#40202D] dark:text-white">{supplier.ruc}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Correo Electrónico
                </p>
                <p className="text-[15px] font-bold text-[#D6405F] dark:text-[#F8BBD0]">{supplier.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Teléfono
                </p>
                <p className="text-[15px] font-bold text-[#40202D] dark:text-white">{supplier.phone}</p>
              </div>
            </div>
          </section>

          {/* Card: Métricas */}
          <aside className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-[#EAE0E2] dark:border-white/10 shadow-sm flex flex-col justify-center">
            <h2 className="text-[13px] font-black uppercase tracking-widest text-[#D6405F] dark:text-[#F8BBD0] flex items-center gap-2 mb-6">
              Resumen Operativo
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-2xl p-5 text-center shadow-inner">
                <p className="text-4xl font-black text-[#40202D] dark:text-white">{orderCount}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 mt-2">Órdenes Totales</p>
              </div>
              <div className="bg-[#D6405F]/5 dark:bg-[#D6405F]/10 border border-[#D6405F]/20 rounded-2xl p-5 text-center shadow-inner">
                <p className="text-4xl font-black text-[#D6405F] dark:text-[#F8BBD0]">{incidencesCount}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400 mt-2">Incidencias</p>
              </div>
            </div>
          </aside>

        </div>

        {/* Tablas / Listados */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Historial de Órdenes */}
          <section className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-[#EAE0E2] dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[13px] font-black uppercase tracking-widest text-[#40202D] dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#D6405F] dark:text-[#F8BBD0]" /> Historial de Órdenes
              </h2>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <div key={index} className="bg-white/50 dark:bg-white/5 rounded-2xl border border-[#EAE0E2] dark:border-white/10 p-5 hover:border-[#D6405F]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-bold text-[#D6405F] dark:text-[#F8BBD0]">#{String(order["_id"] ?? order["id"] ?? `ORD-00${index + 1}`)}</p>
                        <p className="text-[11px] font-medium text-[#8C6B79] dark:text-gray-400 mt-1">{String(order["status"] ?? "Pendiente")} artículos</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-black text-[#40202D] dark:text-white">{`S/ ${String(order["total"] ?? order["amount"] ?? "0.00")}`}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C6B79] dark:text-gray-500 mt-1">{String(order["createdAt"] ?? order["date"] ?? "Sin fecha")}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/30 dark:bg-white/5 rounded-2xl border border-dashed border-[#EAE0E2] dark:border-white/20 p-8 text-center">
                  <Truck className="w-8 h-8 text-[#8C6B79]/50 mx-auto mb-3" />
                  <p className="text-[12px] font-bold text-[#8C6B79] dark:text-gray-500">No hay órdenes registradas.</p>
                </div>
              )}
            </div>
          </section>

          {/* Incidencias */}
          <section className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-[#EAE0E2] dark:border-white/10 shadow-sm">
             <div className="flex items-center justify-between mb-6">
              <h2 className="text-[13px] font-black uppercase tracking-widest text-[#40202D] dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D6405F] dark:text-[#F8BBD0]" /> Incidencias Reportadas
              </h2>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {incidences.length > 0 ? (
                incidences.map((incidence, index) => (
                  <div key={index} className="bg-[#D6405F]/5 dark:bg-[#D6405F]/10 rounded-2xl border border-[#D6405F]/20 p-5">
                    <p className="text-[14px] font-bold text-[#D6405F] dark:text-[#F8BBD0] mb-1">{String(incidence["title"] ?? `Incidencia ${index + 1}`)}</p>
                    <p className="text-[12px] font-medium text-[#40202D] dark:text-gray-300 leading-relaxed">{String(incidence["description"] ?? "Sin descripción reportada para esta incidencia.")}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white/30 dark:bg-white/5 rounded-2xl border border-dashed border-[#EAE0E2] dark:border-white/20 p-8 text-center">
                  <AlertTriangle className="w-8 h-8 text-[#8C6B79]/50 mx-auto mb-3" />
                  <p className="text-[12px] font-bold text-[#8C6B79] dark:text-gray-500">Proveedor excelente, sin incidencias.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
