"use client";

import { CatalogToolbar, ProductCard } from "./_components";

// Tipos locales para este archivo (compatibles con ProductCard)
type ProductVariant = {
  id: string;
  label: string;
  colorHex: string;
  image: string; // Primera imagen para mostrar en card
  images: string[]; // Todas las imágenes
};

type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  badge?: "Best Seller" | "New Arrival";
  rating?: number;
  reviews?: number;
  variants: ProductVariant[];
};

const PRODUCTS: Product[] = [
  {
    id: "short-puffer-jacket",
    title: "Casaca Puffer Corta",
    price: 299.9,
    oldPrice: 399.9,
    badge: "Best Seller",
    rating: 4.8,
    reviews: 45,
    variants: [
      {
        id: "black",
        label: "Negro",
        colorHex: "#000000",
        image: "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_UB1_main?wid=1728&qlt=80,0",
        images: [
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_UB1_main?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_UB1_alternate1?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_UB1_alternate2?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_UB1_alternate3?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_UB1_alternate4?wid=1728&qlt=80,0"
        ]
      },
      {
        id: "flat-gray",
        label: "Gris Plano",
        colorHex: "#A7A9AC",
        image: "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_PTF_main?wid=1728&qlt=80,0",
        images: [
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_PTF_main?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_PTF_alternate1?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_PTF_alternate2?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_PTF_alternate3?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_PTF_alternate4?wid=1728&qlt=80,0"
        ]
      },
      {
        id: "chalk",
        label: "Tiza",
        colorHex: "#F2EFE8",
        image: "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_67U_main?wid=1728&qlt=80,0",
        images: [
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_67U_main?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_67U_alternate1?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_67U_alternate2?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_67U_alternate3?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_67U_alternate4?wid=1728&qlt=80,0"
        ]
      }
    ]
  },
  {
    id: "soft-polo-relaxed-sweater",
    title: "Suéter Polo Suave Relaxed",
    price: 189.9,
    rating: 4.5,
    reviews: 28,
    variants: [
      {
        id: "black",
        label: "Negro",
        colorHex: "#000000",
        image: "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_8MN_main?wid=1728&qlt=80,0",
        images: [
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_8MN_main?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_8MN_alternate1?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_8MN_alternate2?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_8MN_alternate3?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_8MN_alternate4?wid=1728&qlt=80,0"
        ]
      },
      {
        id: "tofu",
        label: "Tofu",
        colorHex: "#F7F3E8",
        image: "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_YAS_main?wid=1728&qlt=80,0",
        images: [
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_YAS_main?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_YAS_alternate1?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_YAS_alternate2?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_YAS_alternate3?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_YAS_alternate4?wid=1728&qlt=80,0"
        ]
      },
      {
        id: "keepsake-blue",
        label: "Azul Keepsake",
        colorHex: "#5A7BAA",
        image: "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_CYR_main?wid=1728&qlt=80,0",
        images: [
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_CYR_main?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_CYR_alternate1?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_CYR_alternate2?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_CYR_alternate3?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E370G_CYR_alternate4?wid=1728&qlt=80,0"
        ]
      }
    ]
  },
  {
    id: "sweater-dress",
    title: "Vestido de Punto",
    price: 249.9,
    badge: "New Arrival",
    rating: 4.9,
    reviews: 15,
    variants: [
      {
        id: "mocha-brown",
        label: "Marrón Moca",
        colorHex: "#70452A",
        image: "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E8_main?wid=1728&qlt=80,0",
        images: [
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E8_main?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E8_alternate1?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E8_alternate2?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E8_alternate3?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E8_alternate4?wid=1728&qlt=80,0"
        ]
      },
      {
        id: "coal",
        label: "Carbón",
        colorHex: "#2B2B2B",
        image: "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E9_main?wid=1728&qlt=80,0",
        images: [
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E9_main?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E9_alternate1?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E9_alternate2?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E9_alternate3?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/47E343G_2E9_alternate4?wid=1728&qlt=80,0"
        ]
      }
    ]
  },
  {
    id: "cropped-jacket",
    title: "Casaca Corta",
    price: 279.9,
    oldPrice: 349.9,
    rating: 4.6,
    reviews: 22,
    variants: [
      {
        id: "quiet-gray",
        label: "Gris Suave",
        colorHex: "#D0D1D3",
        image: "https://calvinklein.scene7.com/is/image/CalvinKlein/44E595G_QBW_main?wid=1728&qlt=80,0",
        images: [
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E595G_QBW_main?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E595G_QBW_alternate1?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E595G_QBW_alternate2?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E595G_QBW_alternate3?wid=1728&qlt=80,0",
          "https://calvinklein.scene7.com/is/image/CalvinKlein/44E595G_QBW_alternate4?wid=1728&qlt=80,0"
        ]
      }
    ]
  }
];

export default function CatalogPage() {
  return (
    <section className="max-w-[1400px] mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Catálogo</h1>

      <CatalogToolbar total={PRODUCTS.length} />

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PRODUCTS.map((p) => (
          <ProductCard
            key={p.id}
            {...p}
            onOpenDetailHref={(variantId) => `/product-detail?sku=${p.id}&color=${variantId}`}
          />
        ))}
      </div>
    </section>
  );
}
