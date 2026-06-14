"use client";

import { useState, useMemo, useEffect } from "react";
import { Eye, Edit2, Search, SlidersHorizontal, Package, Store, Train, Bike, Truck, ChevronDown, Check, FileText } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { OrderDetailModal } from "../features/admin/orders/order-detail-modal";
import { OrderEditModal } from "../features/admin/orders/order-edit-modal";
import { OrderInvoiceModal } from "../features/admin/orders/order-invoice-modal";

export type DeliveryMethodId = 'store' | 'point' | 'motorized' | 'province';
export type OrderStatus = 'Pendiente' | 'Preparando' | 'En camino' | 'Entregado' | 'Cancelado';

export interface OrderData {
  id: string;
  dbId?: string; // Real backend ID
  date: string;
  client: string;
  amount: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethodId;
  items?: any[];
}

interface OrdersTableProps {
  title: string;
  description: string;
  data: OrderData[];
  baseHref?: string;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
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

export function OrdersTable({ title, description, data: initialData, baseHref = "/admin/orders", onStatusChange }: OrdersTableProps) {
  const [data, setData] = useState<OrderData[]>(initialData);
  const [activeTab, setActiveTab] = useState<string>('Recientes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleSaveStatus = (id: string, newStatus: OrderStatus) => {
    setData(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (onStatusChange) {
      onStatusChange(id, newStatus);
    }
  };

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
      case 'Pendiente': return "bg-amber-950 text-amber-300 border-amber-800";
      case 'Preparando': return "bg-blue-950 text-blue-300 border-blue-800";
      case 'En camino': return "bg-blue-950 text-blue-300 border-blue-800";
      case 'Entregado': return "bg-emerald-950 text-emerald-300 border-emerald-800";
      case 'Cancelado': return "bg-zinc-800 text-zinc-400 border-zinc-700";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(order => {
      // 1. Filtrar por Tab (Estado)
      if (activeTab === 'Recientes' && order.status !== 'Pendiente') return false;
      if (activeTab === 'En Progreso' && (order.status !== 'Preparando' && order.status !== 'En camino')) return false;
      if (activeTab === 'Finalizadas' && (order.status !== 'Entregado' && order.status !== 'Cancelado')) return false;

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
    <div className="w-full font-sans transition-colors duration-300 relative space-y-6">
      <div className="w-full relative z-10 space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-pink-100 dark:border-white/10 bg-[#fffcfd] dark:bg-zinc-900 px-6 py-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Pendientes</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {data.filter(o => o.status === 'Pendiente').length}
            </p>
          </div>
          <div className="rounded-2xl border border-pink-100 dark:border-white/10 bg-[#fffcfd] dark:bg-zinc-900 px-6 py-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">En Progreso</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {data.filter(o => o.status === 'Preparando' || o.status === 'En camino').length}
            </p>
          </div>
          <div className="rounded-2xl border border-pink-100 dark:border-white/10 bg-[#fffcfd] dark:bg-zinc-900 px-6 py-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Finalizadas</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {data.filter(o => o.status === 'Entregado').length}
            </p>
          </div>
          <div className="rounded-2xl border border-pink-100 dark:border-white/10 bg-[#fffcfd] dark:bg-zinc-900 px-6 py-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-700" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Monto Finalizado</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              S/ {data.filter(o => o.status === 'Entregado').reduce((acc, o) => acc + o.amount, 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* CONTROLS (TABS + SEARCH + FILTERS) */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
          
          {/* TABS */}
          <div className="flex border-b border-zinc-800 w-full mb-4">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id 
                    ? "border-[#8B3A52] text-[#8B3A52] dark:text-white" 
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Buscador */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID o Cliente..." 
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:border-[#8B3A52] focus:ring-0 rounded-md pl-10 pr-4 py-2.5 text-sm transition-colors"
              />
            </div>

            {/* Dropdown de Filtro (Método de Entrega) */}
            <div className="relative w-full sm:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-md hover:border-[#8B3A52] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-zinc-500 group-hover:text-[#8B3A52] transition-colors" />
                  <span className="text-sm font-medium">
                    {DELIVERY_FILTERS.find(f => f.id === selectedDelivery)?.label}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-[#8B3A52] transition-colors" />
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-[#EAE0E2] dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {DELIVERY_FILTERS.map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setSelectedDelivery(filter.id);
                          setShowFilters(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <span className={`text-sm font-medium ${selectedDelivery === filter.id ? 'text-[#8B3A52]' : 'text-zinc-400 hover:text-zinc-200'}`}>
                          {filter.label}
                        </span>
                        {selectedDelivery === filter.id && <Check className="w-4 h-4 text-[#8B3A52]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="border border-[rgba(212,175,55,0.25)] shadow-[0_2px_16px_rgba(212,175,55,0.08)] bg-[#faf5f0] dark:shadow-[0_2px_16px_rgba(212,175,55,0.03)] dark:border-[rgba(212,175,55,0.15)] dark:bg-[#2e1d27] rounded-[32px] overflow-hidden transition-[background-color,border-color] duration-[600ms]">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead className="relative transition-[background-color,border-color] duration-[600ms]">
                <tr className="border-b border-zinc-800">
                  <th className="py-4 px-6 text-xs font-medium text-zinc-400 uppercase tracking-wider">ID Orden</th>
                  <th className="py-4 px-6 text-xs font-medium text-zinc-400 uppercase tracking-wider">Fecha</th>
                  <th className="py-4 px-6 text-xs font-medium text-zinc-400 uppercase tracking-wider">Cliente</th>
                  <th className="py-4 px-6 text-xs font-medium text-zinc-400 uppercase tracking-wider">Origen</th>
                  <th className="py-4 px-6 text-xs font-medium text-zinc-400 uppercase tracking-wider">Entrega</th>
                  <th className="py-4 px-6 text-xs font-medium text-zinc-400 uppercase tracking-wider">Monto Total</th>
                  <th className="py-4 px-6 text-xs font-medium text-zinc-400 uppercase tracking-wider">Estado</th>
                  <th className="py-4 px-6 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredData.map((order, idx) => (
                  <tr key={order.id} className="transition-colors group/row hover:bg-zinc-800/20">
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-[#8B3A52]">{order.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-zinc-200 font-normal">{order.date}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-zinc-200 font-normal">{order.client}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs text-zinc-500 font-normal">
                        {getOrigin(order.deliveryMethod)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="text-zinc-400">
                          {getDeliveryIcon(order.deliveryMethod)}
                        </div>
                        <span className="text-sm text-zinc-200 font-normal">
                          {getDeliveryLabel(order.deliveryMethod)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-zinc-200 font-normal">S/ {order.amount.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}
                          className="p-2 text-gray-400 hover:text-[#D6405F] bg-white dark:bg-zinc-800 hover:bg-pink-50 dark:hover:bg-zinc-700 rounded-full transition-colors border border-gray-200 dark:border-zinc-700 shadow-sm"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedOrder(order); setIsEditOpen(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-zinc-700 rounded-full transition-colors border border-gray-200 dark:border-zinc-700 shadow-sm"
                          title="Editar estado"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedOrder(order); setIsInvoiceOpen(true); }}
                          className="p-2 text-gray-400 hover:text-emerald-600 bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 rounded-full transition-colors border border-gray-200 dark:border-zinc-700 shadow-sm"
                          title="Ver comprobante"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-[#844C60] dark:text-white/50">
                        <Package className="w-12 h-12 mb-4 opacity-50 text-[#8C6B79] dark:text-gray-500" />
                        <p className="text-[15px] font-bold text-[#8C6B79] dark:text-gray-400">No hay órdenes para mostrar</p>
                        <p className="text-[13px] mt-1 text-[#8C6B79] dark:text-gray-500 font-medium">Intenta ajustando los filtros o el término de búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-sm text-zinc-400">Mostrando <strong className="text-zinc-200 font-semibold">{filteredData.length}</strong> órdenes</span>
              <div className="flex gap-2">
                <button className="border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-md px-3 py-1.5 transition-colors">Anterior</button>
                <button className="border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-md px-3 py-1.5 transition-colors">Siguiente</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <OrderDetailModal 
        open={isDetailOpen} 
        order={selectedOrder} 
        onClose={() => { setIsDetailOpen(false); setSelectedOrder(null); }} 
      />

      <OrderEditModal 
        open={isEditOpen} 
        order={selectedOrder} 
        onClose={() => { setIsEditOpen(false); setSelectedOrder(null); }} 
        onSave={handleSaveStatus}
      />

      <OrderInvoiceModal 
        open={isInvoiceOpen} 
        order={selectedOrder} 
        onClose={() => { setIsInvoiceOpen(false); setSelectedOrder(null); }} 
      />
    </div>
  );
}
