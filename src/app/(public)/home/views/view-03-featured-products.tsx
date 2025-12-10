import type { ReactNode } from "react";
import Link from "next/link";

/** Tipos */
export type FeaturedItem = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  promo?: string;
  image: string;           // URL absoluta o /public/*
  badge?: "Best Seller" | "New Arrival";
  rating?: number;         // 0–5
  reviews?: number;
};

export type View03FeaturedProductsProps = {
  title?: string;
  viewAllHref?: string;
  items?: ReadonlyArray<FeaturedItem>;
  className?: string;
};

/** Mock de ejemplo (puedes reemplazarlo al pasar items por props) */
const MOCK: ReadonlyArray<FeaturedItem> = [
  {
    id: "feat-blue",
    title: "Pantalón Azul",
    price: 129.9,
    image: "https://i.postimg.cc/SnP6rT0P/blue-pants.png",
    badge: "Best Seller",
    rating: 4.5,
    reviews: 12,
  },
  {
    id: "feat-shirt-green",
    title: "Polo Verde",
    price: 84.9,
    image: "https://i.postimg.cc/Xqdffk23/green-shirt.png",
    badge: "New Arrival",
    rating: 4.2,
    reviews: 7,
  },
  {
    id: "feat-dress",
    title: "Vestido Primavera",
    price: 149.9,
    image: "https://i.postimg.cc/Fsbb1Gdz/vestido.png",
    rating: 4.8,
    reviews: 9,
  },
  {
    id: "feat-orange",
    title: "Pantalón Naranja",
    price: 129.9,
    oldPrice: 159.9,
    promo: "50% off",
    image: "https://i.postimg.cc/yNx0QHfx/orange-pants.png",
    rating: 4.6,
    reviews: 11,
  },
] as const;

/** UI helpers */
const Stars: React.FC<{ value?: number }> = ({ value = 0 }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <span key={i}>★</span>;
        if (i === full && half) return <span key={i}>☆</span>;
        return <span key={i} className="text-gray-300">★</span>;
      })}
    </div>
  );
};

const Card: React.FC<{ item: FeaturedItem }> = ({ item }) => (
  <article className="group">
    <div className="relative overflow-hidden rounded-xl bg-gray-100">
      {item.badge && (
        <span className="absolute left-2 top-2 z-10 rounded-md bg-gray-800/90 px-2 py-1 text-xs font-medium text-white">
          {item.badge}
        </span>
      )}
      {/* <img> para evitar configurar next.config.js con dominios; si quieres <Image>, te paso la config */}
      <img
        src={item.image}
        alt={item.title}
        className="h-[360px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      />
    </div>

    <div className="mt-3">
      <h3 className="text-[15px] font-medium text-gray-900">{item.title}</h3>

      <div className="mt-1 flex items-center gap-2">
        {item.oldPrice && (
          <span className="text-sm text-gray-400 line-through">S/ {item.oldPrice.toFixed(2)}</span>
        )}
        <span className="text-[15px] font-semibold text-gray-900">S/ {item.price.toFixed(2)}</span>
        {item.promo && <span className="text-sm font-semibold text-rose-600">{item.promo}</span>}
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <Stars value={item.rating} />
        {typeof item.reviews === "number" && <span>({item.reviews})</span>}
      </div>
    </div>
  </article>
);

/** Vista 03 – Productos Destacados (arrow function) */
export const View03FeaturedProducts: React.FC<View03FeaturedProductsProps> = ({
  title = "Productos destacados",
  viewAllHref = "/catalog",
  items = MOCK,
  className = "",
}) => (
  <section
    className={`relative isolate bg-white -mt-16 pt-16 ${className}`}
    // si abajo también aparece línea, añade: `-mb-16 pb-16`
  >
    <div className="max-w-[1400px] mx-auto px-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
          <div className="mt-1 h-1 w-20 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400" />
        </div>
        <Link href={viewAllHref} className="text-sm font-medium text-pink-600 hover:underline">
          Ver todo →
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((it) => (
          <Card key={it.id} item={it} />
        ))}
      </div>
    </div>
  </section>
);