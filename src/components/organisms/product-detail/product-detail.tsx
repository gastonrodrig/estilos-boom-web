"use client";

import { useState, useMemo } from "react";
import { Star, Heart, ChevronDown, RefreshCcw, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { CartItem, Product } from "@/core/models";
import { useCartStore } from "@hooks";
import { CheckoutDrawer } from "@components";

interface Props {
  product: Product;
}

type VariantUI = {
  id_variant: string;
  size: string;
  color: string;
  stock: number;
  sku_variant: string;
};

export const ProductDetail = ({ product }: Props) => {
  const { addItem } = useCartStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | undefined>(undefined);

  const variants = useMemo<VariantUI[]>(
    () =>
      Array.isArray(product.variants)
        ? product.variants.map((v) => ({
            id_variant: v.id_variant ?? "",
            size: v.size ?? "",
            color: v.color ?? "",
            stock: Number(v.stock ?? 0),
            sku_variant: v.sku_variant ?? "",
          }))
        : [],
    [product.variants],
  );

  const uniqueColors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))),
    [variants],
  );

  const [selectedColor, setSelectedColor] = useState<string>(uniqueColors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(product.images?.[0] ?? "/placeholder.jpg");

  const availableSizes = useMemo(() => {
    return variants
      .filter((v) => v.color === selectedColor)
      .map((v) => ({ size: v.size, stock: v.stock }));
  }, [selectedColor, variants]);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.color === selectedColor && v.size === selectedSize),
    [variants, selectedColor, selectedSize],
  );

  const maxStockForSelection = selectedVariant?.stock ?? 0;
  const quantityOptions = useMemo(
    () => Array.from({ length: Math.min(Math.max(maxStockForSelection, 1), 10) }, (_, i) => i + 1),
    [maxStockForSelection],
  );

  const canAddToCart =
    Boolean(selectedColor) &&
    Boolean(selectedSize) &&
    maxStockForSelection > 0 &&
    quantity > 0 &&
    quantity <= maxStockForSelection;

  const handleAddToCart = async () => {
    if (!canAddToCart) {
      alert("Selecciona color y talla disponibles.");
      return;
    }

    const item: CartItem & { stock: number } = {
      productId: product.id_product,
      name: product.name,
      price: product.base_price,
      quantity,
      color: selectedColor,
      size: selectedSize,
      image: product.images?.[0] ?? "/placeholder.jpg",
      stock: maxStockForSelection,
      categoryId: product.id_category,
      categoryName: product.category?.name,
    };

    await addItem(item);
    setLastAddedItem(item);
    setDrawerOpen(true);
  };

  const productDetailsMock = {
    description:
      "Nuestra colección Premium Cotton: diseños atemporales y confort superior para el día a día, confeccionados en tejidos suaves con el ajuste perfecto de Estilos Boom.",
    bullets: [
      "Mezcla de algodón orgánico y elastano",
      "Corte entallado de alta definición",
      "Tejido transpirable de tacto suave",
      "Lavado a máquina en frío",
      "Secado natural recomendado",
    ],
    specs: {
      sku: product.sku || "EB-2614001",
      genero: "Mujer",
      estilo: product.category?.name || "Casual Premium",
      composicion: "95% Algodón, 5% Elastano",
      temporada: "Primavera 2026",
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#594246] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <nav className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-10 flex gap-2">
          <span className="hover:text-[#F2778D] cursor-pointer transition-colors">Inicio</span> /
          <span className="hover:text-[#F2778D] cursor-pointer transition-colors">Catálogo</span> /
          <span className="font-bold text-[#594246]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <motion.div layoutId="main-img" className="aspect-3/4 bg-white overflow-hidden relative">
              <img
                src={mainImage || "/placeholder.jpg"}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                alt={product.name}
              />
              <button className="absolute top-6 right-6 p-3 bg-white/70 backdrop-blur-sm rounded-full text-[#594246] hover:text-[#F2778D] transition-all">
                <Heart size={20} className="stroke-2" />
              </button>
            </motion.div>

            <div className="grid grid-cols-6 gap-3">
              {product.images.slice(0, 6).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`aspect-square bg-white border transition-all ${
                    mainImage === img ? "border-[#F2778D] p-0.5" : "border-[#EBEAE8]"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="border-b border-[#EBEAE8] pb-6">
              {product.is_new_in && (
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#F291A3] font-bold mb-2">
                  New Arrival
                </p>
              )}
              <h1 className="text-3xl font-light uppercase tracking-widest leading-tight mb-3 text-[#594246]">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex text-[#F2778D]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" stroke="none" />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                  (156 reseñas)
                </span>
              </div>

              <p className="text-2xl font-medium tracking-tight text-[#594246]">
                S/ {product.base_price.toFixed(2)}
              </p>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold block mb-4">
                Color: <span className="font-light text-gray-500">{selectedColor || "Seleccionar"}</span>
              </span>
              <div className="flex gap-4">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize("");
                      setQuantity(1);
                    }}
                    className={`w-9 h-9 rounded-full border transition-all ${
                      selectedColor === color ? "border-[#F2778D] p-1 scale-110" : "border-[#EBEAE8]"
                    }`}
                  >
                    <div
                      className="w-full h-full rounded-full border border-white"
                      style={{
                        backgroundColor:
                          color === "Negro" ? "#000" : color === "Blanco" ? "#fff" : "#F2D0D3",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold">
                  Talla: <span className="font-light text-gray-500">{selectedSize || "Seleccionar"}</span>
                </span>
                <button className="text-[10px] uppercase tracking-widest border-b border-[#594246] pb-0.5 font-bold hover:text-[#F2778D] hover:border-[#F2778D] transition-all">
                  Guía de tallas
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {availableSizes.map(({ size, stock }) => (
                  <button
                    key={size}
                    disabled={stock === 0}
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }}
                    className={`h-12 text-[11px] font-bold transition-all border ${
                      stock === 0
                        ? "bg-[#FAF9F6] border-[#EBEAE8] text-gray-300 cursor-not-allowed"
                        : selectedSize === size
                        ? "bg-[#594246] border-[#594246] text-white"
                        : "bg-white border-[#EBEAE8] hover:border-[#594246] text-[#594246]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="mt-4 text-[11px] uppercase tracking-widest text-[#F2778D] font-bold">
                  Stock: {maxStockForSelection}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 pt-2 border-t border-[#EBEAE8]">
              <div className="flex gap-3">
                <div className="relative border border-[#EBEAE8] bg-white group min-w-17.5">
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-transparent px-5 pr-9 py-3 text-xs font-bold outline-none appearance-none cursor-pointer text-[#594246]"
                  >
                    {quantityOptions.map((n) => (
                      <option key={n} value={n} className="text-black bg-white">
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-[#F2778D] transition-colors"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className={`flex-1 text-white text-[11px] font-bold uppercase tracking-[0.3em] py-4 rounded-sm transition-all ${
                    canAddToCart
                      ? "bg-[#594246] hover:bg-black active:scale-[0.98]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Agregar al carrito
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-400 italic">
                Envíos gratis en Lima por compras superiores a S/ 199
              </p>
            </div>

            <div className="bg-white border border-[#EBEAE8] rounded-sm p-6 space-y-4">
              <div className="flex items-center gap-4 text-xs">
                <Truck className="text-[#F2D0D3]" size={20} />
                <div>
                  <p className="font-bold text-[#594246]">Envíos gratis</p>
                  <p className="text-gray-400">En Lima Metropolitana mayores a S/199.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs border-t border-[#EBEAE8] pt-4">
                <RefreshCcw className="text-[#F2778D]" size={20} />
                <div>
                  <p className="font-bold text-[#594246]">Cambios fáciles</p>
                  <p className="text-gray-400">Hasta 30 días después de tu compra.</p>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-[#EBEAE8] space-y-8">
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold mb-6 text-[#594246]">
                  Detalles del Producto
                </h3>
                <p className="text-sm leading-relaxed text-gray-500 font-light mb-6">
                  {productDetailsMock.description}
                </p>
                <ul className="space-y-3">
                  {productDetailsMock.bullets.map((bullet, i) => (
                    <li key={i} className="text-sm text-gray-500 font-light flex items-start gap-3">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#F2778D] shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 space-y-4">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-6">
                  Ref.: <span className="text-[#594246] font-bold">{productDetailsMock.specs.sku}</span>
                </p>

                <div className="grid grid-cols-1 gap-y-4">
                  {[
                    { label: "Género", value: productDetailsMock.specs.genero },
                    { label: "Estilo", value: productDetailsMock.specs.estilo },
                    { label: "Composición", value: productDetailsMock.specs.composicion },
                    { label: "Temporada", value: productDetailsMock.specs.temporada },
                  ].map((spec, i) => (
                    <div key={i} className="flex items-center text-[11px] uppercase tracking-[0.15em]">
                      <span className="w-32 text-gray-400">{spec.label} :</span>
                      <span className="font-bold text-[#594246]">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CheckoutDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        item={lastAddedItem}
      />
    </div>
  );
};