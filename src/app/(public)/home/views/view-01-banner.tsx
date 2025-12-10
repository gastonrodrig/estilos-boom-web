"use client";

import Link from "next/link";

type Props = {
  onToggleAccessible?: () => void;
};

export const View01Hero = ({ onToggleAccessible }: Props) => {
  return (
    <section className="relative overflow-hidden">
      {/* Fondo suave con degradé */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-rose-50 via-amber-100 to-white" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(65%_55%_at_60%_10%,rgba(255,120,120,0.25),rgba(255,184,108,0.18)_45%,transparent_70%)]" />

      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-sm shadow-sm backdrop-blur-sm">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            ✨
          </span>
          <span className="text-gray-700">Compra online sin complicaciones</span>
        </div>

        {/* Título */}
        <h1 className="mt-6 text-3xl leading-tight font-semibold text-gray-900 md:text-6xl">
          ¿Te da inseguridad comprar online por tu <span className="whitespace-nowrap">edad?</span> <span>🌸</span>
        </h1>

        {/* Subtítulo */}
        <p className="mt-4 text-xl text-gray-700">
          Nosotros te ayudamos paso a paso.
        </p>

        {/* Descripción */}
        <p className="mx-auto mt-3 max-w-3xl text-gray-600">
          En Estilos Boom, comprar ropa es fácil, seguro y sin complicaciones. Te acompañamos en todo
          momento con asesoría personalizada y un diseño pensado para ti.
        </p>

        {/* Botones */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-md hover:opacity-90 transition"
          >
            Ver catálogo completo <span>→</span>
          </Link>

          <Link
            href="https://wa.me/51999999999"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-6 py-3 font-medium text-gray-800 shadow-sm hover:bg-amber-50 transition"
          >
            Contactar por WhatsApp
          </Link>
        </div>

        {/* Tarjeta Accesibilidad */}
        <div className="mx-auto mt-10 w-full max-w-3xl">
          <div className="relative rounded-2xl border border-amber-100 bg-white/80 p-4 text-left shadow-xl backdrop-blur-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <button
                onClick={onToggleAccessible}
                className="inline-flex items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-gray-800 shadow-sm hover:bg-amber-50 transition"
                aria-label="Activar modo accesible"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  🦻
                </span>
                <span className="font-medium">Activar modo accesible</span>
              </button>

              <p className="text-sm text-gray-600">
                Al activarlo, verás <span className="font-semibold text-rose-600">letras más grandes</span>,{" "}
                <span className="font-semibold text-rose-600">colores más suaves</span> y una{" "}
                <span className="font-semibold text-rose-600">guía paso a paso</span> para comprar con total tranquilidad.
              </p>
            </div>

            {/* Halo suave debajo */}
            <div className="pointer-events-none absolute inset-x-6 -bottom-6 h-6 rounded-full bg-amber-200/40 blur-md" />
          </div>
        </div>
      </div>
    </section>
  );
}
