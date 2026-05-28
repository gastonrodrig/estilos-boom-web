'use client';

import { Package, Heart, TrendingUp, Clock, CheckCircle2, MessageCircleHeart } from 'lucide-react';
import Image from 'next/image';

export default function ClientHomePage() {
  return (
    <div className="space-y-10 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-medium text-[#594246] tracking-wide">¡Bienvenida de nuevo!</h1>
        <p className="text-[#594246]/70 mt-2 font-light">Aquí está un resumen de tu actividad</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-[#FAF9F6] p-6 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.04)] border border-[#EBEAE8]/40 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F2D0D3] to-[#F2B6C1] flex items-center justify-center shadow-inner">
            <Package className="w-7 h-7 text-[#594246]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-3xl font-medium text-[#594246]">2</p>
            <p className="text-sm text-[#594246]/70 mt-0.5 font-medium">Pedidos activos</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#FAF9F6] p-6 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.04)] border border-[#EBEAE8]/40 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F2778D]/30 to-[#F291A3]/30 flex items-center justify-center shadow-inner">
            <Heart className="w-7 h-7 text-[#F2778D]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-3xl font-medium text-[#594246]">8</p>
            <p className="text-sm text-[#594246]/70 mt-0.5 font-medium">Productos favoritos</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#FAF9F6] p-6 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.04)] border border-[#EBEAE8]/40 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#EBEAE8] to-[#F2D0D3] flex items-center justify-center shadow-inner">
            <TrendingUp className="w-7 h-7 text-[#594246]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-3xl font-medium text-[#594246]">5</p>
            <p className="text-sm text-[#594246]/70 mt-0.5 font-medium">Compras completadas</p>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="relative rounded-[2rem] overflow-hidden shadow-[0_12px_40px_-10px_rgba(89,66,70,0.2)] flex bg-[#594246] w-full min-h-[220px]">
        {/* The background image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/assets/FloresRosadas.png" 
            alt="Nueva Colección" 
            className="w-full h-full object-cover object-right"
          />
        </div>
        
        {/* The Magic Gradient Overlay (Softer to show more flowers) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#594246] via-[#594246]/60 via-45% to-transparent w-full"></div>

        {/* Banner Content */}
        <div className="relative z-10 flex flex-col justify-center p-10 max-w-lg">
          <h2 className="text-3xl font-serif text-[#FAF9F6] mb-3 drop-shadow-md">Nueva colección disponible</h2>
          <p className="text-[#F2D0D3] mb-6 font-light leading-relaxed drop-shadow-md">Descubre las últimas tendencias de moda femenina con nuestra línea más exclusiva.</p>
          <button className="bg-[#FAF9F6] text-[#594246] font-medium py-3 px-8 rounded-full w-fit hover:bg-[#F2D0D3] hover:text-[#594246] transition-all duration-300 shadow-sm">
            Ver colección
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#FAF9F6] p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(89,66,70,0.05)] border border-[#EBEAE8]/50">
        <h3 className="text-xl font-bold text-[#594246] mb-6">Actividad reciente</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#F2D0D3]/50 shadow-sm transition-colors hover:bg-[#F2D0D3]/10">
            <div className="w-10 h-10 rounded-full bg-[#F2D0D3]/40 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#594246]" strokeWidth={1.5} />
            </div>
            <p className="text-[#594246] font-medium text-sm">Tu pedido <span className="font-bold">#0042</span> está siendo procesado</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#EBEAE8] shadow-sm transition-colors hover:bg-[#EBEAE8]/30">
            <div className="w-10 h-10 rounded-full bg-[#EBEAE8] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#594246]" strokeWidth={1.5} />
            </div>
            <p className="text-[#594246] font-medium text-sm">Tu pago del pedido <span className="font-bold">#0041</span> fue confirmado</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#F2778D]/30 shadow-sm transition-colors hover:bg-[#F2778D]/10">
            <div className="w-10 h-10 rounded-full bg-[#F2778D]/20 flex items-center justify-center shrink-0">
              <MessageCircleHeart className="w-5 h-5 text-[#F2778D]" strokeWidth={1.5} />
            </div>
            <p className="text-[#594246] font-medium text-sm">Tu sugerencia fue recibida</p>
          </div>
        </div>
      </div>

    </div>
  );
}
