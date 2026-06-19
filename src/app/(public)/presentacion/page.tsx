"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ShoppingBag,
  Package,
  Factory,
  AlertTriangle,
  Heart,
  ArrowRight,
  Warehouse,
  ClipboardList,
  CheckCircle2,
  ChevronDown,
  Clock,
  X,
  Layers,
  TrendingDown,
  RefreshCw,
  Truck,
  Star,
} from "lucide-react";

/* ───────────────────────────────────────────────────────── STEPS DATA */
const steps = [
  {
    id: 1,
    phase: "Inicio del flujo",
    actor: "Clienta",
    actorEmoji: "👩‍💼",
    icon: ShoppingBag,
    color: "#D6405F",
    bg: "from-rose-900/40 to-rose-950/60",
    border: "border-rose-500/30",
    glow: "shadow-rose-500/20",
    title: "Valentina realiza su compra con envío",
    subtitle: "Compra dos productos y solicita el envío por Shalom.",
    description:
      "Valentina ingresa a la tienda Estilos Boom y añade al carrito dos productos (uno de origen Abastecimiento y otro de Producción). Finaliza su compra solicitando envío a través de Shalom.",
    tags: [
      { label: "Producto A — Abastecimiento", icon: Package, color: "#60a5fa" },
      { label: "Producto B — Producción", icon: Factory, color: "#a78bfa" },
    ],
    detail:
      "El sistema registra el pedido y la preferencia de envío, preparando el terreno para el proceso de despacho de ventas desde el almacén.",
  },
  {
    id: 2,
    phase: "Despacho de venta",
    actor: "Almacenero",
    actorEmoji: "📦",
    icon: Warehouse,
    color: "#60a5fa",
    bg: "from-blue-900/40 to-blue-950/60",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
    title: "Despacho y salida del almacén",
    subtitle: "Se realiza el despacho de la venta y se registran los movimientos.",
    description:
      "El almacenero visualiza el pedido, alista los productos y efectúa el despacho de la venta. Se registra formalmente el movimiento de salida del paquete desde el almacén.",
    tags: [
      { label: "Despacho de Venta", icon: Truck, color: "#f472b6" },
      { label: "Movimiento de Salida", icon: ClipboardList, color: "#34d399" },
    ],
    detail:
      "Este flujo asegura que el inventario se descuente correctamente y exista trazabilidad completa de la salida física de la mercancía.",
  },
  {
    id: 3,
    phase: "El tiempo pasa…",
    actor: "Sistema",
    actorEmoji: "⏳",
    icon: Clock,
    color: "#f59e0b",
    bg: "from-amber-900/40 to-amber-950/60",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    title: "Una semana después…",
    subtitle: "El stock de los dos productos se agota.",
    description:
      "La demanda supera el inventario disponible. Los dos productos que Valentina compró ya no tienen existencias.",
    tags: [
      { label: "Stock agotado — Producto A", icon: AlertTriangle, color: "#f87171" },
      { label: "Stock agotado — Producto B", icon: AlertTriangle, color: "#f87171" },
    ],
    detail:
      "El sistema refleja automáticamente el stock en cero. Las usuarias no pueden agregar esos productos al carrito.",
  },
  {
    id: 4,
    phase: "Experiencia de cliente",
    actor: "Clienta",
    actorEmoji: "😟",
    icon: Heart,
    color: "#f43f5e",
    bg: "from-pink-900/40 to-pink-950/60",
    border: "border-pink-500/30",
    glow: "shadow-pink-500/20",
    title: "Valentina quiere comprar de nuevo",
    subtitle: "Pero el stock no se lo permite.",
    description:
      "Valentina regresa a la app, revisa su lista de favoritos y ve que ambos productos están sin stock. No puede recomprarlos.",
    tags: [
      { label: "Sin stock disponible", icon: X, color: "#f87171" },
      { label: "Favoritos — sin stock", icon: Heart, color: "#fb7185" },
    ],
    detail:
      "La app muestra el estado real del inventario en tiempo real. La clienta no puede completar su compra hasta que el área administrativa reponga el stock.",
  },
  {
    id: 5,
    phase: "Gestión administrativa",
    actor: "Administrador",
    actorEmoji: "🏢",
    icon: RefreshCw,
    color: "#a78bfa",
    bg: "from-violet-900/40 to-violet-950/60",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/20",
    title: "El admin activa el flujo de reposición",
    subtitle: "Dos caminos paralelos: Abastecimiento y Producción.",
    description:
      "Desde el panel administrativo, el equipo registra la necesidad de reponer ambos productos activando dos flujos distintos según el origen de cada uno.",
    tags: [
      { label: "Flujo de Abastecimiento", icon: Truck, color: "#60a5fa" },
      { label: "Flujo de Producción", icon: Factory, color: "#a78bfa" },
    ],
    detail:
      "Producto A: se genera una orden de abastecimiento al proveedor. Producto B: se abre una orden de producción al taller, que pasa por etapas de corte, confección y acabados hasta su ingreso al almacén.",
  },
  {
    id: 6,
    phase: "Resultado",
    actor: "Sistema",
    actorEmoji: "✅",
    icon: CheckCircle2,
    color: "#34d399",
    bg: "from-emerald-900/40 to-emerald-950/60",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    title: "Stock repuesto. Ciclo completado.",
    subtitle: "Valentina puede volver a comprar.",
    description:
      "Una vez completados ambos flujos, el stock se actualiza en el sistema. Valentina accede a sus favoritos y ya puede agregar al carrito.",
    tags: [
      { label: "Inventario actualizado", icon: Layers, color: "#34d399" },
      { label: "Ciclo operativo cerrado", icon: Star, color: "#fbbf24" },
    ],
    detail:
      "El sistema garantiza que cada unidad ingresada tiene trazabilidad completa: desde la orden hasta el ingreso al almacén y la venta final.",
  },
];

/* ───────────────────────────────────────────────────────── STEP CARD */
function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="absolute left-8 top-full w-[2px] h-16 bg-gradient-to-b from-white/20 to-transparent z-10 hidden md:block" />
      )}

      <div
        className={`relative rounded-3xl border bg-gradient-to-br ${step.bg} ${step.border} shadow-2xl ${step.glow} backdrop-blur-xl overflow-hidden`}
      >
        {/* Decorative glow blob */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: step.color }}
        />

        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Step number */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `${step.color}22`, border: `1.5px solid ${step.color}55` }}
              >
                <Icon size={24} style={{ color: step.color }} />
              </div>
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-0.5"
                  style={{ color: step.color }}
                >
                  Paso {index + 1} — {step.phase}
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-snug">
                  {step.title}
                </h3>
              </div>
            </div>
            {/* Actor badge */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <span className="text-3xl">{step.actorEmoji}</span>
              <span className="text-[9px] uppercase tracking-widest text-white/40">
                {step.actor}
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-white/60 text-sm font-medium mb-4 italic">{step.subtitle}</p>

          {/* Description */}
          <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {step.tags.map((tag, i) => {
              const TagIcon = tag.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: `${tag.color}18`,
                    border: `1px solid ${tag.color}40`,
                    color: tag.color,
                  }}
                >
                  <TagIcon size={11} />
                  {tag.label}
                </div>
              );
            })}
          </div>

          {/* Detail */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-white/50 text-xs md:text-sm leading-relaxed">{step.detail}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────────────── MAIN PAGE */
export default function PresentacionPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0510] text-white relative overflow-x-hidden">
      {/* ── Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-rose-600/10 blur-[140px]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
      </div>

      {/* ── HERO */}
      <section className="relative z-10 pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-6"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            <span className="text-white">Desarrollar Un Sistema Web Para La Mejora De La </span>
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              Gestión Operativa
            </span>
            <br />
            <span className="text-white/80">En Estilos Boom</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Desde que una clienta hace su primera compra hasta que el sistema repone el inventario
            automáticamente. Un ciclo completo en 6 pasos.
          </p>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-12 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-[10px] uppercase tracking-widest">Desplázate para ver el flujo</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── FLOW DIAGRAM (timeline bar) */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-center gap-0 flex-wrap md:flex-nowrap">
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg"
                  style={{ background: step.color, color: "#fff" }}
                >
                  {i + 1}
                </div>
                <span className="text-[8px] uppercase tracking-wider text-white/30 text-center max-w-[60px] leading-tight hidden md:block">
                  {step.phase}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-[2px] bg-gradient-to-r from-white/20 to-white/10 mx-1 hidden md:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── STEP CARDS */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-32 flex flex-col gap-8">
        {steps.map((step, index) => (
          <StepCard key={step.id} step={step} index={index} />
        ))}

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="relative rounded-3xl overflow-hidden border border-white/10 text-center p-12"
          style={{ background: "linear-gradient(135deg, #1a0a14 0%, #0f0618 100%)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600/15 via-transparent to-violet-600/15 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
              Sistema diseñado para la eficiencia operativa
            </h3>
            <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed mb-8">
              Este flujo completo corre sobre una plataforma web desarrollada con Next.js, NestJS y
              MongoDB — diseñada específicamente para las necesidades reales de Estilos Boom.
            </p>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #D6405F 0%, #9333ea 100%)",
                boxShadow: "0 0 40px #D6405F44",
              }}
            >
              Explorar la plataforma
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-white/20 text-xs">
          Desarrollar un Sistema Web para la Mejora de la Gestión Operativa en Estilos Boom · 2025
        </p>
      </footer>
    </div>
  );
}
