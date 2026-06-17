'use client';

import { Package, Heart, TrendingUp, Clock, CheckCircle2, MessageCircleHeart, AlertCircle, ShoppingBag, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ordersApi } from '@/api/orders/orders-api';
import { favoritesApi } from '@/api/favorites/favorites-api';
import { getFirebaseAuthToken } from '@helpers';
import { getAuthConfig } from '@utils';

export default function ClientHomePage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState({ active: 0, favorites: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = await getFirebaseAuthToken();
        const config = getAuthConfig({ token });
        
        // Fetch both active and history orders, plus favorites
        const [activeRes, historyRes, favoritesRes] = await Promise.all([
          ordersApi.get('/client/active', config).catch(() => ({ data: [] })),
          ordersApi.get('/client/history', config).catch(() => ({ data: [] })),
          favoritesApi.get('/', config).catch(() => ({ data: [] }))
        ]);
        
        // Update Stats
        setStats({
          active: activeRes.data ? activeRes.data.length : 0,
          completed: historyRes.data ? historyRes.data.length : 0,
          favorites: favoritesRes.data ? favoritesRes.data.length : 0
        });
        
        // Combine and sort descending by date
        const allOrders = [...(activeRes.data || []), ...(historyRes.data || [])];
        allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setActivities(allOrders);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const visibleActivities = activities.slice(0, visibleCount);

  return (
    <div className="space-y-10 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-medium text-[#594246] dark:text-white tracking-wide">¡Bienvenida de nuevo!</h1>
        <p className="text-[#594246]/70 dark:text-white/70 mt-2 font-light">Aquí está un resumen de tu actividad</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <Link href="/client/orders/active" className="bg-white/60 dark:bg-[#2d0a1e]/40 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.05)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-white/40 dark:border-[#e8688a]/20 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-14 h-14 rounded-full bg-[#F2D0D3]/40 dark:bg-[#e8688a]/20 flex items-center justify-center shrink-0">
            <Package className="w-7 h-7 text-[#594246] dark:text-[#f0a0c0]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-3xl font-medium text-[#594246] dark:text-[#f8f0f5]">{stats.active}</p>
            <p className="text-sm text-[#594246]/70 dark:text-[#f0d8e8]/90 mt-0.5 font-medium">Pedidos activos</p>
          </div>
        </Link>

        {/* Card 2 */}
        <Link href="/client/favorites" className="bg-white/60 dark:bg-[#2d0a1e]/40 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.05)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-white/40 dark:border-[#e8688a]/20 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-14 h-14 rounded-full bg-[#EBEAE8] dark:bg-[#e8688a]/20 flex items-center justify-center shrink-0">
            <Heart className="w-7 h-7 text-[#594246] dark:text-[#f0a0c0]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-3xl font-medium text-[#594246] dark:text-[#f8f0f5]">{stats.favorites}</p>
            <p className="text-sm text-[#594246]/70 dark:text-[#f0d8e8]/90 mt-0.5 font-medium">Favoritos</p>
          </div>
        </Link>

        {/* Card 3 */}
        <Link href="/client/orders/history" className="bg-white/60 dark:bg-[#2d0a1e]/40 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_-4px_rgba(89,66,70,0.05)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-white/40 dark:border-[#e8688a]/20 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 col-span-2 md:col-span-1">
          <div className="w-14 h-14 rounded-full bg-[#F2778D]/20 dark:bg-[#e8688a]/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-7 h-7 text-[#F2778D] dark:text-[#f0a0c0]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-3xl font-medium text-[#594246] dark:text-[#f8f0f5]">{stats.completed}</p>
            <p className="text-sm text-[#594246]/70 dark:text-[#f0d8e8]/90 mt-0.5 font-medium">Compras exitosas</p>
          </div>
        </Link>
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
          <Link href="/catalogue/new-in">
            <button className="bg-[#FAF9F6] text-[#594246] font-medium py-3 px-8 rounded-full w-fit hover:bg-[#F2D0D3] dark:hover:bg-[#e8688a] hover:text-[#594246] dark:hover:text-[#f8f0f5] transition-all duration-300 shadow-sm">
              Ver colección
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/60 dark:bg-[#2d0a1e]/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(89,66,70,0.05)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-white/40 dark:border-[#e8688a]/20">
        <h3 className="text-xl font-bold text-[#594246] dark:text-[#f8f0f5] mb-6">Actividad reciente</h3>
        
        <div className="space-y-4">
          {loading ? (
            <p className="text-[#594246]/60 dark:text-[#f8f0f5]/60 text-sm italic">Cargando actividad reciente...</p>
          ) : activities.length === 0 ? (
            <p className="text-[#594246]/60 dark:text-[#f8f0f5]/60 text-sm italic">Aún no tienes actividad reciente.</p>
          ) : (
            <>
              {visibleActivities.map((order) => {
                let statusText = '';
                let bgClass = 'bg-[#EBEAE8] dark:bg-[#e8688a]/20';
                let iconClass = 'text-[#594246] dark:text-[#f0a0c0]';
                let Icon = Clock;

                switch (order.status) {
                  case 'PRE_ORDER':
                    statusText = 'Verificando el pago de tu pedido';
                    Icon = Clock;
                    bgClass = 'bg-[#F2D0D3]/40 dark:bg-[#e8688a]/20';
                    iconClass = 'text-[#594246] dark:text-[#f0a0c0]';
                    break;
                  case 'CONFIRMED':
                    statusText = 'Pago confirmado para el pedido';
                    Icon = CheckCircle2;
                    bgClass = 'bg-[#EBEAE8] dark:bg-[#e8688a]/20';
                    iconClass = 'text-[#594246] dark:text-[#f0a0c0]';
                    break;
                  case 'OBSERVED':
                    statusText = 'Observación en el pago de tu pedido';
                    Icon = AlertCircle;
                    bgClass = 'bg-[#F2778D]/20 dark:bg-[#e8688a]/20';
                    iconClass = 'text-[#F2778D] dark:text-[#f0a0c0]';
                    break;
                  case 'PREPARING':
                    statusText = 'Preparando tu pedido';
                    Icon = ShoppingBag;
                    bgClass = 'bg-[#F2D0D3]/40 dark:bg-[#e8688a]/20';
                    iconClass = 'text-[#594246] dark:text-[#f0a0c0]';
                    break;
                  case 'SHIPPED':
                    statusText = 'Tu pedido está en camino';
                    Icon = Package;
                    bgClass = 'bg-[#F2D0D3]/40 dark:bg-[#e8688a]/20';
                    iconClass = 'text-[#594246] dark:text-[#f0a0c0]';
                    break;
                  case 'DELIVERED':
                    statusText = 'Pedido entregado exitosamente';
                    Icon = CheckCircle2;
                    bgClass = 'bg-[#EBEAE8] dark:bg-[#e8688a]/20';
                    iconClass = 'text-[#594246] dark:text-[#f0a0c0]';
                    break;
                  case 'CANCELLED':
                    statusText = 'Pedido cancelado';
                    Icon = XCircle;
                    bgClass = 'bg-[#EBEAE8]/50 dark:bg-white/5';
                    iconClass = 'text-[#594246]/50 dark:text-white/40';
                    break;
                  default:
                    statusText = 'Tu pedido está siendo procesado';
                }

                const dateStr = new Date(order.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });

                return (
                  <Link href={`/client/orders/${order._id || order.id}`} key={order._id || order.id} className="block group">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/70 dark:bg-[#e8688a]/5 p-4 rounded-2xl border border-white/50 dark:border-[#e8688a]/10 shadow-sm transition-colors group-hover:bg-white/90 dark:group-hover:bg-[#e8688a]/15 backdrop-blur-md relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
                        <Icon className={`w-5 h-5 ${iconClass}`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 pr-16">
                        <p className="text-[#594246] dark:text-[#f0d8e8]/90 font-medium text-sm">
                          {statusText} <span className="font-bold dark:text-[#f0a0c0]">#{order.orderNumber}</span>
                        </p>
                      </div>
                      <div className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto">
                        <span className="text-xs text-[#594246]/50 dark:text-[#f8f0f5]/50 whitespace-nowrap">{dateStr}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Botones de Paginación */}
              <div className="flex justify-center gap-4 mt-6 pt-2">
                {visibleCount < activities.length && (
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 3)}
                    className="text-sm font-medium text-[#594246] dark:text-[#f0a0c0] hover:underline transition-all"
                  >
                    Ver más actividad
                  </button>
                )}
                {visibleCount > 3 && (
                  <button 
                    onClick={() => setVisibleCount(3)}
                    className="text-sm font-medium text-[#594246]/60 dark:text-[#f0a0c0]/60 hover:underline transition-all"
                  >
                    Ver menos
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
