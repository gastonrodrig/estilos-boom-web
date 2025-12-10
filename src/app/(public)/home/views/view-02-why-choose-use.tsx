import type { ReactNode } from "react";

export interface BenefitItem {
  title: string;
  desc: string;
  iconBgClass: string;   // clases tailwind para el fondo (ej. gradiente)
  icon: ReactNode;       // svg o componente de ícono
}

const defaultItems: ReadonlyArray<BenefitItem> = [
  {
    title: "Asesoría personalizada por WhatsApp",
    desc: "Te acompañamos en todo el proceso de compra. Respuestas claras y amables.",
    iconBgClass: "bg-gradient-to-br from-pink-500 to-rose-400",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-4 11H8a1 1 0 1 1 0-2h8a1 1 0 0 1 0 2Zm2-4H8a1 1 0 1 1 0-2h10a1 1 0 0 1 0 2Z"
        />
      </svg>
    ),
  },
  {
    title: "Letras grandes y colores suaves",
    desc: "Diseñado pensando en tu comodidad visual. Sin complicaciones.",
    iconBgClass: "bg-gradient-to-br from-fuchsia-500 to-violet-400",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 4c4.418 0 8 2.91 8 6.5S16.418 17 12 17s-8-2.91-8-6.5S7.582 4 12 4Zm0 2C8.686 6 6 8.015 6 10.5S8.686 15 12 15s6-2.015 6-4.5S15.314 6 12 6Zm0 2.25A2.25 2.25 0 1 1 9.75 10.5 2.25 2.25 0 0 1 12 8.25Z"
        />
      </svg>
    ),
  },
  {
    title: "Pagos sencillos",
    desc: "Yape, Plin o pago en entrega. Elige el método que más te convenga.",
    iconBgClass: "bg-gradient-to-br from-amber-400 to-orange-500",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4 5h16a2 2 0 0 1 2 2v9.5A2.5 2.5 0 0 1 19.5 19h-15A2.5 2.5 0 0 1 2 16.5V7a2 2 0 0 1 2-2Zm0 2v2h16V7H4Zm4 7h6a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2Z"
        />
      </svg>
    ),
  },
] as const;

export const View02WhyChooseUs = ({
  title = "¿Por qué comprar con nosotros?",
  items = defaultItems,
  className = "",
}) => {
  return (
    <div aria-labelledby="why-choose-us-heading" className={`relative ${className}`}>
      {/* fondo suave */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-amber-100 to-white" />

      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Título */}
        <div className="text-center">
          <h2 id="why-choose-us-heading" className="text-2xl md:text-3xl font-semibold text-gray-900">
            {title}
          </h2>
          <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400" />
        </div>

        {/* Tarjetas */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <article
              key={it.title}
              className="rounded-3xl bg-white p-8 shadow-[0_10px_35px_-15px_rgba(0,0,0,0.2)] border border-black/5 hover:shadow-[0_16px_45px_-15px_rgba(0,0,0,0.25)] transition"
            >
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-white"
                style={{ boxShadow: "inset 0 1px 6px rgba(255,255,255,.25)" }}
              >
                <div className={`flex h-full w-full items-center justify-center rounded-2xl ${it.iconBgClass}`}>
                  {it.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">{it.title}</h3>
              <p className="mt-2 text-gray-600 text-center leading-7">{it.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
