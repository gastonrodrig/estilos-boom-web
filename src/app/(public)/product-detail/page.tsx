"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import Image from "next/image";

type Variant = {
  id: string;
  label: string;
  colorHex: string;
  image: string;
  images: string[];
};

type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  rating: number;
  reviews: number;
  features: string[];
  variants: Variant[];
  sizes: string[];
  images: string[];
  description: string;
  material?: string;
  care?: string;
};

const PRODUCTS: Product[] = [
  {
    id: "short-puffer-jacket",
    title: "Casaca Puffer Corta",
    price: 299.9,
    oldPrice: 399.9,
    discount: "-25% OFF",
    rating: 4.8,
    reviews: 45,
    features: [
      "Material acolchado de alta calidad",
      "Diseño moderno y versátil",
      "Cierre frontal de cremallera",
      "Perfecto para clima frío"
    ],
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
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_UB1_main?wid=1728&qlt=80,0",
      "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_UB1_alternate1?wid=1728&qlt=80,0",
      "https://calvinklein.scene7.com/is/image/CalvinKlein/47D579G_UB1_alternate2?wid=1728&qlt=80,0"
    ],
    description: "Casaca Puffer Corta confeccionada con material acolchado de alta calidad. Diseño moderno y versátil, perfecto para clima frío. Cuenta con cierre frontal de cremallera y ajuste cómodo ideal para todo tipo de cuerpo.",
    material: "100% Poliéster, Relleno: Plumas de ganso",
    care: "Lavar en seco o a máquina en ciclo delicado con agua fría. No usar lejía."
  }
];

export default function ProductDetailPage() {
  const sp = useSearchParams();
  const sku = sp.get("sku") ?? "short-puffer-jacket";
  const colorParam = sp.get("color");

  const initialProduct = useMemo(
    () => PRODUCTS.find(p => p.id === sku) ?? PRODUCTS[0],
    [sku]
  );
  const [product, setProduct] = useState<Product>(initialProduct);

  const initialVariant = useMemo(
    () => product.variants.find(v => v.id === colorParam) ?? product.variants[0],
    [product, colorParam]
  );

  const [selectedVariant, setSelectedVariant] = useState<Variant>(initialVariant);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] =
    useState<"description" | "material" | "care">("description");
  const [mainImage, setMainImage] = useState<string>(initialVariant.image);

  // Inicializar con el producto por defecto o desde localStorage
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("selectedProduct") : null;
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      // Normaliza lo que viene de LS para que tenga mismas llaves que Product
      const normalized: Product = {
        id: parsed.id ?? initialProduct.id,
        title: parsed.title ?? initialProduct.title,
        price: parsed.price ?? initialProduct.price,
        oldPrice: parsed.oldPrice,
        discount:
          parsed.oldPrice && parsed.price
            ? `-${Math.round((1 - parsed.price / parsed.oldPrice) * 100)}% OFF`
            : undefined,
        rating: parsed.rating ?? initialProduct.rating ?? 4.5,
        reviews: parsed.reviews ?? initialProduct.reviews ?? 0,
        // OJO: si quieres mantener “features” del SSR, no las cambies;
        // si prefieres las del LS, define aquí de forma CONSISTENTE
        features:
          parsed.features ??
          initialProduct.features, // << evitar textos distintos en SSR/CSR
        variants: parsed.variants ?? initialProduct.variants,
        sizes: parsed.sizes ?? initialProduct.sizes ?? ["XS", "S", "M", "L", "XL", "XXL"],
        images: parsed.images ?? initialProduct.images ?? [],
        description: parsed.description ?? initialProduct.description, // coherente con SSR
        material: parsed.material ?? initialProduct.material,
        care: parsed.care ?? initialProduct.care,
      };

      setProduct(normalized);
    } catch (e) {
      console.error("Error parsing stored product:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku]); // si cambia SKU, re-hidratamos

  // 3) Si cambia el product (o color en URL), recalcula variante, talla e imagen
  useEffect(() => {
    const v = product.variants.find(v => v.id === colorParam) ?? product.variants[0];
    setSelectedVariant(v);
    setMainImage(v.image);
    setSelectedSize(product.sizes[0]);
  }, [product, colorParam]);

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: quantity,
      selectedVariant: selectedVariant.id,
      selectedSize: selectedSize,
      image: selectedVariant.image,
      timestamp: Date.now()
    };

    // Obtener carrito existente
    const existingCart = localStorage.getItem('cart');
    const cart = existingCart ? JSON.parse(existingCart) : [];

    // Buscar si el producto ya existe con la misma configuración
    const existingItemIndex = cart.findIndex(
      (item: typeof cartItem) => 
        item.id === cartItem.id && 
        item.selectedVariant === cartItem.selectedVariant && 
        item.selectedSize === cartItem.selectedSize
    );

    if (existingItemIndex > -1) {
      // Si existe, sumar la cantidad
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Si no existe, agregarlo
      cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-gray-50">
            <Image
              src={mainImage}
              alt={product.title}
              width={800}
              height={600}
              className="w-full object-cover"
              priority
            />
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-pink-50 transition">
              <Heart className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          
          {/* Miniaturas */}
          <div className="grid grid-cols-3 gap-3">
            {selectedVariant.images.map((img, i) => (
              <div 
                key={i} 
                onClick={() => setMainImage(img)}
                className={`rounded-xl overflow-hidden bg-gray-50 aspect-square cursor-pointer border-2 transition ${mainImage === img ? "border-pink-500" : "border-transparent hover:border-pink-400"}`}
              >
                <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{product.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-amber-400" : "fill-gray-200"}`} viewBox="0 0 20 20">
                    <path d="M10 1.5 12.6 7l5.4.4-4.1 3.4 1.3 5.2L10 13.9 4.8 16l1.3-5.2L2 7.4 7.4 7 10 1.5Z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">{product.rating} ({product.reviews} reseñas)</span>
            </div>
          </div>

          {/* Precio */}
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-pink-600">S/ {product.price.toFixed(2)}</span>
            {product.oldPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">S/ {product.oldPrice.toFixed(2)}</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold">{product.discount}</span>
              </>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {product.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Selector de color */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">Color: <span className="text-pink-600">{selectedVariant.label}</span></p>
            <div className="flex gap-2">
              {product.variants.map(variant => (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setMainImage(variant.image);
                  }}
                  className={`w-12 h-12 rounded-full border-2 transition ${selectedVariant.id === variant.id ? "border-pink-500 ring-2 ring-pink-200" : "border-gray-200"}`}
                  style={{ backgroundColor: variant.colorHex }}
                  aria-label={variant.label}
                />
              ))}
            </div>
          </div>

          {/* Selector de talla */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">Talla: <span className="text-pink-600">{selectedSize}</span></p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-5 py-2 rounded-lg border-2 font-medium transition ${selectedSize === size ? "bg-pink-500 text-white border-pink-500" : "bg-white text-gray-700 border-gray-200 hover:border-pink-300"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">Cantidad</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-pink-500 text-gray-700 font-bold text-lg">−</button>
              <span className="w-12 text-center font-bold text-lg text-gray-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-pink-500 text-gray-700 font-bold text-lg">+</button>
            </div>
          </div>

          {/* Botón agregar al carrito */}
          <button 
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-pink-700 transition shadow-lg">
            🛒 Agregar al carrito
          </button>

          {/* Información adicional */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Envío gratis</strong> en compras mayores a S/ 150</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span><strong>Cambios fáciles</strong> hasta 30 días después de la compra</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span><strong>Compra segura</strong> protección garantizada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de información */}
      <div className="mt-16">
        <div className="flex gap-4 border-b">
          <button onClick={() => setActiveTab("description")} className={`px-6 py-3 font-medium transition ${activeTab === "description" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-600 hover:text-pink-500"}`}>
            Descripción
          </button>
          <button onClick={() => setActiveTab("material")} className={`px-6 py-3 font-medium transition ${activeTab === "material" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-600 hover:text-pink-500"}`}>
            Material
          </button>
          <button onClick={() => setActiveTab("care")} className={`px-6 py-3 font-medium transition ${activeTab === "care" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-600 hover:text-pink-500"}`}>
            Cuidados
          </button>
        </div>

        <div className="py-8">
          {activeTab === "description" && <p className="text-gray-700 leading-relaxed">{product.description}</p>}
          {activeTab === "material" && <p className="text-gray-700 leading-relaxed">{product.material}</p>}
          {activeTab === "care" && <p className="text-gray-700 leading-relaxed">{product.care}</p>}
        </div>
      </div>
    </section>
  );
}
