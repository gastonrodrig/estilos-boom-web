'use client';

import { useState, useEffect } from 'react';
import { Star, Camera, UploadCloud, MessageSquareHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewsApi } from '../../../api/reviews/reviews-api';
import { getFirebaseAuthToken } from '@helpers';
import { getAuthConfig } from '@utils';
import { useAuthStore } from '@hooks';

// Mock Data for pending reviews
const PENDING_REVIEWS = [
  {
    id: 1,
    name: "Blusa Romántica",
    size: "S",
    orderId: "0038",
    deliveryDate: "10 de mayo, 2026",
    image: "/assets/product/vestido-corto-floral-cuello-v.png",
  },
  {
    id: 2,
    name: "Falda Midi Elegante",
    size: "M",
    orderId: "0038",
    deliveryDate: "10 de mayo, 2026",
    image: "/assets/product/vestido-elegante-encaje-volantes.png",
  }
];

const RATING_PHRASES: Record<number, string> = {
  1: "No era lo que esperaba 😔",
  2: "Puede mejorar un poquito 🤔",
  3: "Está lindo, me gusta 🙂",
  4: "¡Muy hermoso, me encanta! 😍",
  5: "¡Simplemente perfecto, me siento una reina! ✨",
};

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [completedReviews, setCompletedReviews] = useState<any[]>([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const { status } = useAuthStore();

  useEffect(() => {
    if (activeTab === 'completed') {
      const loadCompletedReviews = async () => {
        if (status === 'checking') return;

        if (status !== 'authenticated') {
          setCompletedReviews([]);
          setLoadingCompleted(false);
          return;
        }

        setLoadingCompleted(true);
        try {
          const token = await getFirebaseAuthToken();
          const { data } = await reviewsApi.get('/user/me', getAuthConfig({ token }));
          setCompletedReviews(data || []);
        } catch (error) {
          console.error("Error loading user reviews:", error);
        } finally {
          setLoadingCompleted(false);
        }
      };
      loadCompletedReviews();
    }
  }, [activeTab, status]);

  return (
    <div className="relative space-y-8 w-full pb-10 min-h-[80vh]">
      
      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-serif font-medium text-[#594246] dark:text-[#f8f0f5] tracking-wide">Tus Reseñas</h1>
        <p className="text-[#594246]/70 dark:text-[#f0d8e8]/70 text-sm mt-1 font-medium">Comparte tu experiencia con otras compradoras.</p>
      </div>

      {/* Elegant Fairy-Tale Tabs */}
      <div className="relative z-10 flex gap-2 p-1.5 bg-white dark:bg-[#2d0a1e]/40 rounded-full w-fit shadow-[0_4px_20px_-4px_rgba(89,66,70,0.04)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-[#EBEAE8] dark:border-[#e8688a]/20">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 relative
            ${activeTab === 'pending' ? 'text-[#594246] dark:text-[#2d0a1e]' : 'text-[#594246]/60 dark:text-[#f0d8e8]/60 hover:text-[#594246] dark:hover:text-[#f8f0f5]'}
          `}
        >
          {activeTab === 'pending' && (
            <motion.div 
              layoutId="active-tab"
              className="absolute inset-0 bg-gradient-to-r from-[#F2D0D3]/40 to-[#F2B6C1]/30 dark:from-[#e8688a] dark:to-[#f0a0c0] rounded-full border border-[#F2D0D3] dark:border-[#e8688a] -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            ></motion.div>
          )}
          Pendientes de reseñar
        </button>

        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 relative
            ${activeTab === 'completed' ? 'text-[#594246] dark:text-[#2d0a1e]' : 'text-[#594246]/60 dark:text-[#f0d8e8]/60 hover:text-[#594246] dark:hover:text-[#f8f0f5]'}
          `}
        >
          {activeTab === 'completed' && (
            <motion.div 
              layoutId="active-tab"
              className="absolute inset-0 bg-gradient-to-r from-[#F2D0D3]/40 to-[#F2B6C1]/30 dark:from-[#e8688a] dark:to-[#f0a0c0] rounded-full border border-[#F2D0D3] dark:border-[#e8688a] -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            ></motion.div>
          )}
          Mis reseñas
        </button>
      </div>

      <div className="pt-2 relative z-10">
        <h2 className="text-xl font-bold text-[#594246] dark:text-[#f8f0f5]">
          {activeTab === 'pending' ? 'Productos que puedes reseñar' : 'Reseñas publicadas'}
        </h2>
        <p className="text-[#594246]/70 dark:text-[#f0d8e8]/70 text-sm mt-1 font-medium">
          {activeTab === 'pending' ? 'Solo aparecen productos de pedidos ya entregados.' : 'Estas son las opiniones que has compartido.'}
        </p>
      </div>

      {/* Review Cards */}
      <div className="space-y-8 relative z-10">
        {activeTab === 'pending' && PENDING_REVIEWS.map((product) => (
          <ReviewCard key={product.id} product={product} />
        ))}

        {activeTab === 'completed' && (
          loadingCompleted ? (
            <p className="text-center text-[#594246]/50">Cargando tus reseñas...</p>
          ) : completedReviews.length > 0 ? (
            <div className="space-y-6">
              {completedReviews.map((rev: any) => (
                <div key={rev._id} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.15)] border border-[#EBEAE8] p-6 flex flex-col sm:flex-row gap-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F2778D] to-[#F2B6C1]"></div>
                  
                  {/* Left part: Product image/details */}
                  <div className="flex items-center gap-4 sm:w-1/3 shrink-0">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#FAF9F6] border border-[#EBEAE8] shrink-0">
                      <img src={rev.productId?.images?.[0] || "/assets/product/vestido-corto-floral-cuello-v.png"} alt={rev.productId?.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#632034] text-sm line-clamp-2">{rev.productId?.name || "Producto"}</h4>
                      <p className="text-[#594246]/50 text-xs mt-1">Calificación: {rev.rating} ★</p>
                    </div>
                  </div>

                  {/* Right part: Stars & comment */}
                  <div className="flex-1">
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= rev.rating ? 'fill-[#F2778D] text-[#F2778D]' : 'fill-transparent text-[#EBEAE8]'}`} />
                      ))}
                    </div>
                    <p className="text-[#594246] text-sm font-medium italic">"{rev.comment || 'Sin comentario'}"</p>
                    <p className="text-[#594246]/40 text-[10px] mt-2 font-bold">Publicado el {new Date(rev.createdAt).toLocaleDateString('es-PE')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-[#594246]/40 dark:text-[#f8f0f5]/40 bg-white/60 backdrop-blur-sm rounded-3xl border border-[#EBEAE8] shadow-sm">
              <MessageSquareHeart className="w-16 h-16 mb-4 stroke-1 opacity-50" />
              <p className="text-lg font-medium">Aún no has publicado ninguna reseña.</p>
            </div>
          )
        )}
      </div>

    </div>
  );
}

// Separate component for the review card to handle its own state
function ReviewCard({ product }: { product: any }) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");

  const displayRating = hoverRating || rating;

  return (
    <div className="bg-white/90 dark:bg-[#2d0a1e]/40 backdrop-blur-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.15)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-[#F2D0D3]/60 dark:border-[#e8688a]/20 p-6 lg:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 transition-shadow duration-300 hover:shadow-[0_15px_50px_-10px_rgba(89,66,70,0.25)] dark:hover:shadow-[0_12px_40px_-4px_rgba(232,104,138,0.2)] relative overflow-hidden">
      
      {/* Subtle top accent line for elegance */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F2778D] via-[#632034] to-[#F2B6C1] dark:from-[#e8688a] dark:via-[#f0a0c0] dark:to-[#e8688a]"></div>

      {/* Left Column: Product Info (Now symmetrical and vertically stacked) */}
      <div className="flex flex-col items-center text-center lg:w-1/4 shrink-0 border-b lg:border-b-0 lg:border-r border-[#EBEAE8] dark:border-[#e8688a]/20 pb-6 lg:pb-0 lg:pr-8">
        <div className="w-28 h-36 lg:w-40 lg:h-52 shrink-0 rounded-2xl overflow-hidden bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/20 shadow-sm mb-4">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        {/* Stronger Wine color for product name */}
        <h3 className="text-lg font-bold text-[#632034] dark:text-[#f8f0f5] leading-tight px-2">{product.name}</h3>
        {/* Removed high transparency for better readability */}
        <p className="text-[#594246] dark:text-[#f0d8e8]/80 text-sm font-bold mt-1">Talla {product.size}</p>
        
        <div className="mt-4 pt-4 border-t border-[#EBEAE8] dark:border-[#e8688a]/20 w-full space-y-1">
          <p className="text-[#632034] dark:text-[#f0a0c0] font-medium text-xs">Pedido #{product.orderId}</p>
          <p className="text-[#632034] dark:text-[#f0a0c0] font-medium text-xs">Entregado: {product.deliveryDate}</p>
        </div>
      </div>

      {/* Right Column: Review Form */}
      <div className="flex-1 flex flex-col">
        
        {/* Star Rating Section */}
        <div className="mb-6">
          <p className="text-[#632034] font-bold text-sm mb-3">Califica este product</p>
          <div className="flex items-center gap-4">
            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  className="p-1 transition-transform hover:scale-110 active:scale-90"
                >
                  <Star 
                    className={`w-8 h-8 transition-all duration-300 ${
                      star <= displayRating 
                        ? 'fill-[#F2778D] dark:fill-[#e8688a] text-[#F2778D] dark:text-[#e8688a] drop-shadow-[0_2px_8px_rgba(242,119,141,0.5)]' 
                        : 'fill-transparent text-[#EBEAE8] dark:text-[#e8688a]/30'
                    }`} 
                  />
                </button>
              ))}
            </div>
            
            {/* Motivational Phrase */}
            <AnimatePresence mode="wait">
              {displayRating > 0 && (
                <motion.span 
                  key={displayRating}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-[#632034] dark:text-[#f8f0f5] font-bold text-sm italic bg-[#F2D0D3]/30 dark:bg-[#e8688a]/20 px-4 py-2 rounded-full border border-[#F2D0D3]/50 dark:border-[#e8688a]/30 shadow-sm"
                >
                  {RATING_PHRASES[displayRating]}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Text Area */}
        <div className="mb-6">
          <p className="text-[#632034] dark:text-[#f8f0f5] font-bold text-sm mb-3 flex items-center justify-between">
            <span>Cuéntanos tu experiencia <span className="text-[#632034]/60 dark:text-[#f0a0c0]/80 font-medium">(opcional)</span></span>
          </p>
          <textarea 
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="¿Qué te pareció la tela? ¿Cómo te quedó la talla? ¡Ayuda a otras chicas a decidirse!"
            className="w-full bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/30 rounded-2xl p-4 text-[#632034] dark:text-[#f8f0f5] font-medium placeholder:text-[#594246]/40 dark:placeholder:text-[#f8f0f5]/40 focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] dark:focus:ring-[#e8688a]/50 focus:border-[#F2D0D3] dark:focus:border-[#e8688a]/50 transition-all resize-none shadow-inner"
          />
        </div>

        {/* Action Buttons: Submit */}
        <div className="flex flex-col sm:flex-row gap-4 mt-auto">
          
          {/* Submit Button */}
          <button 
            disabled={rating === 0}
            onClick={async () => {
              try {
                const token = await getFirebaseAuthToken();
                const cleanProductId = (product.id.toString().length === 24) ? product.id.toString() : '65f1a2b3c4d5e6f7a8b9c0d1';
                const cleanOrderId = (product.orderId && product.orderId.toString().length === 24) ? product.orderId.toString() : '65f1a2b3c4d5e6f7a8b9c0d1';
                
                await reviewsApi.post('/', {
                  productId: cleanProductId,
                  orderId: cleanOrderId,
                  rating: rating,
                  comment: reviewText
                }, getAuthConfig({ token }));
                alert('¡Reseña publicada con éxito!');
                setReviewText("");
                setRating(0);
              } catch (error) {
                console.error("Error submitting review:", error);
                alert('Hubo un error al publicar tu reseña. Por favor intenta de nuevo.');
              }
            }}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-sm
              ${rating > 0 
                ? 'bg-[#632034] dark:bg-[#e8688a]/20 text-white dark:text-[#f0a0c0] hover:bg-[#F2778D] dark:hover:bg-[#e8688a] dark:hover:text-[#f8f0f5] border-2 border-transparent dark:border-[#e8688a]/30 hover:shadow-md' 
                : 'bg-[#EBEAE8] dark:bg-white/5 text-[#594246]/50 dark:text-[#f8f0f5]/30 cursor-not-allowed shadow-none border-2 border-[#EBEAE8] dark:border-transparent'}
            `}
          >
            <UploadCloud className="w-5 h-5" />
            Publicar reseña
          </button>

        </div>
        
        {rating === 0 && (
          <p className="text-center sm:text-right text-[12px] text-[#632034]/60 dark:text-[#f0a0c0]/80 mt-2 font-bold">
            * Debes seleccionar al menos una estrella para publicar.
          </p>
        )}

      </div>
    </div>
  );
}
