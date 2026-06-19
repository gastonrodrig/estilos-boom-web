"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, Heart, ChevronDown, RefreshCcw, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { CartItem, Product } from "@/core/models";
import { useCartStore } from "@hooks";
import { CheckoutDrawer } from "@components";
import { favoritesApi } from "@api";
import { getFirebaseAuthToken } from "@helpers";
import { getAuthConfig } from "@utils";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

type VariantUI = {
  id_variant: string;
  size: string;
  color: string;
  color_hex: string;
  stock: number;
  sku_variant: string;
};

export const ProductDetail = ({ product }: Props) => {
  console.log("🚀 PRODUCT DATA EN DETALLE:", product);
  const { addItem } = useCartStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | undefined>(undefined);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      let token;
      try {
        token = await getFirebaseAuthToken();
      } catch (err) {
        toast.error("Debes iniciar sesión para agregar a favoritos");
        return;
      }
      const config = getAuthConfig({ token });
      const productId = product.id_product;
      
      try {
        await favoritesApi.post("/", { productId }, config);
        setIsFavorited(true);
        toast.success("Producto agregado a tus favoritos");
      } catch (err: any) {
        if (err.response?.status === 409) {
          await favoritesApi.delete(`/${productId}`, config);
          setIsFavorited(false);
          toast.success("Producto eliminado de tus favoritos");
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Hubo un error al procesar tu solicitud.");
    }
  };

  const variants = useMemo<VariantUI[]>(
    () =>
      Array.isArray(product.variants)
        ? product.variants.map((v) => ({
            id_variant: v.id_variant ?? "",
            size: v.size ?? "",
            color: typeof v.color === 'string' ? v.color : (v.color?.name ?? ""),
            color_hex: typeof v.color === 'object' && v.color !== null ? (v.color.hex ?? "#F2D0D3") : "#F2D0D3",
            stock: Number(v.stock ?? 0),
            sku_variant: v.sku_variant ?? "",
          }))
        : [],
    [product.variants],
  );

  const uniqueColors = useMemo(() => {
    const map = new Map<string, string>();
    variants.forEach((v) => {
      if (v.color && !map.has(v.color)) {
        map.set(v.color, v.color_hex);
      }
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [variants]);

  const [selectedColor, setSelectedColor] = useState<string>(uniqueColors[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // 📸 Filtra las imágenes por color usando la relación explícita { url, color }.
  // Fallback al método legado (color embebido en la URL) para productos antiguos.
  const filteredImages = useMemo(() => {
    const withColor = product.imagesWithColor ?? [];
    if (!selectedColor || withColor.length === 0) return product.images ?? [];

    // 1. Coincidencia exacta por color estructurado
    const exact = withColor.filter(img => img.color === selectedColor).map(img => img.url);
    if (exact.length > 0) return exact;

    // 2. Fallback legado: color embebido en el nombre del archivo
    const safeColor = selectedColor
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
    const legacy = (product.images ?? []).filter(url => url.toLowerCase().includes(safeColor));
    return legacy.length > 0 ? legacy : (product.images ?? []);
  }, [selectedColor, product.imagesWithColor, product.images]);

  const [mainImage, setMainImage] = useState(product.images?.[0] ?? "/placeholder.jpg");

  // Cuando cambia el color, actualiza la imagen principal
  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    setSelectedSize("");
    setQuantity(1);
    const exactMain = (product.imagesWithColor ?? []).find(img => img.color === colorName)?.url;
    if (exactMain) {
      setMainImage(exactMain);
      return;
    }
    const safeColor = colorName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
    const match = product.images?.find(url => url.toLowerCase().includes(safeColor));
    setMainImage(match ?? product.images?.[0] ?? "/placeholder.jpg");
  };

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
    () => Array.from({ length: Math.min(Math.max(maxStockForSelection, 1), 30) }, (_, i) => i + 1),
    [maxStockForSelection],
  );

  const isColorOutOfStock = useMemo(() => {
    return availableSizes.length > 0 && availableSizes.every((s) => s.stock === 0);
  }, [availableSizes]);

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

  // Función para abrir la guía de tallas (Fallback: Producto -> Categoría)
  const handleOpenSizeGuide = () => {
    const url = product.custom_size_guide_url || product.category?.default_size_guide_url;
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-transparent text-[#594246] dark:text-[#f0d8e8] font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <nav className="breadcrumb text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-[#e8688a]/80 mb-10 flex gap-2">
          <Link href="/" className="hover:text-[#632034] dark:hover:text-[#f0a0c0] cursor-pointer transition-colors">INICIO</Link> /
          <Link href="/catalogue/all" className="hover:text-[#632034] dark:hover:text-[#f0a0c0] cursor-pointer transition-colors">CATÁLOGO</Link> /
          <span className="active font-bold text-[#632034] dark:text-[#f0a0c0] uppercase">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <motion.div layoutId="main-img" className="aspect-3/4 bg-white dark:bg-transparent overflow-hidden relative border border-transparent dark:border-transparent">
              <img
                src={mainImage || "/placeholder.jpg"}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                alt={product.name}
              />
              <button 
                onClick={handleFavoriteClick}
                className="absolute top-6 right-6 p-3 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-full text-[#594246] dark:text-white hover:text-[#632034] dark:hover:text-[#f0a0c0] hover:bg-white dark:hover:bg-white/10 transition-all border border-transparent dark:border-[#e8688a]/20"
              >
                <Heart size={20} className={`stroke-2 ${isFavorited ? 'fill-[#F2778D] text-[#F2778D]' : ''}`} />
              </button>
            </motion.div>

            <div className="grid grid-cols-6 gap-3">
              {filteredImages.slice(0, 6).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`aspect-square bg-white dark:bg-transparent border transition-all ${
                    mainImage === img ? "border-[#C5A059] dark:border-[#f0a0c0] p-0.5" : "border-[#EBEAE8] dark:border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} miniatura ${idx + 1}`}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="border-b border-[#EBEAE8] dark:border-[#e8688a]/20 pb-6">
              {product.is_new_in && (
                <span className="badge-new-arrival inline-block bg-[#D9A2A8] dark:bg-transparent border border-transparent dark:border-[#e8688a]/80 text-white dark:text-[#e8688a] text-[9px] px-2.5 py-1 font-bold uppercase tracking-widest mb-4 shadow-sm">
                  NEW ARRIVAL
                </span>
              )}
              <h1 className="product-title text-3xl md:text-4xl font-serif uppercase tracking-widest leading-tight mb-3 text-[#632034] dark:text-white">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-5">
                <div className="stars flex text-[#C5A059] dark:text-[#e8688a]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" stroke="none" />
                  ))}
                </div>
                <span className="reviews-count text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#f0d8e8]/60 font-medium">
                  (156 RESEÑAS)
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <p className="product-price text-2xl font-medium tracking-tight text-[#632034] dark:text-[#f0a0c0]">
                  S/ {product.base_price.toFixed(2)}
                </p>
                <p className="product-price-original text-sm text-gray-400 line-through">
                  S/ {(product.base_price * 1.2).toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <span className="color-label text-[11px] uppercase tracking-[0.2em] font-bold block mb-4 text-[#594246] dark:text-white">
                COLOR: <span className="font-light text-gray-500 dark:text-[#f0d8e8]/70 uppercase">{selectedColor || "SELECCIONAR"}</span>
              </span>
              <div className="flex gap-4">
                {uniqueColors.map((colorObj) => (
                  <button
                    key={colorObj.name}
                    onClick={() => handleColorChange(colorObj.name)}
                    className={`color-swatch w-9 h-9 rounded-full border transition-all flex items-center justify-center ${
                      selectedColor === colorObj.name ? "active border-[#C5A059] dark:border-white p-[3px] scale-110" : "border-[#EBEAE8] dark:border-transparent"
                    }`}
                  >
                    <div
                      className="w-full h-full rounded-full border border-white"
                      style={{
                        backgroundColor: colorObj.hex,
                      }}
                      title={colorObj.name}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="size-label text-[11px] uppercase tracking-[0.2em] font-bold text-[#594246] dark:text-white">
                  TALLA: <span className="font-light text-gray-500 dark:text-[#f0d8e8]/70 uppercase">{selectedSize || "SELECCIONAR"}</span>
                </span>
                <button 
                  onClick={handleOpenSizeGuide}
                  className="size-guide-link text-[10px] uppercase tracking-widest border-b border-[#594246] dark:border-white pb-0.5 font-bold hover:text-[#C5A059] dark:hover:text-[#f0a0c0] hover:border-[#C5A059] dark:hover:border-[#f0a0c0] transition-all dark:text-white"
                >
                  GUÍA DE TALLAS
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
                    className={`size-btn h-14 flex flex-col items-center justify-center text-xs font-bold transition-all border rounded-lg ${
                      stock === 0
                        ? "bg-[#FAF9F6] dark:bg-transparent border-[#EBEAE8] dark:border-[#e8688a]/10 text-gray-300 dark:text-[#e8688a]/30 cursor-not-allowed"
                        : selectedSize === size
                        ? "active bg-[#632034] dark:bg-[#e8688a]/10 border-[#632034] dark:border-[#e8688a] text-white dark:text-white"
                        : "bg-white dark:bg-transparent border-gray-300 dark:border-[#e8688a]/30 hover:bg-[#FCF5F5] dark:hover:bg-[#e8688a]/5 hover:border-[#D9A2A8] dark:hover:border-[#e8688a] hover:text-[#632034] dark:hover:text-white text-[#594246] dark:text-[#e8688a]/80"
                    }`}
                  >
                    <span className="block text-[13px] font-bold">{size}</span>
                    <span className={`block text-[9px] font-normal mt-0.5 uppercase tracking-tighter ${
                      stock === 0 ? 'text-gray-300 dark:text-[#e8688a]/20' : selectedSize === size ? 'text-pink-200' : 'text-gray-400 dark:text-[#f0d8e8]/50'
                    }`}>
                      {stock > 0 ? `${stock} disp.` : 'Agotado'}
                    </span>
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className={`mt-4 text-[11px] uppercase tracking-widest font-bold ${
                  maxStockForSelection <= 3 ? 'text-red-500 animate-pulse' : 'text-[#C5A059] dark:text-[#e8b86d]'
                }`}>
                  {maxStockForSelection <= 3 
                    ? `¡Últimas ${maxStockForSelection} unidades disponibles!` 
                    : `Stock disponible: ${maxStockForSelection} unidades`
                  }
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex gap-3">
                <div className="relative border border-[#EBEAE8] dark:border-[#e8688a]/30 bg-white dark:bg-transparent group w-24">
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="quantity-selector w-full bg-transparent px-5 pr-9 py-4 text-xs font-bold outline-none appearance-none cursor-pointer text-[#594246] dark:text-white"
                  >
                    {quantityOptions.map((n) => (
                      <option key={n} value={n} className="text-black dark:text-white bg-white dark:bg-[#2d0a1e]">
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#f0d8e8]/70 pointer-events-none group-hover:text-[#632034] dark:group-hover:text-white transition-colors"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || isColorOutOfStock}
                  className={`btn-add-cart flex-1 text-[11px] font-bold uppercase tracking-[0.3em] py-4 rounded-sm transition-all border ${
                    canAddToCart && !isColorOutOfStock
                      ? "bg-[#632034] dark:bg-white/5 border-transparent dark:border-[#e8688a]/30 hover:bg-black dark:hover:bg-white/10 text-white dark:text-white active:scale-[0.98]"
                      : "bg-[#FDF9F3] dark:bg-transparent text-[#594246]/60 dark:text-[#f0d8e8]/50 border-[#EBEAE8] dark:border-[#e8688a]/30 cursor-not-allowed"
                  }`}
                >
                  {isColorOutOfStock 
                    ? "AGOTADO" 
                    : !selectedSize 
                    ? "SELECCIONA TU TALLA" 
                    : maxStockForSelection === 0 
                    ? "SIN STOCK DISPONIBLE" 
                    : "AGREGAR AL CARRITO"
                  }
                </button>
              </div>
              <p className="shipping-note text-[10px] text-gray-400 dark:text-[#f0d8e8]/50 italic">
                Envíos gratis en Lima por compras superiores a S/ 199
              </p>
            </div>

            <div className="shipping-card bg-[#FCF5F5] dark:bg-transparent border border-[#E5B3B8] dark:border-[#e8688a]/30 rounded-sm p-6 space-y-4">
              <div className="flex items-center gap-4 text-xs">
                <Truck className="shipping-icon text-[#D9A2A8] dark:text-white" size={20} strokeWidth={1.5} />
                <div className="info-card">
                  <p className="title font-bold text-[#594246] dark:text-white">Envíos gratis</p>
                  <p className="desc text-gray-500 dark:text-[#f0d8e8]/70">En Lima Metropolitana mayores a S/199.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs border-t border-[#E5B3B8] dark:border-[#e8688a]/30 pt-4">
                <RefreshCcw className="shipping-icon text-[#D9A2A8] dark:text-white" size={20} strokeWidth={1.5} />
                <div className="info-card">
                  <p className="title font-bold text-[#594246] dark:text-white">Cambios fáciles</p>
                  <p className="desc text-gray-500 dark:text-[#f0d8e8]/70">Hasta 30 días después de tu compra.</p>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 space-y-8">
              <div>
                <h3 className="product-details-title text-[11px] uppercase tracking-[0.3em] font-bold mb-6 text-[#594246] dark:text-white">
                  DETALLES DEL PRODUCTO
                </h3>
                <p className="product-details-text text-sm leading-relaxed text-gray-500 dark:text-[#f0d8e8]/70 font-light mb-6">
                  {product.description}
                </p>
                <ul className="space-y-3">
                  {product.highlights?.map((bullet, i) => (
                    <li key={i} className="text-sm text-gray-500 font-light flex items-start gap-3">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C5A059] shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 space-y-4">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#f0d8e8]/60 mb-6">
                  REF.: <span className="text-[#594246] dark:text-white font-bold">{product.sku}</span>
                </p>

                <div className="grid grid-cols-1 gap-y-4">
                  {[
                    { label: "GÉNERO", value: product.gender },
                    { label: "ESTILO", value: product.style_type || product.category?.name },
                    { label: "COMPOSICIÓN", value: product.composition },
                    { label: "TEMPORADA", value: product.season },
                  ].map((spec, i) => (
                    spec.value && (
                      <div key={i} className="flex items-center text-[11px] uppercase tracking-[0.15em]">
                        <span className="w-32 text-gray-400 dark:text-[#f0d8e8]/60">{spec.label} :</span>
                        <span className="font-bold text-[#594246] dark:text-[#e8688a]">{spec.value}</span>
                      </div>
                    )
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