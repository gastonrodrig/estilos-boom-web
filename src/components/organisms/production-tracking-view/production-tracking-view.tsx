"use client";

import { useEffect, useRef } from "react";
import { Activity, ArrowLeft, CheckCircle2, ClipboardCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  TrackingOrder,
  ChatMessage,
  ProductionBaseItem,
} from "@/components/organisms/production-tracking-view";

interface ProductionTrackingViewOrder extends TrackingOrder {
  pre_order_number?: string;
  workshopName?: string;
}

interface ProductionTrackingViewProps {
  order: ProductionTrackingViewOrder;
  onBack: () => void;
  onApproveQuality?: (id: string) => Promise<void>;
}

export function ProductionTrackingView({
  order,
  onBack,
  onApproveQuality,
}: ProductionTrackingViewProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [order.chatHistory]);

  const totalExpected =
    order.base_items?.reduce(
      (acc: number, item: ProductionBaseItem) => acc + item.quantity,
      0
    ) || 0;

  const unitsReady = order.progress?.unidadesListas || 0;

  const progressPercent =
    totalExpected > 0
      ? Math.min(100, Math.round((unitsReady / totalExpected) * 100))
      : 0;

  const isReadyForQuality =
    order.status === "CONTROL_CALIDAD" ||
    order.status === "COMPLETADA" ||
    order.botState === "COMPLETED";

  const orderCode =
    order.order_number || order.pre_order_number || "Orden sin numero";

  const workshopName = order.workshopName || "Taller asignado";

  return (
    <section className="min-h-screen bg-[#fdfcfc]">
      <header className="border-b border-rose-100 bg-white px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm font-bold text-[#594246] transition-colors hover:text-[#F2778D]"
        >
          <ArrowLeft className="h-4 w-4" />
          Seguimiento de Produccion
        </button>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#594246]">
              Bot de seguimiento
            </h1>

            <p className="mt-1 text-sm text-[#9b8088]">
              {orderCode} · {order.base_items?.length || 0} variantes ·{" "}
              {totalExpected} unidades
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#F2778D] px-3 py-1 text-xs font-bold uppercase text-white">
              {order.status}
            </span>

            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase text-[#F2778D]">
              Bot: {order.botState || "SIN_INICIAR"}
            </span>
          </div>
        </div>
      </header>

      <main className="grid gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(360px,0.95fr)_minmax(420px,1.25fr)]">
        <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-6 flex items-center gap-2 text-sm font-bold text-[#594246]">
            <Activity className="h-4 w-4 text-[#F2778D]" />
            Timeline del proceso
          </h2>

          <div className="space-y-5">
            <TrackingStep
              active
              title="Contacto inicial"
              description="Orden enviada al taller por WhatsApp."
            />

            <TrackingStep
              active={!!order.progress?.corteIniciado}
              title="Corte"
              description={
                order.progress?.corteIniciado
                  ? "El taller confirmo el inicio de corte."
                  : "Esperando confirmacion del taller."
              }
            />

            <TrackingStep
              active={!!order.progress?.costuraIniciada}
              title="Confeccion"
              description={
                order.progress?.costuraIniciada
                  ? "El taller confirmo el inicio de confeccion."
                  : "Esperando inicio de confeccion."
              }
            />

            <TrackingStep
              active={unitsReady > 0}
              title="Avance parcial"
              description={`${unitsReady} de ${totalExpected} unidades listas.`}
              progress={progressPercent}
            />

            <TrackingStep
              active={isReadyForQuality}
              title="Control de calidad"
              description={
                isReadyForQuality
                  ? "Listo para revision fisica."
                  : "Pendiente de finalizacion del taller."
              }
            />
          </div>

          <div className="mt-8 border-t border-rose-100 pt-5">
            <div className="mb-4 rounded-xl border border-rose-100 bg-[#fffafb] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#594246]">
                <ClipboardCheck className="h-4 w-4 text-[#F2778D]" />
                Validacion
              </h3>

              <InfoRow label="Estado actual" value={order.status} highlight />

              <InfoRow
                label="Prendas avanzadas"
                value={`${unitsReady} / ${totalExpected}`}
              />

              <InfoRow
                label="Proyeccion de fin"
                value={
                  order.progress?.fechaProyectadaFin ||
                  (order.botState === "COMPLETED"
                    ? new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
                    : "Pendiente")
                }
              />
            </div>

            {order.status === "COMPLETADA" ? (
              <div className="rounded-xl border border-[#d1e7dd] bg-[#d1e7dd]/30 px-4 py-4 text-center text-sm leading-relaxed text-[#0f5132] font-medium flex flex-col items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 animate-pulse" />
                <span className="font-bold">¡Orden Completada!</span>
                Las prendas han sido recibidas físicamente y el stock del Almacén Central (Boom) se actualizó correctamente.
              </div>
            ) : order.status === "CONTROL_CALIDAD" ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-4 text-center text-sm leading-relaxed text-blue-900 font-medium flex flex-col items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 animate-bounce">
                  ⏳
                </div>
                <span className="font-bold">En espera de recepción en Almacén</span>
                La producción del taller ha finalizado. Esperando que el almacenero central realice la recepción física y conteo de mercadería desde el módulo de Recepciones para cerrar la orden y actualizar el inventario.
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm leading-relaxed text-[#9b8088]">
                El taller se encuentra en proceso de fabricación. El seguimiento y reportes de avance continúan automáticamente por WhatsApp.
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-[#101b20] shadow-sm">
          <div className="flex items-center gap-3 border-b border-white/10 bg-[#1b2a31] px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-500 text-sm font-bold text-white">
              {workshopName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">{workshopName}</h2>

              <p className="text-xs text-slate-300">
                WhatsApp activo
                {order.workshopPhone ? ` · ${order.workshopPhone}` : ""}
              </p>
            </div>
          </div>

          <div className="h-[620px] space-y-4 overflow-y-auto bg-[#071115] p-5">
            {order.chatHistory?.length ? (
              order.chatHistory.map((msg: ChatMessage, idx: number) => {
                const isBot = msg.sender === "bot";

                return (
                  <div
                    key={idx}
                    className={`flex ${isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        isBot
                          ? "rounded-tl-sm bg-emerald-700 text-white"
                          : "rounded-tr-sm bg-[#1b2a31] text-white"
                      }`}
                    >
                      <p
                        className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${
                          isBot ? "text-emerald-100" : "text-amber-300"
                        }`}
                      >
                        {isBot ? "Estilos Boom Bot" : workshopName}
                      </p>

                      <p className="whitespace-pre-line">{msg.text}</p>

                      <p className="mt-2 text-right text-[10px] text-white/60">
                        {new Date(msg.timestamp).toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
                Aun no hay mensajes del taller.
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </section>
      </main>
    </section>
  );
}

function TrackingStep({
  active,
  title,
  description,
  progress,
}: {
  active: boolean;
  title: string;
  description: string;
  progress?: number;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
            active ? "bg-[#C94F74] text-white" : "bg-[#ded2d5] text-white"
          }`}
        >
          {active ? "✓" : ""}
        </div>

        <div className="mt-2 h-full w-px bg-rose-100" />
      </div>

      <div className="flex-1 rounded-xl bg-[#fbf7f7] p-4">
        <h3 className="text-sm font-bold text-[#594246]">{title}</h3>

        <p className="mt-1 text-xs leading-relaxed text-[#9b8088]">
          {description}
        </p>

        {typeof progress === "number" && (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-rose-100">
              <div
                className="h-full bg-[#C94F74] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-1 text-xs font-bold text-[#C94F74]">
              {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rose-50 py-3 first:pt-0 last:border-0 last:pb-0">
      <span className="text-xs text-[#9b8088]">{label}</span>

      <span
        className={`text-right text-xs font-bold ${
          highlight
            ? "rounded-full bg-blue-50 px-2 py-1 uppercase text-blue-600"
            : "text-[#594246]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}