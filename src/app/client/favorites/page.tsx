'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { favoritesApi } from '../../../api/favorites/favorites-api';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const MOCK_FAVORITES = [
  {
    id: 1,
    name: "Vestido Floral Primavera",
    price: 129.90,
    size: "S",
    image: "/assets/product/vestido-corto-floral-cuello-v.png",
    inStock: true,
  },
  {
    id: 2,
    name: "Vestido Elegante Encaje",
    price: 150.00,
    size: "M",
    image: "/assets/product/vestido-elegante-encaje-volantes.png",
    inStock: true,
  },
  {
    id: 3,
    name: "Vestido Escote V",
    price: 95.00,
    size: "L",
    image: "/assets/product/vestido-escote-v.png",
    inStock: false,
  },
  {
    id: 4,
    name: "Vestido Línea A Floral",
    price: 110.00,
    size: "M",
    image: "/assets/product/vestido-linea-a-floral.png",
    inStock: true,
  },
  {
    id: 5,
    name: "Vestido Midi Halter",
    price: 89.90,
    size: "S",
    image: "/assets/product/vestido-midi-halter.png",
    inStock: false,
  },
];

type FilterType = 'all' | 'available' | 'out_of_stock';

export default function FavoritesPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Local state to track which items are still favorited (for the visual toggle)
  const [favoritedIds, setFavoritedIds] = useState<number[]>(
    MOCK_FAVORITES.map(item => item.id)
  );

  const toggleFavorite = async (id: number) => {
    const isCurrentlyFavorited = favoritedIds.includes(id);
    
    // Optimistic UI update
    setFavoritedIds(prev => 
      isCurrentlyFavorited ? prev.filter(fId => fId !== id) : [...prev, id]
    );

    // Simulate Axios/Fetch connection
    try {
      if (isCurrentlyFavorited) {
        await favoritesApi.delete(`/${id}`);
      } else {
        await favoritesApi.post('/', { productId: id.toString() });
      }
    } catch (error) {
      console.error(error);
      // Revert optimistic update on error
      setFavoritedIds(prev => 
        isCurrentlyFavorited ? [...prev, id] : prev.filter(fId => fId !== id)
      );
    }
  };

  const filteredProducts = MOCK_FAVORITES.filter(item => {
    if (filter === 'available') return item.inStock;
    if (filter === 'out_of_stock') return !item.inStock;
    return true; // 'all'
  });

  return (
    <div className="space-y-8 w-full pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-medium text-[#594246] tracking-wide">Mis favoritos</h1>
        <p className="text-[#594246]/70 mt-1 font-light">{MOCK_FAVORITES.length} productos guardados</p>
        <p className="text-[#594246]/50 text-sm mt-1">Productos que guardaste para más tarde</p>
      </div>

      {/* Elegant Fairy-Tale Filters */}
      <div className="flex gap-2 p-1.5 bg-white rounded-full w-fit shadow-[0_4px_20px_-4px_rgba(89,66,70,0.04)] border border-[#EBEAE8]">
        <button 
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 relative
            ${filter === 'all' ? 'text-[#594246]' : 'text-[#594246]/50 hover:text-[#594246]/80'}
          `}
        >
          {filter === 'all' && (
            <motion.div 
              layoutId="active-pill"
              className="absolute inset-0 bg-gradient-to-r from-[#F2D0D3]/40 to-[#F2B6C1]/30 rounded-full border border-[#F2D0D3] -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            ></motion.div>
          )}
          Todos
        </button>

        <button 
          onClick={() => setFilter('available')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 relative
            ${filter === 'available' ? 'text-[#594246]' : 'text-[#594246]/50 hover:text-[#594246]/80'}
          `}
        >
          {filter === 'available' && (
            <motion.div 
              layoutId="active-pill"
              className="absolute inset-0 bg-gradient-to-r from-[#F2D0D3]/40 to-[#F2B6C1]/30 rounded-full border border-[#F2D0D3] -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            ></motion.div>
          )}
          Disponibles
        </button>

        <button 
          onClick={() => setFilter('out_of_stock')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 relative
            ${filter === 'out_of_stock' ? 'text-[#594246]' : 'text-[#594246]/50 hover:text-[#594246]/80'}
          `}
        >
          {filter === 'out_of_stock' && (
            <motion.div 
              layoutId="active-pill"
              className="absolute inset-0 bg-gradient-to-r from-[#F2D0D3]/40 to-[#F2B6C1]/30 rounded-full border border-[#F2D0D3] -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            ></motion.div>
          )}
          Sin stock
        </button>
      </div>

      {/* Products Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pt-4">
        <AnimatePresence>
          {filteredProducts.map(product => {
            const isFavorited = favoritedIds.includes(product.id);
            
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={product.id} 
                className="group flex flex-col bg-transparent"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-[#FAF9F6] border border-[#EBEAE8]/50 shadow-sm transition-shadow duration-500 group-hover:shadow-[0_12px_40px_-10px_rgba(89,66,70,0.15)] mb-4">
                  {/* The Image */}
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className={`w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 ${!product.inStock ? 'opacity-40 grayscale-[0.5]' : ''}`}
                  />

                  {/* Out of stock overlay */}
                  {!product.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#594246]/10 backdrop-blur-[1px]">
                      <div className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-[#EBEAE8] shadow-sm">
                        <span className="text-[#594246]/70 font-bold text-sm tracking-wide">Sin stock</span>
                      </div>
                    </div>
                  )}

                  {/* Heart Button */}
                  <button 
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors duration-300 ${isFavorited ? 'fill-[#F2778D] text-[#F2778D]' : 'text-[#594246]/40'}`} 
                    />
                  </button>
                </div>

                {/* Product Info */}
                <div className="px-2 flex flex-col flex-1">
                  <h3 className="text-[#594246] font-bold text-[15px] leading-tight line-clamp-1">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2 mb-4">
                    <p className="text-[#F2778D] font-bold text-lg">S/ {product.price.toFixed(2)}</p>
                    <span className="text-xs font-bold text-[#594246]/50 bg-[#EBEAE8]/50 px-2.5 py-1 rounded-md">
                      Talla {product.size}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    disabled={!product.inStock}
                    className={`mt-auto w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all duration-300
                      ${product.inStock 
                        ? 'bg-[#F2D0D3]/40 text-[#594246] border border-[#F2D0D3] hover:bg-[#F2778D] hover:text-white hover:border-[#F2778D] shadow-sm' 
                        : 'bg-[#EBEAE8] text-[#594246]/30 border border-[#EBEAE8] cursor-not-allowed'}
                    `}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.inStock ? 'Agregar al carrito' : 'No disponible'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#594246]/40">
            <Heart className="w-16 h-16 mb-4 stroke-1 opacity-50" />
            <p className="text-lg font-medium">No hay vestidos en esta categoría.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
