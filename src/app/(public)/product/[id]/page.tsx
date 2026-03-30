"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useProductStore } from "@/hooks/product/use-product-store";
import { ProductDetail, RelatedProducts } from "@/components";
import { Product } from "@/core/models";

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
      
      <RelatedProducts 
        currentCategoryId={product.category?.name} 
        currentProductId={product.id_product} 
      />
    </main>
  );
}