"use client";

import { Star, MessageSquareHeart, Filter, Search, ShieldCheck, MoreVertical, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Review {
  id: string;
  clientName: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  status: "Publicado" | "Oculto";
}

const dummyReviews: Review[] = [
  { id: "REV-001", clientName: "Lucía Gómez", productName: "Vestido Floral Primavera", rating: 5, comment: "¡Me encantó! La tela es súper suave y el diseño tal cual la foto. El envío fue rapidísimo. Definitivamente volveré a comprar.", date: "15 Oct 2023", verified: true, status: "Publicado" },
  { id: "REV-002", clientName: "María Pérez", productName: "Blusa Elegance Blanca", rating: 4, comment: "Muy bonita, aunque la talla M me quedó un poco suelta. La calidad de la tela es muy buena y fresca.", date: "12 Oct 2023", verified: true, status: "Publicado" },
  { id: "REV-003", clientName: "Ana Rodríguez", productName: "Pantalón Denim Clásico", rating: 2, comment: "El pantalón llegó con un pequeño defecto en la costura, tuve que llevarlo a arreglar. El color sí es muy bonito.", date: "10 Oct 2023", verified: false, status: "Oculto" },
  { id: "REV-004", clientName: "Carla Mendoza", productName: "Chaqueta Cuero Sintético", rating: 5, comment: "Espectacular. Una de las mejores compras que he hecho este año. Combina con todo y abriga súper bien.", date: "05 Oct 2023", verified: true, status: "Publicado" },
  { id: "REV-005", clientName: "Sofía Vargas", productName: "Falda Midi Plisada", rating: 3, comment: "La falda es linda pero el color real es un poco más oscuro que en la foto de la web.", date: "02 Oct 2023", verified: true, status: "Publicado" },
];

export default function AdminReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<number | "all">("all");

  const filteredReviews = dummyReviews.filter((r) => {
    if (filterRating !== "all" && r.rating !== filterRating) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.clientName.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 dark:bg-black/30 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#EAE0E2] dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#D6405F] dark:text-[#F8BBD0]">
            <MessageSquareHeart className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Feedback</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#40202D] dark:text-white tracking-wide mt-2">Reseñas de Clientes</h1>
          <p className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-300 mt-1">Lee lo que opinan tus clientes sobre tus productos.</p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="text-center px-4">
            <p className="text-3xl font-black text-[#D6405F] dark:text-[#F8BBD0]">4.6</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">Promedio Global</p>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8C6B79] dark:text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, producto o palabra clave..." 
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md text-[13px] font-bold text-[#40202D] dark:text-white outline-none focus:ring-2 focus:ring-[#D6405F]/50 shadow-inner transition-all placeholder:text-[#8C6B79]/50"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <button 
            onClick={() => setFilterRating("all")}
            className={`shrink-0 h-14 px-6 rounded-2xl border ${filterRating === "all" ? 'border-[#D6405F] bg-gradient-to-r from-[#D6405F]/10 to-[#F23B69]/10 text-[#D6405F]' : 'border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-400 hover:bg-white/80'} font-black text-[11px] uppercase tracking-widest transition-colors shadow-sm`}
          >
            Todas
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button 
              key={star}
              onClick={() => setFilterRating(star)}
              className={`shrink-0 flex items-center gap-1 h-14 px-5 rounded-2xl border ${filterRating === star ? 'border-amber-400 bg-amber-400/10 text-amber-600 dark:text-amber-400' : 'border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-400 hover:bg-white/80'} font-black text-[13px] transition-colors shadow-sm`}
            >
              {star} <Star className={`w-4 h-4 ${filterRating === star ? 'fill-amber-400 text-amber-400' : 'text-[#8C6B79] dark:text-gray-400'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid (Pinterest Style / Masonry feel) */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        <AnimatePresence>
          {filteredReviews.map((review) => (
            <motion.div 
              key={review.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="break-inside-avoid bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-3xl p-6 border border-[#EAE0E2] dark:border-white/10 shadow-sm hover:shadow-md transition-shadow group relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D6405F] to-[#F23B69] flex items-center justify-center text-white font-black shadow-inner">
                    {review.clientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#40202D] dark:text-white flex items-center gap-1">
                      {review.clientName}
                      {review.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500"  />}
                    </h3>
                    <p className="text-[11px] font-medium text-[#8C6B79] dark:text-gray-400">{review.date}</p>
                  </div>
                </div>
                
                <button className="text-[#8C6B79] hover:text-[#40202D] dark:hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 dark:fill-white/10 dark:text-white/10'}`} />
                ))}
              </div>

              <p className="text-[13px] font-medium text-[#40202D] dark:text-gray-300 mb-4 leading-relaxed">
                "{review.comment}"
              </p>

              <div className="pt-4 border-t border-[#EAE0E2] dark:border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D6405F] dark:text-[#F8BBD0]">
                  {review.productName}
                </span>
                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${review.status === 'Publicado' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-500'}`}>
                  {review.status}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredReviews.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white/30 dark:bg-white/5 rounded-3xl border border-dashed border-[#EAE0E2] dark:border-white/20">
            <MessageSquareHeart className="w-12 h-12 mx-auto text-[#8C6B79]/50 mb-3" />
            <p className="text-[#8C6B79] font-medium">No se encontraron reseñas con esos filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
