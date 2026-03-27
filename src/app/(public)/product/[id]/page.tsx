"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useProductStore } from "@/hooks/product/use-product-store";
import { ProductDetail,RelatedProducts } from "@/components";
import { Product } from "@/core/models";

export default function ProductPage() {
  const { id } = useParams();
  const { getProductById, products, loading } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // 1. Buscamos en el store local
    const found = products.find(p => p.id_product === id);
    console.log("Buscando producto con ID:", id, "Encontrado:", found);
    console.log("Productos en store:", products);
    
    if (found) {
      setProduct(found);
    } else if (id) {
      // 2. Si no está (F5), lo traemos del API directamente
      getProductById(id as string).then(data => setProduct(data));
    }
  }, [id, products, getProductById]);

  if (loading && !product) return (
    <div className="h-screen flex items-center justify-center animate-pulse text-pink-400 font-serif">
      Cargando Estilos Boom...
    </div>
  );

  if (!product) return <div className="h-screen flex items-center justify-center">Producto no encontrado</div>;

  return (
  <main className="min-h-screen bg-[#FAF9F6]">
    <div className="pt-0">
      <ProductDetail product={product} />
    </div>
    
    {/* Sección de Recomendados */}
    <RelatedProducts 
      currentCategoryId={product.category?.name} 
      currentProductId={product.id_product} 
    />
  </main>
  );
}