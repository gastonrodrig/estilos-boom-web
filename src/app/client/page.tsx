'use client';

import { Package, Heart, TrendingUp, Clock, CheckCircle2, MessageCircleHeart } from 'lucide-react';
import Image from 'next/image';

export default function ClientHomePage() {
  return (
    <div className="space-y-10 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-medium text-[#594246] dark:text-white tracking-wide">¡Bienvenida de nuevo!</h1>
        <p className="text-[#594246]/70 dark:text-white/70 mt-2 font-light">Aquí está un resumen de tu actividad</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white/60 dark:bg-[#2d0a1e]/40 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.05)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-white/40 dark:border-[#e8688a]/20 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F2D0D3] to-[#F2B6C1] dark:from-[#e8688a]/20 dark:to-[#f0a0c0]/20 flex items-center justify-center shadow-inner">
            <Package className="w-7 h-7 text-[#594246] dark:text-[#f0a0c0]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-3xl font-medium text-[#594246] dark:text-[#f8f0f5]">2</p>
            <p className="text-sm text-[#594246]/70 dark:text-[#f0d8e8]/90 mt-0.5 font-medium">Pedidos activos</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white/60 dark:bg-[#2d0a1e]/40 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.05)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-white/40 dark:border-[#e8688a]/20 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F2778D]/30 to-[#F291A3]/30 dark:from-[#e8688a]/30 dark:to-[#f0a0c0]/30 flex items-center justify-center shadow-inner">
            <Heart className="w-7 h-7 text-[#F2778D] dark:text-[#e8688a]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-3xl font-medium text-[#594246] dark:text-[#f8f0f5]">8</p>
            <p className="text-sm text-[#594246]/70 dark:text-[#f0d8e8]/90 mt-0.5 font-medium">Productos favoritos</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white/60 dark:bg-[#2d0a1e]/40 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.05)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-white/40 dark:border-[#e8688a]/20 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#EBEAE8] to-[#F2D0D3] dark:from-[#e8688a]/10 dark:to-[#f0a0c0]/10 flex items-center justify-center shadow-inner">
            <TrendingUp className="w-7 h-7 text-[#594246] dark:text-[#f0a0c0]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-3xl font-medium text-[#594246] dark:text-[#f8f0f5]">5</p>
            <p className="text-sm text-[#594246]/70 dark:text-[#f0d8e8]/90 mt-0.5 font-medium">Compras completadas</p>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="relative rounded-[2rem] overflow-hidden shadow-[0_12px_40px_-10px_rgba(89,66,70,0.2)] flex bg-[#594246] w-full min-h-[220px]">
        {/* The background image */}
        <img 
          src="/assets/FloresRosadas.png" 
          alt="Nueva Colección" 
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />
        
        {/* The Magic Gradient Overlay (Softer to show more flowers) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#594246] via-[#594246]/60 via-45% to-transparent w-full dark:from-[#2d0a1e] dark:via-[#2d0a1e]/60"></div>

        {/* Banner Content */}
        <div className="relative z-10 flex flex-col justify-center p-10 max-w-lg">
          <h2 className="text-3xl font-serif text-[#FAF9F6] dark:text-[#f8f0f5] mb-3 drop-shadow-md">Nueva colección disponible</h2>
          <p className="text-[#F2D0D3] dark:text-[#f0a0c0] mb-6 font-light leading-relaxed drop-shadow-md">Descubre las últimas tendencias de moda femenina con nuestra línea más exclusiva.</p>
          <button className="bg-[#FAF9F6] text-[#594246] font-medium py-3 px-8 rounded-full w-fit hover:bg-[#F2D0D3] dark:hover:bg-[#e8688a] hover:text-[#594246] dark:hover:text-[#f8f0f5] transition-all duration-300 shadow-sm">
            Ver colección
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/60 dark:bg-[#2d0a1e]/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(89,66,70,0.05)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-white/40 dark:border-[#e8688a]/20">
        <h3 className="text-xl font-bold text-[#594246] dark:text-[#f8f0f5] mb-6">Actividad reciente</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-white/70 dark:bg-[#e8688a]/5 p-4 rounded-2xl border border-white/50 dark:border-[#e8688a]/10 shadow-sm transition-colors hover:bg-white/90 dark:hover:bg-[#e8688a]/15 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-[#F2D0D3]/40 dark:bg-[#e8688a]/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#594246] dark:text-[#f0a0c0]" strokeWidth={1.5} />
            </div>
            <p className="text-[#594246] dark:text-[#f0d8e8]/90 font-medium text-sm">Tu pedido <span className="font-bold dark:text-[#f0a0c0]">#0042</span> está siendo procesado</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/70 dark:bg-[#e8688a]/5 p-4 rounded-2xl border border-white/50 dark:border-[#e8688a]/10 shadow-sm transition-colors hover:bg-white/90 dark:hover:bg-[#e8688a]/15 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-[#EBEAE8] dark:bg-[#e8688a]/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#594246] dark:text-[#f0a0c0]" strokeWidth={1.5} />
            </div>
            <p className="text-[#594246] dark:text-[#f0d8e8]/90 font-medium text-sm">Tu pago del pedido <span className="font-bold dark:text-[#f0a0c0]">#0041</span> fue confirmado</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/70 dark:bg-[#e8688a]/5 p-4 rounded-2xl border border-white/50 dark:border-[#e8688a]/10 shadow-sm transition-colors hover:bg-white/90 dark:hover:bg-[#e8688a]/15 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-[#F2778D]/20 dark:bg-[#e8688a]/20 flex items-center justify-center shrink-0">
              <MessageCircleHeart className="w-5 h-5 text-[#F2778D] dark:text-[#f0a0c0]" strokeWidth={1.5} />
            </div>
            <p className="text-[#594246] dark:text-[#f0d8e8]/90 font-medium text-sm">Tu sugerencia fue recibida</p>
          </div>
        </div>
      </div>

    </div>
  );
}
