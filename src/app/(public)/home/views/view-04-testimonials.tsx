/* ---------- Tipos ---------- */
export type Testimonial = {
  id: string;
  name: string;
  age: number;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
};

export type View04TestimonialsProps = {
  title?: string;
  subtitle?: string;
  items?: ReadonlyArray<Testimonial>;
  className?: string;
};

/* ---------- Data por defecto ---------- */
const DEFAULT_ITEMS: ReadonlyArray<Testimonial> = [
  {
    id: "t1",
    name: "María González",
    age: 62,
    rating: 5,
    quote:
      '“Al principio tenía miedo de comprar por internet, pero el equipo me ayudó por WhatsApp. ¡Ahora compro con confianza!”',
  },
  {
    id: "t2",
    name: "Rosa Fernández",
    age: 58,
    rating: 5,
    quote:
      '“Me encanta que las letras sean grandes y los colores suaves. Es fácil de usar y la ropa es hermosa.”',
  },
  {
    id: "t3",
    name: "Carmen Díaz",
    age: 65,
    rating: 5,
    quote:
      '“Pago con Yape y llega rápido a mi casa. La calidad es excelente y me siento elegante.”',
  },
] as const;

/* ---------- Subcomponentes ---------- */
const Stars: React.FC<{ value: number }> = ({ value }) => (
  <div className="flex items-center gap-1 text-amber-400" aria-label={`${value} de 5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        viewBox="0 0 20 20"
        className={`w-5 h-5 ${i < value ? "fill-current" : "fill-gray-200"}`}
        aria-hidden="true"
      >
        <path d="M10 1.5 12.6 7l5.4.4-4.1 3.4 1.3 5.2L10 13.9 4.8 16l1.3-5.2L2 7.4 7.4 7 10 1.5Z" />
      </svg>
    ))}
  </div>
);

const QuoteBadge: React.FC = () => (
  <div className="absolute -top-5 left-6 rounded-2xl px-3 py-2 text-white shadow-md bg-gradient-to-br from-pink-500 to-amber-400">
    <span className="font-semibold">””</span>
  </div>
);

/* ---------- Vista 04: Testimonios ---------- */
export const View04Testimonials: React.FC<View04TestimonialsProps> = ({
  title = "Lo que dicen nuestras clientas",
  subtitle = "Historias reales de mujeres que confían en nosotros",
  items = DEFAULT_ITEMS,
  className = "",
}) => (
    <div className={`relative overflow-hidden -mt-16 py-16 ${className}`}>
    {/* Fondo suave con halo */}
    <div className="pointer-events-none absolute inset-0 -z-10 bg-white" />
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_85%_30%,rgba(255,140,64,0.12),transparent_60%)]" />

    <div className="max-w-6xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-gray-600">{subtitle}</p>
        <div className="mx-auto mt-3 h-1 w-28 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400" />
      </div>

      {/* Grid de cards */}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <article
            key={t.id}
            className="relative rounded-3xl bg-white p-8 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.25)] border border-amber-100"
          >
            <QuoteBadge />

            <div className="mt-2 flex justify-center">
              <Stars value={t.rating} />
            </div>

            <p className="mt-4 text-gray-700 italic leading-7">{t.quote}</p>

            <div className="pb-6"></div>

            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">{t.name}</p>
              <p className="text-sm text-gray-500">{t.age} años</p>
            </div>
          </article>
        ))}
      </div>
    </div>
    </div>
);
