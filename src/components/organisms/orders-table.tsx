"use client";

import { useState, useMemo } from "react";
import { Eye, Edit2, Search, SlidersHorizontal, Package, Store, Train, Bike, Truck, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export type DeliveryMethodId = 'store' | 'point' | 'motorized' | 'province';
export type OrderStatus = 'Pendiente' | 'En Progreso' | 'Finalizado' | 'Cancelado';

export interface OrderData {
  id: string;
  date: string;
  client: string;
  amount: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethodId;
}

interface OrdersTableProps {
  title: string;
  description: string;
  data: OrderData[];
  baseHref?: string;
}

const TABS = [
  { id: 'Recientes', label: 'Recientes (Pendientes)' },
  { id: 'En Progreso', label: 'En Progreso' },
  { id: 'Finalizadas', label: 'Finalizadas' }
];

const DELIVERY_FILTERS = [
  { id: 'all', label: 'Todos los métodos' },
  { id: 'store', label: 'Tienda Física (Recojo)' },
  { id: 'motorized', label: 'Motorizado' },
  { id: 'point', label: 'Punto de Encuentro' },
  { id: 'province', label: 'Provincia (Shalom)' },
];

export function OrdersTable({ title, description, data, baseHref = "/admin/orders" }: OrdersTableProps) {
  const [activeTab, setActiveTab] = useState<string>('Recientes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Derivar origen (Virtual/Física) del método de entrega
  const getOrigin = (method: DeliveryMethodId) => {
    return method === 'store' ? 'Venta Física' : 'Venta Virtual';
  };

  const getDeliveryIcon = (method: DeliveryMethodId) => {
    switch (method) {
      case 'store': return <Store className="w-3.5 h-3.5" />;
      case 'motorized': return <Bike className="w-3.5 h-3.5" />;
      case 'point': return <Train className="w-3.5 h-3.5" />;
      case 'province': return <Truck className="w-3.5 h-3.5" />;
    }
  };

  const getDeliveryLabel = (method: DeliveryMethodId) => {
    switch (method) {
      case 'store': return 'Recojo en Tienda';
      case 'motorized': return 'Motorizado';
      case 'point': return 'Punto de Encuentro';
      case 'province': return 'Provincia - Shalom';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pendiente': return "bg-[#FDF1F3] dark:bg-[#40202D] text-[#D6405F] dark:text-[#F2b6c1] border-[#F2DEE4] dark:border-[#592633]";
      case 'En Progreso': return "bg-[#FFF9EB] dark:bg-[#332511] text-[#B87C14] dark:text-[#EBB559] border-[#F7EAC4] dark:border-transparent";
      case 'Finalizado': return "bg-[#F0FDF4] dark:bg-[#122A1A] text-[#166534] dark:text-[#4ADE80] border-[#DCFCE7] dark:border-transparent";
      case 'Cancelado': return "bg-[#F3F4F6] dark:bg-[#1F2937] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-transparent";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(order => {
      // 1. Filtrar por Tab (Estado)
      if (activeTab === 'Recientes' && order.status !== 'Pendiente') return false;
      if (activeTab === 'En Progreso' && order.status !== 'En Progreso') return false;
      if (activeTab === 'Finalizadas' && (order.status !== 'Finalizado' && order.status !== 'Cancelado')) return false;

      // 2. Filtrar por Método de Entrega
      if (selectedDelivery !== 'all' && order.deliveryMethod !== selectedDelivery) return false;

      // 3. Filtrar por Búsqueda (ID o Cliente)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchId = order.id.toLowerCase().includes(query);
        const matchClient = order.client.toLowerCase().includes(query);
        if (!matchId && !matchClient) return false;
      }

      return true;
    });
  }, [data, activeTab, selectedDelivery, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-[#F7EEF1] dark:bg-[#150D10] p-4 pt-24 md:p-8 md:pt-28 font-sans transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-[#5B283A] dark:text-[#Fdfcfc] mb-2">{title}</h1>
          <p className="text-[14px] text-[#844C60] dark:text-[#C9B3BC]">{description}</p>
        </div>

        {/* CONTROLS (TABS + SEARCH + FILTERS) */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
          
          {/* TABS */}
          <div className="flex p-1 bg-white dark:bg-[#201519] border border-[#EEDCE1] dark:border-[#38202A] rounded-xl w-fit">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-2.5 text-[13px] font-bold uppercase tracking-wider rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? "text-white dark:text-white" 
                    : "text-[#844C60] dark:text-[#C9B3BC] hover:text-[#40202D] dark:hover:text-[#F2b6c1]"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[#5B283A] dark:bg-[#F2778D] rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Buscador */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#844C60] dark:text-[#C9B3BC]" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID o Cliente..." 
                className="w-full bg-white dark:bg-[#1A1114] border border-[#EEDCE1] dark:border-[#38202A] rounded-xl pl-10 pr-4 py-3 text-[14px] text-[#40202D] dark:text-white focus:outline-none focus:border-[#D6405F] dark:focus:border-[#F2778D] transition-colors placeholder:text-[#C9B3BC]"
              />
            </div>

            {/* Dropdown de Filtro (Método de Entrega) */}
            <div className="relative w-full sm:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 px-5 py-3 bg-white dark:bg-[#1A1114] border border-[#EEDCE1] dark:border-[#38202A] rounded-xl hover:border-[#D6405F] dark:hover:border-[#F2778D] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#844C60] dark:text-[#F2b6c1]" />
                  <span className="text-[14px] font-bold text-[#40202D] dark:text-white">
                    {DELIVERY_FILTERS.find(f => f.id === selectedDelivery)?.label}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#844C60] dark:text-[#C9B3BC]" />
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1A1114] border border-[#EEDCE1] dark:border-[#38202A] rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {DELIVERY_FILTERS.map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setSelectedDelivery(filter.id);
                          setShowFilters(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FCF8F9] dark:hover:bg-[#201519] transition-colors text-left"
                      >
                        <span className={`text-[13px] font-bold ${selectedDelivery === filter.id ? 'text-[#D6405F] dark:text-[#F2778D]' : 'text-[#40202D] dark:text-white'}`}>
                          {filter.label}
                        </span>
                        {selectedDelivery === filter.id && <Check className="w-4 h-4 text-[#D6405F] dark:text-[#F2778D]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#311824] dark:to-[#190B12] rounded-2xl shadow-[0_8px_30px_rgba(242,119,141,0.06)] dark:shadow-none border border-[#EEDCE1] dark:border-[#38202A] overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-[#FCF8F9] dark:bg-[#150D10] border-b border-[#EEDCE1] dark:border-[#38202A]">
                  <th className="py-5 px-6 text-[11px] font-bold text-[#844C60] dark:text-[#C9B3BC] uppercase tracking-wider">ID Orden</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-[#844C60] dark:text-[#C9B3BC] uppercase tracking-wider">Fecha</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-[#844C60] dark:text-[#C9B3BC] uppercase tracking-wider">Cliente</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-[#844C60] dark:text-[#C9B3BC] uppercase tracking-wider">Origen</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-[#844C60] dark:text-[#C9B3BC] uppercase tracking-wider">Entrega</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-[#844C60] dark:text-[#C9B3BC] uppercase tracking-wider">Monto Total</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-[#844C60] dark:text-[#C9B3BC] uppercase tracking-wider">Estado</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-[#844C60] dark:text-[#C9B3BC] uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEDCE1] dark:divide-[#38202A]">
                {filteredData.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FCF8F9] dark:hover:bg-[#201519] transition-colors group">
                    <td className="py-4 px-6">
                      <span className="font-bold text-[14px] text-[#40202D] dark:text-white">{order.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[13px] text-[#844C60] dark:text-[#C9B3BC] font-medium">{order.date}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FDF1F3] dark:bg-[#321A23] flex items-center justify-center shrink-0 border border-[#F2DEE4] dark:border-[#592633]">
                          <span className="text-[11px] font-bold text-[#D6405F] dark:text-[#F2778D]">{order.client.charAt(0)}</span>
                        </div>
                        <span className="font-bold text-[#40202D] dark:text-white text-[14px]">{order.client}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[13px] font-bold text-[#844C60] dark:text-[#EAE0E2]">
                        {getOrigin(order.deliveryMethod)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="text-[#D6405F] dark:text-[#F2b6c1]">
                          {getDeliveryIcon(order.deliveryMethod)}
                        </div>
                        <span className="text-[13px] font-medium text-[#40202D] dark:text-white">
                          {getDeliveryLabel(order.deliveryMethod)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-[15px] text-[#40202D] dark:text-white">S/ {order.amount.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`${baseHref}/${order.id.toLowerCase().replace('#', '')}`} className="p-2 text-[#844C60] dark:text-[#C9B3BC] hover:text-[#5B283A] dark:hover:text-white hover:bg-[#FDF1F3] dark:hover:bg-[#38202A] rounded-lg transition-colors">
                          <Eye className="w-4.5 h-4.5" />
                        </Link>
                        <button className="p-2 text-[#844C60] dark:text-[#C9B3BC] hover:text-[#D6405F] dark:hover:text-[#F2778D] hover:bg-[#FDF1F3] dark:hover:bg-[#321A23] rounded-lg transition-colors">
                          <Edit2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-[#844C60] dark:text-[#A78E96]">
                        <Package className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-[15px] font-bold">No hay órdenes para mostrar</p>
                        <p className="text-[13px] mt-1">Intenta ajustando los filtros o el término de búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 bg-[#FCF8F9] dark:bg-[#150D10]/50 border-t border-[#EEDCE1] dark:border-[#38202A] flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#844C60] dark:text-[#A78E96]">Mostrando <strong className="text-[#40202D] dark:text-white">{filteredData.length}</strong> órdenes</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-[12px] font-bold text-[#844C60] dark:text-[#C9B3BC] border border-[#EEDCE1] dark:border-[#38202A] rounded-lg hover:bg-white dark:hover:bg-[#38202A] transition-colors">Anterior</button>
                <button className="px-4 py-2 text-[12px] font-bold text-[#844C60] dark:text-[#C9B3BC] border border-[#EEDCE1] dark:border-[#38202A] rounded-lg hover:bg-white dark:hover:bg-[#38202A] transition-colors">Siguiente</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
