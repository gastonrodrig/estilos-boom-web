"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useProductStore } from "@/hooks/product/use-product-store";
import { ProductDetail, RelatedProducts } from "@/components";
import { Product } from "@/core/models";
import { Loader2 } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams();
  const { getProductById, products, loading } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const found = products.find(p => p.id_product === id);
    
    if (found) {
      setProduct(found);
    } else if (id) {
      getProductById(id as string).then(data => setProduct(data));
    }
  }, [id, products, getProductById]);

  if (loading && !product) return (
    <div className="h-screen flex flex-col items-center justify-center gap-3 text-[#8B3A52] dark:text-[#f0a0c0] animate-in fade-in duration-500">
      <Loader2 size={32} className="animate-spin opacity-80" />
      <span className="text-xs font-semibold tracking-widest uppercase opacity-80">Cargando producto...</span>
    </div>
  );

  if (!product) return <div className="h-screen flex items-center justify-center">Producto no encontrado</div>;

  return (
    <>
      <style>{`
        /* 🌑 FONDO */
        html.dark .product-detail-page,
        html.dark .product-page {
          background:
            radial-gradient(ellipse 60% 40% at 75% 15%, rgba(196,84,122,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 50% 35% at 20% 80%, rgba(232,184,109,0.06) 0%, transparent 50%),
            #1a0618 !important;
        }

        /* 🍞 BREADCRUMB */
        html.dark .breadcrumb,
        html.dark .breadcrumb a,
        html.dark .breadcrumb span {
          color: rgba(253,238,245,0.35) !important;
          font-size: 0.72rem !important;
          letter-spacing: 0.1em !important;
        }
        html.dark .breadcrumb .active,
        html.dark .breadcrumb span:last-child {
          color: rgba(232,184,109,0.7) !important;
        }

        /* 🏷️ BADGE "NEW ARRIVAL" */
        html.dark .badge-new-arrival {
          border: 1px solid rgba(232,184,109,0.4) !important;
          color: #e8b86d !important;
          background: rgba(232,184,109,0.08) !important;
          border-radius: 4px !important;
          font-size: 0.65rem !important;
          letter-spacing: 0.12em !important;
          padding: 3px 10px !important;
        }

        /* 📝 TÍTULO Y PRECIO */
        html.dark .product-title {
          color: #fdeef5 !important;
          font-family: 'Playfair Display', serif !important;
          font-weight: 400 !important;
          letter-spacing: 0.02em !important;
        }

        html.dark .product-price {
          color: #f0a0c0 !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 700 !important;
        }

        html.dark .product-price-original {
          color: rgba(253,238,245,0.3) !important;
          text-decoration: line-through !important;
        }

        /* ⭐ RESEÑAS */
        html.dark .stars { color: #e8b86d !important; }
        html.dark .reviews-count {
          color: rgba(253,238,245,0.4) !important;
          font-size: 0.82rem !important;
        }

        /* 🎨 SELECTOR DE COLOR */
        html.dark .color-label,
        html.dark .size-label {
          color: rgba(253,238,245,0.5) !important;
          font-size: 0.72rem !important;
          letter-spacing: 0.12em !important;
          text-transform: uppercase !important;
        }
        html.dark .color-label span,
        html.dark .size-label span {
          color: #fdeef5 !important;
          font-weight: 500 !important;
        }

        html.dark .color-swatch {
          border: 2px solid rgba(253,238,245,0.15) !important;
          border-radius: 50% !important;
          transition: border-color 0.2s !important;
        }
        html.dark .color-swatch.active,
        html.dark .color-swatch:hover {
          border-color: #e8b86d !important;
          box-shadow: 0 0 0 2px rgba(232,184,109,0.3) !important;
        }

        /* 📐 SELECTOR DE TALLA */
        html.dark .size-btn {
          background: rgba(26,8,18,0.8) !important;
          border: 1px solid rgba(196,84,122,0.2) !important;
          color: rgba(253,238,245,0.6) !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-size: 0.82rem !important;
          transition: all 0.2s ease !important;
        }
        html.dark .size-btn:hover {
          border-color: rgba(232,184,109,0.5) !important;
          color: #fdeef5 !important;
          background: rgba(232,184,109,0.06) !important;
        }
        html.dark .size-btn.active {
          background: rgba(232,184,109,0.1) !important;
          border-color: #e8b86d !important;
          color: #e8b86d !important;
        }

        /* 🔢 SELECTOR CANTIDAD */
        html.dark .quantity-selector {
          background: rgba(26,8,18,0.8) !important;
          border: 1px solid rgba(196,84,122,0.2) !important;
          color: #fdeef5 !important;
          border-radius: 8px !important;
        }

        /* 🛒 BOTÓN PRINCIPAL */
        html.dark .btn-add-cart {
          background: rgba(196,84,122,0.12) !important;
          border: 1px solid rgba(196,84,122,0.35) !important;
          color: #f0a0c0 !important;
          border-radius: 4px !important;
          font-size: 0.78rem !important;
          letter-spacing: 0.12em !important;
          text-transform: uppercase !important;
          font-weight: 500 !important;
          transition: all 0.25s ease !important;
        }
        html.dark .btn-add-cart:hover {
          background: rgba(196,84,122,0.22) !important;
          border-color: #f0a0c0 !important;
          color: #fdeef5 !important;
        }

        /* 📦 CARDS DE ENVÍO Y CAMBIOS */
        html.dark .shipping-card,
        html.dark .info-card {
          background: rgba(26,8,18,0.7) !important;
          border: 1px solid rgba(196,84,122,0.12) !important;
          border-radius: 10px !important;
          backdrop-filter: blur(8px) !important;
        }
        html.dark .shipping-card .title,
        html.dark .info-card strong {
          color: #fdeef5 !important;
          font-size: 0.88rem !important;
        }
        html.dark .shipping-card .desc,
        html.dark .info-card p {
          color: rgba(253,238,245,0.45) !important;
          font-size: 0.8rem !important;
        }
        html.dark .shipping-icon {
          color: #e8b86d !important;
        }

        /* 📋 DETALLES DEL PRODUCTO */
        html.dark .product-details-title {
          color: rgba(232,184,109,0.7) !important;
          font-size: 0.7rem !important;
          letter-spacing: 0.16em !important;
          text-transform: uppercase !important;
          border-bottom: 1px solid rgba(196,84,122,0.12) !important;
          padding-bottom: 10px !important;
        }
        html.dark .product-details-text {
          color: rgba(253,238,245,0.55) !important;
          font-size: 0.85rem !important;
          line-height: 1.7 !important;
        }

        /* 🔗 GUÍA DE TALLAS */
        html.dark .size-guide-link {
          color: rgba(232,184,109,0.6) !important;
          font-size: 0.75rem !important;
          letter-spacing: 0.08em !important;
          text-decoration: underline !important;
          text-underline-offset: 3px !important;
          text-decoration-color: rgba(232,184,109,0.3) !important;
        }
        html.dark .size-guide-link:hover {
          color: #e8b86d !important;
        }

        /* 💬 NOTA DE ENVÍO GRATIS */
        html.dark .shipping-note {
          color: rgba(253,238,245,0.35) !important;
          font-size: 0.75rem !important;
          font-style: italic !important;
        }
      `}</style>
    <main className="product-page min-h-screen bg-[#FAF9F6] dark:bg-transparent transition-colors duration-300">
      <div className="pt-0">
        <ProductDetail product={product} />
      </div>
      
      <RelatedProducts 
        currentCategoryId={product.category?.name} 
        currentProductId={product.id_product} 
      />
    </main>
    </>
  );
}